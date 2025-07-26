import { UserBehaviorData, NetworkActivityData, ResourceUsageData, ApiUsageData, BaselineProfile } from "./SecurityMonitoring"

export interface AnomalyEvent {
  id: string
  timestamp: string
  type: 'user_behavior' | 'network' | 'resource' | 'api' | 'compound'
  description: string
  riskScore: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  features: Record<string, number>
  sourceData: any
  correlatedEvents?: string[]
  iocMatches?: string[]
}

export interface ThreatIntelligence {
  suspiciousDomains: string[]
  maliciousIps: string[]
  knownAttackPatterns: string[]
  blockedPorts: number[]
}

class IsolationForestSimulator {
  private readonly contamination: number = 0.1 // Expected proportion of anomalies
  private readonly randomSeed: number = 12345

  // Simplified Isolation Forest algorithm simulation
  predict(features: number[]): number {
    // Simulate isolation score calculation
    const normalizedFeatures = this.normalizeFeatures(features)
    
    // Calculate anomaly score based on feature deviation
    let anomalyScore = 0
    for (let i = 0; i < normalizedFeatures.length; i++) {
      const deviation = Math.abs(normalizedFeatures[i] - 0.5) // Distance from normal center
      anomalyScore += deviation * (Math.random() * 0.5 + 0.5) // Add some randomness
    }
    
    // Normalize to 0-1 range
    anomalyScore = Math.min(1, anomalyScore / normalizedFeatures.length)
    
    // Add bias for certain patterns
    if (features.length > 4) {
      // Higher scores for extreme values
      const extremeValuePenalty = features.filter(f => f > 0.9 || f < 0.1).length * 0.2
      anomalyScore += extremeValuePenalty
    }
    
    return Math.min(1, anomalyScore)
  }

  private normalizeFeatures(features: number[]): number[] {
    const max = Math.max(...features, 1)
    return features.map(f => f / max)
  }
}

class AnomalyDetectionEngine {
  private isolationForest = new IsolationForestSimulator()
  private threatIntel: ThreatIntelligence = {
    suspiciousDomains: [
      'unknown-domain.ru',
      'suspicious-site.com', 
      'malware-c2.net',
      'phishing-test.org'
    ],
    maliciousIps: [
      '192.168.1.666', // Fake IP for testing
      '10.0.0.999',
      '172.16.255.666'
    ],
    knownAttackPatterns: [
      'brute_force_login',
      'sql_injection',
      'port_scanning',
      'data_exfiltration'
    ],
    blockedPorts: [1337, 4444, 6666, 8888]
  }

  // Detect user behavior anomalies
  detectUserBehaviorAnomaly(
    data: UserBehaviorData, 
    baseline: BaselineProfile | null
  ): AnomalyEvent | null {
    if (!baseline) return null

    const currentHour = new Date(data.loginTime).getHours()
    const hourDeviation = Math.abs(currentHour - baseline.avgLoginHour) / 12
    
    const locationKnown = baseline.commonLocations.includes(data.location) ? 0 : 1
    const deviceKnown = baseline.typicalDevices.includes(data.device) ? 0 : 1
    const actionRateDeviation = Math.abs(data.actionFrequency - baseline.normalActionRate) / baseline.normalActionRate

    const features = [
      hourDeviation,
      locationKnown,
      deviceKnown,
      actionRateDeviation,
      data.actionFrequency / 100 // Normalize action frequency
    ]

    const riskScore = this.isolationForest.predict(features)

    // Only flag if significant anomaly
    if (riskScore < 0.6) return null

    return {
      id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: 'user_behavior',
      description: `Unusual login pattern detected for user ${data.userId}`,
      riskScore,
      severity: this.calculateSeverity(riskScore),
      features: {
        hourDeviation,
        locationKnown,
        deviceKnown,
        actionRateDeviation,
        actionFrequency: data.actionFrequency
      },
      sourceData: data
    }
  }

