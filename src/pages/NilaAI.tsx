import { AppSidebar } from "@/components/AppSidebar"
import { AppHeader } from "@/components/AppHeader"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { NilaChat } from "@/components/NilaChat"
import { useState, useEffect, useCallback } from "react"
import { Bot, Brain, Lightbulb, Search, FileText, ArrowLeft, MessageSquare, Activity, Zap, Clock, TrendingUp } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function NilaAI() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const [sessionStats, setSessionStats] = useState({
    queries: 0,
    suggestions: 0,
    workflows: 0,
    conversationTime: 0
  })
  const [isSystemOnline, setIsSystemOnline] = useState(true)
  const [recentQueries, setRecentQueries] = useState<string[]>([])
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)

  useEffect(() => {
    // Auto-open NILA chat when page loads
    setIsOpen(true)
    setSessionStartTime(new Date())
  }, [])

  // Real-time session tracking
  useEffect(() => {
    if (!sessionStartTime) return

    const interval = setInterval(() => {
      const now = new Date()
      const timeDiff = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000 / 60) // minutes
      setSessionStats(prev => ({ ...prev, conversationTime: timeDiff }))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [sessionStartTime])

  // Simulate AI system status
  useEffect(() => {
    const interval = setInterval(() => {
      setIsSystemOnline(prev => Math.random() > 0.05 ? true : prev) // 95% uptime simulation
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleNewQuery = useCallback((query: string) => {
    setSessionStats(prev => ({ 
      ...prev, 
      queries: prev.queries + 1,
      suggestions: prev.suggestions + Math.floor(Math.random() * 3) + 1
    }))
    setRecentQueries(prev => [query, ...prev.slice(0, 4)]) // Keep last 5 queries
  }, [])

  const handleStartWorkflow = useCallback(() => {
    setSessionStats(prev => ({ ...prev, workflows: prev.workflows + 1 }))
  }, [])

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleBack = () => {
    navigate('/dashboard')
  }

  const capabilities = [
    {
      icon: Brain,
      title: "Intelligent Analysis",
      description: "AI-powered investigation guidance and pattern recognition"
    },
    {
      icon: Lightbulb,
      title: "Smart Suggestions",
      description: "Contextual recommendations for investigation workflows"
    },
    {
      icon: Search,
      title: "Deep Insights",
      description: "Advanced data correlation and evidence connections"
    },
    {
      icon: FileText,
      title: "Automated Reports",
      description: "Generate comprehensive investigation summaries"
    }
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className="flex-1 min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
          <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-cyber-glow" />
                <h1 className="text-2xl font-bold text-cyber-glow font-cyber">
                  NILA AI Assistant
                </h1>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-mono text-muted-foreground">Queries Processed</p>
                      <p className="text-2xl font-bold text-cyber-glow font-cyber">
                        {sessionStats.queries}
                      </p>
                    </div>
                    <Search className="h-8 w-8 text-cyber-glow/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-accent/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-mono text-muted-foreground">AI Suggestions</p>
                      <p className="text-2xl font-bold text-accent font-cyber">
                        {sessionStats.suggestions}
                      </p>
                    </div>
                    <Lightbulb className="h-8 w-8 text-accent/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-cyber-glow-secondary/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-mono text-muted-foreground">Active Workflows</p>
                      <p className="text-2xl font-bold text-cyber-glow-secondary font-cyber">
                        {sessionStats.workflows}
                      </p>
                    </div>
                    <Brain className="h-8 w-8 text-cyber-glow-secondary/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-cyber-warning/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-mono text-muted-foreground">Session Time</p>
                      <p className="text-2xl font-bold text-cyber-warning font-cyber">
                        {sessionStats.conversationTime}m
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-cyber-warning/60" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Capabilities Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Queries */}
              <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-cyber-glow font-cyber">
                    <MessageSquare className="h-5 w-5" />
                    Recent Queries
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentQueries.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No queries yet. Start a conversation with NILA!
                    </p>
                  ) : (
                    recentQueries.map((query, index) => (
                      <div key={index} className="p-3 rounded-lg bg-card/30 border border-cyber-glow/10">
                        <p className="text-sm text-foreground line-clamp-2">{query}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {index === 0 ? 'Just now' : `${index * 2} minutes ago`}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Capabilities Grid */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {capabilities.map((capability, index) => (
                    <Card key={index} className="bg-card/30 border-cyber-glow/20 hover:border-cyber-glow/50 transition-all duration-300 cursor-pointer group">
                      <CardContent className="p-6 text-center space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-lg bg-cyber-glow/10 flex items-center justify-center group-hover:bg-cyber-glow/20 transition-all duration-300">
                          <capability.icon className="h-6 w-6 text-cyber-glow" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{capability.title}</h3>
                          <p className="text-xs text-muted-foreground">{capability.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyber-glow font-cyber">
                  <Bot className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="cyber" 
                    className="w-full"
                    onClick={() => {
                      setIsOpen(true)
                      handleStartWorkflow()
                    }}
                  >
                    Start New Investigation
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-cyber-glow/30 hover:bg-cyber-glow/10"
                    onClick={() => setIsOpen(true)}
                  >
                    Continue Previous Chat
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-accent/30 hover:bg-accent/10"
                    onClick={() => {
                      setIsOpen(true)
                      handleNewQuery("What are the best practices for digital forensics investigations?")
                    }}
                  >
                    Get Investigation Tips
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Status Indicator */}
            <div className="text-center py-8">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${
                isSystemOnline 
                  ? 'bg-accent/10 border-accent/20' 
                  : 'bg-cyber-danger/10 border-cyber-danger/20'
              }`}>
                <div className={`w-2 h-2 rounded-full animate-pulse-glow ${
                  isSystemOnline ? 'bg-accent' : 'bg-cyber-danger'
                }`} />
                <span className={`text-sm font-mono ${
                  isSystemOnline ? 'text-accent' : 'text-cyber-danger'
                }`}>
                  NILA AI System {isSystemOnline ? 'Online' : 'Maintenance Mode'}
                </span>
              </div>
            </div>

            {/* Chat Interface */}
            {isOpen && (
              <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
                <CardHeader className="pb-3 border-b border-cyber-glow/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-accent rounded-full animate-pulse-glow" />
                      <CardTitle className="text-lg font-cyber text-cyber-glow">NILA AI Assistant</CardTitle>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleClose}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-96">
                    <NilaChat 
                      onNewQuery={handleNewQuery}
                      systemOnline={isSystemOnline}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}