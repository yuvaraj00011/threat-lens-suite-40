import { AnomalyEvent } from "./AnomalyDetection"
import { useToast } from "@/hooks/use-toast"

export interface ResponseAction {
  id: string
  timestamp: string
  action: 'lock_session' | 'suspend_user' | 'block_ip' | 'rate_limit' | 'mfa_challenge' | 'alert_team' | 'capture_forensics' | 'escalate'
  targetId: string
  reason: string
  anomalyId: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'executed' | 'failed' | 'reverted'
  executionTime?: string
  evidence?: string[]
}

export interface IncidentRecord {
  id: string
  createdAt: string
  updatedAt: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'false_positive'
  assignedTo?: string
  anomalies: string[]
  responseActions: string[]
  timeline: Array<{
    timestamp: string
    action: string
    actor: string
    details: string
  }>
  evidencePackage?: {
    sessionLogs: string[]
    networkCapture: string[]
    systemMetrics: string[]
    userActivity: string[]
    signatures: string[]
  }
}

export interface ResponseConfig {
  autoResponseEnabled: boolean
  criticalThreshold: number // >= 0.85
  highThreshold: number    // >= 0.8
  mediumThreshold: number  // >= 0.6
  maxActionsPerMinute: number
  requireApprovalFor: string[]
}

class AutomatedResponseEngine {
  private responseHistory: ResponseAction[] = []
  private incidents: Map<string, IncidentRecord> = new Map()
  private config: ResponseConfig = {
    autoResponseEnabled: true,
    criticalThreshold: 0.85,
    highThreshold: 0.8,
    mediumThreshold: 0.6,
    maxActionsPerMinute: 10,
    requireApprovalFor: ['suspend_user', 'block_ip']
  }

  private sessionLocks: Set<string> = new Set()
  private suspendedUsers: Set<string> = new Set()
  private blockedIps: Set<string> = new Set()
  private rateLimitedUsers: Set<string> = new Set()

  // Main response trigger
  async processAnomaly(anomaly: AnomalyEvent): Promise<ResponseAction[]> {
    if (!this.config.autoResponseEnabled) {
      return []
    }

    // Check rate limiting
    const recentActions = this.getRecentActions(60000) // Last minute
    if (recentActions.length >= this.config.maxActionsPerMinute) {
      console.warn('Response rate limit exceeded, skipping automated actions')
      return []
    }

    const actions: ResponseAction[] = []
    const targetId = this.extractTargetId(anomaly)

    // Critical severity actions (>= 0.85)
    if (anomaly.riskScore >= this.config.criticalThreshold) {
      // Lock session immediately
      if (targetId) {
        actions.push(await this.createResponseAction('lock_session', targetId, anomaly, 'critical'))
      }

      // Suspend user for critical user behavior anomalies
      if (anomaly.type === 'user_behavior' && anomaly.sourceData?.userId) {
        actions.push(await this.createResponseAction('suspend_user', anomaly.sourceData.userId, anomaly, 'critical'))
      }

      // Capture forensic evidence
      actions.push(await this.createResponseAction('capture_forensics', targetId || 'system', anomaly, 'critical'))

      // Alert security team
      actions.push(await this.createResponseAction('alert_team', 'security_team', anomaly, 'critical'))

      // Auto-escalate
      actions.push(await this.createResponseAction('escalate', anomaly.id, anomaly, 'critical'))
    }
    
    // High severity actions (>= 0.8)
    else if (anomaly.riskScore >= this.config.highThreshold) {
      // Rate limit user
      if (anomaly.sourceData?.userId) {
        actions.push(await this.createResponseAction('rate_limit', anomaly.sourceData.userId, anomaly, 'high'))
      }

      // Block suspicious IPs for network anomalies
      if (anomaly.type === 'network' && anomaly.sourceData?.sourceIp) {
        actions.push(await this.createResponseAction('block_ip', anomaly.sourceData.sourceIp, anomaly, 'high'))
      }

      // Alert team
      actions.push(await this.createResponseAction('alert_team', 'security_team', anomaly, 'high'))
    }
    
    // Medium severity actions (>= 0.6)
    else if (anomaly.riskScore >= this.config.mediumThreshold) {
      // Require MFA challenge
      if (anomaly.type === 'user_behavior' && anomaly.sourceData?.userId) {
        actions.push(await this.createResponseAction('mfa_challenge', anomaly.sourceData.userId, anomaly, 'medium'))
      }

      // Extended telemetry logging
      actions.push(await this.createResponseAction('capture_forensics', targetId || 'system', anomaly, 'medium'))
    }

    // Execute non-approval-required actions immediately
    for (const action of actions) {
      if (!this.config.requireApprovalFor.includes(action.action)) {
        await this.executeAction(action)
      }
    }

    // Create or update incident
    await this.createOrUpdateIncident(anomaly, actions)

    return actions
  }

