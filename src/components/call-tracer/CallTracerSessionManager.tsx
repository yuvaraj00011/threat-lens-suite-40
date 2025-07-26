import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  History, 
  Calendar, 
  Phone, 
  AlertTriangle,
  Play,
  Trash2,
  MapPin,
  Users
} from "lucide-react"

interface CallObservation {
  id: string
  sessionId: string
  phoneNumbers: any[]
  extractionSource: string
  timestamp: string
  metadata: {
    totalNumbers: number
    riskDistribution: Record<string, number>
    countries: string[]
    carriers: string[]
  }
}

interface SessionManagerProps {
  sessions: CallObservation[]
  currentSession?: CallObservation
  onLoadSession: (session: CallObservation) => void
  onDeleteSession?: (sessionId: string) => void
  showDetailed?: boolean
}

export function CallTracerSessionManager({ 
  sessions, 
  currentSession, 
  onLoadSession, 
  onDeleteSession,
  showDetailed = false 
}: SessionManagerProps) {
  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'scammer': return "destructive"
      case 'high-risk': return "destructive" 
      case 'suspicious': return "secondary"
      case 'verified': return "default"
      default: return "outline"
    }
  }

  const getHighestRiskLevel = (session: CallObservation) => {
    const risks = Object.keys(session.metadata.riskDistribution)
    if (risks.includes('scammer')) return 'scammer'
    if (risks.includes('high-risk')) return 'high-risk'
    if (risks.includes('suspicious')) return 'suspicious'
    return 'verified'
  }

  if (showDetailed) {
    return (
      <div className="h-full space-y-4 overflow-auto">
        <Card className="bg-card/30 border-cyber-glow/20">
          <CardHeader>
            <CardTitle className="text-lg font-cyber text-cyber-glow flex items-center gap-2">
              <History className="h-5 w-5" />
              Call Tracer History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-mono">No previous analysis sessions</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    currentSession?.id === session.id
                      ? 'border-cyber-glow bg-cyber-glow/10'
                      : 'border-cyber-glow/20 hover:border-cyber-glow/40 hover:bg-card/50'
                  }`}
                  onClick={() => onLoadSession(session)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-mono font-semibold text-sm mb-1">
                        Session {session.sessionId}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                        <Calendar className="h-3 w-3" />
                        {formatDate(session.timestamp)}
                      </div>
                    </div>
                    {currentSession?.id === session.id && (
                      <Badge variant="outline" className="border-cyber-glow text-cyber-glow">
                        Current
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="space-y-1">
                      <div className="text-xs font-mono text-muted-foreground">Source</div>
                      <Badge variant="outline" className="text-xs">
                        {session.extractionSource}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-mono text-muted-foreground">Numbers</div>
                      <div className="text-sm font-mono font-semibold flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {session.metadata.totalNumbers}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="space-y-1">
                      <div className="text-xs font-mono text-muted-foreground">Countries</div>
                      <div className="text-sm font-mono font-semibold flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.metadata.countries.length}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-mono text-muted-foreground">Carriers</div>
                      <div className="text-sm font-mono font-semibold flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {session.metadata.carriers.length}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-cyber-warning" />
                        <span className="text-xs font-mono text-muted-foreground">Highest Risk:</span>
                        <Badge variant={getRiskBadgeVariant(getHighestRiskLevel(session))}>
                          {getHighestRiskLevel(session)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onLoadSession(session)
                        }}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                      {onDeleteSession && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteSession(session.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Risk Distribution */}
                  <div className="mt-3 pt-3 border-t border-cyber-glow/20">
                    <div className="text-xs text-muted-foreground mb-2">Risk Distribution:</div>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(session.metadata.riskDistribution).map(([risk, count]) => (
                        <Badge key={risk} variant={getRiskBadgeVariant(risk)} className="text-xs">
                          {risk}: {count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Compact view for sidebar
  return (
    <Card className="bg-card/30 border-cyber-glow/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-cyber text-cyber-glow flex items-center gap-2">
          <History className="h-4 w-4" />
          Recent Sessions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.length === 0 ? (
          <p className="text-xs text-muted-foreground font-mono text-center">
            No previous sessions
          </p>
        ) : (
          sessions.slice(-3).reverse().map((session) => (
            <div
              key={session.id}
              className="p-3 border border-cyber-glow/20 rounded-lg cursor-pointer hover:bg-card/50 transition-all duration-200"
              onClick={() => onLoadSession(session)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-mono font-semibold truncate">
                  Session {session.sessionId.slice(-6)}
                </div>
                <Badge variant="outline" className="text-xs">
                  {session.metadata.totalNumbers}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-muted-foreground">
                  {formatDate(session.timestamp)}
                </span>
                <div className="flex items-center gap-1">
                  <Badge variant={getRiskBadgeVariant(getHighestRiskLevel(session))} className="text-xs">
                    {getHighestRiskLevel(session)}
                  </Badge>
                </div>
              </div>
            </div>
          ))
        )}
        
        {sessions.length > 3 && (
          <Button variant="outline" size="sm" className="w-full text-xs">
            View All ({sessions.length})
          </Button>
        )}
      </CardContent>
    </Card>
  )
}