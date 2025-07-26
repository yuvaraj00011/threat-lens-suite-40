import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  FileArchive,
  Hash,
  Calendar,
  User,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Play,
  Pause,
  Volume2
} from "lucide-react"
import { FileRecord } from "./FileListTable"
import { FileStatusBadge } from "./FileStatusBadge"

interface FilePreviewModalProps {
  file: FileRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAction: (action: string, fileId: string) => void
  userRole?: 'admin' | 'analyst' | 'viewer'
}

export function FilePreviewModal({
  file,
  open,
  onOpenChange,
  onAction,
  userRole = 'analyst'
}: FilePreviewModalProps) {
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (file && open) {
      loadPreviewContent()
    }
  }, [file, open])

  const loadPreviewContent = async () => {
    if (!file) return
    
    setIsLoading(true)
    try {
      // Simulate loading file content based on type
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      switch (file.type.toLowerCase()) {
        case 'txt':
        case 'log':
          setPreviewContent(`Sample content for ${file.name}...
This is a demonstration of text file preview functionality.
Lines of content would appear here in a real implementation.
Network logs, system logs, or plain text would be displayed.`)
          break
        case 'pdf':
          setPreviewContent('PDF preview would be rendered here using a PDF viewer library.')
          break
        case 'json':
          setPreviewContent(JSON.stringify({
            "sample": "data",
            "file": file.name,
            "analysis": file.analysisResults,
            "metadata": {
              "size": file.size,
              "uploader": file.uploader.name
            }
          }, null, 2))
          break
        default:
          setPreviewContent('Preview not available for this file type.')
      }
    } catch (error) {
      setPreviewContent('Error loading file preview.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

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
        return ImageIcon
      case 'zip':
      case 'rar':
      case '7z':
        return FileArchive
      default:
        return FileText
    }
  }

  const renderPreview = () => {
    if (!file) return null

    const FileIcon = getFileIcon(file.type)

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-glow mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading preview...</p>
          </div>
        </div>
      )
    }

    // Image preview
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(file.type.toLowerCase())) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(25, zoom - 25))}
                className="border-cyber-glow/30"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-mono">{zoom}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                className="border-cyber-glow/30"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="border border-cyber-glow/20 rounded-lg overflow-hidden bg-card/20">
            <div 
              className="flex items-center justify-center min-h-64 p-4"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              <div className="text-center space-y-2">
                <ImageIcon className="h-16 w-16 text-cyber-glow mx-auto" />
                <p className="text-sm text-muted-foreground">Image preview would display here</p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Audio preview
    if (['mp3', 'wav', 'flac'].includes(file.type.toLowerCase())) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4 p-8 border border-cyber-glow/20 rounded-lg bg-card/20">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="border-cyber-glow/30"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>0:00</span>
                <span>3:45</span>
              </div>
              <Progress value={33} className="h-1" />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-cyber-glow/30"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )
    }

    // Text-based preview
    if (previewContent) {
      return (
        <ScrollArea className="h-64 border border-cyber-glow/20 rounded-lg bg-card/20 p-4">
          <pre className="text-sm font-mono whitespace-pre-wrap text-foreground">
            {previewContent}
          </pre>
        </ScrollArea>
      )
    }

    // Default fallback
    return (
      <div className="flex items-center justify-center h-64 border border-cyber-glow/20 rounded-lg bg-card/20">
        <div className="text-center space-y-2">
          <FileIcon className="h-16 w-16 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">Preview not available for this file type</p>
        </div>
      </div>
    )
  }

  if (!file) return null

  const canDownload = file.status === 'analyzed' && userRole !== 'viewer'
  const canQuarantine = ['analyzed', 'error'].includes(file.status) && userRole === 'admin'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-card/95 backdrop-blur border-cyber-glow/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-cyber-glow">
            {getFileIcon(file.type)({ className: "h-5 w-5" })}
            {file.name}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            File analysis and preview
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            {renderPreview()}
          </TabsContent>

          <TabsContent value="metadata" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-card/50 border-cyber-glow/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-cyber-glow">File Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Type: {file.type.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Size: {formatFileSize(file.size)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Uploaded: {formatDate(file.uploadedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">By: {file.uploader.name}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-cyber-glow/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-cyber-glow">Security Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Status:</span>
                    <FileStatusBadge status={file.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Risk Level:</span>
                    <Badge 
                      variant={file.riskLevel === 'high' ? 'destructive' : 
                              file.riskLevel === 'medium' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {file.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    SHA256: abc123def456...
                  </div>
                  <div className="text-sm text-muted-foreground">
                    MD5: 5d41402abc4b...
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Card className="bg-card/50 border-cyber-glow/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-cyber-glow">Analysis Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {file.analysisResults.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      This file has been processed by the following analysis tools:
                    </p>
                    {file.analysisResults.map((tool, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-accent" />
                        <span className="text-sm">{tool}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No analysis results available
                    </p>
                  </div>
                )}

                {file.status === 'analyzed' && (
                  <div className="mt-4 pt-4 border-t border-cyber-glow/20">
                    <p className="text-sm text-muted-foreground mb-2">Detailed Analysis Report:</p>
                    <div className="bg-muted/20 rounded-lg p-3 text-sm font-mono">
                      Analysis completed successfully.<br/>
                      No malicious content detected.<br/>
                      File is safe for download and use.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t border-cyber-glow/20">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              ID: {file.id}
            </Badge>
            {file.downloadCount && (
              <Badge variant="outline" className="text-xs">
                <Download className="h-3 w-3 mr-1" />
                {file.downloadCount} downloads
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction('download', file.id)}
                className="border-accent/30 text-accent hover:bg-accent/10"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            )}
            {canQuarantine && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction('quarantine', file.id)}
                className="border-[hsl(var(--status-quarantined))]/30 text-[hsl(var(--status-quarantined))] hover:bg-[hsl(var(--status-quarantined))]/10"
              >
                <Shield className="h-4 w-4 mr-1" />
                Quarantine
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction('reAnalyze', file.id)}
              className="border-cyber-warning/30 text-cyber-warning hover:bg-cyber-warning/10"
            >
              <RotateCw className="h-4 w-4 mr-1" />
              Re-analyze
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}