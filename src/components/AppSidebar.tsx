import { useState } from "react"
import { useLocation, Link } from "react-router-dom"
import {
  LayoutDashboard,
  FolderOpen,
  Clock,
  FileText,
  Bot,
  Star,
  Settings,
  User,
  Palette,
  LogOut,
  ChevronRight,
  Eye
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Case History", url: "/case-history", icon: Clock },
  { title: "Report Center", url: "/report-center", icon: FileText },
  { title: "U-View", url: "/u-view", icon: Eye },
  { title: "NILA AI", url: "/nila", icon: Bot },
  { title: "Starred Cases", url: "/starred-cases", icon: Star },
  { title: "App Settings", url: "/app-settings", icon: Settings },
  { title: "My Profile", url: "/my-profile", icon: User },
]

export function AppSidebar() {
  const { open, setOpen } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path

  return (
    <Sidebar 
      className={`
        ${open ? "w-64" : "w-16"} 
        bg-gradient-to-b from-card/80 to-background/80 
        border-r border-cyber-glow/20 
        backdrop-blur-md
        transition-all duration-300
      `}
      collapsible="icon"
    >
      <SidebarContent className="relative">
        {/* Header */}
        <div className="p-4 border-b border-cyber-glow/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyber-glow/10 border border-cyber-glow/30 flex items-center justify-center">
              <div className="w-4 h-4 bg-cyber-glow rounded-sm animate-pulse-glow" />
            </div>
            {open && (
              <span className="font-cyber text-cyber-glow font-semibold">
                UCIIP
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-cyber-glow/70 font-mono text-xs uppercase tracking-wider">
            {open ? "Navigation" : "Nav"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={`
                      transition-all duration-300 rounded-lg
                      ${isActive(item.url) 
                        ? "bg-cyber-glow/20 text-cyber-glow border border-cyber-glow/30 shadow-cyber" 
                        : "hover:bg-cyber-glow/10 hover:text-cyber-glow text-foreground/80"
                      }
                    `}
                  >
                    <Link 
                      to={item.url}
                      className="flex items-center gap-3 w-full p-3"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {open && (
                        <>
                          <span className="font-medium">{item.title}</span>
                          {isActive(item.url) && (
                            <ChevronRight className="h-3 w-3 ml-auto text-cyber-glow" />
                          )}
                        </>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Login/Logout at bottom */}
        <div className="mt-auto p-4 border-t border-cyber-glow/20">
          <Link to="/login" className="block mb-2">
            <Button 
              variant="cyber" 
              className="w-full justify-start gap-3"
            >
              <LogOut className="h-4 w-4" />
              {open && <span>Login</span>}
            </Button>
          </Link>
        </div>

        {/* Cyber accent line */}
        <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-cyber-glow/50 to-transparent" />
      </SidebarContent>
    </Sidebar>
  )
}