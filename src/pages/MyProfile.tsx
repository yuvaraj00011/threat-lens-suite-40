import { useState } from "react"
import { 
  User,
  Shield,
  Activity,
  Clock,
  FileText,
  Eye,
  Settings,
  Key,
  Save,
  Camera,
  Download,
  TrendingUp,
  Award,
  Target,
  Zap
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/AppSidebar"
import { AppHeader } from "@/components/AppHeader"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useUserProfile } from "@/hooks/useUserProfile"

const MyProfile = () => {
  const {
    profile,
    stats,
    activityLog,
    updateProfile,
    saveProfile,
    exportProfile,
    simulateNewCaseCompletion,
    simulateNewEvidence,
    simulateNewAnalysis,
    formatDate,
    formatTimeAgo,
    isLoading,
    lastUpdated
  } = useUserProfile()

  const getClearanceColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'top secret':
        return 'text-cyber-danger border-cyber-danger/20 bg-cyber-danger/10'
      case 'secret':
        return 'text-cyber-warning border-cyber-warning/20 bg-cyber-warning/10'
      case 'confidential':
        return 'text-cyber-glow border-cyber-glow/20 bg-cyber-glow/10'
      default:
        return 'text-accent border-accent/20 bg-accent/10'
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className="flex-1 min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
          <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-6 w-6 text-cyber-glow" />
                <h1 className="text-2xl font-bold text-cyber-glow font-cyber">
                  My Profile
                </h1>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  onClick={exportProfile}
                  className="border-cyber-glow/20 text-cyber-glow hover:bg-cyber-glow/10"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Profile
                </Button>
                <Button 
                  onClick={saveProfile}
                  disabled={isLoading}
                  className="bg-cyber-glow/10 border border-cyber-glow/20 text-cyber-glow hover:bg-cyber-glow/20"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyber-glow font-cyber">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture and Basic Info */}
              <div className="flex items-start gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback className="text-xl font-cyber">
                      {profile.firstName[0]}{profile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-cyber-glow/10 border border-cyber-glow/20 text-cyber-glow hover:bg-cyber-glow/20"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-foreground">
                      {profile.firstName} {profile.lastName}
                    </h2>
                    <Badge variant="outline" className={getClearanceColor(profile.clearanceLevel)}>
                      <Shield className="h-3 w-3 mr-1" />
                      {profile.clearanceLevel}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-mono">
                      {profile.role} • {profile.department}
                    </p>
                    <p className="text-sm text-muted-foreground font-mono">
                      Badge: {profile.badgeNumber}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="opacity-20" />

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => updateProfile('firstName', e.target.value)}
                    className="bg-input border-cyber-glow/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => updateProfile('lastName', e.target.value)}
                    className="bg-input border-cyber-glow/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => updateProfile('email', e.target.value)}
                    className="bg-input border-cyber-glow/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => updateProfile('phone', e.target.value)}
                    className="bg-input border-cyber-glow/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                  <Input
                    id="department"
                    value={profile.department}
                    onChange={(e) => updateProfile('department', e.target.value)}
                    className="bg-input border-cyber-glow/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact" className="text-sm font-medium">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={profile.emergencyContact}
                    onChange={(e) => updateProfile('emergencyContact', e.target.value)}
                    className="bg-input border-cyber-glow/20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyber-glow font-cyber">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={simulateNewCaseCompletion}
                    className="border-cyber-glow/20 text-cyber-glow hover:bg-cyber-glow/10"
                  >
                    <Target className="h-3 w-3 mr-1" />
                    Complete Case
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={simulateNewEvidence}
                    className="border-cyber-glow/20 text-cyber-glow hover:bg-cyber-glow/10"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Add Evidence
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={simulateNewAnalysis}
                    className="border-cyber-glow/20 text-cyber-glow hover:bg-cyber-glow/10"
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    Run Analysis
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {activityLog.length === 0 ? (
                    <p className="text-sm text-muted-foreground font-mono">No recent activity</p>
                  ) : (
                    activityLog.slice(0, 10).map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full animate-pulse-glow ${
                          activity.type === 'case' ? 'bg-cyber-glow' :
                          activity.type === 'analysis' ? 'bg-cyber-warning' :
                          activity.type === 'evidence' ? 'bg-cyber-glow-secondary' :
                          'bg-accent'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{activity.action}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {formatTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            activity.type === 'case' ? 'text-cyber-glow border-cyber-glow/20 bg-cyber-glow/10' :
                            activity.type === 'analysis' ? 'text-cyber-warning border-cyber-warning/20 bg-cyber-warning/10' :
                            activity.type === 'evidence' ? 'text-cyber-glow-secondary border-cyber-glow-secondary/20 bg-cyber-glow-secondary/10' :
                            'text-accent border-accent/20 bg-accent/10'
                          }`}
                        >
                          {activity.type}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics and Info */}
        <div className="space-y-6">
          {/* Performance Stats */}
          <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyber-glow font-cyber">
                <Activity className="h-5 w-5" />
                Performance Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="h-4 w-4 text-accent" />
                    <div className="text-2xl font-bold text-accent font-cyber">
                      {stats.casesCompleted}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    Cases Completed
                  </div>
                </div>
                
                <div className="text-center p-3 rounded-lg bg-gradient-to-br from-cyber-warning/10 to-cyber-warning/5 border border-cyber-warning/20">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Activity className="h-4 w-4 text-cyber-warning" />
                    <div className="text-2xl font-bold text-cyber-warning font-cyber">
                      {stats.activeCases}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    Active Cases
                  </div>
                </div>
                
                <div className="text-center p-3 rounded-lg bg-gradient-to-br from-cyber-glow/10 to-cyber-glow/5 border border-cyber-glow/20">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <FileText className="h-4 w-4 text-cyber-glow" />
                    <div className="text-2xl font-bold text-cyber-glow font-cyber">
                      {stats.totalEvidence}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    Evidence Files
                  </div>
                </div>
                
                <div className="text-center p-3 rounded-lg bg-gradient-to-br from-cyber-glow-secondary/10 to-cyber-glow-secondary/5 border border-cyber-glow-secondary/20">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="h-4 w-4 text-cyber-glow-secondary" />
                    <div className="text-2xl font-bold text-cyber-glow-secondary font-cyber">
                      {stats.successRate}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    Success Rate
                  </div>
                </div>
              </div>
              
              <Separator className="opacity-20" />
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm p-2 rounded-lg bg-background/50">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-cyber-glow" />
                    <span className="text-muted-foreground font-mono">Avg Response Time</span>
                  </div>
                  <Badge variant="outline" className="text-cyber-glow border-cyber-glow/20 bg-cyber-glow/10">
                    {stats.avgResponseTime}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm p-2 rounded-lg bg-background/50">
                  <div className="flex items-center gap-2">
                    <Award className="h-3 w-3 text-cyber-warning" />
                    <span className="text-muted-foreground font-mono">Commendations</span>
                  </div>
                  <Badge variant="outline" className="text-cyber-warning border-cyber-warning/20 bg-cyber-warning/10">
                    {stats.commendations}
                  </Badge>
                </div>
                {lastUpdated && (
                  <div className="flex justify-between items-center text-sm p-2 rounded-lg bg-background/50">
                    <div className="flex items-center gap-2">
                      <Activity className="h-3 w-3 text-accent animate-pulse" />
                      <span className="text-muted-foreground font-mono">Last Updated</span>
                    </div>
                    <span className="text-xs text-accent font-mono">
                      {lastUpdated.toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyber-glow font-cyber">
                <Shield className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-mono">Join Date</span>
                  <span className="text-foreground font-mono">{formatDate(profile.joinDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-mono">Last Login</span>
                  <span className="text-foreground font-mono">{formatTimeAgo(profile.lastLogin)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-mono">Clearance Level</span>
                  <Badge variant="outline" className={getClearanceColor(profile.clearanceLevel)}>
                    {profile.clearanceLevel}
                  </Badge>
                </div>
              </div>
              
              <Separator className="opacity-20" />
              
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full border-cyber-glow/20 text-cyber-glow hover:bg-cyber-glow/10"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-cyber-glow/20 text-cyber-glow hover:bg-cyber-glow/10"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default MyProfile