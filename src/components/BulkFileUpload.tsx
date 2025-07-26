import { useState, useCallback, useEffect } from "react"
import { Upload, File, X, CheckCircle, AlertCircle, Shield, Brain, Globe, Zap, Eye, AlertTriangle, FolderOpen, HardDrive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useAppSettings } from "@/hooks/useAppSettings"
import { useToast } from "@/hooks/use-toast"

interface BulkFileUploadProps {
  onFileAnalyzed?: (tools: string[]) => void
}

interface UploadedFile {
  id: string
  file: File
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  analysis?: AnalysisResult
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

export function BulkFileUpload({ onFileAnalyzed }: BulkFileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [totalProgress, setTotalProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [storageUsed, setStorageUsed] = useState(0)
  const [showDetails, setShowDetails] = useState(false)
  const { settings } = useAppSettings()
  const { toast } = useToast()

  // Real-time storage calculation
  useEffect(() => {
    const totalSize = uploadedFiles.reduce((sum, file) => sum + file.file.size, 0)
    setStorageUsed(totalSize)
  }, [uploadedFiles])

  // Real-time progress calculation
  useEffect(() => {
    if (uploadedFiles.length === 0) {
      setTotalProgress(0)
      return
    }
    
    const totalProgress = uploadedFiles.reduce((sum, file) => sum + file.progress, 0)
    const avgProgress = totalProgress / uploadedFiles.length
    setTotalProgress(avgProgress)
  }, [uploadedFiles])

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
    
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  const handleFiles = (selectedFiles: File[]) => {
    const allowedTypes = ['.zip', '.pdf', '.json', '.csv', '.log', '.txt', '.jpg', '.png', '.wav', '.mp3', '.mp4']
    const validFiles: File[] = []
    let invalidCount = 0

    selectedFiles.forEach(file => {
      const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
      if (allowedTypes.includes(fileExt)) {
        validFiles.push(file)
      } else {
        invalidCount++
      }
    })

    // Skip notification for invalid files

    if (validFiles.length === 0) return

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      status: 'pending',
      progress: 0
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    // Files added silently

    // Auto-start processing
    setTimeout(() => processBatch([...uploadedFiles, ...newFiles]), 1000)
  }

  const processBatch = async (filesToProcess: UploadedFile[]) => {
    setIsProcessing(true)
    
    const pendingFiles = filesToProcess.filter(f => f.status === 'pending')
    if (pendingFiles.length === 0) {
      setIsProcessing(false)
      return
    }

    // Batch processing started silently

    // Process files concurrently with staggered start
    const processingPromises = pendingFiles.map((uploadedFile, index) => 
      new Promise<void>(resolve => {
        setTimeout(() => {
          processFile(uploadedFile.id).then(resolve)
        }, index * 500) // Stagger by 500ms
      })
    )

    await Promise.all(processingPromises)
    setIsProcessing(false)

    // Collect all activated tools
    const allTools = new Set<string>()
    uploadedFiles.forEach(file => {
      if (file.analysis) {
        file.analysis.activatedTools.forEach(tool => allTools.add(tool))
      }
    })

    onFileAnalyzed?.(Array.from(allTools))

    // Batch processing completed silently
  }

  const processFile = async (fileId: string) => {
    const updateFile = (updates: Partial<UploadedFile>) => {
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, ...updates } : f
      ))
    }

    updateFile({ status: 'processing', progress: 0 })

    const file = uploadedFiles.find(f => f.id === fileId)?.file
    if (!file) return

    // Simulate processing stages
    const stages = [25, 50, 75, 100]
    