  // Detect network anomalies
  detectNetworkAnomaly(data: NetworkActivityData): AnomalyEvent | null {
    const features = []
    let anomalyReasons = []

    // Check against threat intelligence
    if (data.domain && this.threatIntel.suspiciousDomains.includes(data.domain)) {
      features.push(1.0)
      anomalyReasons.push('suspicious domain')
    } else {
      features.push(0.0)
    }

    if (this.threatIntel.maliciousIps.includes(data.destinationIp)) {
      features.push(1.0)
      anomalyReasons.push('malicious IP')
    } else {
      features.push(0.0)
    }

    if (this.threatIntel.blockedPorts.includes(data.port)) {
      features.push(1.0)
      anomalyReasons.push('blocked port')
    } else {
      features.push(0.0)
    }

    // Traffic volume analysis
    const normalVolume = 50000 // Average expected traffic
    const volumeDeviation = Math.abs(data.trafficVolume - normalVolume) / normalVolume
    features.push(Math.min(1, volumeDeviation))

    // Time-based analysis (unusual hours)
    const currentHour = new Date(data.timestamp).getHours()
    const unusualHour = (currentHour < 6 || currentHour > 22) ? 0.7 : 0.0
    features.push(unusualHour)

    const riskScore = this.isolationForest.predict(features)

    if (riskScore < 0.6) return null

    return {
      id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: 'network',
      description: `Suspicious network activity detected: ${anomalyReasons.join(', ') || 'unusual traffic pattern'}`,
      riskScore,
      severity: this.calculateSeverity(riskScore),
      features: {
        suspiciousDomain: features[0],
        maliciousIp: features[1],
        blockedPort: features[2],
        volumeDeviation,
        unusualHour
      },
      sourceData: data,
      iocMatches: anomalyReasons
    }
  }

  // Detect resource usage anomalies
  detectResourceAnomaly(data: ResourceUsageData): AnomalyEvent | null {
    const features = [
      Math.min(1, data.cpuUsage / 100),
      Math.min(1, data.ramUsage / 8192),
      Math.min(1, data.diskUsage / 1000),
      Math.min(1, data.networkIo / 100000)
    ]

    const riskScore = this.isolationForest.predict(features)

    if (riskScore < 0.7) return null // Higher threshold for resource usage

    return {
      id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: 'resource',
      description: `Abnormal resource usage detected on process ${data.processId}`,
      riskScore,
      severity: this.calculateSeverity(riskScore),
      features: {
        cpuUsage: data.cpuUsage,
        ramUsage: data.ramUsage,
        diskUsage: data.diskUsage,
        networkIo: data.networkIo
      },
      sourceData: data
    }
  }

  // Detect API usage anomalies
  detectApiAnomaly(data: ApiUsageData, recentApiCalls: ApiUsageData[]): AnomalyEvent | null {
    // Rate limiting check
    const recentCalls = recentApiCalls.filter(call => 
      new Date(call.timestamp).getTime() > Date.now() - 60000 && // Last minute
      call.endpoint === data.endpoint &&
      call.userId === data.userId
    )

    const callRate = recentCalls.length
    const errorRate = recentCalls.filter(call => call.statusCode >= 400).length / Math.max(1, recentCalls.length)

    const features = [
      Math.min(1, callRate / 100), // Normalize call rate
      errorRate,
      Math.min(1, data.responseTime / 5000), // Normalize response time
      data.statusCode >= 400 ? 1 : 0,
      Math.min(1, data.errorCount / 10)
    ]

    const riskScore = this.isolationForest.predict(features)

    if (riskScore < 0.65) return null

    return {
      id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: 'api',
      description: `API abuse detected on ${data.endpoint} - rate: ${callRate}/min, errors: ${(errorRate * 100).toFixed(1)}%`,
      riskScore,
      severity: this.calculateSeverity(riskScore),
      features: {
        callRate,
        errorRate,
        responseTime: data.responseTime,
        statusCode: data.statusCode,
        errorCount: data.errorCount
      },
      sourceData: data
    }
  }

