import { useState, useEffect } from "react"
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Shield, 
  Clock, 
  History,
  RotateCcw,
  Download,
  ExternalLink,
  AlertCircle,
  TrendingUp,
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"

interface NewsArticle {
  id: string
  title: string
  content: string
  url?: string
  source: string
  publishDate: string
  credibilityScore: number
  biasScore: number
  flags: string[]
  factChecks: Array<{
    source: string
    verdict: string
    url: string
    confidence: number
  }>
}

interface ScanSession {
  id: string
  timestamp: string
  filename?: string
  dataSource: string
  articles: NewsArticle[]
  overallRiskScore: number
  totalArticles: number
  flaggedCount: number
}

interface FakeNewsTrackerProps {
  isOpen: boolean
  onClose: () => void
}

const STORAGE_KEY = 'fake-news-tracker-sessions'
const CURRENT_SESSION_KEY = 'fake-news-tracker-current'

export function FakeNewsTracker({ isOpen, onClose }: FakeNewsTrackerProps) {
  const [currentSession, setCurrentSession] = useState<ScanSession | null>(null)
  const [sessions, setSessions] = useState<ScanSession[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanPhase, setScanPhase] = useState('')
  const [inputText, setInputText] = useState('')
  const [activeTab, setActiveTab] = useState('scan')
  const { toast } = useToast()

  // Load sessions and current session from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem(STORAGE_KEY)
    const savedCurrentSession = localStorage.getItem(CURRENT_SESSION_KEY)
    
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions))
    }
    
    if (savedCurrentSession) {
      setCurrentSession(JSON.parse(savedCurrentSession))
    }
  }, [])

  // Save sessions to localStorage
  const saveSessions = (newSessions: ScanSession[]) => {
    setSessions(newSessions)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions))
  }

  // Save current session to localStorage
  const saveCurrentSession = (session: ScanSession | null) => {
    setCurrentSession(session)
    if (session) {
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(CURRENT_SESSION_KEY)
    }
  }

  const simulateAnalysis = async (articles: NewsArticle[]) => {
    const phases = [
      'Initializing NLP analysis...',
      'Analyzing language patterns...',
      'Cross-referencing fact-checkers...',
      'Detecting sentiment and bias...',
      'Running ML classification...',
      'Verifying sources...',
      'Finalizing credibility scores...'
    ]

    for (let i = 0; i < phases.length; i++) {
      setScanPhase(phases[i])
      setScanProgress((i + 1) / phases.length * 100)
      await new Promise(resolve => setTimeout(resolve, 800))
    }

    return articles.map(article => ({
      ...article,
      credibilityScore: Math.random() * 100,
      biasScore: (Math.random() - 0.5) * 100,
      flags: Math.random() > 0.7 ? ['clickbait', 'unverified-source'] : [],
      factChecks: Math.random() > 0.5 ? [{
        source: 'PolitiFact',
        verdict: Math.random() > 0.5 ? 'Mostly True' : 'False',
        url: 'https://politifact.com/example',
        confidence: Math.random() * 100
      }] : []
    }))
  }

  const handleScan = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter text or URLs to analyze",
        variant: "destructive"
      })
      return
    }

    setIsScanning(true)
    setScanProgress(0)

    // Parse input into articles (simplified)
    const articles: NewsArticle[] = inputText.split('\n').filter(line => line.trim()).map((line, index) => ({
      id: `article-${Date.now()}-${index}`,
      title: line.length > 100 ? line.substring(0, 100) + '...' : line,
      content: line,
      source: 'Manual Input',
      publishDate: new Date().toISOString(),
      credibilityScore: 0,
      biasScore: 0,
      flags: [],
      factChecks: []
    }))

    try {
      const analyzedArticles = await simulateAnalysis(articles)
      const flaggedCount = analyzedArticles.filter(a => a.flags.length > 0 || a.credibilityScore < 50).length
      const overallRiskScore = flaggedCount / analyzedArticles.length * 100

      const newSession: ScanSession = {
        id: `session-${Date.now()}`,
        timestamp: new Date().toISOString(),
        dataSource: 'Manual Input',
        articles: analyzedArticles,
        overallRiskScore,
        totalArticles: analyzedArticles.length,
        flaggedCount
      }

      // Save to history
      const updatedSessions = [newSession, ...sessions]
      saveSessions(updatedSessions)
      
      // Set as current session
      saveCurrentSession(newSession)
      
      setActiveTab('results')
      
      toast({
        title: "Analysis Complete",
        description: `Analyzed ${analyzedArticles.length} articles. Risk score: ${overallRiskScore.toFixed(1)}%`
      })
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "An error occurred during analysis",
        variant: "destructive"
      })
    } finally {
      setIsScanning(false)
    }
  }

  const handleReset = () => {
    saveCurrentSession(null)
    setInputText('')
    setActiveTab('scan')
    setScanProgress(0)
    setScanPhase('')
    toast({
      title: "Session Reset",
      description: "Ready for new analysis"
    })
  }

  const handleOpenHistorySession = (session: ScanSession) => {
    saveCurrentSession(session)
    setActiveTab('results')
  }

  const getCredibilityColor = (score: number) => {
    if (score >= 70) return 'text-accent'
    if (score >= 40) return 'text-cyber-warning'
    return 'text-cyber-danger'
  }

  const getCredibilityLabel = (score: number) => {
    if (score >= 70) return 'Highly Credible'
    if (score >= 40) return 'Questionable'
    return 'Likely Misinformation'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] bg-card/95 border-cyber-glow/30 text-foreground">
        <DialogHeader className="border-b border-cyber-glow/20 pb-4">
          <DialogTitle className="text-2xl font-cyber text-cyber-glow flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Fake News Tracker
            {currentSession && (
              <Badge variant="secondary" className="ml-auto text-xs">
                Session Active
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 border border-cyber-glow/20">
            <TabsTrigger value="scan" className="font-mono">
              {currentSession ? 'New Scan' : 'Scan'}
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!currentSession} className="font-mono">
              Results
            </TabsTrigger>
            <TabsTrigger value="history" className="font-mono">
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="flex-1 overflow-auto space-y-4">
            <div className="space-y-4">
              {currentSession && (
                <Card className="bg-cyber-glow/5 border-cyber-glow/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-cyber-glow font-mono">Current Session Active</p>
                        <p className="text-xs text-muted-foreground">
                          {currentSession.totalArticles} articles analyzed • Risk: {currentSession.overallRiskScore.toFixed(1)}%
                        </p>
                      </div>
                      <Button onClick={handleReset} variant="outline" size="sm" className="border-cyber-warning/50 text-cyber-warning">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Start New
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-card/30 border-cyber-glow/20">
                <CardHeader>
                  <CardTitle className="text-cyber-glow font-cyber">Data Input</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-mono text-muted-foreground">
                      Enter news articles, URLs, or social media posts (one per line)
                    </label>
                    <Textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste URLs, article text, or social media posts here..."
                      className="mt-2 min-h-[200px] bg-card/50 border-cyber-glow/20 font-mono text-sm"
                    />
                  </div>

                  <Button 
                    onClick={handleScan} 
                    disabled={isScanning || !inputText.trim()}
                    className="w-full bg-cyber-glow/20 border border-cyber-glow/50 text-cyber-glow hover:bg-cyber-glow/30"
                  >
                    {isScanning ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Start Analysis
                      </>
                    )}
                  </Button>

                  {isScanning && (
                    <div className="space-y-2">
                      <Progress value={scanProgress} className="w-full" />
                      <p className="text-sm text-cyber-glow font-mono text-center">{scanPhase}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="results" className="flex-1 overflow-auto space-y-4">
            {currentSession ? (
              <div className="space-y-4">
                {/* Results Summary */}
                <Card className="bg-card/30 border-cyber-glow/20">
                  <CardHeader>
                    <CardTitle className="text-cyber-glow font-cyber flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyber-glow font-cyber">
                          {currentSession.totalArticles}
                        </div>
                        <div className="text-sm text-muted-foreground font-mono">
                          Total Articles
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyber-danger font-cyber">
                          {currentSession.flaggedCount}
                        </div>
                        <div className="text-sm text-muted-foreground font-mono">
                          Flagged Items
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold font-cyber ${getCredibilityColor(100 - currentSession.overallRiskScore)}`}>
                          {currentSession.overallRiskScore.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground font-mono">
                          Risk Score
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Articles List */}
                <div className="space-y-3">
                  {currentSession.articles.map((article) => (
                    <Card key={article.id} className="bg-card/30 border-cyber-glow/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-foreground">{article.title}</h4>
                              <Badge 
                                variant="secondary"
                                className={`${getCredibilityColor(article.credibilityScore)} border-current`}
                              >
                                {getCredibilityLabel(article.credibilityScore)}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{article.source}</span>
                              <span>{new Date(article.publishDate).toLocaleDateString()}</span>
                              <span className={getCredibilityColor(article.credibilityScore)}>
                                Credibility: {article.credibilityScore.toFixed(1)}%
                              </span>
                            </div>

                            {article.flags.length > 0 && (
                              <div className="flex gap-2">
                                {article.flags.map((flag) => (
                                  <Badge key={flag} variant="destructive" className="text-xs">
                                    {flag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {article.factChecks.length > 0 && (
                              <div className="space-y-1">
                                {article.factChecks.map((check, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-accent" />
                                    <span className="text-accent">{check.source}:</span>
                                    <span className={check.verdict.includes('True') ? 'text-accent' : 'text-cyber-danger'}>
                                      {check.verdict}
                                    </span>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-mono">No active analysis session</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-auto space-y-4">
            <Card className="bg-card/30 border-cyber-glow/20">
              <CardHeader>
                <CardTitle className="text-cyber-glow font-cyber flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Analysis History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sessions.length > 0 ? (
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-cyber-glow/10">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-foreground">
                              {session.filename || session.dataSource}
                            </span>
                            <Badge 
                              variant="secondary"
                              className={`${getCredibilityColor(100 - session.overallRiskScore)} border-current text-xs`}
                            >
                              {session.overallRiskScore.toFixed(1)}% risk
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {new Date(session.timestamp).toLocaleString()} • {session.totalArticles} articles • {session.flaggedCount} flagged
                          </div>
                        </div>
                        <Button
                          onClick={() => handleOpenHistorySession(session)}
                          variant="outline"
                          size="sm"
                          className="border-cyber-glow/50 text-cyber-glow"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-mono">No previous analyses</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}