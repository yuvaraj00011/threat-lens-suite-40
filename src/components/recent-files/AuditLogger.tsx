import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Eye, 
  Download, 
  Shield, 
  Trash2, 
  Archive,
  Play,
  User,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle
} from "lucide-react"

export interface AuditLogEntry {
  id: string
  fileId: string
  fileName: string
  action: 'view' | 'download' | 'quarantine' | 'delete' | 'archive' | 'reAnalyze' | 'upload'
  userId: string
  userName: string
  timestamp: string
  details?: string
  ipAddress?: string
  userAgent?: string
}

interface AuditLoggerProps {
  logs: AuditLogEntry[]
  onExport?: () => void
}

export function AuditLogger({ logs, onExport }: AuditLoggerProps) {
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>(logs)
  const [selectedAction, setSelectedAction] = useState<string>('all')

  useEffect(() => {
    if (selectedAction === 'all') {
      setFilteredLogs(logs)
    } else {
      setFilteredLogs(logs.filter(log => log.action === selectedAction))
    }
  }, [logs, selectedAction])

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'view':
        return Eye
      case 'download':
        return Download
      case 'quarantine':
        return Shield
      case 'delete':
        return Trash2
      case 'archive':
        return Archive
      case 'reAnalyze':
        return Play
      default:
        return Activity
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'view':
        return 'text-cyber-glow'
      case 'download':
        return 'text-accent'
      case 'quarantine':
        return 'text-[hsl(var(--status-quarantined))]'
      case 'delete':
        return 'text-cyber-danger'
      case 'archive':
        return 'text-muted-foreground'
      case 'reAnalyze':
        return 'text-cyber-warning'
      default:
        return 'text-foreground'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  const uniqueActions = Array.from(new Set(logs.map(log => log.action)))

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-cyber-glow/30 text-cyber-glow hover:bg-cyber-glow/10"
        >
          <Activity className="h-4 w-4 mr-1" />
          Audit Logs ({logs.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-card/95 backdrop-blur border-cyber-glow/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-cyber-glow">
            <Activity className="h-5 w-5" />
            File Access Audit Log
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filter Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filter by action:</span>
              <div className="flex flex-wrap gap-1">
                <Button
                  variant={selectedAction === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedAction('all')}
                  className="h-7 text-xs"
                >
                  All
                </Button>
                {uniqueActions.map(action => (
                  <Button
                    key={action}
                    variant={selectedAction === action ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedAction(action)}
                    className="h-7 text-xs capitalize"
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
            
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="border-accent/30 text-accent hover:bg-accent/10"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            )}
          </div>

          {/* Logs List */}
          <ScrollArea className="h-96 border border-cyber-glow/20 rounded-lg bg-card/20">
            <div className="p-4 space-y-2">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No audit logs found</p>
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const ActionIcon = getActionIcon(log.action)
                  const actionColor = getActionColor(log.action)
                  
                  return (
                    <Card key={log.id} className="bg-card/50 border-cyber-glow/10 hover:border-cyber-glow/20 transition-colors">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 ${actionColor}`}>
                              <ActionIcon className="h-4 w-4" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{log.userName}</span>
                                <Badge variant="outline" className="text-xs">
                                  {log.action}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {log.fileName}
                                </span>
                              </div>
                              {log.details && (
                                <p className="text-xs text-muted-foreground">
                                  {log.details}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTimestamp(log.timestamp)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {log.userId}
                                </div>
                                {log.ipAddress && (
                                  <span>IP: {log.ipAddress}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </ScrollArea>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-cyber-glow/20">
            <div className="text-center">
              <div className="text-lg font-bold text-accent">
                {logs.filter(l => l.action === 'view').length}
              </div>
              <div className="text-xs text-muted-foreground">Views</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-cyber-glow">
                {logs.filter(l => l.action === 'download').length}
              </div>
              <div className="text-xs text-muted-foreground">Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-cyber-warning">
                {logs.filter(l => l.action === 'reAnalyze').length}
              </div>
              <div className="text-xs text-muted-foreground">Re-analyses</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-cyber-danger">
                {logs.filter(l => ['quarantine', 'delete'].includes(l.action)).length}
              </div>
              <div className="text-xs text-muted-foreground">Security Actions</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook for managing audit logs
export function useAuditLogger() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([
    {
      id: '1',
      fileId: '1',
      fileName: 'email_dump_2024.zip',
      action: 'download',
      userId: 'user_001',
      userName: 'Agent Smith',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      details: 'File downloaded successfully',
      ipAddress: '192.168.1.100'
    },
    {
      id: '2',
      fileId: '2',
      fileName: 'financial_transactions.csv',
      action: 'view',
      userId: 'user_002',
      userName: 'Dr. Neo',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      details: 'Viewed file details and analysis',
      ipAddress: '192.168.1.101'
    },
    {
      id: '3',
      fileId: '6',
      fileName: 'network_logs.txt',
      action: 'quarantine',
      userId: 'user_001',
      userName: 'Agent Smith',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      details: 'File quarantined due to suspicious content',
      ipAddress: '192.168.1.100'
    },
    {
      id: '4',
      fileId: '3',
      fileName: 'voice_recording.wav',
      action: 'reAnalyze',
      userId: 'user_003',
      userName: 'Agent Trinity',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      details: 'Re-analysis requested due to updated detection rules',
      ipAddress: '192.168.1.102'
    }
  ])

  const addLog = (logEntry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newLog: AuditLogEntry = {
      ...logEntry,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    }
    setLogs(prev => [newLog, ...prev])
  }

  const exportLogs = () => {
    const csvContent = [
      'Timestamp,User,Action,File,Details,IP Address',
      ...logs.map(log => 
        `${log.timestamp},${log.userName},${log.action},${log.fileName},"${log.details || ''}",${log.ipAddress || ''}`
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return { logs, addLog, exportLogs }
}