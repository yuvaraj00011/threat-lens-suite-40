import { useState, useCallback, useEffect } from "react"
import { CheckCircle, Clock, AlertCircle, Play, Pause, RotateCcw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { INVESTIGATION_CATEGORIES, CategorizedData } from "./DataCategorizationEngine"

export interface ToolExecutionStatus {
  toolId: string
  toolName: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused'
  progress: number
  startTime?: number
  endTime?: number
  duration?: number
  filesProcessed: number
  totalFiles: number
  results?: ToolAnalysisResult
  error?: string
}

export interface ToolAnalysisResult {
  toolId: string
  summary: string
  findings: ToolFinding[]
  threatLevel: 'low' | 'medium' | 'high'
  confidence: number
  metadata: Record<string, any>
}

export interface ToolFinding {
  id: string
  type: string
  description: string
  severity: 'info' | 'warning' | 'critical'
  data: any
  timestamp: string
  relatedItems?: string[]
}

export interface AutoExecutionState {
  isRunning: boolean
  isPaused: boolean
  completedTools: number
  totalTools: number
  overallProgress: number
  startTime?: number
  estimatedTimeRemaining?: number
  toolStatuses: ToolExecutionStatus[]
}

interface AutoExecutionEngineProps {
  categorizedData: CategorizedData[]
  selectedCategories: string[]
  isOpen: boolean
  onClose: () => void
  onComplete: (results: ToolAnalysisResult[]) => void
}

class AutoExecutionEngine {
  private executionCallbacks: ((status: AutoExecutionState) => void)[] = []
  private currentExecution: AutoExecutionState | null = null

  async executeTools(
    categorizedData: CategorizedData[], 
    selectedCategories: string[],
    onStatusUpdate: (status: AutoExecutionState) => void
  ): Promise<ToolAnalysisResult[]> {
    // Filter data for selected categories
    const selectedData = categorizedData.filter(data => 
      selectedCategories.includes(data.category)
    )

    if (selectedData.length === 0) {
      throw new Error('No data to process')
    }

    // Initialize execution state
    const initialState: AutoExecutionState = {
      isRunning: true,
      isPaused: false,
      completedTools: 0,
      totalTools: selectedData.length,
      overallProgress: 0,
      startTime: Date.now(),
      toolStatuses: selectedData.map(data => ({
        toolId: data.category,
        toolName: this.getToolName(data.category),
        status: 'pending',
        progress: 0,
        filesProcessed: 0,
        totalFiles: data.files.length
      }))
    }

    this.currentExecution = initialState
    onStatusUpdate(initialState)

    const results: ToolAnalysisResult[] = []

    // Execute each tool sequentially
    for (let i = 0; i < selectedData.length; i++) {
      const data = selectedData[i]
      
      // Update tool status to running
      this.updateToolStatus(data.category, {
        status: 'running',
        startTime: Date.now()
      })
      onStatusUpdate(this.currentExecution!)

      try {
        // Simulate tool execution
        const result = await this.executeIndividualTool(data, (progress) => {
          this.updateToolStatus(data.category, {
            progress,
            filesProcessed: Math.floor(data.files.length * progress / 100)
          })
          this.updateOverallProgress()
          onStatusUpdate(this.currentExecution!)
        })

        // Mark tool as completed
        this.updateToolStatus(data.category, {
          status: 'completed',
          progress: 100,
          endTime: Date.now(),
          results: result,
          filesProcessed: data.files.length
        })

        this.currentExecution!.completedTools++
        results.push(result)

      } catch (error) {
        // Mark tool as failed
        this.updateToolStatus(data.category, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }

      this.updateOverallProgress()
      onStatusUpdate(this.currentExecution!)
    }

    // Mark execution as complete
    this.currentExecution!.isRunning = false
    onStatusUpdate(this.currentExecution!)

    return results
  }

  private updateToolStatus(toolId: string, updates: Partial<ToolExecutionStatus>) {
    if (!this.currentExecution) return

    const toolIndex = this.currentExecution.toolStatuses.findIndex(t => t.toolId === toolId)
    if (toolIndex !== -1) {
      this.currentExecution.toolStatuses[toolIndex] = {
        ...this.currentExecution.toolStatuses[toolIndex],
        ...updates
      }

      // Calculate duration if both start and end times are available
      const tool = this.currentExecution.toolStatuses[toolIndex]
      if (tool.startTime && tool.endTime) {
        tool.duration = tool.endTime - tool.startTime
      }
    }
  }

  private updateOverallProgress() {
    if (!this.currentExecution) return

    const totalProgress = this.currentExecution.toolStatuses.reduce((sum, tool) => 
      sum + tool.progress, 0
    )
    this.currentExecution.overallProgress = totalProgress / this.currentExecution.totalTools

    // Estimate time remaining
    if (this.currentExecution.startTime && this.currentExecution.overallProgress > 0) {
      const elapsed = Date.now() - this.currentExecution.startTime
      const estimatedTotal = elapsed / (this.currentExecution.overallProgress / 100)
      this.currentExecution.estimatedTimeRemaining = estimatedTotal - elapsed
    }
  }

  private async executeIndividualTool(
    data: CategorizedData, 
    onProgress: (progress: number) => void
  ): Promise<ToolAnalysisResult> {
    // Simulate realistic tool execution with progressive updates
    const toolId = data.category
    const totalSteps = 10 + Math.floor(Math.random() * 5) // 10-14 steps
    
    for (let step = 0; step <= totalSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300)) // 200-500ms per step
      const progress = (step / totalSteps) * 100
      onProgress(progress)
    }

    // Generate realistic analysis results based on tool type
    return this.generateToolResults(toolId, data)
  }

  private generateToolResults(toolId: string, data: CategorizedData): ToolAnalysisResult {
    const findings = this.generateFindings(toolId, data.files.length)
    const threatLevel = this.calculateThreatLevel(findings)
    
    return {
      toolId,
      summary: this.generateSummary(toolId, findings),
      findings,
      threatLevel,
      confidence: 0.75 + Math.random() * 0.25, // 75-100%
      metadata: {
        filesAnalyzed: data.files.length,
        processingTime: 2000 + Math.random() * 3000,
        version: '2.1.0',
        lastUpdated: new Date().toISOString()
      }
    }
  }

  private generateFindings(toolId: string, fileCount: number): ToolFinding[] {
    const findings: ToolFinding[] = []
    const findingCount = Math.min(fileCount, 3 + Math.floor(Math.random() * 5)) // 3-7 findings max

    const findingTemplates: Record<string, any> = {
      'email-checker': [
        { type: 'suspicious_sender', description: 'Email from known malicious domain', severity: 'critical' },
        { type: 'phishing_attempt', description: 'Potential phishing email detected', severity: 'warning' },
        { type: 'attachment_threat', description: 'Suspicious attachment found', severity: 'warning' },
        { type: 'spoofed_header', description: 'Email header spoofing detected', severity: 'critical' }
      ],
      'call-tracer': [
        { type: 'suspicious_number', description: 'Call from reported scam number', severity: 'warning' },
        { type: 'location_mismatch', description: 'Caller location inconsistency', severity: 'info' },
        { type: 'frequent_calls', description: 'Unusually high call frequency', severity: 'warning' },
        { type: 'unknown_number', description: 'Call from unregistered number', severity: 'info' }
      ],
      'phishing-detector': [
        { type: 'malicious_url', description: 'Known malicious URL detected', severity: 'critical' },
        { type: 'suspicious_domain', description: 'Newly registered suspicious domain', severity: 'warning' },
        { type: 'url_shortener', description: 'Suspicious URL shortener used', severity: 'warning' },
        { type: 'typosquatting', description: 'Domain typosquatting detected', severity: 'critical' }
      ],
      'money-mapper': [
        { type: 'large_transfer', description: 'Unusually large money transfer', severity: 'warning' },
        { type: 'foreign_account', description: 'Transfer to foreign account', severity: 'info' },
        { type: 'rapid_transactions', description: 'Rapid succession of transactions', severity: 'warning' },
        { type: 'suspicious_recipient', description: 'Transfer to flagged account', severity: 'critical' }
      ],
      'fake-news-tracker': [
        { type: 'false_claim', description: 'Factually incorrect information detected', severity: 'warning' },
        { type: 'misleading_headline', description: 'Misleading headline identified', severity: 'info' },
        { type: 'biased_source', description: 'Information from biased source', severity: 'info' },
        { type: 'unverified_claim', description: 'Unverified claim requiring fact-check', severity: 'warning' }
      ],
      'nmap-scanner': [
        { type: 'open_port', description: 'Unnecessary open port detected', severity: 'warning' },
        { type: 'vulnerable_service', description: 'Vulnerable service version found', severity: 'critical' },
        { type: 'weak_encryption', description: 'Weak encryption protocol in use', severity: 'warning' },
        { type: 'unauthorized_service', description: 'Unauthorized service running', severity: 'critical' }
      ],
      'voice-identifier': [
        { type: 'voice_match', description: 'Voice pattern matches known individual', severity: 'info' },
        { type: 'voice_spoofing', description: 'Potential voice spoofing detected', severity: 'warning' },
        { type: 'background_noise', description: 'Suspicious background noise analysis', severity: 'info' },
        { type: 'stress_indicators', description: 'Voice stress indicators detected', severity: 'warning' }
      ],
      'ai-security': [
        { type: 'anomaly_detected', description: 'Behavioral anomaly identified', severity: 'warning' },
        { type: 'security_breach', description: 'Potential security breach detected', severity: 'critical' },
        { type: 'unauthorized_access', description: 'Unauthorized access attempt', severity: 'critical' },
        { type: 'suspicious_activity', description: 'Suspicious user activity pattern', severity: 'warning' }
      ],
      'social-media-finder': [
        { type: 'fake_profile', description: 'Potentially fake social media profile', severity: 'warning' },
        { type: 'linked_accounts', description: 'Multiple linked suspicious accounts', severity: 'info' },
        { type: 'bot_activity', description: 'Automated bot activity detected', severity: 'warning' },
        { type: 'coordinated_behavior', description: 'Coordinated inauthentic behavior', severity: 'critical' }
      ],
      'document-handler': [
        { type: 'malware_detected', description: 'Malware found in document', severity: 'critical' },
        { type: 'suspicious_macro', description: 'Suspicious macro code detected', severity: 'warning' },
        { type: 'hidden_content', description: 'Hidden content found in document', severity: 'warning' },
        { type: 'data_exfiltration', description: 'Potential data exfiltration attempt', severity: 'critical' }
      ]
    }

    const templates = findingTemplates[toolId] || []
    
    for (let i = 0; i < findingCount; i++) {
      const template = templates[Math.floor(Math.random() * templates.length)]
      if (template) {
        findings.push({
          id: `${toolId}_${i + 1}`,
          type: template.type,
          description: template.description,
          severity: template.severity,
          data: this.generateFindingData(toolId, template.type),
          timestamp: new Date().toISOString(),
          relatedItems: Math.random() > 0.7 ? [`related_${i}`, `linked_${i}`] : undefined
        })
      }
    }

    return findings
  }

  private generateFindingData(toolId: string, type: string): any {
    // Generate realistic data based on finding type
    const dataTemplates: Record<string, any> = {
      suspicious_sender: { email: 'malicious@suspicious-domain.ru', reputation: 'blacklisted' },
      malicious_url: { url: 'https://fake-bank-login.com/secure', risk_score: 95 },
      large_transfer: { amount: '$' + (Math.random() * 50000 + 10000).toFixed(2), destination: 'Offshore Account' },
      voice_match: { confidence: (Math.random() * 30 + 70).toFixed(1) + '%', speaker_id: 'SPEAKER_' + Math.floor(Math.random() * 1000) }
    }

    return dataTemplates[type] || { value: 'detected', confidence: Math.floor(Math.random() * 40 + 60) }
  }

  private calculateThreatLevel(findings: ToolFinding[]): 'low' | 'medium' | 'high' {
    const criticalCount = findings.filter(f => f.severity === 'critical').length
    const warningCount = findings.filter(f => f.severity === 'warning').length

    if (criticalCount > 0) return 'high'
    if (warningCount > 2) return 'medium'
    return 'low'
  }

  private generateSummary(toolId: string, findings: ToolFinding[]): string {
    const toolName = this.getToolName(toolId)
    const criticalCount = findings.filter(f => f.severity === 'critical').length
    const warningCount = findings.filter(f => f.severity === 'warning').length

    if (criticalCount > 0) {
      return `${toolName} detected ${criticalCount} critical threat${criticalCount > 1 ? 's' : ''} requiring immediate attention.`
    } else if (warningCount > 0) {
      return `${toolName} identified ${warningCount} potential issue${warningCount > 1 ? 's' : ''} for review.`
    } else {
      return `${toolName} analysis completed successfully with no major threats detected.`
    }
  }

  private getToolName(toolId: string): string {
    const category = INVESTIGATION_CATEGORIES.find(cat => cat.id === toolId)
    return category?.name || toolId
  }

  pauseExecution() {
    if (this.currentExecution) {
      this.currentExecution.isPaused = true
    }
  }

  resumeExecution() {
    if (this.currentExecution) {
      this.currentExecution.isPaused = false
    }
  }

  getCurrentState(): AutoExecutionState | null {
    return this.currentExecution
  }
}

