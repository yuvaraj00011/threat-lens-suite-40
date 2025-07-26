import { useState, useEffect } from "react"
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  Clock, 
  Lock, 
  Users, 
  Network, 
  Cpu,
  X,
  Download,
  Filter,
  RefreshCw,
  Eye,
  TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useSecurityMonitoring } from "./security/SecurityMonitoring"
import { useAutomatedResponse } from "./security/AutomatedResponse"

interface SecurityDashboardProps {
  isOpen: boolean
  onClose: () => void
}

interface ThreatEvent {
  id: string
  timestamp: string
  type: 'user_behavior' | 'network' | 'resource' | 'api'
  description: string
  riskScore: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  source: string
  status: 'active' | 'investigating' | 'resolved'
}

interface SystemMetrics {
  overallThreatLevel: number
  activeSessions: number
  suspiciousEvents: number
  blockedThreats: number
  systemHealth: number
}

export function SecurityDashboard({ isOpen, onClose }: SecurityDashboardProps) {
  const { monitoringData, isMonitoring, startMonitoring, stopMonitoring } = useSecurityMonitoring()
  const { getActiveIncidents, getResponseHistory } = useAutomatedResponse()
  
  const [metrics, setMetrics] = useState<SystemMetrics>({
    overallThreatLevel: 0.23,
    activeSessions: 47,
    suspiciousEvents: 12,
    blockedThreats: 3,
    systemHealth: 98.7
  })

  // Start monitoring when dashboard opens
  useEffect(() => {
    if (isOpen && !isMonitoring) {
      startMonitoring()
    }
  }, [isOpen, isMonitoring, startMonitoring])

  const [threatEvents, setThreatEvents] = useState<ThreatEvent[]>([
    {
      id: "evt_001",
      timestamp: "2024-01-20T14:30:25Z",
      type: "user_behavior",
      description: "Unusual login pattern detected from user ID: UC_4472",
      riskScore: 0.78,
      severity: "high",
      source: "Authentication Module",
      status: "investigating"
    },
    {
      id: "evt_002", 
      timestamp: "2024-01-20T14:28:15Z",
      type: "network",
      description: "Suspicious outbound traffic to unknown domain",
      riskScore: 0.65,
      severity: "medium",
      source: "Network Monitor",
      status: "active"
    },
    {
      id: "evt_003",
      timestamp: "2024-01-20T14:25:42Z",
      type: "api",
      description: "API rate limit exceeded - potential abuse detected",
      riskScore: 0.89,
      severity: "critical",
      source: "API Gateway",
      status: "resolved"
    }
  ])

  const [selectedEvent, setSelectedEvent] = useState<ThreatEvent | null>(null)

  // Real-time threat level animation
  useEffect(() => {
    if (!isOpen) return
    
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        overallThreatLevel: Math.max(0, Math.min(1, prev.overallThreatLevel + (Math.random() - 0.5) * 0.05))
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [isOpen])

  const getThreatLevelColor = (level: number) => {
    if (level < 0.3) return "text-accent"
    if (level < 0.6) return "text-cyber-warning" 
    if (level < 0.8) return "text-cyber-danger"
    return "text-cyber-danger animate-pulse-glow"
  }

  const getThreatLevelBg = (level: number) => {
    if (level < 0.3) return "from-accent/20 to-accent/5"
    if (level < 0.6) return "from-cyber-warning/20 to-cyber-warning/5"
    if (level < 0.8) return "from-cyber-danger/20 to-cyber-danger/5"
    return "from-cyber-danger/30 to-cyber-danger/10"
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-accent/20 text-accent border-accent/30'
      case 'medium': return 'bg-cyber-warning/20 text-cyber-warning border-cyber-warning/30'
      case 'high': return 'bg-cyber-danger/20 text-cyber-danger border-cyber-danger/30'
      case 'critical': return 'bg-cyber-danger/30 text-cyber-danger border-cyber-danger animate-pulse-glow'
      default: return 'bg-muted/20 text-muted-foreground'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-cyber-danger/20 text-cyber-danger'
      case 'investigating': return 'bg-cyber-warning/20 text-cyber-warning'
      case 'resolved': return 'bg-accent/20 text-accent'
      default: return 'bg-muted/20 text-muted-foreground'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] bg-background/95 backdrop-blur-lg border-cyber-glow/30">
        <DialogHeader className="border-b border-cyber-glow/20 pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl font-cyber text-cyber-glow">
            <div className="relative">
              <Shield className="h-8 w-8 animate-pulse-glow" />
              <div className="absolute inset-0 animate-ping">
                <Shield className="h-8 w-8 opacity-30" />
              </div>
            </div>
            AI Security Dashboard
            <Badge className="ml-auto bg-cyber-glow/20 text-cyber-glow border-cyber-glow/30 animate-pulse-glow">
              ACTIVE MONITORING
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full overflow-hidden">
          {/* Left Panel - Threat Meter & Quick Stats */}
          <div className="space-y-4">
            {/* Real-Time Threat Meter */}
            <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-cyber text-cyber-glow">Threat Level</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <div className={`text-center p-6 rounded-lg bg-gradient-to-br ${getThreatLevelBg(metrics.overallThreatLevel)}`}>
                    <div className={`text-4xl font-bold font-cyber ${getThreatLevelColor(metrics.overallThreatLevel)}`}>
                      {(metrics.overallThreatLevel * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      Platform Risk Score
                    </p>
                  </div>
                  <Progress 
                    value={metrics.overallThreatLevel * 100} 
                    className="mt-3 h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-card/30 border-cyber-glow/20">
                <CardContent className="p-4 text-center">
                  <Users className="h-6 w-6 mx-auto mb-2 text-cyber-glow" />
                  <div className="text-xl font-bold font-cyber text-cyber-glow">
                    {metrics.activeSessions}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    Active Sessions
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-cyber-warning/20">
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-cyber-warning" />
                  <div className="text-xl font-bold font-cyber text-cyber-warning">
                    {metrics.suspiciousEvents}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    Suspicious Events
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-cyber-danger/20">
                <CardContent className="p-4 text-center">
                  <Lock className="h-6 w-6 mx-auto mb-2 text-cyber-danger" />
                  <div className="text-xl font-bold font-cyber text-cyber-danger">
                    {metrics.blockedThreats}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    Blocked Threats
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-accent/20">
                <CardContent className="p-4 text-center">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-accent" />
                  <div className="text-xl font-bold font-cyber text-accent">
                    {metrics.systemHealth}%
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    System Health
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Center Panel - Anomaly Timeline & Incident Feed */}
          <div className="lg:col-span-2 space-y-4">
            {/* Control Bar */}
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="border-cyber-glow/30 hover:border-cyber-glow">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button size="sm" variant="outline" className="border-cyber-glow/30 hover:border-cyber-glow">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" variant="outline" className="border-cyber-glow/30 hover:border-cyber-glow ml-auto">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Incident Feed */}
            <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-cyber-glow font-cyber">
                  <Clock className="h-5 w-5" />
                  Live Incident Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {threatEvents.map((event, index) => (
                      <div key={event.id} className="space-y-2">
                        <div 
                          className="p-4 rounded-lg bg-card/30 border border-cyber-glow/10 hover:border-cyber-glow/30 cursor-pointer transition-all duration-300 hover:shadow-cyber"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge className={getSeverityColor(event.severity)}>
                                  {event.severity.toUpperCase()}
                                </Badge>
                                <Badge className={getStatusColor(event.status)}>
                                  {event.status.toUpperCase()}
                                </Badge>
                                <span className="text-xs text-muted-foreground font-mono ml-auto">
                                  Risk: {(event.riskScore * 100).toFixed(0)}%
                                </span>
                              </div>
                              
                              <p className="text-sm font-medium text-foreground">
                                {event.description}
                              </p>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                                <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                                <span>Source: {event.source}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              <div className={`w-2 h-2 rounded-full animate-pulse-glow ${
                                event.severity === 'critical' ? 'bg-cyber-danger' :
                                event.severity === 'high' ? 'bg-cyber-danger' :
                                event.severity === 'medium' ? 'bg-cyber-warning' : 'bg-accent'
                              }`} />
                              <Button size="sm" variant="ghost" className="p-1">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {index < threatEvents.length - 1 && (
                          <div className="ml-6 w-px h-4 bg-cyber-glow/20" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Session Monitor & Live Logs */}
          <div className="space-y-4">
            {/* Session/Process Panel */}
            <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-cyber text-cyber-glow">Active Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between p-2 bg-card/30 rounded">
                      <span>UC_4472</span>
                      <Badge className="bg-cyber-warning/20 text-cyber-warning text-xs">
                        FLAGGED
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-card/30 rounded">
                      <span>UC_3891</span>
                      <Badge className="bg-accent/20 text-accent text-xs">
                        NORMAL
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-card/30 rounded">
                      <span>UC_7723</span>
                      <Badge className="bg-cyber-danger/20 text-cyber-danger text-xs">
                        LOCKED
                      </Badge>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Live Log Tail */}
            <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-cyber text-cyber-glow">Live Log Tail</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-1 text-xs font-mono">
                    <div className="text-muted-foreground">
                      [14:30:25] AUTH: Login attempt from 192.168.1.100
                    </div>
                    <div className="text-cyber-warning">
                      [14:30:20] ANOMALY: Unusual access pattern detected
                    </div>
                    <div className="text-muted-foreground">
                      [14:30:15] NET: Outbound connection established
                    </div>
                    <div className="text-cyber-danger">
                      [14:30:10] BLOCK: Suspicious domain blocked
                    </div>
                    <div className="text-muted-foreground">
                      [14:30:05] API: Rate limit warning threshold reached
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
            <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-lg border-cyber-glow/30">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-cyber-glow font-cyber">
                  <AlertTriangle className="h-5 w-5" />
                  Threat Event Details
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-muted-foreground">Event ID</label>
                    <p className="font-mono text-cyber-glow">{selectedEvent.id}</p>
                  </div>
                  <div>
                    <label className="text-xs font-mono text-muted-foreground">Risk Score</label>
                    <p className="font-mono text-cyber-danger">{(selectedEvent.riskScore * 100).toFixed(1)}%</p>
                  </div>
                </div>
                
                <Separator className="bg-cyber-glow/20" />
                
                <div>
                  <label className="text-xs font-mono text-muted-foreground">Description</label>
                  <p className="mt-1">{selectedEvent.description}</p>
                </div>
                
                <div className="flex gap-4">
                  <Button className="bg-cyber-danger/20 text-cyber-danger border-cyber-danger/30 hover:bg-cyber-danger/30">
                    Lock Session
                  </Button>
                  <Button variant="outline" className="border-cyber-glow/30 hover:border-cyber-glow">
                    Mark as Benign
                  </Button>
                  <Button variant="outline" className="border-cyber-glow/30 hover:border-cyber-glow">
                    Export Evidence
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  )
}