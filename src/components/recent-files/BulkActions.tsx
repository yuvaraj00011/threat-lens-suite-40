import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ChevronDown, 
  Play, 
  Download, 
  Trash2, 
  Archive,
  FileText,
  Shield,
  Loader2,
  CheckCircle,
  X
} from "lucide-react"

interface BulkActionsProps {
  selectedFiles: string[]
  onBulkReAnalyze: (fileIds: string[]) => Promise<void>
  onBulkDownload: (fileIds: string[]) => Promise<void>
  onBulkDelete: (fileIds: string[]) => Promise<void>
  onBulkArchive: (fileIds: string[]) => Promise<void>
  onBulkExport: (fileIds: string[], format: 'csv' | 'pdf') => Promise<void>
  onClearSelection: () => void
  userRole?: 'admin' | 'analyst' | 'viewer'
}

export function BulkActions({
  selectedFiles,
  onBulkReAnalyze,
  onBulkDownload,
  onBulkDelete,
  onBulkArchive,
  onBulkExport,
  onClearSelection,
  userRole = 'analyst'
}: BulkActionsProps) {
  const [operation, setOperation] = useState<{
    type: string
    progress: number
    total: number
    isRunning: boolean
    error?: string
  } | null>(null)

  const selectedCount = selectedFiles.length

  if (selectedCount === 0) return null

  const canDownload = userRole !== 'viewer'
  const canDelete = userRole === 'admin'
  const canArchive = userRole !== 'viewer'

  const executeWithProgress = async (
    actionName: string,
    action: () => Promise<void>
  ) => {
    setOperation({
      type: actionName,
      progress: 0,
      total: selectedCount,
      isRunning: true
    })

    try {
      // Simulate progress for demo (in real app, this would be actual progress)
      const progressInterval = setInterval(() => {
        setOperation(prev => prev ? {
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        } : null)
      }, 100)

      await action()

      clearInterval(progressInterval)
      setOperation(prev => prev ? {
        ...prev,
        progress: 100,
        isRunning: false
      } : null)

      // Auto-clear after success
      setTimeout(() => {
        setOperation(null)
        onClearSelection()
      }, 2000)

    } catch (error) {
      setOperation(prev => prev ? {
        ...prev,
        isRunning: false,
        error: error instanceof Error ? error.message : 'Operation failed'
      } : null)
    }
  }

  const handleBulkReAnalyze = () => {
    executeWithProgress('Re-analyzing files', () => onBulkReAnalyze(selectedFiles))
  }

  const handleBulkDownload = () => {
    executeWithProgress('Downloading files', () => onBulkDownload(selectedFiles))
  }

  const handleBulkDelete = () => {
    executeWithProgress('Deleting files', () => onBulkDelete(selectedFiles))
  }

  const handleBulkArchive = () => {
    executeWithProgress('Archiving files', () => onBulkArchive(selectedFiles))
  }

  const handleExportCSV = () => {
    executeWithProgress('Exporting to CSV', () => onBulkExport(selectedFiles, 'csv'))
  }

  const handleExportPDF = () => {
    executeWithProgress('Exporting to PDF', () => onBulkExport(selectedFiles, 'pdf'))
  }

  const cancelOperation = () => {
    setOperation(null)
  }

  return (
    <div className="space-y-4">
      {/* Selection Info and Actions */}
      <div className="flex items-center justify-between p-4 bg-cyber-glow/10 border border-cyber-glow/30 rounded-lg backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="text-cyber-glow font-medium">
            {selectedCount} file{selectedCount !== 1 ? 's' : ''} selected
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkReAnalyze}
            disabled={operation?.isRunning}
            className="border-cyber-warning/30 text-cyber-warning hover:bg-cyber-warning/10"
          >
            <Play className="h-4 w-4 mr-1" />
            Re-analyze
          </Button>

          {canDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDownload}
              disabled={operation?.isRunning}
              className="border-accent/30 text-accent hover:bg-accent/10"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          )}

          {/* More Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={operation?.isRunning}
                className="border-cyber-glow/30 hover:border-cyber-glow/50"
              >
                More
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 bg-card/95 backdrop-blur border-cyber-glow/20"
            >
              <DropdownMenuItem 
                onClick={handleExportCSV}
                className="hover:bg-cyber-glow/10 focus:bg-cyber-glow/10"
              >
                <FileText className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={handleExportPDF}
                className="hover:bg-cyber-glow/10 focus:bg-cyber-glow/10"
              >
                <FileText className="mr-2 h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>

              {canArchive && (
                <>
                  <DropdownMenuSeparator className="bg-cyber-glow/20" />
                  <DropdownMenuItem 
                    onClick={handleBulkArchive}
                    className="hover:bg-muted/50 focus:bg-muted/50"
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Archive Files
                  </DropdownMenuItem>
                </>
              )}

              {canDelete && (
                <>
                  <DropdownMenuSeparator className="bg-cyber-glow/20" />
                  <DropdownMenuItem 
                    onClick={handleBulkDelete}
                    className="hover:bg-cyber-danger/10 focus:bg-cyber-danger/10 text-cyber-danger"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Files
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Operation Progress */}
      {operation && (
        <Alert className={`border-cyber-glow/30 ${
          operation.error ? 'border-cyber-danger/30 bg-cyber-danger/5' :
          operation.progress === 100 ? 'border-accent/30 bg-accent/5' :
          'bg-cyber-glow/5'
        }`}>
          <div className="flex items-center gap-3">
            {operation.isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin text-cyber-glow" />
            ) : operation.error ? (
              <X className="h-4 w-4 text-cyber-danger" />
            ) : (
              <CheckCircle className="h-4 w-4 text-accent" />
            )}
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <AlertDescription className="mb-0">
                  {operation.error ? (
                    <span className="text-cyber-danger">{operation.error}</span>
                  ) : operation.progress === 100 ? (
                    <span className="text-accent">{operation.type} completed successfully!</span>
                  ) : (
                    <span>{operation.type}... {operation.progress}%</span>
                  )}
                </AlertDescription>
                
                {operation.isRunning && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelOperation}
                    className="h-6 px-2 text-xs"
                  >
                    Cancel
                  </Button>
                )}
              </div>
              
              {operation.isRunning && (
                <Progress 
                  value={operation.progress} 
                  className="h-1.5"
                />
              )}
            </div>
          </div>
        </Alert>
      )}
    </div>
  )
}