// Singleton instance
export const autoExecutionEngine = new AutoExecutionEngine()

export function AutoExecutionMonitor({ 
  categorizedData, 
  selectedCategories, 
  isOpen, 
  onClose, 
  onComplete 
}: AutoExecutionEngineProps) {
  const { toast } = useToast()
  const [executionState, setExecutionState] = useState<AutoExecutionState | null>(null)
  const [isStarted, setIsStarted] = useState(false)

  const startExecution = useCallback(async () => {
    if (isStarted) return

    setIsStarted(true)
    toast({
      title: "Analysis Started",
      description: `Beginning automated analysis of ${selectedCategories.length} investigation tools.`
    })

    try {
      const results = await autoExecutionEngine.executeTools(
        categorizedData,
        selectedCategories,
        setExecutionState
      )

      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed data using ${selectedCategories.length} tools.`
      })

      // Wait a moment before calling onComplete to show final state
      setTimeout(() => {
        onComplete(results)
      }, 1000)

    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      })
    }
  }, [categorizedData, selectedCategories, isStarted, onComplete, toast])

  // Auto-start execution when dialog opens
  useEffect(() => {
    if (isOpen && !isStarted) {
      // Small delay to show the initial state
      setTimeout(startExecution, 500)
    }
  }, [isOpen, isStarted, startExecution])

  const getStatusIcon = (status: ToolExecutionStatus['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'running': return <Clock className="h-4 w-4 text-blue-400 animate-spin" />
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-400" />
      case 'paused': return <Pause className="h-4 w-4 text-yellow-400" />
      default: return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: ToolExecutionStatus['status']) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'running': return 'text-blue-400'
      case 'failed': return 'text-red-400'
      case 'paused': return 'text-yellow-400'
      default: return 'text-muted-foreground'
    }
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur border-cyber-glow/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-cyber-glow font-cyber">
            <Play className="h-6 w-6" />
            Auto-Execution Monitor
          </DialogTitle>
        </DialogHeader>

        {executionState && (
          <div className="space-y-6">
            {/* Overall Progress */}
            <Card className="bg-card/50 border-cyber-glow/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-cyber-glow font-cyber">
                    Overall Progress
                  </CardTitle>
                  <Badge variant="outline" className="font-mono">
                    {executionState.completedTools}/{executionState.totalTools} tools
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress 
                  value={executionState.overallProgress} 
                  className="h-3 bg-muted/20"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    {executionState.isRunning ? 'Running...' : 'Completed'}
                  </span>
                  {executionState.estimatedTimeRemaining && executionState.isRunning && (
                    <span>
                      Est. {formatDuration(executionState.estimatedTimeRemaining)} remaining
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tool Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {executionState.toolStatuses.map((tool) => (
                <Card 
                  key={tool.toolId}
                  className={`
                    bg-card/30 border transition-all duration-300
                    ${tool.status === 'completed' 
                      ? 'border-green-400/50 bg-green-400/5' 
                      : tool.status === 'running' 
                        ? 'border-blue-400/50 bg-blue-400/5 animate-pulse-glow' 
                        : tool.status === 'failed' 
                          ? 'border-red-400/50 bg-red-400/5'
                          : 'border-cyber-glow/20'
                    }
                  `}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-cyber">
                        {tool.toolName}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tool.status)}
                        <span className={`text-xs font-mono ${getStatusColor(tool.status)}`}>
                          {tool.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Progress 
                      value={tool.progress} 
                      className="h-2 bg-muted/20"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{tool.filesProcessed}/{tool.totalFiles} files</span>
                      {tool.duration && (
                        <span>{formatDuration(tool.duration)}</span>
                      )}
                    </div>
                    {tool.results && (
                      <div className="text-xs">
                        <Badge 
                          variant="outline" 
                          className={`
                            ${tool.results.threatLevel === 'high' 
                              ? 'border-red-400/50 text-red-400' 
                              : tool.results.threatLevel === 'medium' 
                                ? 'border-yellow-400/50 text-yellow-400' 
                                : 'border-green-400/50 text-green-400'
                            }
                          `}
                        >
                          {tool.results.threatLevel.toUpperCase()} THREAT
                        </Badge>
                        <p className="mt-1 text-muted-foreground">
                          {tool.results.findings.length} findings detected
                        </p>
                      </div>
                    )}
                    {tool.error && (
                      <p className="text-xs text-red-400">
                        Error: {tool.error}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center">
              {!executionState.isRunning ? (
                <Button 
                  variant="cyber" 
                  onClick={onClose}
                  className="min-w-32"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Analysis Complete
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => autoExecutionEngine.pauseExecution()}
                    disabled={executionState.isPaused}
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => autoExecutionEngine.resumeExecution()}
                    disabled={!executionState.isPaused}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}