import { useState, useEffect } from "react"
import { Eye, FileText, Clock, Activity, Upload, Brain, TrendingUp } from "lucide-react"
import { AppSidebar } from "@/components/AppSidebar"
import { AppHeader } from "@/components/AppHeader"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UViewDashboard } from "@/components/UViewDashboard"
import { UViewAnalysisResult, UViewRealTimeEngine } from "@/components/UViewRealTimeEngine"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const UView = () => {
  const [analysisHistory, setAnalysisHistory] = useState<UViewAnalysisResult[]>([])
  const [showDashboard, setShowDashboard] = useState(false)
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("realtime")

  // Load analysis history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('uview-analysis-history')
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
        setAnalysisHistory(parsedHistory)
      } catch (error) {
        console.error('Failed to load analysis history:', error)
      }
    }
  }, [])

  const handleViewAnalysis = (analysisId: string) => {
    setSelectedAnalysisId(analysisId)
    setShowDashboard(true)
  }

  const handleAnalysisComplete = (result: UViewAnalysisResult) => {
    setActiveTab("history")
  }

  const handleUpdateHistory = (history: UViewAnalysisResult[]) => {
    setAnalysisHistory(history)
  }

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'HIGH': return 'destructive'
      case 'MEDIUM': return 'secondary'
      case 'LOW': return 'outline'
      default: return 'outline'
    }
  }

  const selectedAnalysis = selectedAnalysisId 
    ? analysisHistory.find(a => a.id === selectedAnalysisId)
    : null

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className="flex-1 min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
          <div className="container mx-auto p-6 space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-6 w-6 text-cyber-glow" />
                <h1 className="text-2xl font-bold text-cyber-glow font-cyber">
                  U-View: Unified Investigation Platform
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                  <Activity className="h-4 w-4" />
                  <span>System Online</span>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-cyber-glow font-cyber mb-1">
                    {analysisHistory.length}
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    Total Analyses
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-accent/20 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-accent font-cyber mb-1">
                    {analysisHistory.reduce((sum, a) => sum + a.totalThreats, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    Threats Identified
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-cyber-warning/20 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-cyber-warning font-cyber mb-1">
                    {analysisHistory.filter(a => a.riskLevel === 'HIGH').length}
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    High Risk Cases
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-cyber-glow-secondary/20 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-cyber-glow-secondary font-cyber mb-1">
                    {analysisHistory.reduce((sum, a) => sum + a.files.length, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    Files Processed
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="realtime">Real-Time Analysis</TabsTrigger>
                <TabsTrigger value="history">Analysis History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="realtime" className="space-y-6">
                <UViewRealTimeEngine 
                  onAnalysisComplete={handleAnalysisComplete}
                  analysisHistory={analysisHistory}
                  onUpdateHistory={handleUpdateHistory}
                />
              </TabsContent>
              
              <TabsContent value="history" className="space-y-6">
                {/* Analysis History */}
                {analysisHistory.length === 0 ? (
                  <Card className="bg-card/50 border-cyber-glow/20">
                    <CardContent className="p-8 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">No Analysis History</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Switch to Real-Time Analysis tab to upload files and generate analysis results.
                      </p>
                      <Button onClick={() => setActiveTab("realtime")} variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Start Analysis
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-card/50 border-cyber-glow/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-cyber-glow font-cyber">
                        <FileText className="h-5 w-5" />
                        Analysis History ({analysisHistory.length} results)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {analysisHistory.map((analysis) => (
                          <Card 
                            key={analysis.id}
                            className="bg-card/30 border-cyber-glow/10 hover:border-cyber-glow/30 transition-all duration-300 cursor-pointer"
                            onClick={() => handleViewAnalysis(analysis.id)}
                          >
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium text-sm">{analysis.name}</h4>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                    <Clock className="h-3 w-3" />
                                    {analysis.timestamp.toLocaleDateString()} at {analysis.timestamp.toLocaleTimeString()}
                                  </div>
                                </div>
                                <Badge variant={getRiskBadgeVariant(analysis.riskLevel)} className="text-xs">
                                  {analysis.riskLevel}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground">Files:</span>
                                  <span className="ml-1 font-mono">{analysis.files.length}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Threats:</span>
                                  <span className="ml-1 font-mono">{analysis.totalThreats}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Risk Score:</span>
                                  <span className="ml-1 font-mono">{analysis.riskScore}/10</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Tools:</span>
                                  <span className="ml-1 font-mono">{Object.keys(analysis.toolResults).length}</span>
                                </div>
                              </div>

                              <Button size="sm" variant="outline" className="w-full">
                                <Eye className="h-3 w-3 mr-1" />
                                View Analysis
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* U-View Dashboard */}
            {selectedAnalysis && (
              <UViewDashboard 
                isOpen={showDashboard}
                onClose={() => setShowDashboard(false)}
                caseId={selectedAnalysis.id}
                analysisData={selectedAnalysis}
              />
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default UView