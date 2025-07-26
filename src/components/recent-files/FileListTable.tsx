import { useState, useEffect } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  File,
  FileText,
  Image,
  Archive,
  Video,
  Music,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react"
import { FileStatusBadge, FileStatus } from "./FileStatusBadge"
import { FileActions } from "./FileActions"
import { Button } from "@/components/ui/button"

export interface FileRecord {
  id: string
  name: string
  type: string
  size: number
  uploader: {
    name: string
    avatar?: string
  }
  uploadedAt: string
  status: FileStatus
  analysisResults: string[]
  riskLevel: 'low' | 'medium' | 'high'
  lastModified?: string
  downloadCount?: number
}

interface FileListTableProps {
  files: FileRecord[]
  selectedFiles: string[]
  onFileSelect: (fileId: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  onSort: (column: string, direction: 'asc' | 'desc') => void
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  onFileAction: {
    reAnalyze: (fileId: string) => void
    viewDetails: (fileId: string) => void
    preview: (fileId: string) => void
    download: (fileId: string) => void
    quarantine: (fileId: string) => void
    delete: (fileId: string) => void
    archive: (fileId: string) => void
  }
  userRole?: 'admin' | 'analyst' | 'viewer'
}

export function FileListTable({
  files,
  selectedFiles,
  onFileSelect,
  onSelectAll,
  onSort,
  sortColumn,
  sortDirection,
  onFileAction,
  userRole = 'analyst'
}: FileListTableProps) {
  const [realTimeUpdates, setRealTimeUpdates] = useState<Record<string, FileStatus>>({})

  // Real-time status updates with enhanced logic
  useEffect(() => {
    const interval = setInterval(() => {
      files.forEach(file => {
        if (file.status === 'analyzing') {
          // Enhanced completion logic with progress simulation
          if (Math.random() > 0.92) {
            const completedStatus = Math.random() > 0.1 ? 'analyzed' : 'error'
            setRealTimeUpdates(prev => ({
              ...prev,
              [file.id]: completedStatus
            }))
          }
        } else if (file.status === 'queued') {
          // Transition from queued to analyzing
          if (Math.random() > 0.95) {
            setRealTimeUpdates(prev => ({
              ...prev,
              [file.id]: 'analyzing'
            }))
          }
        }
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [files])

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'txt':
        return FileText
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return Image
      case 'zip':
      case 'rar':
      case '7z':
        return Archive
      case 'mp4':
      case 'avi':
      case 'mov':
        return Video
      case 'mp3':
      case 'wav':
      case 'flac':
        return Music
      default:
        return File
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return `${days} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return ArrowUpDown
    return sortDirection === 'asc' ? ArrowUp : ArrowDown
  }

  const handleSort = (column: string) => {
    const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc'
    onSort(column, direction)
  }

  const allSelected = files.length > 0 && selectedFiles.length === files.length
  const someSelected = selectedFiles.length > 0 && selectedFiles.length < files.length

  return (
    <div className="border border-cyber-glow/20 rounded-lg bg-card/30 backdrop-blur overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-cyber-glow/20 hover:bg-transparent">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onSelectAll}
                className="border-cyber-glow/30 data-[state=checked]:bg-cyber-glow data-[state=checked]:border-cyber-glow"
                aria-label={someSelected ? "Some files selected" : allSelected ? "All files selected" : "No files selected"}
              />
            </TableHead>
            <TableHead className="w-12"></TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('name')}
                className="h-auto p-0 font-medium text-cyber-glow hover:text-cyber-glow"
              >
                File Name
                {getSortIcon('name')({ className: "ml-2 h-4 w-4" })}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('size')}
                className="h-auto p-0 font-medium text-cyber-glow hover:text-cyber-glow"
              >
                Size
                {getSortIcon('size')({ className: "ml-2 h-4 w-4" })}
              </Button>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Uploader</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('uploadedAt')}
                className="h-auto p-0 font-medium text-cyber-glow hover:text-cyber-glow"
              >
                Uploaded
                {getSortIcon('uploadedAt')({ className: "ml-2 h-4 w-4" })}
              </Button>
            </TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => {
            const FileIcon = getFileIcon(file.type)
            const currentStatus = realTimeUpdates[file.id] || file.status
            const isSelected = selectedFiles.includes(file.id)

            return (
              <TableRow 
                key={file.id}
                className={`
                  border-b border-cyber-glow/10 hover:bg-cyber-glow/5 transition-colors
                  ${isSelected ? 'bg-cyber-glow/10' : ''}
                `}
              >
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onFileSelect(file.id, !!checked)}
                    className="border-cyber-glow/30 data-[state=checked]:bg-cyber-glow data-[state=checked]:border-cyber-glow"
                  />
                </TableCell>
                
                <TableCell>
                  <div className="w-8 h-8 bg-cyber-glow/10 rounded-lg flex items-center justify-center">
                    <FileIcon className="h-4 w-4 text-cyber-glow" />
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="font-medium text-foreground cursor-pointer hover:text-cyber-glow transition-colors">
                            {file.name.length > 40 ? `${file.name.substring(0, 40)}...` : file.name}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>{file.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="text-xs text-muted-foreground font-mono">
                      {file.type.toUpperCase()}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="text-sm font-mono text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                </TableCell>

                <TableCell>
                  <FileStatusBadge status={currentStatus} />
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={file.uploader.avatar} />
                      <AvatarFallback className="text-xs bg-cyber-glow/10 text-cyber-glow">
                        {file.uploader.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground">{file.uploader.name}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-sm text-muted-foreground font-mono">
                    {formatDate(file.uploadedAt)}
                  </div>
                </TableCell>

                <TableCell>
                  <FileActions
                    fileId={file.id}
                    status={currentStatus}
                    fileName={file.name}
                    onReAnalyze={onFileAction.reAnalyze}
                    onViewDetails={onFileAction.viewDetails}
                    onPreview={onFileAction.preview}
                    onDownload={onFileAction.download}
                    onQuarantine={onFileAction.quarantine}
                    onDelete={onFileAction.delete}
                    onArchive={onFileAction.archive}
                    userRole={userRole}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {files.length === 0 && (
        <div className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No files found</h3>
          <p className="text-muted-foreground font-mono text-sm">
            No files match your current filters. Try adjusting your search criteria.
          </p>
        </div>
      )}
    </div>
  )
}