import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  History, 
  Calendar, 
  FileText, 
  AlertTriangle,
  Play,
  Trash2
} from "lucide-react"

interface SessionManagerProps {
  sessions: any[]
  currentSession?: any
  onLoadSession: (session: any) => void
  showDetailed?: boolean
}

export function MoneyMapperSessionManager({ 
  sessions, 
  currentSession, 
  onLoadSession, 
  showDetailed = false 
}: SessionManagerProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const getRiskBadgeVariant = (riskScore: number) => {
    if (riskScore >= 80) return "destructive"
    if (riskScore >= 60) return "secondary"
    return "outline"
  }

  if (showDetailed) {
    return (
      <div className="h-full space-y-4 overflow-auto">
        <Card className="bg-card/30 border-cyber-glow/20">
          <CardHeader>
            <CardTitle className="text-lg font-cyber text-cyber-glow flex items-center gap-2">
              <History className="h-5 w-5" />
              Analysis History
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
                        {session.name}
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
                      <div className="text-xs font-mono text-muted-foreground">Format</div>
                      <Badge variant="outline" className="text-xs">
                        {session.dataFormat}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-mono text-muted-foreground">Transactions</div>
                      <div className="text-sm font-mono font-semibold">
                        {session.transactionCount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-cyber-warning" />
                        <span className="text-xs font-mono text-muted-foreground">Risk:</span>
                        <Badge variant={getRiskBadgeVariant(session.riskScore)}>
                          {session.riskScore}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">AML Flags:</span>
                        <Badge variant="destructive" className="text-xs">
                          {session.amlFlags}
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle delete
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
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
          Previous Sessions
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
                  {session.name}
                </div>
                <Badge variant="outline" className="text-xs">
                  {session.dataFormat}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-muted-foreground">
                  {session.transactionCount.toLocaleString()} txns
                </span>
                <div className="flex items-center gap-1">
                  <Badge variant={getRiskBadgeVariant(session.riskScore)} className="text-xs">
                    {session.riskScore}%
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