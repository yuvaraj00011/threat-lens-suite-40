import { useState, useCallback } from "react"
import { Upload, File, X, CheckCircle, AlertCircle, Shield, Brain, Globe, Zap, Eye, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface FileUploadProps {
  onFileAnalyzed?: (tools: string[]) => void
}

interface ProcessingStage {
  id: string
  name: string
  description: string
  icon: any
  progress: number
  completed: boolean
  active: boolean
}

interface ThreatDetection {
  type: string
  confidence: number
  description: string
  severity: 'low' | 'medium' | 'high'
  details?: string[]
}

interface AnalysisResult {
  sessionId: string
  threats: ThreatDetection[]
  activatedTools: string[]
  riskScore: number
  fileMetadata: {
    type: string
    size: number
    domains: string[]
    emails: string[]
    phones: string[]
  }
}

export function FileUpload({ onFileAnalyzed }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [sessionId, setSessionId] = useState<string>("")
  const [processingStages, setProcessingStages] = useState<ProcessingStage[]>([])
  const [currentStage, setCurrentStage] = useState<number>(-1)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFile = (selectedFile: File) => {
    // Validate file format
    const allowedTypes = ['.zip', '.pdf', '.json', '.csv', '.log', '.txt', '.jpg', '.png', '.wav', '.mp3']
    const fileExt = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'))
    
    if (!allowedTypes.includes(fileExt)) {
      alert('Unsupported file format. Please upload ZIP, PDF, JSON, CSV, LOG, IMG, or audio files.')
      return
    }

    setFile(selectedFile)
    const newSessionId = `UCIIP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setSessionId(newSessionId)
    startAdvancedProcessing(selectedFile, newSessionId)
  }

  const startAdvancedProcessing = async (file: File, sessionId: string) => {
    // Initialize four-stage processing pipeline
    const stages: ProcessingStage[] = [
      {
        id: 'upload',
        name: 'Upload Detection',
        description: 'Validating file and creating session tracking',
        icon: Upload,
        progress: 0,
        completed: false,
        active: true
      },
      {
        id: 'analysis',
        name: 'AI Content Analysis',
        description: 'Pattern recognition and threat classification',
        icon: Brain,
        progress: 0,
        completed: false,
        active: false
      },
      {
        id: 'scam-detection',
        name: 'Domain Scam Detection',
        description: 'NLP algorithms scanning for threats',
        icon: Shield,
        progress: 0,
        completed: false,
        active: false
      },
      {
        id: 'tool-activation',
        name: 'Tool Activation',
        description: 'Enabling relevant investigation tools',
        icon: Zap,
        progress: 0,
        completed: false,
        active: false
      }
    ]

    setProcessingStages(stages)
    setCurrentStage(0)

    // Stage 1: Upload Detection
    await runUploadDetection(stages[0], file)
    
    // Stage 2: AI Content Analysis  
    await runContentAnalysis(stages[1], file)
    
    // Stage 3: Domain Scam Detection
    await runScamDetection(stages[2], file)
    
    // Stage 4: Tool Activation
    await runToolActivation(stages[3], file, sessionId)
  }

  const runUploadDetection = async (stage: ProcessingStage, file: File) => {
    setCurrentStage(0)
    
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setProcessingStages(prev => prev.map((s, idx) => 
        idx === 0 ? { ...s, progress: i, active: true } : s
      ))
    }
    
    setProcessingStages(prev => prev.map((s, idx) => 
      idx === 0 ? { ...s, completed: true, active: false } : 
      idx === 1 ? { ...s, active: true } : s
    ))
  }

  const runContentAnalysis = async (stage: ProcessingStage, file: File) => {
    setCurrentStage(1)
    
    for (let i = 0; i <= 100; i += 15) {
      await new Promise(resolve => setTimeout(resolve, 300))
      setProcessingStages(prev => prev.map((s, idx) => 
        idx === 1 ? { ...s, progress: i } : s
      ))
    }
    
    setProcessingStages(prev => prev.map((s, idx) => 
      idx === 1 ? { ...s, completed: true, active: false } : 
      idx === 2 ? { ...s, active: true } : s
    ))
  }

  const runScamDetection = async (stage: ProcessingStage, file: File) => {
    setCurrentStage(2)
    
    for (let i = 0; i <= 100; i += 25) {
      await new Promise(resolve => setTimeout(resolve, 250))
      setProcessingStages(prev => prev.map((s, idx) => 
        idx === 2 ? { ...s, progress: i } : s
      ))
    }
    
    setProcessingStages(prev => prev.map((s, idx) => 
      idx === 2 ? { ...s, completed: true, active: false } : 
      idx === 3 ? { ...s, active: true } : s
    ))
  }

  const runToolActivation = async (stage: ProcessingStage, file: File, sessionId: string) => {
    setCurrentStage(3)
    
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setProcessingStages(prev => prev.map((s, idx) => 
        idx === 3 ? { ...s, progress: i } : s
      ))
    }
    
    // Generate comprehensive analysis results
    const result = await generateAnalysisResult(file, sessionId)
    setAnalysisResult(result)
    
    setProcessingStages(prev => prev.map((s, idx) => 
      idx === 3 ? { ...s, completed: true, active: false, progress: 100 } : s
    ))
    
    setCurrentStage(-1)
    onFileAnalyzed?.(result.activatedTools)
  }

  const generateAnalysisResult = async (file: File, sessionId: string): Promise<AnalysisResult> => {
    const fileName = file.name.toLowerCase()
    const threats: ThreatDetection[] = []
    const activatedTools: string[] = []
    
    // Simulate content analysis
    const mockDomains = extractMockDomains(fileName)
    const mockEmails = extractMockEmails(fileName)
    const mockPhones = extractMockPhones(fileName)
    
    // Domain scam detection
    mockDomains.forEach(domain => {
      const confidence = Math.random() * 100
      if (confidence > 70) {
        threats.push({
          type: 'Suspicious Domain',
          confidence: Math.round(confidence),
          description: `Domain ${domain} shows indicators of malicious activity`,
          severity: confidence > 85 ? 'high' : 'medium',
          details: ['Newly registered domain', 'No valid SSL certificate', 'Similar to known phishing sites']
        })
      }
    })
    
    // Email threats
    if (fileName.includes('email') || fileName.includes('phish')) {
      threats.push({
        type: 'Email Phishing',
        confidence: 92,
        description: 'Phishing patterns detected in email content',
        severity: 'high',
        details: ['Urgent language detected', 'Suspicious sender domain', 'Contains credential harvesting links']
      })
      activatedTools.push('Email Checker', 'Phishing Detector')
    }
    
    // Financial threats
    if (fileName.includes('financial') || fileName.includes('money') || fileName.includes('bank')) {
      threats.push({
        type: 'Financial Fraud',
        confidence: 78,
        description: 'Suspicious financial transaction patterns',
        severity: 'medium',
        details: ['Unusual transaction velocity', 'Cross-border transfers', 'Shell company indicators']
      })
      activatedTools.push('Money Mapper')
    }
    
    // Voice/Audio analysis
    if (file.type.includes('audio') || fileName.includes('voice') || fileName.includes('call')) {
      activatedTools.push('Voice Identifier', 'Call Tracer')
    }
    
    // Social media content
    if (fileName.includes('social') || fileName.includes('profile') || fileName.includes('user')) {
      activatedTools.push('Social Media Finder')
    }
    
    // News/Misinformation
    if (fileName.includes('news') || fileName.includes('article') || fileName.includes('post')) {
      threats.push({
        type: 'Misinformation',
        confidence: 65,
        description: 'Potential misinformation content detected',
        severity: 'medium',
        details: ['Fact-check discrepancies', 'Biased language patterns', 'Unverified claims']
      })
      activatedTools.push('Fake News Tracker')
    }
    
    // Network/Security files
    if (fileName.includes('network') || fileName.includes('scan') || fileName.includes('log')) {
      activatedTools.push('N-Map', 'AI Security System')
    }
    
    // Document files always activate Safe Document Handler
    if (fileName.includes('doc') || fileName.includes('pdf') || file.type.includes('document') || 
        file.type.includes('text') || file.type.includes('pdf')) {
      activatedTools.push('Safe Document Handler')
    }
    
    // Always include baseline tools for comprehensive analysis
    if (!activatedTools.includes('Safe Document Handler')) {
      activatedTools.push('Safe Document Handler')
    }
    
    // Calculate overall risk score
    const riskScore = threats.length > 0 ? 
      Math.round(threats.reduce((sum, t) => sum + t.confidence, 0) / threats.length) : 
      Math.round(Math.random() * 30) // Low baseline risk
    
    return {
      sessionId,
      threats,
      activatedTools: [...new Set(activatedTools)],
      riskScore,
      fileMetadata: {
        type: file.type || 'unknown',
        size: file.size,
        domains: mockDomains,
        emails: mockEmails,
        phones: mockPhones
      }
    }
  }

  const extractMockDomains = (fileName: string): string[] => {
    const domains = ['suspicious-site.com', 'fake-bank.net', 'phish-mail.org']
    if (fileName.includes('phish') || fileName.includes('scam')) {
      return domains.slice(0, 2)
    }
    return fileName.includes('email') ? [domains[0]] : []
  }

  const extractMockEmails = (fileName: string): string[] => {
    if (fileName.includes('email') || fileName.includes('contact')) {
      return ['attacker@suspicious-site.com', 'admin@fake-bank.net']
    }
    return []
  }

  const extractMockPhones = (fileName: string): string[] => {
    if (fileName.includes('call') || fileName.includes('phone') || fileName.includes('contact')) {
      return ['+1-555-SCAM-123', '+44-207-FAKE-456']
    }
    return []
  }

  const getThreatSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'low': return 'text-green-400 bg-green-400/10 border-green-400/20'
      default: return 'text-muted-foreground bg-muted/10 border-muted/20'
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-400'
    if (score >= 40) return 'text-yellow-400'
    return 'text-green-400'
  }

  const removeFile = () => {
    setFile(null)
    setSessionId("")
    setProcessingStages([])
    setCurrentStage(-1)
    setAnalysisResult(null)
    setShowDetails(false)
    onFileAnalyzed?.([])
  }

  return (
    <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-cyber-glow" />
            <h3 className="text-lg font-semibold text-cyber-glow font-cyber">
              Data Upload & Analysis
            </h3>
          </div>

          {!file ? (
            <div
              className={`
                relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
                ${dragActive 
                  ? "border-cyber-glow bg-cyber-glow/10 shadow-cyber" 
                  : "border-cyber-glow/30 hover:border-cyber-glow/50 hover:bg-cyber-glow/5"
                }
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                accept=".zip,.pdf,.json,.csv,.log,.txt,.jpg,.png,.gif,.wav,.mp3,.mp4"
              />
              
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-cyber-glow/10 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-cyber-glow" />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">
                    Drop your data dump here
                  </p>
                  <p className="text-muted-foreground font-mono text-sm">
                    or <span className="text-cyber-glow">click to browse</span>
                  </p>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  Supports: ZIP, PDF, JSON, CSV, LOG, IMG (JPG/PNG), Audio (WAV/MP3)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Info Header */}
              <div className="flex items-center justify-between p-4 bg-card/30 rounded-lg border border-cyber-glow/20">
                <div className="flex items-center gap-3">
                  <File className="h-8 w-8 text-cyber-glow" />
                  <div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono">
                      <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      {sessionId && <span>Session: {sessionId}</span>}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                  className="hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Processing Pipeline */}
              {processingStages.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-cyber-glow font-cyber">
                    Advanced Processing Pipeline
                  </h4>
                  <div className="space-y-3">
                    {processingStages.map((stage, index) => (
                      <div 
                        key={stage.id}
                        className={`
                          p-4 rounded-lg border transition-all duration-500
                          ${stage.active 
                            ? 'border-cyber-glow bg-cyber-glow/10 shadow-cyber animate-pulse-glow' 
                            : stage.completed 
                            ? 'border-accent bg-accent/10' 
                            : 'border-cyber-glow/20 bg-card/20'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <stage.icon className={`
                            h-5 w-5 transition-colors duration-300
                            ${stage.active 
                              ? 'text-cyber-glow animate-pulse' 
                              : stage.completed 
                              ? 'text-accent' 
                              : 'text-muted-foreground'
                            }
                          `} />
                          <span className={`
                            font-medium font-cyber
                            ${stage.active 
                              ? 'text-cyber-glow' 
                              : stage.completed 
                              ? 'text-accent' 
                              : 'text-foreground'
                            }
                          `}>
                            {stage.name}
                          </span>
                          {stage.completed && (
                            <CheckCircle className="h-4 w-4 text-accent ml-auto" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mb-2">
                          {stage.description}
                        </p>
                        {(stage.active || stage.completed) && (
                          <Progress 
                            value={stage.progress} 
                            className={`
                              h-1 transition-all duration-300
                              ${stage.active ? 'opacity-100' : 'opacity-60'}
                            `}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analysis Results */}
              {analysisResult && (
                <div className="space-y-4">
                  {/* Risk Score Dashboard */}
                  <div className="p-4 bg-card/30 rounded-lg border border-cyber-glow/20">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-cyber-glow font-cyber">
                        Threat Analysis Complete
                      </h4>
                      <Badge variant="outline" className={`
                        font-mono text-xs px-3 py-1
                        ${getRiskScoreColor(analysisResult.riskScore)}
                      `}>
                        Risk Score: {analysisResult.riskScore}%
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-cyber-glow font-cyber">
                          {analysisResult.threats.length}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          Threats Detected
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-accent font-cyber">
                          {analysisResult.activatedTools.length}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          Tools Activated
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-cyber-glow-secondary font-cyber">
                          {analysisResult.fileMetadata.domains.length + 
                           analysisResult.fileMetadata.emails.length + 
                           analysisResult.fileMetadata.phones.length}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          IOCs Found
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Threat Cards */}
                  {analysisResult.threats.length > 0 && (
                    <div className="space-y-3">
                      <h5 className="text-sm font-medium text-red-400 font-cyber flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Detected Threats
                      </h5>
                      {analysisResult.threats.map((threat, index) => (
                        <div 
                          key={index}
                          className={`
                            p-3 rounded-lg border transition-all duration-300 hover:shadow-lg
                            ${getThreatSeverityColor(threat.severity)}
                          `}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium font-cyber text-sm">
                              {threat.type}
                            </span>
                            <Badge variant="outline" className="text-xs font-mono">
                              {threat.confidence}% confidence
                            </Badge>
                          </div>
                          <p className="text-xs font-mono mb-2">
                            {threat.description}
                          </p>
                          {threat.details && (
                            <div className="space-y-1">
                              {threat.details.map((detail, idx) => (
                                <div key={idx} className="text-xs font-mono opacity-75 flex items-center gap-1">
                                  <div className="w-1 h-1 bg-current rounded-full" />
                                  {detail}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Activated Tools */}
                  <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-4 w-4 text-accent animate-pulse-glow" />
                      <span className="text-sm font-medium text-accent font-cyber">
                        Investigation Tools Activated
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.activatedTools.map((tool, index) => (
                        <Badge 
                          key={index}
                          variant="outline" 
                          className="text-xs font-mono bg-accent/10 text-accent border-accent/30 hover:bg-accent/20 transition-all duration-300 hover:shadow-cyber"
                        >
                          {tool}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-3">
                      Tools are now available in the grid below with enhanced investigation capabilities.
                    </p>
                  </div>

                  {/* Details Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-full text-cyber-glow hover:bg-cyber-glow/10"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showDetails ? 'Hide' : 'Show'} Technical Details
                  </Button>

                  {/* Technical Details */}
                  {showDetails && (
                    <div className="p-4 bg-card/20 rounded-lg border border-cyber-glow/20 font-mono text-xs space-y-3">
                      <div>
                        <span className="text-cyber-glow">Session ID:</span> {analysisResult.sessionId}
                      </div>
                      <div>
                        <span className="text-cyber-glow">File Type:</span> {analysisResult.fileMetadata.type}
                      </div>
                      {analysisResult.fileMetadata.domains.length > 0 && (
                        <div>
                          <span className="text-cyber-glow">Domains:</span> {analysisResult.fileMetadata.domains.join(', ')}
                        </div>
                      )}
                      {analysisResult.fileMetadata.emails.length > 0 && (
                        <div>
                          <span className="text-cyber-glow">Emails:</span> {analysisResult.fileMetadata.emails.join(', ')}
                        </div>
                      )}
                      {analysisResult.fileMetadata.phones.length > 0 && (
                        <div>
                          <span className="text-cyber-glow">Phones:</span> {analysisResult.fileMetadata.phones.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}