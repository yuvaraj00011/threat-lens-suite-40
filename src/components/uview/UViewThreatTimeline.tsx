import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertTriangle, Shield, DollarSign, Phone, Mail } from "lucide-react"

interface Correlation {
  id: string
  type: string
  severity: string
  confidence: number
  description: string
  involvedTools: string[]
  timeline: Array<{
    time: string
    event: string
    tool: string
  }>
}

interface UViewThreatTimelineProps {
  correlations: Correlation[]
}

const getToolIcon = (tool: string) => {
  switch (tool) {
    case 'callTracer': return Phone
    case 'phishingDetector': 
    case 'emailChecker': return Mail
    case 'moneyMapper': return DollarSign
    default: return AlertTriangle
  }
}

const getToolColor = (tool: string) => {
  switch (tool) {
    case 'callTracer': return 'text-blue-500'
    case 'phishingDetector': 
    case 'emailChecker': return 'text-red-500'
    case 'moneyMapper': return 'text-green-500'
    default: return 'text-yellow-500'
  }
}

export function UViewThreatTimeline({ correlations }: UViewThreatTimelineProps) {
  // Flatten all timeline events and sort by time
  const allEvents = correlations
    .flatMap(corr => 
      corr.timeline.map(event => ({
        ...event,
        correlationId: corr.id,
        correlationType: corr.type,
        severity: corr.severity
      }))
    )
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr)
    return date.toLocaleString()
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'border-red-500 bg-red-500/10'
      case 'MEDIUM': return 'border-yellow-500 bg-yellow-500/10'
      case 'LOW': return 'border-green-500 bg-green-500/10'
      default: return 'border-gray-500 bg-gray-500/10'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyber-glow font-cyber">
          <Clock className="h-5 w-5" />
          Threat Timeline Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-cyber-glow/30"></div>
          
          <div className="space-y-6">
            {allEvents.map((event, index) => {
              const Icon = getToolIcon(event.tool)
              const iconColor = getToolColor(event.tool)
              
              return (
                <div key={`${event.correlationId}-${index}`} className="relative flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className={`
                    relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2
                    ${getSeverityColor(event.severity)}
                  `}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  
                  {/* Event content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {formatTime(event.time)}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {event.tool}
                      </Badge>
                      <Badge 
                        variant={event.severity === 'HIGH' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {event.severity}
                      </Badge>
                    </div>
                    
                    <p className="text-sm font-medium text-foreground mb-1">
                      {event.event}
                    </p>
                    
                    <p className="text-xs text-muted-foreground">
                      Correlation: {event.correlationType.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
          
          {allEvents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-mono">No timeline events available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}