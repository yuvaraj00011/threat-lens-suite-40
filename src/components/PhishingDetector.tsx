import { useState, useEffect } from "react"
import { 
  Shield, 
  Upload, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download, 
  Filter,
  Clock,
  Globe,
  Lock,
  Database,
  ChevronDown,
  ChevronRight,
  Copy,
  Send,
  RotateCcw,
  History,
  FileText,
  Calendar,
  Trash2
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface URLAnalysis {
  id: string
  url: string
  riskScore: number
  riskLevel: 'safe' | 'suspicious' | 'dangerous'
  status: 'pending' | 'analyzing' | 'complete' | 'error'
  decomposition?: {
    domain: string
    subdomain: string
    path: string
    parameters: string[]
    suspiciousChars: boolean
    isShortened: boolean
    homographAttack: boolean
  }
  mlClassification?: {
    phishingProbability: number
    suspiciousPatterns: string[]
    featureScore: number
  }
  domainIntelligence?: {
    whoisData: {
      registrar: string
      creationDate: string
      expirationDate: string
      domainAge: number
    }
    sslStatus: {
      valid: boolean
      issuer: string
      expires: string
    }
    dnsRecords: {
      mxRecords: string[]
      nsRecords: string[]
    }
    reputation: number
  }
  reasons: string[]
  timestamp: string
}

interface ScanSession {
  id: string
  name: string
  timestamp: string
  source: 'manual' | 'upload' | 'detected'
  filename?: string
  urlCount: number
  riskSummary: {
    safe: number
    suspicious: number
    dangerous: number
  }
  urls: URLAnalysis[]
}

interface PhishingDetectorProps {
  isOpen: boolean
  onClose: () => void
}

const scanningStages = [
  { id: 'decomposition', label: 'URL Decomposition', icon: Database },
  { id: 'ml', label: 'ML Classification', icon: Shield },
  { id: 'intelligence', label: 'Domain Intelligence', icon: Globe }
]

export function PhishingDetector({ isOpen, onClose }: PhishingDetectorProps) {
  const [currentStage, setCurrentStage] = useState<'input' | 'scanning' | 'results'>('input')
  const [inputMethod, setInputMethod] = useState<'manual' | 'upload' | 'detected'>('manual')
  const [urlInput, setUrlInput] = useState('')
  const [urlList, setUrlList] = useState<URLAnalysis[]>([])
  const [scanProgress, setScanProgress] = useState(0)
  const [currentScanStage, setCurrentScanStage] = useState(0)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set())
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [currentSession, setCurrentSession] = useState<ScanSession | null>(null)
  const [scanHistory, setScanHistory] = useState<ScanSession[]>([])
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current')
  const [selectedHistorySession, setSelectedHistorySession] = useState<ScanSession | null>(null)
  const { toast } = useToast()

  // Load data from localStorage on component mount
  useEffect(() => {
    if (isOpen) {
      const savedSession = localStorage.getItem('phishing-detector-current-session')
      const savedHistory = localStorage.getItem('phishing-detector-history')
      
      if (savedSession) {
        const session = JSON.parse(savedSession)
        setCurrentSession(session)
        setUrlList(session.urls)
        setCurrentStage(session.urls.length > 0 ? 'results' : 'input')
      }
      
      if (savedHistory) {
        setScanHistory(JSON.parse(savedHistory))
      }
    }
  }, [isOpen])

  // Save current session to localStorage whenever it changes
  useEffect(() => {
    if (currentSession) {
      localStorage.setItem('phishing-detector-current-session', JSON.stringify(currentSession))
    }
  }, [currentSession])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('phishing-detector-history', JSON.stringify(scanHistory))
  }, [scanHistory])

  // Mock detected URLs for demo
  const detectedUrls = [
    'https://paypal-security.verification-update.com/login',
    'https://amazon-account.secure-verify.net/confirm',
    'https://microsoft-support.technical-assistance.org/help'
  ]

  const handleInputSubmit = () => {
    const urls = urlInput.split('\n').filter(url => url.trim() !== '')
    const urlAnalyses: URLAnalysis[] = urls.map((url, index) => ({
      id: `url-${index}`,
      url: url.trim(),
      riskScore: 0,
      riskLevel: 'safe' as const,
      status: 'pending' as const,
      reasons: [],
      timestamp: new Date().toISOString()
    }))
    
    const session: ScanSession = {
      id: Date.now().toString(),
      name: `Manual Scan ${new Date().toLocaleDateString()}`,
      timestamp: new Date().toISOString(),
      source: 'manual',
      urlCount: urls.length,
      riskSummary: { safe: 0, suspicious: 0, dangerous: 0 },
      urls: urlAnalyses
    }
    
    setCurrentSession(session)
    setUrlList(urlAnalyses)
    setCurrentStage('scanning')
    startScanning(urlAnalyses)
  }

  const handleDetectedUrls = () => {
    const urlAnalyses: URLAnalysis[] = detectedUrls.map((url, index) => ({
      id: `detected-${index}`,
      url,
      riskScore: 0,
      riskLevel: 'safe' as const,
      status: 'pending' as const,
      reasons: [],
      timestamp: new Date().toISOString()
    }))
    
    const session: ScanSession = {
      id: Date.now().toString(),
      name: `Auto-Detected URLs ${new Date().toLocaleDateString()}`,
      timestamp: new Date().toISOString(),
      source: 'detected',
      urlCount: urlAnalyses.length,
      riskSummary: { safe: 0, suspicious: 0, dangerous: 0 },
      urls: urlAnalyses
    }
    
    setCurrentSession(session)
    setUrlList(urlAnalyses)
    setCurrentStage('scanning')
    startScanning(urlAnalyses)
  }

  const startScanning = async (urls: URLAnalysis[]) => {
    // Simulate scanning process
    for (let stage = 0; stage < scanningStages.length; stage++) {
      setCurrentScanStage(stage)
      
      // Update progress through current stage
      for (let progress = 0; progress <= 100; progress += 10) {
        setScanProgress((stage * 100 + progress) / scanningStages.length)
        await new Promise(resolve => setTimeout(resolve, 150))
      }
      
      // Update URLs with analysis results for current stage
      const updatedUrls = urls.map(url => {
        const updated = { ...url }
        
        if (stage === 0) { // URL Decomposition
          updated.decomposition = generateDecomposition(url.url)
          updated.status = 'analyzing'
        } else if (stage === 1) { // ML Classification
          updated.mlClassification = generateMLClassification(url.url)
        } else if (stage === 2) { // Domain Intelligence
          updated.domainIntelligence = generateDomainIntelligence(url.url)
          updated.status = 'complete'
          
          // Calculate final risk score and level
          const risk = calculateRiskScore(updated)
          updated.riskScore = risk.score
          updated.riskLevel = risk.level
          updated.reasons = risk.reasons
        }
        
        return updated
      })
      
      setUrlList(updatedUrls)
    }
    
    // Calculate final risk summary and save to history
    const finalUrls = urlList.map(url => url.status === 'complete' ? url : url)
    const riskSummary = finalUrls.reduce((acc, url) => {
      acc[url.riskLevel]++
      return acc
    }, { safe: 0, suspicious: 0, dangerous: 0 })
    
    if (currentSession) {
      const completedSession = {
        ...currentSession,
        urls: finalUrls,
        riskSummary
      }
      setCurrentSession(completedSession)
      
      // Add to history (remove any existing session with same ID)
      setScanHistory(prev => {
        const filtered = prev.filter(s => s.id !== completedSession.id)
        return [completedSession, ...filtered].slice(0, 20) // Keep last 20 sessions
      })
    }
    
    setCurrentStage('results')
    toast({
      title: "Scan Complete",
      description: `Analyzed ${urls.length} URLs for phishing threats`
    })
  }

  const generateDecomposition = (url: string) => {
    try {
      const urlObj = new URL(url)
      const domain = urlObj.hostname
      const subdomain = domain.split('.').slice(0, -2).join('.')
      
      return {
        domain: domain.split('.').slice(-2).join('.'),
        subdomain,
        path: urlObj.pathname,
        parameters: Array.from(urlObj.searchParams.keys()),
        suspiciousChars: /[^\w\-\.]/.test(domain),
        isShortened: ['bit.ly', 'tinyurl.com', 'goo.gl'].some(short => domain.includes(short)),
        homographAttack: /[а-я]/.test(domain) // Cyrillic characters
      }
    } catch {
      return {
        domain: 'invalid',
        subdomain: '',
        path: '',
        parameters: [],
        suspiciousChars: true,
        isShortened: false,
        homographAttack: false
      }
    }
  }

  const generateMLClassification = (url: string) => {
    const suspiciousKeywords = ['secure', 'verify', 'update', 'confirm', 'suspended', 'limited']
    const hasKeywords = suspiciousKeywords.some(keyword => url.toLowerCase().includes(keyword))
    const probability = hasKeywords ? Math.random() * 0.4 + 0.6 : Math.random() * 0.3
    
    return {
      phishingProbability: probability,
      suspiciousPatterns: hasKeywords ? ['suspicious-keywords', 'url-structure'] : [],
      featureScore: probability * 100
    }
  }

  const generateDomainIntelligence = (url: string) => {
    try {
      const urlObj = new URL(url)
      const domain = urlObj.hostname
      
      return {
        whoisData: {
          registrar: 'Example Registrar',
          creationDate: '2023-12-01',
          expirationDate: '2024-12-01',
          domainAge: Math.floor(Math.random() * 365)
        },
        sslStatus: {
          valid: !domain.includes('verification') && !domain.includes('secure'),
          issuer: domain.includes('verification') ? 'Self-Signed' : 'Let\'s Encrypt',
          expires: '2024-12-31'
        },
        dnsRecords: {
          mxRecords: ['mail.example.com'],
          nsRecords: ['ns1.example.com', 'ns2.example.com']
        },
        reputation: Math.random() * 100
      }
    } catch {
      return {
        whoisData: {
          registrar: 'Unknown',
          creationDate: 'Unknown',
          expirationDate: 'Unknown',
          domainAge: 0
        },
        sslStatus: {
          valid: false,
          issuer: 'None',
          expires: 'N/A'
        },
        dnsRecords: {
          mxRecords: [],
          nsRecords: []
        },
        reputation: 0
      }
    }
  }

  const calculateRiskScore = (url: URLAnalysis): { score: number, level: 'safe' | 'suspicious' | 'dangerous', reasons: string[] } => {
    const reasons: string[] = []
    let score = 0

    // Check decomposition
    if (url.decomposition?.suspiciousChars) {
      score += 30
      reasons.push('Suspicious characters in domain')
    }
    if (url.decomposition?.homographAttack) {
      score += 40
      reasons.push('Potential homograph attack')
    }
    if (url.decomposition?.isShortened) {
      score += 20
      reasons.push('Shortened URL detected')
    }

    // Check ML classification
    if (url.mlClassification && url.mlClassification.phishingProbability > 0.7) {
      score += 50
      reasons.push('High ML phishing probability')
    }

    // Check domain intelligence
    if (url.domainIntelligence) {
      if (!url.domainIntelligence.sslStatus.valid) {
        score += 25
        reasons.push('Invalid SSL certificate')
      }
      if (url.domainIntelligence.whoisData.domainAge < 30) {
        score += 30
        reasons.push('Very new domain')
      }
      if (url.domainIntelligence.reputation < 50) {
        score += 20
        reasons.push('Poor domain reputation')
      }
    }

    let level: 'safe' | 'suspicious' | 'dangerous' = 'safe'
    if (score >= 70) level = 'dangerous'
    else if (score >= 40) level = 'suspicious'

    return { score: Math.min(score, 100), level, reasons }
  }

  const toggleRowExpansion = (urlId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(urlId)) {
      newExpanded.delete(urlId)
    } else {
      newExpanded.add(urlId)
    }
    setExpandedRows(newExpanded)
  }

  const toggleUrlSelection = (urlId: string) => {
    const newSelected = new Set(selectedUrls)
    if (newSelected.has(urlId)) {
      newSelected.delete(urlId)
    } else {
      newSelected.add(urlId)
    }
    setSelectedUrls(newSelected)
  }

  const filteredUrls = urlList.filter(url => {
    if (filterLevel === 'all') return true
    return url.riskLevel === filterLevel
  })

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'safe': return 'default'
      case 'suspicious': return 'secondary'
      case 'dangerous': return 'destructive'
      default: return 'outline'
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'safe': return 'text-green-500'
      case 'suspicious': return 'text-yellow-500'
      case 'dangerous': return 'text-red-500'
      default: return 'text-muted-foreground'
    }
  }

  const exportResults = () => {
    const data = filteredUrls.map(url => ({
      url: url.url,
      riskScore: url.riskScore,
      riskLevel: url.riskLevel,
      reasons: url.reasons.join(', '),
      timestamp: url.timestamp
    }))
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'phishing-analysis.json'
    a.click()
    
    toast({
      title: "Export Complete",
      description: "Analysis results downloaded successfully"
    })
  }

  const resetSession = () => {
    setCurrentSession(null)
    setUrlList([])
    setUrlInput('')
    setCurrentStage('input')
    setActiveTab('current')
    setSelectedHistorySession(null)
    setExpandedRows(new Set())
    setSelectedUrls(new Set())
    setFilterLevel('all')
    localStorage.removeItem('phishing-detector-current-session')
    
    toast({
      title: "Session Reset",
      description: "Started new scanning session"
    })
  }

  const loadHistorySession = (session: ScanSession) => {
    setSelectedHistorySession(session)
    setUrlList(session.urls)
    setCurrentStage('results')
    setActiveTab('current')
    setExpandedRows(new Set())
    setSelectedUrls(new Set())
    setFilterLevel('all')
  }

  const deleteHistorySession = (sessionId: string) => {
    setScanHistory(prev => prev.filter(s => s.id !== sessionId))
    if (selectedHistorySession?.id === sessionId) {
      setSelectedHistorySession(null)
    }
    toast({
      title: "Session Deleted",
      description: "History session removed"
    })
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-cyber-glow font-cyber">
              <Shield className="h-6 w-6 text-cyber-glow animate-pulse-glow" />
              Phishing Detector
            </DialogTitle>
            <div className="flex items-center gap-2">
              {(currentStage === 'results' || selectedHistorySession) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetSession}
                  className="text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  New Scan
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'current' | 'history')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Current Scan
              {currentSession && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {currentSession.urlCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
              {scanHistory.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {scanHistory.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6 mt-6">
            {currentStage === 'input' && (
          <div className="space-y-6">
            <Tabs value={inputMethod} onValueChange={(value) => setInputMethod(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="detected">Auto-Detected</TabsTrigger>
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                <TabsTrigger value="upload">File Upload</TabsTrigger>
              </TabsList>

              <TabsContent value="detected" className="space-y-4">
                <Card className="bg-card/50 border-cyber-glow/20">
                  <CardHeader>
                    <CardTitle className="text-cyber-glow font-mono">URLs Detected in Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {detectedUrls.map((url, index) => (
                        <div key={index} className="p-3 bg-card/30 rounded border border-cyber-glow/10 font-mono text-sm">
                          {url}
                        </div>
                      ))}
                    </div>
                    <Button 
                      onClick={handleDetectedUrls}
                      className="w-full mt-4"
                      variant="cyber"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Analyze Detected URLs
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <Card className="bg-card/50 border-cyber-glow/20">
                  <CardHeader>
                    <CardTitle className="text-cyber-glow font-mono">Enter URLs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Enter URLs (one per line)&#10;https://example.com&#10;https://suspicious-site.com"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="min-h-32 font-mono"
                    />
                    <Button 
                      onClick={handleInputSubmit}
                      disabled={!urlInput.trim()}
                      className="w-full"
                      variant="cyber"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Start Analysis
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                <Card className="bg-card/50 border-cyber-glow/20">
                  <CardHeader>
                    <CardTitle className="text-cyber-glow font-mono">Upload URL File</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-cyber-glow/30 rounded-lg p-8 text-center hover:border-cyber-glow/50 transition-colors">
                      <Upload className="mx-auto h-12 w-12 text-cyber-glow/50" />
                      <p className="mt-2 text-sm text-muted-foreground font-mono">
                        Drop CSV or TXT file here, or click to upload
                      </p>
                      <Button variant="outline" className="mt-4">
                        Choose File
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {currentStage === 'scanning' && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-cyber-glow/5 to-cyber-glow-secondary/5 border-cyber-glow/30">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold text-cyber-glow font-cyber">
                    Scanning {urlList.length} URLs for phishing threats...
                  </h3>
                  
                  <div className="space-y-2">
                    <Progress value={scanProgress} className="h-3" />
                    <p className="text-sm text-muted-foreground font-mono">
                      {Math.round(scanProgress)}% Complete
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    {scanningStages.map((stage, index) => {
                      const Icon = stage.icon
                      const isActive = currentScanStage === index
                      const isComplete = currentScanStage > index
                      
                      return (
                        <div 
                          key={stage.id}
                          className={`
                            p-4 rounded-lg border transition-all duration-300
                            ${isActive 
                              ? 'bg-cyber-glow/10 border-cyber-glow shadow-cyber animate-pulse-glow' 
                              : isComplete 
                                ? 'bg-green-500/10 border-green-500/30' 
                                : 'bg-card/30 border-cyber-glow/20'
                            }
                          `}
                        >
                          <div className="text-center space-y-2">
                            <Icon className={`
                              mx-auto h-8 w-8
                              ${isActive 
                                ? 'text-cyber-glow animate-pulse-glow' 
                                : isComplete 
                                  ? 'text-green-500' 
                                  : 'text-muted-foreground'
                              }
                            `} />
                            <p className="text-sm font-mono">
                              {stage.label}
                            </p>
                            {isComplete && (
                              <CheckCircle className="mx-auto h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStage === 'results' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-cyber-glow font-cyber">
                Analysis Results
              </h3>
              <div className="flex items-center gap-2">
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="safe">Safe Only</SelectItem>
                    <SelectItem value="suspicious">Suspicious Only</SelectItem>
                    <SelectItem value="dangerous">Dangerous Only</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={exportResults}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {filteredUrls.map((urlAnalysis) => (
                <Card key={urlAnalysis.id} className="bg-card/50 border-cyber-glow/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={selectedUrls.has(urlAnalysis.id)}
                          onCheckedChange={() => toggleUrlSelection(urlAnalysis.id)}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-sm truncate">
                            {urlAnalysis.url}
                          </p>
                        </div>

                        <Badge variant={getRiskBadgeVariant(urlAnalysis.riskLevel)}>
                          {urlAnalysis.riskLevel.toUpperCase()} ({urlAnalysis.riskScore}%)
                        </Badge>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(urlAnalysis.id)}
                        >
                          {expandedRows.has(urlAnalysis.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {expandedRows.has(urlAnalysis.id) && (
                      <div className="mt-4 pt-4 border-t border-cyber-glow/20 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* URL Decomposition */}
                          <Card className="bg-card/30">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-mono text-cyber-glow">
                                URL Structure
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              {urlAnalysis.decomposition && (
                                <>
                                  <div className="text-xs space-y-1">
                                    <p><span className="text-muted-foreground">Domain:</span> {urlAnalysis.decomposition.domain}</p>
                                    {urlAnalysis.decomposition.subdomain && (
                                      <p><span className="text-muted-foreground">Subdomain:</span> {urlAnalysis.decomposition.subdomain}</p>
                                    )}
                                    <p><span className="text-muted-foreground">Path:</span> {urlAnalysis.decomposition.path || '/'}</p>
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {urlAnalysis.decomposition.suspiciousChars && (
                                      <Badge variant="destructive" className="text-xs">Suspicious Chars</Badge>
                                    )}
                                    {urlAnalysis.decomposition.isShortened && (
                                      <Badge variant="secondary" className="text-xs">Shortened</Badge>
                                    )}
                                    {urlAnalysis.decomposition.homographAttack && (
                                      <Badge variant="destructive" className="text-xs">Homograph</Badge>
                                    )}
                                  </div>
                                </>
                              )}
                            </CardContent>
                          </Card>

                          {/* ML Classification */}
                          <Card className="bg-card/30">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-mono text-cyber-glow">
                                ML Analysis
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {urlAnalysis.mlClassification && (
                                <div className="space-y-2">
                                  <div className="text-xs">
                                    <p className="text-muted-foreground">Phishing Probability:</p>
                                    <p className={getRiskColor(urlAnalysis.riskLevel)}>
                                      {(urlAnalysis.mlClassification.phishingProbability * 100).toFixed(1)}%
                                    </p>
                                  </div>
                                  {urlAnalysis.mlClassification.suspiciousPatterns.length > 0 && (
                                    <div className="space-y-1">
                                      {urlAnalysis.mlClassification.suspiciousPatterns.map((pattern, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {pattern}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Domain Intelligence */}
                          <Card className="bg-card/30">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-mono text-cyber-glow">
                                Domain Info
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {urlAnalysis.domainIntelligence && (
                                <div className="space-y-2 text-xs">
                                  <div>
                                    <p className="text-muted-foreground">Age:</p>
                                    <p>{urlAnalysis.domainIntelligence.whoisData.domainAge} days</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">SSL:</p>
                                    <p className={urlAnalysis.domainIntelligence.sslStatus.valid ? 'text-green-500' : 'text-red-500'}>
                                      {urlAnalysis.domainIntelligence.sslStatus.valid ? 'Valid' : 'Invalid'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Reputation:</p>
                                    <p>{urlAnalysis.domainIntelligence.reputation.toFixed(1)}/100</p>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>

                        {urlAnalysis.reasons.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-cyber-glow font-mono">
                              Risk Factors:
                            </h4>
                            <div className="space-y-1">
                              {urlAnalysis.reasons.map((reason, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                  <span className="text-sm font-mono">{reason}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm">
                            <Copy className="mr-2 h-4 w-4" />
                            Copy URL
                          </Button>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open Safely
                          </Button>
                          <Button variant="outline" size="sm">
                            <Send className="mr-2 h-4 w-4" />
                            Send to Email Checker
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedUrls.size > 0 && (
              <Card className="bg-cyber-glow/5 border-cyber-glow/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-sm">
                      {selectedUrls.size} URLs selected
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export Selected
                      </Button>
                      <Button variant="outline" size="sm">
                        <Send className="mr-2 h-4 w-4" />
                        Forward to Tools
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6 mt-6">
            {scanHistory.length === 0 ? (
              <Card className="bg-card/50 border-cyber-glow/20">
                <CardContent className="p-8 text-center">
                  <History className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground font-mono">
                    No scan history available
                  </p>
                  <p className="text-sm text-muted-foreground font-mono mt-2">
                    Complete a scan to see it here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-cyber-glow font-cyber">
                    Scan History
                  </h3>
                  <p className="text-sm text-muted-foreground font-mono">
                    {scanHistory.length} session{scanHistory.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="space-y-3">
                  {scanHistory.map((session) => (
                    <Card key={session.id} className="bg-card/50 border-cyber-glow/20 hover:border-cyber-glow/40 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                {session.source === 'manual' && <FileText className="h-4 w-4 text-cyber-glow" />}
                                {session.source === 'upload' && <Upload className="h-4 w-4 text-cyber-glow" />}
                                {session.source === 'detected' && <Shield className="h-4 w-4 text-cyber-glow" />}
                                <h4 className="font-mono text-sm font-medium">
                                  {session.name}
                                </h4>
                              </div>
                              {session.filename && (
                                <Badge variant="outline" className="text-xs">
                                  {session.filename}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatTimestamp(session.timestamp)}
                              </div>
                              <div>
                                {session.urlCount} URLs
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {session.riskSummary.safe > 0 && (
                                <Badge variant="default" className="text-xs">
                                  {session.riskSummary.safe} Safe
                                </Badge>
                              )}
                              {session.riskSummary.suspicious > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {session.riskSummary.suspicious} Suspicious
                                </Badge>
                              )}
                              {session.riskSummary.dangerous > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {session.riskSummary.dangerous} Dangerous
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => loadHistorySession(session)}
                              className="text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteHistorySession(session.id)}
                              className="text-xs text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}