  // Correlation engine to detect compound threats
  detectCompoundThreats(recentAnomalies: AnomalyEvent[]): AnomalyEvent[] {
    const compoundThreats: AnomalyEvent[] = []
    const timeWindow = 5 * 60 * 1000 // 5 minutes

    // Group anomalies by user/session within time window
    const groupedByUser = recentAnomalies.reduce((groups, anomaly) => {
      const userId = anomaly.sourceData?.userId || anomaly.sourceData?.sessionId || 'unknown'
      const key = `${userId}_${Math.floor(new Date(anomaly.timestamp).getTime() / timeWindow)}`
      
      if (!groups[key]) groups[key] = []
      groups[key].push(anomaly)
      return groups
    }, {} as Record<string, AnomalyEvent[]>)

    // Look for compound threat patterns
    Object.entries(groupedByUser).forEach(([key, anomalies]) => {
      if (anomalies.length < 2) return

      const types = new Set(anomalies.map(a => a.type))
      const avgRiskScore = anomalies.reduce((sum, a) => sum + a.riskScore, 0) / anomalies.length
      const maxRiskScore = Math.max(...anomalies.map(a => a.riskScore))

      // Pattern: User behavior + Network + Resource = potential compromise
      if (types.has('user_behavior') && types.has('network') && types.has('resource')) {
        compoundThreats.push({
          id: `compound_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          type: 'compound',
          description: `Multi-vector attack detected: abnormal user behavior + suspicious network activity + resource abuse`,
          riskScore: Math.min(1, avgRiskScore + 0.2), // Boost compound threat score
          severity: this.calculateSeverity(Math.min(1, avgRiskScore + 0.2)),
          features: {
            anomalyCount: anomalies.length,
            typeVariety: types.size,
            avgRiskScore,
            maxRiskScore
          },
          sourceData: { compoundEvents: anomalies.length },
          correlatedEvents: anomalies.map(a => a.id)
        })
      }

      // Pattern: Multiple API failures + User behavior = credential stuffing
      if (types.has('api') && types.has('user_behavior')) {
        const apiAnomalies = anomalies.filter(a => a.type === 'api')
        const errorBasedApi = apiAnomalies.filter(a => a.features.errorRate > 0.5)
        
        if (errorBasedApi.length > 0) {
          compoundThreats.push({
            id: `compound_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            type: 'compound',
            description: `Credential stuffing attack detected: repeated API failures + unusual login behavior`,
            riskScore: Math.min(1, avgRiskScore + 0.15),
            severity: this.calculateSeverity(Math.min(1, avgRiskScore + 0.15)),
            features: {
              anomalyCount: anomalies.length,
              apiErrorRate: errorBasedApi.length / apiAnomalies.length,
              avgRiskScore
            },
            sourceData: { compoundEvents: anomalies.length },
            correlatedEvents: anomalies.map(a => a.id)
          })
        }
      }
    })

    return compoundThreats
  }

  private calculateSeverity(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (riskScore >= 0.9) return 'critical'
    if (riskScore >= 0.8) return 'high'
    if (riskScore >= 0.65) return 'medium'
    return 'low'
  }

  updateThreatIntelligence(newThreatIntel: Partial<ThreatIntelligence>): void {
    this.threatIntel = { ...this.threatIntel, ...newThreatIntel }
  }

  getThreatIntelligence(): ThreatIntelligence {
    return { ...this.threatIntel }
  }
}

// Singleton instance
export const anomalyDetection = new AnomalyDetectionEngine()

// Export detection functions
export function detectUserBehaviorAnomaly(data: UserBehaviorData, baseline: BaselineProfile | null) {
  return anomalyDetection.detectUserBehaviorAnomaly(data, baseline)
}

export function detectNetworkAnomaly(data: NetworkActivityData) {
  return anomalyDetection.detectNetworkAnomaly(data)
}

export function detectResourceAnomaly(data: ResourceUsageData) {
  return anomalyDetection.detectResourceAnomaly(data)
}

export function detectApiAnomaly(data: ApiUsageData, recentCalls: ApiUsageData[]) {
  return anomalyDetection.detectApiAnomaly(data, recentCalls)
}

export function detectCompoundThreats(recentAnomalies: AnomalyEvent[]) {
  return anomalyDetection.detectCompoundThreats(recentAnomalies)
}