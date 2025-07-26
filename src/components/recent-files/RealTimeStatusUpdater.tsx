import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { FileStatus } from "./FileStatusBadge"

export interface FileStatusUpdate {
  fileId: string
  status: FileStatus
  progress?: number
  analysisResults?: string[]
  error?: string
}

interface RealTimeStatusUpdaterProps {
  onStatusUpdate: (update: FileStatusUpdate) => void
  onNewFileUploaded?: (fileData: any) => void
}

export function RealTimeStatusUpdater({ 
  onStatusUpdate, 
  onNewFileUploaded 
}: RealTimeStatusUpdaterProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)

  // Simulate WebSocket connection for real-time updates
  useEffect(() => {
    let eventSource: EventSource | null = null
    let reconnectTimer: NodeJS.Timeout | null = null

    const connect = () => {
      try {
        // In a real implementation, this would be a WebSocket or Server-Sent Events connection
        // For demo purposes, we'll simulate with periodic updates
        setIsConnected(true)
        setReconnectAttempts(0)
        
        // Simulate real-time status updates
        const updateInterval = setInterval(() => {
          // Randomly trigger status updates for demo
          if (Math.random() > 0.95) {
            const mockUpdate: FileStatusUpdate = {
              fileId: Math.random().toString(),
              status: 'analyzed' as FileStatus,
              progress: 100,
              analysisResults: ['Email Checker', 'Phishing Detector']
            }
            onStatusUpdate(mockUpdate)
          }
        }, 2000)

        return () => {
          clearInterval(updateInterval)
        }
      } catch (error) {
        console.error('Failed to connect to real-time updates:', error)
        setIsConnected(false)
        
        // Exponential backoff for reconnection
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)
        reconnectTimer = setTimeout(() => {
          setReconnectAttempts(prev => prev + 1)
          connect()
        }, delay)
      }
    }

    const cleanup = connect()

    return () => {
      if (cleanup) cleanup()
      if (reconnectTimer) clearTimeout(reconnectTimer)
      if (eventSource) eventSource.close()
    }
  }, [onStatusUpdate, reconnectAttempts])

  // Simulate file processing updates
  const simulateFileProcessing = useCallback((fileId: string) => {
    let progress = 0
    const progressInterval = setInterval(() => {
      progress += Math.random() * 20
      
      if (progress >= 100) {
        clearInterval(progressInterval)
        onStatusUpdate({
          fileId,
          status: 'analyzed',
          progress: 100,
          analysisResults: ['Security Scan', 'Malware Detection', 'Content Analysis']
        })
        toast.success('File analysis completed', {
          description: `File ${fileId} has been successfully analyzed.`
        })
      } else {
        onStatusUpdate({
          fileId,
          status: 'analyzing',
          progress: Math.min(progress, 99)
        })
      }
    }, 1000)

    return () => clearInterval(progressInterval)
  }, [onStatusUpdate])

  // Connection status indicator (optional UI component)
  const ConnectionStatus = () => (
    <div className="flex items-center gap-2 text-xs">
      <div 
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-accent animate-pulse' : 'bg-cyber-danger'
        }`} 
      />
      <span className="text-muted-foreground">
        {isConnected ? 'Live updates active' : 'Reconnecting...'}
      </span>
    </div>
  )

  return { 
    isConnected, 
    simulateFileProcessing, 
    ConnectionStatus,
    reconnectAttempts 
  }
}

// Custom hook for managing real-time file updates
export function useRealTimeFileUpdates() {
  const [statusUpdates, setStatusUpdates] = useState<Record<string, FileStatusUpdate>>({})
  const [isConnected, setIsConnected] = useState(false)

  const handleStatusUpdate = useCallback((update: FileStatusUpdate) => {
    setStatusUpdates(prev => ({
      ...prev,
      [update.fileId]: update
    }))

    // Show toast notifications for important status changes
    switch (update.status) {
      case 'analyzed':
        toast.success('Analysis Complete', {
          description: `File analysis finished successfully.`
        })
        break
      case 'error':
        toast.error('Analysis Failed', {
          description: `File analysis encountered an error: ${update.error || 'Unknown error'}`
        })
        break
      case 'quarantined':
        toast.warning('File Quarantined', {
          description: 'File has been quarantined due to security concerns.'
        })
        break
    }
  }, [])

  const getFileStatus = useCallback((fileId: string, defaultStatus: FileStatus) => {
    return statusUpdates[fileId]?.status || defaultStatus
  }, [statusUpdates])

  const getFileProgress = useCallback((fileId: string) => {
    return statusUpdates[fileId]?.progress
  }, [statusUpdates])

  const clearStatusUpdate = useCallback((fileId: string) => {
    setStatusUpdates(prev => {
      const { [fileId]: removed, ...rest } = prev
      return rest
    })
  }, [])

  return {
    handleStatusUpdate,
    getFileStatus,
    getFileProgress,
    clearStatusUpdate,
    isConnected,
    setIsConnected,
    statusUpdates
  }
}