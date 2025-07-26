import { useState, useCallback } from "react"
import { Upload, File, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface SimpleFileUploadProps {
  onFileSelect: (files: File[]) => void
  acceptedFileTypes?: string
  maxFileSize?: number
  multiple?: boolean
  disabled?: boolean
}

export function SimpleFileUpload({ 
  onFileSelect, 
  acceptedFileTypes = "*",
  maxFileSize = 50 * 1024 * 1024, // 50MB default
  multiple = false,
  disabled = false
}: SimpleFileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files)
      handleFiles(files)
    }
  }, [])

  const handleFiles = (files: File[]) => {
    if (disabled) return
    
    // Validate file sizes
    const validFiles = files.filter(file => file.size <= maxFileSize)
    
    if (validFiles.length !== files.length) {
      alert(`Some files exceed the maximum size limit of ${(maxFileSize / (1024 * 1024)).toFixed(1)}MB`)
    }
    
    if (multiple) {
      setSelectedFiles(prev => [...prev, ...validFiles])
      onFileSelect([...selectedFiles, ...validFiles])
    } else {
      setSelectedFiles([validFiles[0]])
      onFileSelect([validFiles[0]])
    }
  }

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    onFileSelect(newFiles)
  }

  const clearAll = () => {
    setSelectedFiles([])
    onFileSelect([])
  }

  return (
    <div className="space-y-4">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
          ${disabled 
            ? "border-gray-300 bg-gray-50 opacity-50 cursor-not-allowed" 
            : dragActive 
            ? "border-cyber-glow bg-cyber-glow/10 shadow-cyber" 
            : "border-cyber-glow/30 hover:border-cyber-glow/50 hover:bg-cyber-glow/5"
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
          accept={acceptedFileTypes}
          multiple={multiple}
          disabled={disabled}
        />
        
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-cyber-glow/10 rounded-full flex items-center justify-center">
            <Upload className="h-8 w-8 text-cyber-glow" />
          </div>
          <div>
            <p className="text-lg font-medium text-foreground">
              {multiple ? "Drop files here" : "Drop file here"}
            </p>
            <p className="text-muted-foreground font-mono text-sm">
              or <span className="text-cyber-glow">click to browse</span>
            </p>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            Max size: {(maxFileSize / (1024 * 1024)).toFixed(1)}MB
            {multiple && " per file"}
          </p>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <Card className="bg-card/30 border-cyber-glow/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">Selected Files ({selectedFiles.length})</h4>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            </div>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div 
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-2 bg-card/50 rounded border border-cyber-glow/10"
                >
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4 text-cyber-glow" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}