import { useEffect, useState } from 'react'
import { Activity, Wifi, WifiOff, Shield, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useAppSettings } from '@/hooks/useAppSettings'

interface SystemStatus {
  network: 'connected' | 'disconnected' | 'degraded'
  security: 'secure' | 'warning' | 'critical'
  performance: 'optimal' | 'degraded' | 'poor'
  lastUpdate: Date
}

interface SecurityEvent {
  id: string
  type: 'login' | 'logout' | 'access_denied' | 'setting_change' | 'audit'
  message: string
  timestamp: Date
  severity: 'info' | 'warning' | 'critical'
}

export const RealTimeSettingsMonitor = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    network: 'connected',
    security: 'secure',
    performance: 'optimal',
    lastUpdate: new Date()
  })
  
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [isMonitoring, setIsMonitoring] = useState(true)
  const { toast } = useToast()
  const { settings } = useAppSettings()

  // Simulate real-time system monitoring
  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      // Simulate system status updates
      const networkStates: SystemStatus['network'][] = ['connected', 'connected', 'connected', 'degraded', 'disconnected']
      const securityStates: SystemStatus['security'][] = ['secure', 'secure', 'secure', 'warning', 'critical']
      const performanceStates: SystemStatus['performance'][] = ['optimal', 'optimal', 'degraded', 'poor']

      const newStatus: SystemStatus = {
        network: networkStates[Math.floor(Math.random() * networkStates.length)],
        security: securityStates[Math.floor(Math.random() * securityStates.length)],
        performance: performanceStates[Math.floor(Math.random() * performanceStates.length)],
        lastUpdate: new Date()
      }

      setSystemStatus(newStatus)

      // Generate security events
      if (Math.random() < 0.3) {
        const eventTypes: SecurityEvent['type'][] = ['login', 'logout', 'access_denied', 'setting_change', 'audit']
        const messages = {
          login: 'User authentication successful',
          logout: 'User session terminated',
          access_denied: 'Access denied for restricted resource',
          setting_change: 'Security setting modified',
          audit: 'Audit log entry created'
        }

        const type = eventTypes[Math.floor(Math.random() * eventTypes.length)]
        const severity = type === 'access_denied' ? 'warning' : 'info'

        const newEvent: SecurityEvent = {
          id: Date.now().toString(),
          type,
          message: messages[type],
          timestamp: new Date(),
          severity
        }

        setSecurityEvents(prev => [newEvent, ...prev.slice(0, 9)]) // Keep last 10 events

        // Security events tracked silently (no notifications)
      }
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [isMonitoring, toast])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'secure':
      case 'optimal':
        return 'text-cyber-glow border-cyber-glow/20 bg-cyber-glow/10'
      case 'degraded':
      case 'warning':
        return 'text-cyber-warning border-cyber-warning/20 bg-cyber-warning/10'
      case 'disconnected':
      case 'critical':
      case 'poor':
        return 'text-cyber-danger border-cyber-danger/20 bg-cyber-danger/10'
      default:
        return 'text-muted-foreground border-muted/20 bg-muted/10'
    }
  }

  const getStatusIcon = (type: string, status: string) => {
    switch (type) {
      case 'network':
        return status === 'connected' ? 
          <Wifi className="h-4 w-4" /> : 
          <WifiOff className="h-4 w-4" />
      case 'security':
        return status === 'secure' ? 
          <Shield className="h-4 w-4" /> : 
          <AlertTriangle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-cyber-glow font-cyber">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-Time System Monitor
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
            className="text-cyber-glow hover:bg-cyber-glow/10"
          >
            {isMonitoring ? 'Pause' : 'Resume'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">System Status</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              {getStatusIcon('network', systemStatus.network)}
              <div>
                <p className="text-xs font-medium">Network</p>
                <Badge variant="outline" className={getStatusColor(systemStatus.network)}>
                  {systemStatus.network}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getStatusIcon('security', systemStatus.security)}
              <div>
                <p className="text-xs font-medium">Security</p>
                <Badge variant="outline" className={getStatusColor(systemStatus.security)}>
                  {systemStatus.security}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getStatusIcon('performance', systemStatus.performance)}
              <div>
                <p className="text-xs font-medium">Performance</p>
                <Badge variant="outline" className={getStatusColor(systemStatus.performance)}>
                  {systemStatus.performance}
                </Badge>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground font-mono">
            Last updated: {systemStatus.lastUpdate.toLocaleTimeString()}
          </p>
        </div>

        {/* Recent Security Events */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Recent Security Events</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {securityEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground font-mono">No recent events</p>
            ) : (
              securityEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-2 p-2 rounded-lg bg-background/50">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${
                    event.severity === 'critical' ? 'bg-cyber-danger' :
                    event.severity === 'warning' ? 'bg-cyber-warning' :
                    'bg-cyber-glow'
                  } animate-pulse-glow`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground">{event.message}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {event.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(event.severity)}`}
                  >
                    {event.type}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}