import { useState, useEffect, useMemo } from "react"
import { 
  Clock,
  RefreshCw,
  Filter,
  Settings,
  Shield,
  AlertTriangle,
  TrendingUp,
  Database,
  CheckCircle2,
  AlertCircle,
  Users,
  Wifi,
  WifiOff,
  Activity
} from "lucide-react"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { FileListTable, FileRecord } from "@/components/recent-files/FileListTable"
import { FileFilters, FileFilters as FileFiltersType } from "@/components/recent-files/FileFilters"
import { BulkActions } from "@/components/recent-files/BulkActions"
import { FileStatus } from "@/components/recent-files/FileStatusBadge"
import { FilePreviewModal } from "@/components/recent-files/FilePreviewModal"
import { AuditLogger, useAuditLogger } from "@/components/recent-files/AuditLogger"
import { useRealTimeFileUpdates } from "@/components/recent-files/RealTimeStatusUpdater"

const RecentFiles = () => {
  // Real-time updates and audit logging
  const { handleStatusUpdate, getFileStatus, getFileProgress, isConnected, setIsConnected } = useRealTimeFileUpdates()
  const { logs, addLog, exportLogs } = useAuditLogger()
  
  // State for files data
  const [files, setFiles] = useState<FileRecord[]>([
    {
      id: '1',
      name: 'email_dump_2024.zip',
      type: 'zip',
      size: 45678901,
      uploader: { name: 'Agent Smith', avatar: '/avatars/smith.jpg' },
      uploadedAt: '2024-01-15T10:30:00Z',
      status: 'analyzed' as FileStatus,
      analysisResults: ['Email Checker', 'Phishing Detector', 'Safe Document Handler'],
      riskLevel: 'high'
    },
    {
      id: '2',
      name: 'financial_transactions.csv',
      type: 'csv',
      size: 2345678,
      uploader: { name: 'Dr. Neo', avatar: '/avatars/neo.jpg' },
      uploadedAt: '2024-01-15T09:15:00Z',
      status: 'analyzed' as FileStatus,
      analysisResults: ['Money Mapper', 'AI Security System'],
      riskLevel: 'medium'
    },
    {
      id: '3',
      name: 'voice_recording.wav',
      type: 'wav',
      size: 12345678,
      uploader: { name: 'Agent Trinity', avatar: '/avatars/trinity.jpg' },
      uploadedAt: '2024-01-15T08:45:00Z',
      status: 'analyzing' as FileStatus,
      analysisResults: ['Voice Identifier'],
      riskLevel: 'low'
    },
    {
      id: '4',
      name: 'social_media_data.json',
      type: 'json',
      size: 8765432,
      uploader: { name: 'Morpheus', avatar: '/avatars/morpheus.jpg' },
      uploadedAt: '2024-01-14T16:20:00Z',
      status: 'analyzed' as FileStatus,
      analysisResults: ['Social Media Finder', 'Fake News Tracker'],
      riskLevel: 'medium'
    },
    {
      id: '5',
      name: 'suspicious_document.pdf',
      type: 'pdf',
      size: 1234567,
      uploader: { name: 'Agent Smith', avatar: '/avatars/smith.jpg' },
      uploadedAt: '2024-01-14T14:10:00Z',
      status: 'error' as FileStatus,
      analysisResults: [],
      riskLevel: 'high'
    },
    {
      id: '6',
      name: 'network_logs.txt',
      type: 'txt',
      size: 987654,
      uploader: { name: 'Cipher', avatar: '/avatars/cipher.jpg' },
      uploadedAt: '2024-01-14T12:00:00Z',
      status: 'quarantined' as FileStatus,
      analysisResults: ['Network Scanner', 'Threat Detection'],
      riskLevel: 'high'
    }
  ])

  // State for UI controls
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [filters, setFilters] = useState<FileFiltersType>({
    search: '',
    fileType: 'all',
    status: 'all',
    uploader: 'all',
    dateRange: { from: undefined, to: undefined }
  })
  const [sortColumn, setSortColumn] = useState<string>('uploadedAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // User role (would come from auth context in real app)
  const userRole = 'admin' as 'admin' | 'analyst' | 'viewer'

  // Simulate connection status
  useEffect(() => {
    const timer = setTimeout(() => setIsConnected(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Get unique uploaders and file types for filters
  const uploaders = useMemo(() => 
    Array.from(new Set(files.map(f => f.uploader.name))), [files]
  )
  const fileTypes = useMemo(() => 
    Array.from(new Set(files.map(f => f.type))), [files]
  )

  // Filter and sort files
  const filteredFiles = useMemo(() => {
    let result = files.filter(file => {
      // Search filter
      if (filters.search && !file.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }
      
      // File type filter
      if (filters.fileType !== 'all' && file.type !== filters.fileType) {
        return false
      }
      
      // Status filter
      if (filters.status !== 'all' && file.status !== filters.status) {
        return false
      }
      
      // Uploader filter
      if (filters.uploader !== 'all' && file.uploader.name !== filters.uploader) {
        return false
      }
      
      // Date range filter
      if (filters.dateRange.from || filters.dateRange.to) {
        const fileDate = new Date(file.uploadedAt)
        if (filters.dateRange.from && fileDate < filters.dateRange.from) return false
        if (filters.dateRange.to && fileDate > filters.dateRange.to) return false
      }
      
      return true
    })

    // Sort files
    result.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortColumn) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'size':
          aValue = a.size
          bValue = b.size
          break
        case 'uploadedAt':
          aValue = new Date(a.uploadedAt).getTime()
          bValue = new Date(b.uploadedAt).getTime()
          break
        default:
          return 0
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return result
  }, [files, filters, sortColumn, sortDirection])

  // Statistics
  const stats = useMemo(() => {
    const total = files.length
    const analyzed = files.filter(f => f.status === 'analyzed').length
    const analyzing = files.filter(f => f.status === 'analyzing').length
    const errors = files.filter(f => f.status === 'error').length
    const quarantined = files.filter(f => f.status === 'quarantined').length
    const totalSize = files.reduce((sum, f) => sum + f.size, 0)
    
    return { total, analyzed, analyzing, errors, quarantined, totalSize }
  }, [files])

  // File selection handlers
  const handleFileSelect = (fileId: string, selected: boolean) => {
    setSelectedFiles(prev => 
      selected 
        ? [...prev, fileId]
        : prev.filter(id => id !== fileId)
    )
  }

  const handleSelectAll = (selected: boolean) => {
    setSelectedFiles(selected ? filteredFiles.map(f => f.id) : [])
  }

  // File action handlers with audit logging
  const fileActions = {
    reAnalyze: async (fileId: string) => {
      const file = files.find(f => f.id === fileId)
      if (!file) return
      
      toast.success(`Re-analyzing ${file.name}`)
      
      // Update file status to analyzing
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'analyzing' as FileStatus } : f
      ))
      
      // Log the action
      addLog({
        fileId,
        fileName: file.name,
        action: 'reAnalyze',
        userId: 'current_user',
        userName: 'Current User',
        details: 'File re-analysis initiated',
        ipAddress: '192.168.1.100'
      })
      
      // Simulate real-time status update
      setTimeout(() => {
        handleStatusUpdate({
          fileId,
          status: 'analyzed',
          progress: 100,
          analysisResults: [...file.analysisResults, 'Updated Analysis']
        })
      }, 3000)
    },
    
    viewDetails: (fileId: string) => {
      const file = files.find(f => f.id === fileId)
      if (!file) return
      
      setPreviewFile(file)
      setShowPreview(true)
      
      // Log the action
      addLog({
        fileId,
        fileName: file.name,
        action: 'view',
        userId: 'current_user',
        userName: 'Current User',
        details: 'File details viewed',
        ipAddress: '192.168.1.100'
      })
    },
    
    preview: (fileId: string) => {
      const file = files.find(f => f.id === fileId)
      if (!file) return
      
      setPreviewFile(file)
      setShowPreview(true)
      
      // Log the action
      addLog({
        fileId,
        fileName: file.name,
        action: 'view',
        userId: 'current_user',
        userName: 'Current User',
        details: 'File preview opened',
        ipAddress: '192.168.1.100'
      })
    },
    
    download: async (fileId: string) => {
      const file = files.find(f => f.id === fileId)
      if (!file) return
      
      toast.success(`Downloading ${file.name}`)
      
      // Update download count
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, downloadCount: (f.downloadCount || 0) + 1 } : f
      ))
      
      // Log the action
      addLog({
        fileId,
        fileName: file.name,
        action: 'download',
        userId: 'current_user',
        userName: 'Current User',
        details: 'File downloaded successfully',
        ipAddress: '192.168.1.100'
      })
    },
    
    quarantine: async (fileId: string) => {
      const file = files.find(f => f.id === fileId)
      if (!file) return
      
      toast.warning(`Quarantined ${file.name}`)
      
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'quarantined' as FileStatus } : f
      ))
      
      // Log the action
      addLog({
        fileId,
        fileName: file.name,
        action: 'quarantine',
        userId: 'current_user',
        userName: 'Current User',
        details: 'File quarantined due to security concerns',
        ipAddress: '192.168.1.100'
      })
    },
    
    delete: async (fileId: string) => {
      const file = files.find(f => f.id === fileId)
      if (!file) return
      
      toast.error(`Deleted ${file.name}`)
      
      setFiles(prev => prev.filter(f => f.id !== fileId))
      setSelectedFiles(prev => prev.filter(id => id !== fileId))
      
      // Log the action
      addLog({
        fileId,
        fileName: file.name,
        action: 'delete',
        userId: 'current_user',
        userName: 'Current User',
        details: 'File permanently deleted',
        ipAddress: '192.168.1.100'
      })
    },
    
    archive: async (fileId: string) => {
      const file = files.find(f => f.id === fileId)
      if (!file) return
      
      toast.success(`Archived ${file.name}`)
      
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'archived' as FileStatus } : f
      ))
      
      // Log the action
      addLog({
        fileId,
        fileName: file.name,
        action: 'archive',
        userId: 'current_user',
        userName: 'Current User',
        details: 'File archived for long-term storage',
        ipAddress: '192.168.1.100'
      })
    }
  }

  // Bulk action handlers
  const bulkActions = {
    reAnalyze: async (fileIds: string[]) => {
      toast.success(`Re-analyzing ${fileIds.length} files`)
    },
    download: async (fileIds: string[]) => {
      toast.success(`Downloading ${fileIds.length} files`)
    },
    delete: async (fileIds: string[]) => {
      toast.error(`Deleted ${fileIds.length} files`)
      setFiles(prev => prev.filter(f => !fileIds.includes(f.id)))
      setSelectedFiles([])
    },
    archive: async (fileIds: string[]) => {
      toast.success(`Archived ${fileIds.length} files`)
    },
    export: async (fileIds: string[], format: 'csv' | 'pdf') => {
      toast.success(`Exported ${fileIds.length} files as ${format.toUpperCase()}`)
    }
  }

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
    toast.success('Files refreshed')
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex-1 min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
          <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyber-glow/20 rounded-lg flex items-center justify-center">
            <Database className="h-5 w-5 text-cyber-glow" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-cyber-glow font-cyber">
              Recent Files
            </h1>
            <p className="text-muted-foreground font-mono text-sm">
              Comprehensive file analysis and investigation platform
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Connection Status */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3 text-accent" />
                <span>Live</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-cyber-danger" />
                <span>Offline</span>
              </>
            )}
          </div>
          
          <AuditLogger logs={logs} onExport={exportLogs} />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-cyber-glow/30 text-cyber-glow hover:bg-cyber-glow/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-cyber-glow" />
              <div>
                <p className="text-sm text-muted-foreground">Total Files</p>
                <p className="text-xl font-bold text-cyber-glow">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-accent/20 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Analyzed</p>
                <p className="text-xl font-bold text-accent">{stats.analyzed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-cyber-warning/20 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyber-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-xl font-bold text-cyber-warning">{stats.analyzing}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-cyber-danger/20 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-cyber-danger" />
              <div>
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-xl font-bold text-cyber-danger">{stats.errors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-[hsl(var(--status-quarantined))]/20 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[hsl(var(--status-quarantined))]" />
              <div>
                <p className="text-sm text-muted-foreground">Quarantined</p>
                <p className="text-xl font-bold text-[hsl(var(--status-quarantined))]">{stats.quarantined}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <FileFilters
        filters={filters}
        onFiltersChange={setFilters}
        uploaders={uploaders}
        fileTypes={fileTypes}
      />

      {/* Bulk Actions */}
      <BulkActions
        selectedFiles={selectedFiles}
        onBulkReAnalyze={bulkActions.reAnalyze}
        onBulkDownload={bulkActions.download}
        onBulkDelete={bulkActions.delete}
        onBulkArchive={bulkActions.archive}
        onBulkExport={bulkActions.export}
        onClearSelection={() => setSelectedFiles([])}
        userRole={userRole}
      />

      {/* Files Table */}
      <FileListTable
        files={filteredFiles.map(file => ({
          ...file,
          status: getFileStatus(file.id, file.status)
        }))}
        selectedFiles={selectedFiles}
        onFileSelect={handleFileSelect}
        onSelectAll={handleSelectAll}
        onSort={(column, direction) => {
          setSortColumn(column)
          setSortDirection(direction)
        }}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onFileAction={fileActions}
        userRole={userRole}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        open={showPreview}
        onOpenChange={setShowPreview}
        onAction={(action, fileId) => {
          if (action in fileActions) {
            (fileActions as any)[action](fileId)
          }
        }}
        userRole={userRole}
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground font-mono">
        <span>
          Showing {filteredFiles.length} of {files.length} files
          {filters.search && ` matching "${filters.search}"`}
        </span>
        <span>
          Total size: {formatBytes(stats.totalSize)}
        </span>
      </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default RecentFiles