import { useState, useRef, useEffect } from "react"
import { 
  Mail, 
  Upload, 
  FileText, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Download, 
  Eye, 
  ChevronDown, 
  ChevronRight,
  ExternalLink,
  Clock,
  User,
  Server,
  Zap,
  RotateCcw,
  History,
  Calendar
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

interface EmailAnalysis {
  id: string
  sender: string
  subject: string
  date: string
  riskScore: number
  riskLevel: 'safe' | 'warning' | 'threat'
  spfStatus: 'pass' | 'fail' | 'neutral'
  dkimStatus: 'pass' | 'fail' | 'neutral'
  dmarcStatus: 'pass' | 'fail' | 'neutral'
  phishingIndicators: string[]
  suspiciousLinks: string[]
  attachments: Array<{
    name: string
    verdict: 'clean' | 'suspicious' | 'dangerous'
  }>
  routingPath: Array<{
    server: string
    timestamp: string
    ip: string
  }>
  fullHeaders: string
  anomalies: string[]
}

interface ScanSession {
  id: string
  uploadedFiles: string[]
  emailAnalyses: EmailAnalysis[]
  timestamp: string
  totalFiles: number
  threatCount: number
}

interface EmailCheckerProps {
  isOpen: boolean
  onClose: () => void
}

const SCAN_PHASES = [
  { id: 'upload', name: 'File Processing', icon: Upload },
  { id: 'headers', name: 'Header Validation (SPF/DKIM/DMARC)', icon: Shield },
  { id: 'nlp', name: 'NLP Phishing Detection', icon: Zap },
  { id: 'reputation', name: 'Reputation Scoring', icon: User },
  { id: 'heatmap', name: 'Threat Heatmap Generation', icon: Server }
]

export function EmailChecker({ isOpen, onClose }: EmailCheckerProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [progress, setProgress] = useState(0)
  const [emailAnalyses, setEmailAnalyses] = useState<EmailAnalysis[]>([])
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set())
  const [scanHistory, setScanHistory] = useState<ScanSession[]>([])
  const [currentView, setCurrentView] = useState<'current' | 'history'>('current')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Load session data on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('emailChecker_currentSession')
    const savedHistory = localStorage.getItem('emailChecker_history')
    
    if (savedSession) {
      const session = JSON.parse(savedSession)
      setEmailAnalyses(session.emailAnalyses || [])
    }
    
    if (savedHistory) {
      setScanHistory(JSON.parse(savedHistory))
    }
  }, [])

  // Save current session to localStorage
  const saveCurrentSession = (analyses: EmailAnalysis[], files: string[]) => {
    const session = {
      emailAnalyses: analyses,
      uploadedFiles: files,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('emailChecker_currentSession', JSON.stringify(session))
  }

  // Save to history
  const saveToHistory = (analyses: EmailAnalysis[], files: string[]) => {
    const session: ScanSession = {
      id: Date.now().toString(),
      uploadedFiles: files,
      emailAnalyses: analyses,
      timestamp: new Date().toISOString(),
      totalFiles: files.length,
      threatCount: analyses.filter(e => e.riskLevel === 'threat').length
    }
    
    const updatedHistory = [session, ...scanHistory].slice(0, 10) // Keep last 10 sessions
    setScanHistory(updatedHistory)
    localStorage.setItem('emailChecker_history', JSON.stringify(updatedHistory))
  }

  // Reset current session
  const resetSession = () => {
    setUploadedFiles([])
    setEmailAnalyses([])
    setIsScanning(false)
    setProgress(0)
    setCurrentPhase(0)
    setExpandedEmails(new Set())
    setCurrentView('current')
    localStorage.removeItem('emailChecker_currentSession')
    
    toast({
      title: "Session reset",
      description: "Ready for new email analysis"
    })
  }

  // Load historical session
  const loadHistoricalSession = (sessionId: string) => {
    const session = scanHistory.find(s => s.id === sessionId)
    if (session) {
      setEmailAnalyses(session.emailAnalyses)
      setCurrentView('current')
      
      toast({
        title: "Historical scan loaded",
        description: `Viewing scan from ${new Date(session.timestamp).toLocaleDateString()}`
      })
    }
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    
    const validFiles = Array.from(files).filter(file => {
      const ext = file.name.toLowerCase()
      return ext.endsWith('.eml') || ext.endsWith('.msg') || ext.endsWith('.mbox') || ext.endsWith('.pdf')
    })

    if (validFiles.length === 0) {
      toast({
        title: "Invalid file format",
        description: "Please upload .eml, .msg, .mbox, or .pdf files only",
        variant: "destructive"
      })
      return
    }

    setUploadedFiles(validFiles)
    toast({
      title: "Files uploaded",
      description: `${validFiles.length} email file(s) ready for analysis`
    })
  }

  const startAnalysis = async () => {
    if (uploadedFiles.length === 0) return

    setIsScanning(true)
    setProgress(0)
    setCurrentPhase(0)

    // Simulate analysis phases
    for (let phase = 0; phase < SCAN_PHASES.length; phase++) {
      setCurrentPhase(phase)
      
      for (let i = 0; i <= 100; i += 10) {
        setProgress((phase * 100 + i) / SCAN_PHASES.length)
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // Generate mock analysis results
    const mockResults: EmailAnalysis[] = uploadedFiles.map((file, index) => ({
      id: `email-${index}`,
      sender: index === 0 ? 'suspicious@fake-bank.com' : index === 1 ? 'admin@company.com' : 'user@legitsite.org',
      subject: index === 0 ? 'URGENT: Account Verification Required' : index === 1 ? 'Weekly Report' : 'Newsletter Update',
      date: new Date(Date.now() - index * 86400000).toLocaleDateString(),
      riskScore: index === 0 ? 95 : index === 1 ? 25 : 10,
      riskLevel: index === 0 ? 'threat' : index === 1 ? 'warning' : 'safe',
      spfStatus: index === 0 ? 'fail' : 'pass',
      dkimStatus: index === 0 ? 'fail' : 'pass',
      dmarcStatus: index === 0 ? 'fail' : 'pass',
      phishingIndicators: index === 0 ? ['Urgency keywords', 'Fake domain', 'Suspicious links'] : [],
      suspiciousLinks: index === 0 ? ['http://fake-bank-verify.com/login'] : [],
      attachments: index === 0 ? [{ name: 'verify.exe', verdict: 'dangerous' }] : [],
      routingPath: [
        { server: 'mail.example.com', timestamp: '2024-01-01 10:00:00', ip: '192.168.1.1' },
        { server: 'smtp.company.com', timestamp: '2024-01-01 10:01:00', ip: '10.0.0.1' }
      ],
      fullHeaders: `Received: from mail.example.com...\nFrom: ${index === 0 ? 'suspicious@fake-bank.com' : 'admin@company.com'}\nTo: user@company.com...`,
      anomalies: index === 0 ? ['Mismatched sender domain', 'No DKIM signature'] : []
    }))

    setEmailAnalyses(mockResults)
    setIsScanning(false)
    setProgress(100)

    // Save to session and history
    const fileNames = uploadedFiles.map(f => f.name)
    saveCurrentSession(mockResults, fileNames)
    saveToHistory(mockResults, fileNames)

    toast({
      title: "Analysis complete",
      description: `Analyzed ${uploadedFiles.length} emails. ${mockResults.filter(e => e.riskLevel === 'threat').length} threats detected.`
    })
  }

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'safe': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'threat': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-cyber-glow/20 text-cyber-glow border-cyber-glow/30'
    }
  }

  const getAuthStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'fail': return <X className="h-4 w-4 text-red-400" />
      default: return <AlertTriangle className="h-4 w-4 text-yellow-400" />
    }
  }

  const toggleEmailExpansion = (emailId: string) => {
    const newExpanded = new Set(expandedEmails)
    if (newExpanded.has(emailId)) {
      newExpanded.delete(emailId)
    } else {
      newExpanded.add(emailId)
    }
    setExpandedEmails(newExpanded)
  }

  const exportResults = (format: 'pdf' | 'csv' | 'json') => {
    toast({
      title: `Export to ${format.toUpperCase()}`,
      description: "Export functionality would be implemented here"
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] bg-card border-cyber-glow/30">
        <DialogHeader className="border-b border-cyber-glow/20 pb-4">
          <DialogTitle className="flex items-center gap-3 text-cyber-glow font-cyber">
            <Mail className="h-6 w-6" />
            Email Checker - Advanced Email Forensics Engine
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as 'current' | 'history')} className="h-full">
            <div className="flex items-center justify-between p-6 pb-2">
              <TabsList className="grid w-auto grid-cols-2">
                <TabsTrigger value="current" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Current Scan
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  History
                </TabsTrigger>
              </TabsList>
              
              {emailAnalyses.length > 0 && currentView === 'current' && (
                <Button variant="outline" size="sm" onClick={resetSession}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Scan
                </Button>
              )}
            </div>

            <TabsContent value="current" className="space-y-6 p-6 pt-2">
              {/* File Upload Section */}
              {uploadedFiles.length === 0 && !isScanning && emailAnalyses.length === 0 && (
            <Card className="border-cyber-glow/30 bg-card/50">
              <CardHeader>
                <CardTitle className="text-cyber-glow">Upload Email Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className="border-2 border-dashed border-cyber-glow/30 rounded-lg p-8 text-center cursor-pointer hover:border-cyber-glow/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 mx-auto text-cyber-glow mb-4" />
                  <p className="text-cyber-glow font-mono">
                    Click to upload email files (.eml, .msg, .mbox, .pdf)
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">
                    Supports individual emails or mailbox files
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept=".eml,.msg,.mbox,.pdf"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
              </CardContent>
            </Card>
          )}

          {/* File List and Start Analysis */}
          {uploadedFiles.length > 0 && !isScanning && emailAnalyses.length === 0 && (
            <Card className="border-cyber-glow/30 bg-card/50">
              <CardHeader>
                <CardTitle className="text-cyber-glow">Ready for Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-card/30 rounded border border-cyber-glow/20">
                      <FileText className="h-4 w-4 text-cyber-glow" />
                      <span className="font-mono text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={startAnalysis}
                  className="w-full"
                  variant="cyber"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Start Email Analysis
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Scanning Progress */}
          {isScanning && (
            <Card className="border-cyber-glow/30 bg-card/50">
              <CardHeader>
                <CardTitle className="text-cyber-glow">
                  Analyzing {uploadedFiles.length} emails...
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-cyber-glow font-mono">Progress</span>
                    <span className="text-cyber-glow font-mono">{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="space-y-3">
                  {SCAN_PHASES.map((phase, index) => {
                    const Icon = phase.icon
                    const isActive = index === currentPhase
                    const isComplete = index < currentPhase
                    
                    return (
                      <div 
                        key={phase.id}
                        className={`flex items-center gap-3 p-3 rounded border transition-all ${
                          isActive 
                            ? 'border-cyber-glow bg-cyber-glow/10 animate-pulse-glow' 
                            : isComplete 
                              ? 'border-green-500/30 bg-green-500/10' 
                              : 'border-cyber-glow/20 bg-card/30'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${
                          isActive ? 'text-cyber-glow' : isComplete ? 'text-green-400' : 'text-muted-foreground'
                        }`} />
                        <span className={`font-mono text-sm ${
                          isActive ? 'text-cyber-glow' : isComplete ? 'text-green-400' : 'text-muted-foreground'
                        }`}>
                          {phase.name}
                        </span>
                        {isComplete && <CheckCircle className="h-4 w-4 text-green-400 ml-auto" />}
                        {isActive && <div className="w-2 h-2 bg-cyber-glow rounded-full animate-pulse-glow ml-auto" />}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Dashboard */}
          {emailAnalyses.length > 0 && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-cyber-glow/30 bg-card/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-cyber-glow font-cyber">
                      {emailAnalyses.length}
                    </div>
                    <div className="text-sm text-muted-foreground font-mono">Total Emails</div>
                  </CardContent>
                </Card>
                
                <Card className="border-green-500/30 bg-green-500/10">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-400 font-cyber">
                      {emailAnalyses.filter(e => e.riskLevel === 'safe').length}
                    </div>
                    <div className="text-sm text-green-300 font-mono">Safe</div>
                  </CardContent>
                </Card>
                
                <Card className="border-yellow-500/30 bg-yellow-500/10">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400 font-cyber">
                      {emailAnalyses.filter(e => e.riskLevel === 'warning').length}
                    </div>
                    <div className="text-sm text-yellow-300 font-mono">Warning</div>
                  </CardContent>
                </Card>
                
                <Card className="border-red-500/30 bg-red-500/10">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-400 font-cyber">
                      {emailAnalyses.filter(e => e.riskLevel === 'threat').length}
                    </div>
                    <div className="text-sm text-red-300 font-mono">Threats</div>
                  </CardContent>
                </Card>
              </div>

              {/* Export Options */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => exportResults('pdf')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportResults('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportResults('json')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
              </div>

              {/* Email List */}
              <Card className="border-cyber-glow/30 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-cyber-glow">Analysis Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {emailAnalyses.map((email) => (
                    <div key={email.id} className="space-y-4">
                      <Collapsible
                        open={expandedEmails.has(email.id)}
                        onOpenChange={() => toggleEmailExpansion(email.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center gap-4 p-4 bg-card/30 rounded border border-cyber-glow/20 cursor-pointer hover:border-cyber-glow/40 transition-colors">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                              <div>
                                <div className="font-mono text-cyber-glow">{email.sender}</div>
                                <div className="text-muted-foreground">{email.subject}</div>
                              </div>
                              <div className="text-muted-foreground font-mono">{email.date}</div>
                              <div className="flex items-center gap-2">
                                <Badge className={getRiskBadgeColor(email.riskLevel)}>
                                  {email.riskLevel.toUpperCase()}
                                </Badge>
                                <span className="text-xs font-mono">{email.riskScore}%</span>
                              </div>
                              <div className="flex gap-2">
                                {getAuthStatusIcon(email.spfStatus)}
                                {getAuthStatusIcon(email.dkimStatus)}
                                {getAuthStatusIcon(email.dmarcStatus)}
                              </div>
                              <div className="flex items-center gap-2">
                                {expandedEmails.has(email.id) ? (
                                  <ChevronDown className="h-4 w-4 text-cyber-glow" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-cyber-glow" />
                                )}
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="mt-4">
                          <div className="bg-card/20 rounded border border-cyber-glow/20 p-4 space-y-6">
                            {/* Authentication Status */}
                            <div>
                              <h4 className="text-cyber-glow font-mono mb-3">Authentication Status</h4>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="flex items-center gap-2">
                                  {getAuthStatusIcon(email.spfStatus)}
                                  <span className="text-sm font-mono">SPF: {email.spfStatus}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getAuthStatusIcon(email.dkimStatus)}
                                  <span className="text-sm font-mono">DKIM: {email.dkimStatus}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getAuthStatusIcon(email.dmarcStatus)}
                                  <span className="text-sm font-mono">DMARC: {email.dmarcStatus}</span>
                                </div>
                              </div>
                            </div>

                            <Separator className="bg-cyber-glow/20" />

                            {/* Phishing Indicators */}
                            {email.phishingIndicators.length > 0 && (
                              <div>
                                <h4 className="text-red-400 font-mono mb-3">Phishing Indicators</h4>
                                <div className="space-y-2">
                                  {email.phishingIndicators.map((indicator, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                      <AlertTriangle className="h-4 w-4 text-red-400" />
                                      <span className="text-sm font-mono text-red-300">{indicator}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Suspicious Links */}
                            {email.suspiciousLinks.length > 0 && (
                              <div>
                                <h4 className="text-yellow-400 font-mono mb-3">Suspicious Links</h4>
                                <div className="space-y-2">
                                  {email.suspiciousLinks.map((link, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                      <ExternalLink className="h-4 w-4 text-yellow-400" />
                                      <span className="text-sm font-mono text-yellow-300">{link}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Routing Path */}
                            <div>
                              <h4 className="text-cyber-glow font-mono mb-3">Routing Path</h4>
                              <div className="space-y-2">
                                {email.routingPath.map((hop, index) => (
                                  <div key={index} className="flex items-center gap-3 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-mono text-muted-foreground">{hop.timestamp}</span>
                                    <Server className="h-4 w-4 text-cyber-glow" />
                                    <span className="font-mono text-cyber-glow">{hop.server}</span>
                                    <span className="font-mono text-muted-foreground">({hop.ip})</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Full Headers */}
                            <div>
                              <h4 className="text-cyber-glow font-mono mb-3">Full Headers</h4>
                              <div className="bg-card/30 p-3 rounded border border-cyber-glow/20">
                                <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap overflow-auto max-h-40">
                                  {email.fullHeaders}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
            </TabsContent>

            <TabsContent value="history" className="space-y-6 p-6 pt-2">
              <Card className="border-cyber-glow/30 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-cyber-glow">Scan History</CardTitle>
                </CardHeader>
                <CardContent>
                  {scanHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground font-mono">No previous scans found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {scanHistory.map((session) => (
                        <div 
                          key={session.id}
                          className="flex items-center justify-between p-4 bg-card/30 rounded border border-cyber-glow/20 hover:border-cyber-glow/40 transition-colors cursor-pointer"
                          onClick={() => loadHistoricalSession(session.id)}
                        >
                          <div className="flex items-center gap-4">
                            <Calendar className="h-5 w-5 text-cyber-glow" />
                            <div>
                              <div className="font-mono text-sm text-cyber-glow">
                                {new Date(session.timestamp).toLocaleDateString()} {new Date(session.timestamp).toLocaleTimeString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {session.totalFiles} files • {session.threatCount} threats detected
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={session.threatCount > 0 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}>
                              {session.threatCount > 0 ? `${session.threatCount} Threats` : 'Clean'}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}