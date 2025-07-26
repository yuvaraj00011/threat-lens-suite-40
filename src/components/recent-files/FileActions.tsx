import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  MoreHorizontal, 
  Play, 
  Eye, 
  Download, 
  Shield, 
  Trash2, 
  Archive,
  FileText,
  AlertTriangle
} from "lucide-react"
import { FileStatus } from "./FileStatusBadge"

interface FileActionsProps {
  fileId: string
  status: FileStatus
  fileName: string
  onReAnalyze: (fileId: string) => void
  onViewDetails: (fileId: string) => void
  onPreview: (fileId: string) => void
  onDownload: (fileId: string) => void
  onQuarantine: (fileId: string) => void
  onDelete: (fileId: string) => void
  onArchive: (fileId: string) => void
  userRole?: 'admin' | 'analyst' | 'viewer'
}

export function FileActions({
  fileId,
  status,
  fileName,
  onReAnalyze,
  onViewDetails,
  onPreview,
  onDownload,
  onQuarantine,
  onDelete,
  onArchive,
  userRole = 'analyst'
}: FileActionsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const canDownload = status === 'analyzed' && userRole !== 'viewer'
  const canQuarantine = ['analyzed', 'error'].includes(status) && userRole === 'admin'
  const canDelete = userRole === 'admin'
  const canReAnalyze = ['error', 'analyzed'].includes(status)
  const canArchive = status === 'analyzed' && userRole !== 'viewer'

  const handleAction = async (action: () => void) => {
    setIsLoading(true)
    try {
      await action()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {/* Quick Actions */}
      {status === 'analyzed' && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-cyber-glow hover:bg-cyber-glow/10"
                onClick={() => handleAction(() => onPreview(fileId))}
                disabled={isLoading}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Preview file content</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {canDownload && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-accent hover:bg-accent/10"
                onClick={() => handleAction(() => onDownload(fileId))}
                disabled={isLoading}
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Download file</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* More Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-cyber-glow hover:bg-cyber-glow/10"
            disabled={isLoading}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-56 bg-card/95 backdrop-blur border-cyber-glow/20"
        >
          <DropdownMenuItem 
            onClick={() => handleAction(() => onViewDetails(fileId))}
            className="hover:bg-cyber-glow/10 focus:bg-cyber-glow/10"
          >
            <FileText className="mr-2 h-4 w-4" />
            View Analysis Details
          </DropdownMenuItem>

          {canReAnalyze && (
            <>
              <DropdownMenuSeparator className="bg-cyber-glow/20" />
              <DropdownMenuItem 
                onClick={() => handleAction(() => onReAnalyze(fileId))}
                className="hover:bg-cyber-warning/10 focus:bg-cyber-warning/10"
              >
                <Play className="mr-2 h-4 w-4" />
                Re-analyze File
              </DropdownMenuItem>
            </>
          )}

          {canArchive && (
            <>
              <DropdownMenuSeparator className="bg-cyber-glow/20" />
              <DropdownMenuItem 
                onClick={() => handleAction(() => onArchive(fileId))}
                className="hover:bg-muted/50 focus:bg-muted/50"
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive File
              </DropdownMenuItem>
            </>
          )}

          {canQuarantine && (
            <>
              <DropdownMenuSeparator className="bg-cyber-glow/20" />
              <DropdownMenuItem 
                onClick={() => handleAction(() => onQuarantine(fileId))}
                className="hover:bg-[hsl(var(--status-quarantined)/0.1)] focus:bg-[hsl(var(--status-quarantined)/0.1)] text-[hsl(var(--status-quarantined))]"
              >
                <Shield className="mr-2 h-4 w-4" />
                Quarantine File
              </DropdownMenuItem>
            </>
          )}

          {canDelete && (
            <>
              <DropdownMenuSeparator className="bg-cyber-glow/20" />
              <DropdownMenuItem 
                onClick={() => handleAction(() => onDelete(fileId))}
                className="hover:bg-cyber-danger/10 focus:bg-cyber-danger/10 text-cyber-danger"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete File
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}