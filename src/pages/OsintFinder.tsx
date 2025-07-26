import { AppSidebar } from "@/components/AppSidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SocialMediaFinder } from "@/components/SocialMediaFinder"
import { useState, useEffect } from "react"

export default function OsintFinder() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Auto-open the social media finder when the page loads
    setIsOpen(true)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    // Navigate back to dashboard when closed
    window.history.back()
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex-1 min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
          <div className="container mx-auto p-6">
            <div className="text-center py-12">
              <h1 className="text-4xl font-bold font-cyber text-cyber-glow mb-4">
                OSINT Social Media Finder
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Advanced social media intelligence gathering and analysis
              </p>
              <div className="text-sm text-muted-foreground">
                Loading investigation interface...
              </div>
            </div>
          </div>
        </div>
        
        <SocialMediaFinder 
          isOpen={isOpen} 
          onClose={handleClose} 
        />
      </SidebarInset>
    </SidebarProvider>
  )
}