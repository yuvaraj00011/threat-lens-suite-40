import { useState, useEffect } from "react"
import { Shield } from "lucide-react"

export function AppHeader() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="w-full bg-slate-900 border-b border-cyber-glow/20 px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and Platform Name */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img 
              src="/src/assets/uciip-professional-logo.png" 
              alt="UCIIP Logo" 
              className="h-8 w-8"
            />
            <div>
              <div className="text-cyber-glow font-cyber text-lg font-bold">
                UCIIP
              </div>
              <div className="text-xs text-muted-foreground font-mono -mt-1">
                Unified Cyber Intelligence and Investigation Platform
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Status and Time */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse-glow" />
            <span className="text-sm font-mono text-accent font-bold">
              SECURE
            </span>
          </div>
          
          <div className="text-sm font-mono text-foreground">
            {formatTime(currentTime)}
          </div>
        </div>
      </div>
    </div>
  )
}