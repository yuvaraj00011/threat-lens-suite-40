import { useState, useEffect, useCallback } from "react"
import { 
  Star,
  FolderOpen,
  Clock,
  User,
  FileText,
  AlertTriangle,
  TrendingUp,
  Eye,
  Edit,
  RefreshCw,
  Filter,
  Search,
  Link,
  Download,
  Bell,
  BellOff,
  Settings
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { AppSidebar } from "@/components/AppSidebar"
import { AppHeader } from "@/components/AppHeader"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

interface StarredCase {
  id: string
  title: string
  description: string
  status: 'active' | 'completed' | 'on-hold'
  priority: 'low' | 'medium' | 'high' | 'critical'
  lastActivity: string
  assignedTo: string
  progressPercentage: number
  alertsCount: number
  evidenceCount: number
  toolsUsed: string[]
}

const StarredCases = () => {
  const { toast } = useToast()
  const [starredCases, setStarredCases] = useState<StarredCase[]>([
    {
      id: 'UC-2024-0891',
      title: 'Financial Fraud Investigation',
      description: 'Large-scale cryptocurrency laundering operation with international connections',
      status: 'active',
      priority: 'critical',
      lastActivity: '2024-01-15T14:30:00Z',
      assignedTo: 'Agent Sarah Chen',
      progressPercentage: 78,
      alertsCount: 23,
      evidenceCount: 347,
      toolsUsed: ['Money Mapper', 'AI Security System', 'Social Media Finder']
    },
    {
      id: 'UC-2024-0889',
      title: 'Voice Authentication Fraud',
      description: 'Sophisticated deepfake voice samples targeting high-value accounts',
      status: 'on-hold',
      priority: 'high',
      lastActivity: '2024-01-14T11:30:00Z',
      assignedTo: 'Agent Lisa Wang',
      progressPercentage: 45,
      alertsCount: 7,
      evidenceCount: 89,
      toolsUsed: ['Voice Identifier', 'AI Security System']
    },
    {
      id: 'UC-2024-0885',
      title: 'Corporate Espionage Network',
      description: 'Advanced persistent threat targeting intellectual property',
      status: 'active',
      priority: 'critical',
      lastActivity: '2024-01-13T16:45:00Z',
      assignedTo: 'Agent Mike Torres',
      progressPercentage: 62,
      alertsCount: 15,
      evidenceCount: 156,
      toolsUsed: ['N-Map', 'Email Checker', 'Safe Document Handler']
    },
    {
      id: 'UC-2024-0882',
      title: 'Nation-State Disinformation Campaign',
      description: 'Coordinated social media manipulation affecting public opinion',
      status: 'completed',
      priority: 'high',
      lastActivity: '2024-01-12T09:15:00Z',
      assignedTo: 'Agent Sarah Chen',
      progressPercentage: 100,
      alertsCount: 0,
      evidenceCount: 523,
      toolsUsed: ['Social Media Finder', 'Fake News Tracker', 'AI Security System']
    }
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [sortBy, setSortBy] = useState("lastActivity")
  const [selectedCase, setSelectedCase] = useState<StarredCase | null>(null)
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [notifications, setNotifications] = useState<{[key: string]: boolean}>({})

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setStarredCases(prevCases => 
        prevCases.map(case_ => {
          if (case_.status === 'active') {
            const shouldUpdate = Math.random() > 0.9
            if (shouldUpdate) {
              const progressIncrease = Math.floor(Math.random() * 5) + 1
              const newProgress = Math.min(100, case_.progressPercentage + progressIncrease)
              const newAlerts = Math.random() > 0.8 ? case_.alertsCount + 1 : case_.alertsCount
              const newEvidence = Math.random() > 0.85 ? case_.evidenceCount + Math.floor(Math.random() * 3) + 1 : case_.evidenceCount
              
              return {
                ...case_,
                progressPercentage: newProgress,
                alertsCount: newAlerts,
                evidenceCount: newEvidence,
                lastActivity: new Date().toISOString()
              }
            }
          }
          return case_
        })
      )
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  // Notification handling
  useEffect(() => {
    starredCases.forEach(case_ => {
      if (case_.alertsCount > 0 && !notifications[case_.id] && case_.status === 'active') {
        setNotifications(prev => ({ ...prev, [case_.id]: true }))
        toast({
          title: "Alert Update",
          description: `${case_.title} has ${case_.alertsCount} active alerts`,
          duration: 5000
        })
      }
    })
  }, [starredCases, notifications, toast])

  const filteredAndSortedCases = useCallback(() => {
    return starredCases
      .filter(case_ => {
        const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             case_.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             case_.id.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || case_.status === statusFilter
        const matchesPriority = priorityFilter === "all" || case_.priority === priorityFilter
        return matchesSearch && matchesStatus && matchesPriority
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'lastActivity':
            return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
          case 'priority':
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
            return priorityOrder[b.priority] - priorityOrder[a.priority]
          case 'progress':
            return b.progressPercentage - a.progressPercentage
          case 'alerts':
            return b.alertsCount - a.alertsCount
          default:
            return 0
        }
      })
  }, [starredCases, searchTerm, statusFilter, priorityFilter, sortBy])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
    toast({
      title: "Cases refreshed",
      description: "Starred cases have been updated with latest data"
    })
  }

  const handleViewCase = (case_: StarredCase) => {
    setSelectedCase(case_)
    setIsDetailViewOpen(true)
  }

  const handleToggleNotification = (caseId: string) => {
    setNotifications(prev => ({ ...prev, [caseId]: !prev[caseId] }))
    toast({
      title: "Notification settings updated",
      description: `Alerts for this case are now ${notifications[caseId] ? 'disabled' : 'enabled'}`
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-accent border-accent/20 bg-accent/10'
      case 'completed':
        return 'text-cyber-glow border-cyber-glow/20 bg-cyber-glow/10'
      case 'on-hold':
        return 'text-cyber-warning border-cyber-warning/20 bg-cyber-warning/10'
      default:
        return 'text-muted-foreground border-muted/20 bg-muted/10'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-cyber-danger border-cyber-danger/20 bg-cyber-danger/10'
      case 'high':
        return 'text-cyber-warning border-cyber-warning/20 bg-cyber-warning/10'
      case 'medium':
        return 'text-cyber-glow border-cyber-glow/20 bg-cyber-glow/10'
      case 'low':
        return 'text-accent border-accent/20 bg-accent/10'
      default:
        return 'text-muted-foreground border-muted/20 bg-muted/10'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const past = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Less than an hour ago'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    return `${Math.floor(diffInHours / 24)} days ago`
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('')
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
                <Star className="h-6 w-6 text-cyber-warning fill-cyber-warning" />
                <h1 className="text-2xl font-bold text-cyber-glow font-cyber">
                  Starred Cases
                </h1>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground font-mono">
                  {filteredAndSortedCases().length} of {starredCases.length} starred cases
                </div>
                <Button 
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="border-cyber-glow/20 hover:bg-cyber-glow/10"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Filters and Search */}
            <Card className="bg-card/30 border-cyber-glow/20">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search starred cases..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lastActivity">Last Activity</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="progress">Progress</SelectItem>
                      <SelectItem value="alerts">Alerts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-cyber-danger/20 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-cyber-danger font-cyber mb-1">
              {starredCases.filter(c => c.priority === 'critical').length}
            </div>
            <div className="text-sm text-muted-foreground font-mono">
              Critical Priority
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-accent/20 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent font-cyber mb-1">
              {starredCases.filter(c => c.status === 'active').length}
            </div>
            <div className="text-sm text-muted-foreground font-mono">
              Active Cases
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-cyber-warning/20 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-cyber-warning font-cyber mb-1">
              {starredCases.reduce((sum, c) => sum + c.alertsCount, 0)}
            </div>
            <div className="text-sm text-muted-foreground font-mono">
              Active Alerts
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-cyber-glow font-cyber mb-1">
              {Math.round(starredCases.reduce((sum, c) => sum + c.progressPercentage, 0) / starredCases.length)}%
            </div>
            <div className="text-sm text-muted-foreground font-mono">
              Avg Progress
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Starred Cases List */}
      <div className="space-y-4">
        {filteredAndSortedCases().map((caseRecord) => (
          <Card key={caseRecord.id} className="bg-card/50 border-cyber-warning/30 backdrop-blur-sm hover:border-cyber-warning/50 transition-all duration-300 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="relative">
                    <div className="w-12 h-12 bg-cyber-warning/10 rounded-lg flex items-center justify-center">
                      <FolderOpen className="h-6 w-6 text-cyber-warning" />
                    </div>
                    <Star className="absolute -top-1 -right-1 h-4 w-4 text-cyber-warning fill-cyber-warning" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg text-foreground">
                        {caseRecord.title}
                      </CardTitle>
                      {caseRecord.alertsCount > 0 && (
                        <Badge variant="outline" className="text-cyber-danger border-cyber-danger/20 bg-cyber-danger/10 animate-pulse-glow">
                          {caseRecord.alertsCount} alerts
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-xs">
                        {caseRecord.id}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(caseRecord.status)}>
                        {caseRecord.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(caseRecord.priority)}>
                        {caseRecord.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewCase(caseRecord)}
                    className="hover:text-cyber-glow hover:bg-cyber-glow/10"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleNotification(caseRecord.id)}
                    className={`hover:bg-cyber-warning/10 ${
                      notifications[caseRecord.id] 
                        ? 'text-cyber-warning' 
                        : 'text-muted-foreground hover:text-cyber-warning'
                    }`}
                  >
                    {notifications[caseRecord.id] ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-cyber-glow hover:bg-cyber-glow/10"
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-accent hover:bg-accent/10"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {caseRecord.description}
              </p>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-mono">Investigation Progress</span>
                  <span className="text-cyber-glow font-mono">{caseRecord.progressPercentage}%</span>
                </div>
                <div className="w-full bg-muted/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cyber-glow to-cyber-glow-secondary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${caseRecord.progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Assigned Agent */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground font-mono">Assigned to</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {getInitials(caseRecord.assignedTo)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground">{caseRecord.assignedTo}</span>
                  </div>
                </div>

                {/* Evidence Count */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground font-mono">Evidence</span>
                  </div>
                  <span className="text-sm text-foreground font-mono">
                    {caseRecord.evidenceCount} files
                  </span>
                </div>

                {/* Last Activity */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground font-mono">Last activity</span>
                  </div>
                  <span className="text-sm text-foreground font-mono">
                    {formatTimeAgo(caseRecord.lastActivity)}
                  </span>
                </div>
              </div>

              {/* Tools Used */}
              {caseRecord.toolsUsed.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground font-mono">Active investigation tools:</span>
                  <div className="flex flex-wrap gap-2">
                    {caseRecord.toolsUsed.map((tool) => (
                      <Badge key={tool} variant="secondary" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

            {/* Case Detail Modal */}
            <Dialog open={isDetailViewOpen} onOpenChange={setIsDetailViewOpen}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                {selectedCase && (
                  <>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-cyber-warning fill-cyber-warning" />
                        {selectedCase.title}
                        <Badge variant="outline" className="font-mono text-xs">
                          {selectedCase.id}
                        </Badge>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <span className="text-xs text-muted-foreground font-mono">Status</span>
                          <Badge variant="outline" className={getStatusColor(selectedCase.status)}>
                            {selectedCase.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground font-mono">Priority</span>
                          <Badge variant="outline" className={getPriorityColor(selectedCase.priority)}>
                            {selectedCase.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground font-mono">Progress</span>
                          <div className="font-mono text-sm">{selectedCase.progressPercentage}%</div>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground font-mono">Alerts</span>
                          <div className="font-mono text-sm">{selectedCase.alertsCount}</div>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-xs text-muted-foreground font-mono">Description</span>
                        <p className="text-sm mt-1">{selectedCase.description}</p>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs text-muted-foreground font-mono">Investigation Progress</span>
                        <Progress value={selectedCase.progressPercentage} className="w-full" />
                      </div>

                      <div>
                        <span className="text-xs text-muted-foreground font-mono">Investigation Tools</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedCase.toolsUsed.map((tool) => (
                            <Badge key={tool} variant="secondary" className="text-xs">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-muted-foreground font-mono">Evidence</span>
                          <div className="font-mono text-sm">{selectedCase.evidenceCount} files</div>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground font-mono">Last Activity</span>
                          <div className="font-mono text-sm">{formatTimeAgo(selectedCase.lastActivity)}</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">
                          <Link className="h-4 w-4 mr-2" />
                          Link to U-View
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Generate Report
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleToggleNotification(selectedCase.id)}
                          className="flex-1"
                        >
                          {notifications[selectedCase.id] ? <BellOff className="h-4 w-4 mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
                          {notifications[selectedCase.id] ? 'Disable' : 'Enable'} Alerts
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>

      {/* Empty state */}
      {filteredAndSortedCases().length === 0 && starredCases.length > 0 && (
        <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No starred cases match your filters</h3>
            <p className="text-muted-foreground font-mono text-sm mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setPriorityFilter("all")
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {starredCases.length === 0 && (
        <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No starred cases</h3>
            <p className="text-muted-foreground font-mono text-sm">
              Star important cases to keep track of high-priority investigations
            </p>
          </CardContent>
        </Card>
      )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default StarredCases