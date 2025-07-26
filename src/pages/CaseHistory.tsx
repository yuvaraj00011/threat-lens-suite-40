import { useState, useEffect, useCallback } from "react"
import { 
  FolderOpen,
  Star,
  Clock,
  User,
  FileText,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Archive,
  Plus,
  Filter,
  Search,
  RefreshCw,
  Activity,
  Link,
  Download
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { AppSidebar } from "@/components/AppSidebar"
import { AppHeader } from "@/components/AppHeader"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

interface CaseRecord {
  id: string
  title: string
  description: string
  status: 'active' | 'completed' | 'archived' | 'on-hold'
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdAt: string
  updatedAt: string
  assignedTo: string
  evidenceCount: number
  toolsUsed: string[]
  starred: boolean
}

const CaseHistory = () => {
  const { toast } = useToast()
  const [cases, setCases] = useState<CaseRecord[]>([
    {
      id: 'UC-2024-0891',
      title: 'Financial Fraud Investigation',
      description: 'Large-scale cryptocurrency laundering operation detected through suspicious transaction patterns',
      status: 'active',
      priority: 'critical',
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-01-15T14:30:00Z',
      assignedTo: 'Agent Sarah Chen',
      evidenceCount: 347,
      toolsUsed: ['Money Mapper', 'AI Security System', 'Social Media Finder'],
      starred: true
    },
    {
      id: 'UC-2024-0890',
      title: 'Phishing Campaign Analysis',
      description: 'Coordinated email phishing attack targeting financial institutions',
      status: 'completed',
      priority: 'high',
      createdAt: '2024-01-14T10:15:00Z',
      updatedAt: '2024-01-15T09:45:00Z',
      assignedTo: 'Agent Mike Torres',
      evidenceCount: 156,
      toolsUsed: ['Email Checker', 'Phishing Detector', 'Fake News Tracker'],
      starred: false
    },
    {
      id: 'UC-2024-0889',
      title: 'Voice Authentication Fraud',
      description: 'Deepfake voice samples used in social engineering attacks',
      status: 'on-hold',
      priority: 'medium',
      createdAt: '2024-01-13T16:20:00Z',
      updatedAt: '2024-01-14T11:30:00Z',
      assignedTo: 'Agent Lisa Wang',
      evidenceCount: 89,
      toolsUsed: ['Voice Identifier', 'AI Security System'],
      starred: true
    },
    {
      id: 'UC-2024-0888',
      title: 'Network Vulnerability Assessment',
      description: 'Comprehensive security audit of corporate infrastructure',
      status: 'archived',
      priority: 'low',
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-12T17:00:00Z',
      assignedTo: 'Agent John Smith',
      evidenceCount: 234,
      toolsUsed: ['N-Map', 'AI Security System', 'Safe Document Handler'],
      starred: false
    },
    {
      id: 'UC-2024-0887',
      title: 'Social Media Misinformation',
      description: 'Bot network spreading false information across multiple platforms',
      status: 'completed',
      priority: 'medium',
      createdAt: '2024-01-08T14:30:00Z',
      updatedAt: '2024-01-11T16:45:00Z',
      assignedTo: 'Agent Sarah Chen',
      evidenceCount: 412,
      toolsUsed: ['Social Media Finder', 'Fake News Tracker', 'AI Security System'],
      starred: false
    }
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [sortBy, setSortBy] = useState("updatedAt")
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null)
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCases(prevCases => 
        prevCases.map(case_ => ({
          ...case_,
          updatedAt: case_.status === 'active' && Math.random() > 0.95 
            ? new Date().toISOString() 
            : case_.updatedAt,
          evidenceCount: case_.status === 'active' && Math.random() > 0.98
            ? case_.evidenceCount + Math.floor(Math.random() * 3)
            : case_.evidenceCount
        }))
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const filteredAndSortedCases = useCallback(() => {
    return cases
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
          case 'updatedAt':
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          case 'createdAt':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          case 'priority':
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
            return priorityOrder[b.priority] - priorityOrder[a.priority]
          case 'title':
            return a.title.localeCompare(b.title)
          default:
            return 0
        }
      })
  }, [cases, searchTerm, statusFilter, priorityFilter, sortBy])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
    toast({
      title: "Cases refreshed",
      description: "Case history has been updated with latest data"
    })
  }

  const handleStarToggle = (caseId: string) => {
    setCases(prevCases =>
      prevCases.map(case_ =>
        case_.id === caseId ? { ...case_, starred: !case_.starred } : case_
      )
    )
    toast({
      title: "Case updated",
      description: "Case has been starred/unstarred"
    })
  }

  const handleStatusChange = (caseId: string, newStatus: CaseRecord['status']) => {
    setCases(prevCases =>
      prevCases.map(case_ =>
        case_.id === caseId 
          ? { ...case_, status: newStatus, updatedAt: new Date().toISOString() }
          : case_
      )
    )
    toast({
      title: "Status updated",
      description: `Case status changed to ${newStatus}`
    })
  }

  const handleViewCase = (case_: CaseRecord) => {
    setSelectedCase(case_)
    setIsDetailViewOpen(true)
  }

  const handleCreateCase = () => {
    // Implementation for creating new case
    toast({
      title: "Feature Coming Soon",
      description: "Case creation will be available in the next update"
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
      case 'archived':
        return 'text-muted-foreground border-muted/20 bg-muted/10'
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
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
                <FolderOpen className="h-6 w-6 text-cyber-glow" />
                <h1 className="text-2xl font-bold text-cyber-glow font-cyber">
                  Case History
                </h1>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground font-mono">
                  {filteredAndSortedCases().length} of {cases.length} cases
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
                <Dialog open={isNewCaseOpen} onOpenChange={setIsNewCaseOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-cyber-glow/10 border border-cyber-glow/20 text-cyber-glow hover:bg-cyber-glow/20">
                      <Plus className="h-4 w-4 mr-2" />
                      New Case
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Case</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Case Title</Label>
                        <Input id="title" placeholder="Enter case title" />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Enter case description" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="priority">Priority</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="assignee">Assign to</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select agent" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sarah">Agent Sarah Chen</SelectItem>
                              <SelectItem value="mike">Agent Mike Torres</SelectItem>
                              <SelectItem value="lisa">Agent Lisa Wang</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button onClick={handleCreateCase} className="w-full">
                        Create Case
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Filters and Search */}
            <Card className="bg-card/30 border-cyber-glow/20">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search cases..."
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
                      <SelectItem value="archived">Archived</SelectItem>
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
                      <SelectItem value="updatedAt">Last Updated</SelectItem>
                      <SelectItem value="createdAt">Created Date</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Cases List */}
            <div className="space-y-4">
              {filteredAndSortedCases().map((caseRecord) => (
                <Card key={caseRecord.id} className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm hover:border-cyber-glow/40 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-cyber-glow/10 rounded-lg flex items-center justify-center">
                          <FolderOpen className="h-6 w-6 text-cyber-glow" />
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-lg text-foreground">
                              {caseRecord.title}
                            </CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStarToggle(caseRecord.id)}
                              className="p-0 h-auto hover:bg-transparent"
                            >
                              <Star className={`h-4 w-4 ${caseRecord.starred 
                                ? 'text-cyber-warning fill-cyber-warning' 
                                : 'text-muted-foreground hover:text-cyber-warning'
                              }`} />
                            </Button>
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
                        <Select onValueChange={(value) => handleStatusChange(caseRecord.id, value as CaseRecord['status'])}>
                          <SelectTrigger className="w-auto h-8 border-0 bg-transparent hover:bg-muted/10">
                            <Edit className="h-4 w-4" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Set Active</SelectItem>
                            <SelectItem value="on-hold">Put On Hold</SelectItem>
                            <SelectItem value="completed">Mark Completed</SelectItem>
                            <SelectItem value="archived">Archive</SelectItem>
                          </SelectContent>
                        </Select>
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Case Details */}
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

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground font-mono">Evidence</span>
                        </div>
                        <span className="text-sm text-foreground font-mono">
                          {caseRecord.evidenceCount} files
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground font-mono">Last updated</span>
                        </div>
                        <span className="text-sm text-foreground font-mono">
                          {formatDate(caseRecord.updatedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Tools Used */}
                    {caseRecord.toolsUsed.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-sm text-muted-foreground font-mono">Investigation tools:</span>
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
                          <FolderOpen className="h-5 w-5 text-cyber-glow" />
                          {selectedCase.title}
                          <Badge variant="outline" className="font-mono text-xs">
                            {selectedCase.id}
                          </Badge>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-muted-foreground font-mono text-xs">Status</Label>
                            <Badge variant="outline" className={getStatusColor(selectedCase.status)}>
                              {selectedCase.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div>
                            <Label className="text-muted-foreground font-mono text-xs">Priority</Label>
                            <Badge variant="outline" className={getPriorityColor(selectedCase.priority)}>
                              {selectedCase.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <div>
                            <Label className="text-muted-foreground font-mono text-xs">Evidence</Label>
                            <div className="font-mono text-sm">{selectedCase.evidenceCount} files</div>
                          </div>
                          <div>
                            <Label className="text-muted-foreground font-mono text-xs">Tools</Label>
                            <div className="font-mono text-sm">{selectedCase.toolsUsed.length} active</div>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-muted-foreground font-mono text-xs">Description</Label>
                          <p className="text-sm mt-1">{selectedCase.description}</p>
                        </div>

                        <div>
                          <Label className="text-muted-foreground font-mono text-xs">Investigation Tools</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedCase.toolsUsed.map((tool) => (
                              <Badge key={tool} variant="secondary" className="text-xs">
                                <Activity className="h-3 w-3 mr-1" />
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground font-mono text-xs">Created</Label>
                            <div className="font-mono text-sm">{formatDate(selectedCase.createdAt)}</div>
                          </div>
                          <div>
                            <Label className="text-muted-foreground font-mono text-xs">Last Updated</Label>
                            <div className="font-mono text-sm">{formatDate(selectedCase.updatedAt)}</div>
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
                        </div>
                      </div>
                    </>
                  )}
                </DialogContent>
              </Dialog>

              {/* Empty state */}
            {filteredAndSortedCases().length === 0 && cases.length > 0 && (
              <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No cases match your filters</h3>
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

            {cases.length === 0 && (
              <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No cases found</h3>
                  <p className="text-muted-foreground font-mono text-sm mb-4">
                    Create your first investigation case to get started
                  </p>
                  <Button className="bg-cyber-glow/10 border border-cyber-glow/20 text-cyber-glow hover:bg-cyber-glow/20">
                    Create New Case
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default CaseHistory