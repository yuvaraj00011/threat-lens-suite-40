
import { useState, useEffect } from "react"
import { Menu } from "lucide-react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { FileUpload } from "@/components/FileUpload"
import { NilaChat } from "@/components/NilaChat"
import { ToolGrid } from "@/components/ToolGrid"
import uciipLogo from "@/assets/uciip-professional-logo.png"

const Index = () => {
  const [activatedTools, setActivatedTools] = useState<string[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleFileAnalyzed = (tools: string[]) => {
    setActivatedTools(tools)
  }

  return (
    <div className="min-h-screen bg-gradient-dark text-foreground font-mono">
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          
          <main className="flex-1 flex flex-col">
            {/* Header */}
            <header className="h-20 border-b border-cyber-glow/20 bg-card/30 backdrop-blur-sm">
              <div className="h-full px-6 flex items-center justify-between">
                {/* Left: Sidebar trigger + UCIIP Logo */}
                <div className="flex items-center gap-6">
                  <SidebarTrigger className="text-cyber-glow hover:bg-cyber-glow/10 border border-cyber-glow/20" />

                  {/* UCIIP Logo */}
                  <div className="flex items-center gap-3">
                    <img 
                      src={uciipLogo} 
                      alt="UCIIP Logo" 
                      className="w-12 h-12 opacity-90"
                    />
                    <div className="text-left">
                      <h1 className="text-xl font-cyber text-cyber-glow font-bold tracking-wider">
                        UCIIP
                      </h1>
                      <p className="text-xs text-muted-foreground font-mono">
                        Unified Cyber Intelligence Platform
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Status indicators */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse-glow" />
                    <span className="text-sm text-accent font-mono">SECURE</span>
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {currentTime.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 p-6 space-y-6 overflow-auto">
              {/* File Upload Section */}
              <FileUpload onFileAnalyzed={handleFileAnalyzed} />

              {/* NILA AI Section */}
              <div className="w-full">
                <NilaChat />
              </div>

              {/* Investigation Tools */}
              <ToolGrid activatedTools={activatedTools} />

              {/* Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card/30 border border-cyber-glow/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-cyber-glow font-cyber">
                    {activatedTools.length}
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    Active Tools
                  </div>
                </div>
                
                <div className="bg-card/30 border border-cyber-glow/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-accent font-cyber">
                    24/7
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    AI Monitoring
                  </div>
                </div>
                
                <div className="bg-card/30 border border-cyber-glow/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-cyber-glow-secondary font-cyber">
                    ∞
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    Data Capacity
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="h-12 border-t border-cyber-glow/20 bg-card/30 backdrop-blur-sm">
              <div className="h-full px-6 flex items-center justify-center">
                <div className="relative">
                  <span className="text-sm font-mono text-cyber-glow tracking-wider">
                    FOR OFFICIAL USE ONLY
                  </span>
                  <div className="absolute inset-0 bg-cyber-glow/20 blur-sm opacity-50 animate-pulse-glow" />
                </div>
              </div>
            </footer>
          </main>
        </div>
      </SidebarProvider>
    </div>
  )
}

export default Index