    for (const progress of stages) {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400))
      updateFile({ progress })

      // Progress update at 50% (silent)
    }

    // Generate analysis result
    const analysis = await generateAnalysisResult(file, fileId)
    updateFile({ 
      status: 'completed', 
      progress: 100, 
      analysis 
    })

    // Analysis completed silently
  }

  const generateAnalysisResult = async (file: File, sessionId: string): Promise<AnalysisResult> => {
    const fileName = file.name.toLowerCase()
    const threats: ThreatDetection[] = []
    const activatedTools: string[] = []
    
    // Simulate content analysis
    const mockDomains = extractMockDomains(fileName)
    const mockEmails = extractMockEmails(fileName)
    const mockPhones = extractMockPhones(fileName)
    
    // Enhanced threat detection based on file content
    if (fileName.includes('email') || fileName.includes('phish')) {
      threats.push({
        type: 'Email Phishing',
        confidence: 85 + Math.random() * 15,
        description: 'Phishing patterns detected in email content',
        severity: 'high',
        details: ['Urgent language detected', 'Suspicious sender domain', 'Contains credential harvesting links']
      })
      activatedTools.push('Email Checker', 'Phishing Detector')
    }
    
    if (fileName.includes('financial') || fileName.includes('money') || fileName.includes('bank')) {
      threats.push({
        type: 'Financial Fraud',
        confidence: 70 + Math.random() * 20,
        description: 'Suspicious financial transaction patterns',
        severity: 'medium',
        details: ['Unusual transaction velocity', 'Cross-border transfers', 'Shell company indicators']
      })
      activatedTools.push('Money Mapper')
    }
    
    if (file.type.includes('audio') || fileName.includes('voice') || fileName.includes('call')) {
      activatedTools.push('Voice Identifier', 'Call Tracer')
    }
    
    if (fileName.includes('social') || fileName.includes('profile') || fileName.includes('user')) {
      activatedTools.push('Social Media Finder')
    }
    
    if (fileName.includes('news') || fileName.includes('article') || fileName.includes('post')) {
      threats.push({
        type: 'Misinformation',
        confidence: 60 + Math.random() * 25,
        description: 'Potential misinformation content detected',
        severity: 'medium',
        details: ['Fact-check discrepancies', 'Biased language patterns', 'Unverified claims']
      })
      activatedTools.push('Fake News Tracker')
    }
    
    if (fileName.includes('network') || fileName.includes('scan') || fileName.includes('log')) {
      activatedTools.push('N-Map', 'AI Security System')
    }
    
    // Always include baseline tools
    activatedTools.push('Safe Document Handler')
    
    const riskScore = threats.length > 0 ? 
      Math.round(threats.reduce((sum, t) => sum + t.confidence, 0) / threats.length) : 
      Math.round(Math.random() * 30)
    
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

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
    
    // File removed silently
  }

  const clearAll = () => {
    setUploadedFiles([])
    setTotalProgress(0)
    setIsProcessing(false)
    
    // Files cleared silently
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getThreatSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-cyber-danger bg-cyber-danger/10 border-cyber-danger/20'
      case 'medium': return 'text-cyber-warning bg-cyber-warning/10 border-cyber-warning/20'
      case 'low': return 'text-cyber-glow bg-cyber-glow/10 border-cyber-glow/20'
      default: return 'text-muted-foreground bg-muted/10 border-muted/20'
    }
  }

  return (
    <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-cyber-glow" />
              <h3 className="text-lg font-semibold text-cyber-glow font-cyber">
                Bulk Data Upload & Analysis
              </h3>
            </div>
            
            {uploadedFiles.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="text-cyber-danger hover:bg-cyber-danger/10 border-cyber-danger/20"
              >
                Clear All
              </Button>
            )}
          </div>

          {/* Storage Info */}
          <div className="flex items-center gap-4 p-3 bg-card/30 rounded-lg border border-cyber-glow/20">
            <HardDrive className="h-5 w-5 text-cyber-glow" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">Storage Used</span>
                <span className="text-xs text-cyber-glow font-mono">{formatFileSize(storageUsed)}</span>
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                Unlimited storage available • {uploadedFiles.length} files uploaded
              </div>
            </div>
          </div>

          {/* Upload Area */}
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
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
              accept=".zip,.pdf,.json,.csv,.log,.txt,.jpg,.png,.gif,.wav,.mp3,.mp4"
            />
            
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-cyber-glow/10 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-cyber-glow" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">
                  Drop unlimited files here
                </p>
                <p className="text-muted-foreground font-mono text-sm">
                  or <span className="text-cyber-glow">click to browse</span> • Multiple file support
                </p>
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                Supports: ZIP, PDF, JSON, CSV, LOG, IMG, Audio • Unlimited storage
              </p>
            </div>
          </div>

          {/* Progress Overview */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-cyber-glow font-cyber">
                  Processing Overview
                </h4>
                <Badge variant="outline" className="font-mono text-xs">
                  {uploadedFiles.filter(f => f.status === 'completed').length}/{uploadedFiles.length} completed
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-mono">Overall Progress</span>
                  <span className="text-cyber-glow font-mono">{Math.round(totalProgress)}%</span>
                </div>
                <Progress value={totalProgress} className="h-2" />
              </div>
            </div>
          )}

          {/* File List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {uploadedFiles.map((uploadedFile) => (
                <div 
                  key={uploadedFile.id}
                  className="p-4 bg-card/30 rounded-lg border border-cyber-glow/20 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <File className="h-5 w-5 text-cyber-glow flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{uploadedFile.file.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {formatFileSize(uploadedFile.file.size)} • {uploadedFile.status}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {uploadedFile.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-accent" />
                      )}
                      {uploadedFile.status === 'error' && (
                        <AlertCircle className="h-4 w-4 text-cyber-danger" />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(uploadedFile.id)}
                        className="hover:text-destructive h-8 w-8"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {uploadedFile.status === 'processing' && (
                    <Progress value={uploadedFile.progress} className="h-1" />
                  )}

                  {uploadedFile.analysis && (
                    <div className="space-y-2 pt-2 border-t border-cyber-glow/10">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-mono">
                          Risk Score: {uploadedFile.analysis.riskScore}%
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {uploadedFile.analysis.threats.length} threats
                        </Badge>
                      </div>
                      
                      {uploadedFile.analysis.threats.length > 0 && (
                        <div className="space-y-1">
                          {uploadedFile.analysis.threats.slice(0, 2).map((threat, idx) => (
                            <div key={idx} className={`text-xs p-2 rounded border ${getThreatSeverityColor(threat.severity)}`}>
                              {threat.type}: {threat.description}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Details Toggle */}
          {uploadedFiles.some(f => f.analysis) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full text-cyber-glow hover:bg-cyber-glow/10"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showDetails ? 'Hide' : 'Show'} Detailed Analysis
            </Button>
          )}

          {/* Detailed Analysis */}
          {showDetails && (
            <div className="space-y-4 p-4 bg-card/20 rounded-lg border border-cyber-glow/20">
              {uploadedFiles.filter(f => f.analysis).map((file) => (
                <div key={file.id} className="space-y-2">
                  <h5 className="text-sm font-medium text-cyber-glow font-cyber">{file.file.name}</h5>
                  <div className="font-mono text-xs space-y-1 text-muted-foreground">
                    <div>Session: {file.analysis!.sessionId}</div>
                    <div>Activated Tools: {file.analysis!.activatedTools.join(', ')}</div>
                    {file.analysis!.fileMetadata.domains.length > 0 && (
                      <div>Domains: {file.analysis!.fileMetadata.domains.join(', ')}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}