  private async createResponseAction(
    action: ResponseAction['action'],
    targetId: string,
    anomaly: AnomalyEvent,
    severity: ResponseAction['severity']
  ): Promise<ResponseAction> {
    const responseAction: ResponseAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      action,
      targetId,
      reason: anomaly.description,
      anomalyId: anomaly.id,
      severity,
      status: 'pending'
    }

    this.responseHistory.push(responseAction)
    return responseAction
  }

  private async executeAction(action: ResponseAction): Promise<boolean> {
    try {
      action.status = 'executed'
      action.executionTime = new Date().toISOString()

      switch (action.action) {
        case 'lock_session':
          this.sessionLocks.add(action.targetId)
          await this.logAction(action, `Session ${action.targetId} locked`)
          break

        case 'suspend_user':
          this.suspendedUsers.add(action.targetId)
          await this.logAction(action, `User ${action.targetId} suspended`)
          break

        case 'block_ip':
          this.blockedIps.add(action.targetId)
          await this.logAction(action, `IP ${action.targetId} blocked`)
          break

        case 'rate_limit':
          this.rateLimitedUsers.add(action.targetId)
          setTimeout(() => this.rateLimitedUsers.delete(action.targetId), 300000) // 5 min
          await this.logAction(action, `User ${action.targetId} rate limited`)
          break

        case 'mfa_challenge':
          await this.logAction(action, `MFA challenge required for ${action.targetId}`)
          break

        case 'alert_team':
          await this.alertSecurityTeam(action)
          break

        case 'capture_forensics':
          await this.captureForensicEvidence(action)
          break

        case 'escalate':
          await this.escalateIncident(action)
          break
      }

      return true
    } catch (error) {
      action.status = 'failed'
      console.error(`Failed to execute action ${action.action}:`, error)
      return false
    }
  }

  private async createOrUpdateIncident(anomaly: AnomalyEvent, actions: ResponseAction[]): Promise<IncidentRecord> {
    // Check if this should be part of an existing incident
    const recentIncidents = Array.from(this.incidents.values())
      .filter(incident => 
        incident.status !== 'resolved' && 
        incident.status !== 'false_positive' &&
        new Date(incident.createdAt).getTime() > Date.now() - 3600000 // Last hour
      )

    let incident = recentIncidents.find(inc => 
      inc.anomalies.includes(anomaly.id) ||
      (anomaly.correlatedEvents && anomaly.correlatedEvents.some(id => inc.anomalies.includes(id)))
    )

    if (!incident) {
      // Create new incident
      incident = {
        id: `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        title: `${anomaly.severity.toUpperCase()}: ${anomaly.description}`,
        description: anomaly.description,
        severity: anomaly.severity,
        status: 'open',
        anomalies: [anomaly.id],
        responseActions: actions.map(a => a.id),
        timeline: [
          {
            timestamp: new Date().toISOString(),
            action: 'incident_created',
            actor: 'ai_security_system',
            details: `Incident created for anomaly ${anomaly.id}`
          }
        ]
      }
    } else {
      // Update existing incident
      incident.updatedAt = new Date().toISOString()
      incident.anomalies.push(anomaly.id)
      incident.responseActions.push(...actions.map(a => a.id))
      
      // Escalate severity if needed
      const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 }
      if (severityLevels[anomaly.severity] > severityLevels[incident.severity]) {
        incident.severity = anomaly.severity
      }

      incident.timeline.push({
        timestamp: new Date().toISOString(),
        action: 'anomaly_added',
        actor: 'ai_security_system',
        details: `Added anomaly ${anomaly.id} to incident`
      })
    }

    this.incidents.set(incident.id, incident)
    return incident
  }

  private extractTargetId(anomaly: AnomalyEvent): string {
    switch (anomaly.type) {
      case 'user_behavior':
        return anomaly.sourceData?.userId || anomaly.sourceData?.sessionId
      case 'network':
        return anomaly.sourceData?.sessionId || anomaly.sourceData?.sourceIp
      case 'resource':
        return anomaly.sourceData?.processId || anomaly.sourceData?.sessionId
      case 'api':
        return anomaly.sourceData?.sessionId || anomaly.sourceData?.userId
      default:
        return 'system'
    }
  }

  private async logAction(action: ResponseAction, message: string): Promise<void> {
    console.log(`[SECURITY] ${action.timestamp}: ${message}`)
    // In real implementation, this would log to audit system
  }

  private async alertSecurityTeam(action: ResponseAction): Promise<void> {
    // Simulate security team notification
    console.log(`[ALERT] Security team notified: ${action.reason}`)
    // In real implementation: send email, Slack, PagerDuty, etc.
  }

  private async captureForensicEvidence(action: ResponseAction): Promise<void> {
    const evidence = [
      `session_log_${action.targetId}_${Date.now()}`,
      `network_capture_${Date.now()}`,
      `system_metrics_${Date.now()}`,
      `user_activity_${action.targetId}_${Date.now()}`
    ]
    
    action.evidence = evidence
    console.log(`[FORENSICS] Evidence captured: ${evidence.join(', ')}`)
  }

  private async escalateIncident(action: ResponseAction): Promise<void> {
    console.log(`[ESCALATION] Incident escalated: ${action.reason}`)
    // In real implementation: notify SOC, create tickets, etc.
  }

  private getRecentActions(timeWindowMs: number): ResponseAction[] {
    const cutoff = Date.now() - timeWindowMs
    return this.responseHistory.filter(action => 
      new Date(action.timestamp).getTime() > cutoff
    )
  }

  // Public interface methods
  getResponseHistory(limit: number = 100): ResponseAction[] {
    return this.responseHistory.slice(-limit)
  }

  getIncidents(): IncidentRecord[] {
    return Array.from(this.incidents.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }

  getActiveIncidents(): IncidentRecord[] {
    return this.getIncidents().filter(inc => 
      inc.status === 'open' || inc.status === 'investigating' || inc.status === 'contained'
    )
  }

  isSessionLocked(sessionId: string): boolean {
    return this.sessionLocks.has(sessionId)
  }

  isUserSuspended(userId: string): boolean {
    return this.suspendedUsers.has(userId)
  }

  isIpBlocked(ip: string): boolean {
    return this.blockedIps.has(ip)
  }

  isUserRateLimited(userId: string): boolean {
    return this.rateLimitedUsers.has(userId)
  }

  updateConfig(newConfig: Partial<ResponseConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): ResponseConfig {
    return { ...this.config }
  }

  // Manual incident management
  markIncidentAsFalsePositive(incidentId: string, analyst: string): boolean {
    const incident = this.incidents.get(incidentId)
    if (!incident) return false

    incident.status = 'false_positive'
    incident.updatedAt = new Date().toISOString()
    incident.timeline.push({
      timestamp: new Date().toISOString(),
      action: 'marked_false_positive',
      actor: analyst,
      details: 'Incident marked as false positive by security analyst'
    })

    return true
  }

  resolveIncident(incidentId: string, analyst: string, resolution: string): boolean {
    const incident = this.incidents.get(incidentId)
    if (!incident) return false

    incident.status = 'resolved'
    incident.updatedAt = new Date().toISOString()
    incident.timeline.push({
      timestamp: new Date().toISOString(),
      action: 'resolved',
      actor: analyst,
      details: resolution
    })

    return true
  }
}

// Singleton instance
export const automatedResponse = new AutomatedResponseEngine()

// Hook for React components
export function useAutomatedResponse() {
  return {
    processAnomaly: automatedResponse.processAnomaly.bind(automatedResponse),
    getResponseHistory: automatedResponse.getResponseHistory.bind(automatedResponse),
    getIncidents: automatedResponse.getIncidents.bind(automatedResponse),
    getActiveIncidents: automatedResponse.getActiveIncidents.bind(automatedResponse),
    isSessionLocked: automatedResponse.isSessionLocked.bind(automatedResponse),
    isUserSuspended: automatedResponse.isUserSuspended.bind(automatedResponse),
    isIpBlocked: automatedResponse.isIpBlocked.bind(automatedResponse),
    isUserRateLimited: automatedResponse.isUserRateLimited.bind(automatedResponse),
    markIncidentAsFalsePositive: automatedResponse.markIncidentAsFalsePositive.bind(automatedResponse),
    resolveIncident: automatedResponse.resolveIncident.bind(automatedResponse),
    updateConfig: automatedResponse.updateConfig.bind(automatedResponse),
    getConfig: automatedResponse.getConfig.bind(automatedResponse)
  }
}