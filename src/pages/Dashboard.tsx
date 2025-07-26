import { useState, useEffect } from "react"
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Shield,
  Zap,
  TrendingUp
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AppSidebar } from "@/components/AppSidebar"
import { AppHeader } from "@/components/AppHeader"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [stats, setStats] = useState({
    activeCases: 12,
    threatsDetected: 847,
    filesProcessed: 2341,
    systemHealth: 98.7
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const [recentActivities] = useState([
    {
      id: 1,
      type: 'threat',
      title: 'High-risk phishing domain detected',
      time: '2 minutes ago',
      severity: 'high'
    },
    {
      id: 2,
      type: 'analysis',
      title: 'Email dump analysis completed',
      time: '15 minutes ago',
      severity: 'medium'
    },
    {
      id: 3,
      type: 'case',
      title: 'New investigation case #UC-2024-0891',
      time: '32 minutes ago',
      severity: 'low'
    },
    {
      id: 4,
      type: 'system',
      title: 'AI Security System updated',
      time: '1 hour ago',
      severity: 'low'
    }
  ])

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
          <Activity className="h-6 w-6 text-cyber-glow" />
          <h1 className="text-2xl font-bold text-cyber-glow font-cyber">
            Command Dashboard
          </h1>
        </div>
        <div className="text-sm font-mono text-foreground bg-card/30 px-3 py-1 rounded border border-cyber-glow/20">
          {currentTime.toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-mono text-muted-foreground">Active Cases</p>
                <p className="text-2xl font-bold text-cyber-glow font-cyber">
                  {stats.activeCases}
                </p>
              </div>
              <FileText className="h-8 w-8 text-cyber-glow/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-cyber-danger/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-mono text-muted-foreground">Threats Detected</p>
                <p className="text-2xl font-bold text-cyber-danger font-cyber">
                  {stats.threatsDetected.toLocaleString()}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-cyber-danger/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-accent/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-mono text-muted-foreground">Files Processed</p>
                <p className="text-2xl font-bold text-accent font-cyber">
                  {stats.filesProcessed.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-cyber-glow-secondary/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-mono text-muted-foreground">System Health</p>
                <p className="text-2xl font-bold text-cyber-glow-secondary font-cyber">
                  {stats.systemHealth}%
                </p>
              </div>
              <Shield className="h-8 w-8 text-cyber-glow-secondary/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Status */}
        <Card className="lg:col-span-2 bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyber-glow font-cyber">
              <Zap className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-muted-foreground">AI Analysis Engine</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <span className="text-sm text-accent font-mono">OPERATIONAL</span>
                </div>
              </div>
              <Progress value={98} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-muted-foreground">Investigation Tools</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <span className="text-sm text-accent font-mono">READY</span>
                </div>
              </div>
              <Progress value={100} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-muted-foreground">Security Monitoring</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <span className="text-sm text-accent font-mono">ACTIVE</span>
                </div>
              </div>
              <Progress value={97} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-muted-foreground">Database Systems</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <span className="text-sm text-accent font-mono">SYNCHRONIZED</span>
                </div>
              </div>
              <Progress value={95} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyber-glow font-cyber">
              <Clock className="h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className={`
                    w-2 h-2 rounded-full mt-2 animate-pulse-glow
                    ${activity.severity === 'high' ? 'bg-cyber-danger' : 
                      activity.severity === 'medium' ? 'bg-cyber-warning' : 'bg-accent'}
                  `} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {activity.time}
                    </p>
                  </div>
                </div>
                {activity.id < recentActivities.length && (
                  <div className="ml-1 w-px h-4 bg-cyber-glow/20" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default Dashboard