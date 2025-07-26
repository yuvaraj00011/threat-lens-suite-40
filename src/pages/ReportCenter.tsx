import { useState, useEffect, useCallback } from "react"
import { 
  FileText,
  Download,
  Eye,
  Plus,
  Filter,
  Calendar,
  User,
  Shield,
  Search,
  RefreshCw,
  Edit,
  Share,
  BarChart3,
  Clock,
  TrendingUp,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { AppSidebar } from "@/components/AppSidebar"
import { AppHeader } from "@/components/AppHeader"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

interface Report {
  id: string
  title: string
  type: 'investigation' | 'threat-analysis' | 'compliance' | 'system-status'
  caseId?: string
  generatedBy: string
  createdAt: string
  status: 'draft' | 'final' | 'reviewed'
  format: 'pdf' | 'docx' | 'excel'
  size: number
  confidentiality: 'unclassified' | 'confidential' | 'secret' | 'top-secret'
  progress?: number
  isGenerating?: boolean
  lastDownloaded?: string
  downloadCount?: number
}

const ReportCenter = () => {
  const { toast } = useToast()
  const [reports, setReports] = useState<Report[]>([
    {
      id: 'RPT-2024-001',
      title: 'Financial Fraud Investigation Summary',
      type: 'investigation',
      caseId: 'UC-2024-0891',
      generatedBy: 'Agent Sarah Chen',
      createdAt: '2024-01-15T16:30:00Z',
      status: 'final',
      format: 'pdf',
      size: 2457600,
      confidentiality: 'confidential',
      downloadCount: 12,
      lastDownloaded: '2024-01-15T10:30:00Z'
    },
    {
      id: 'RPT-2024-002',
      title: 'Phishing Campaign Technical Analysis',
      type: 'threat-analysis',
      caseId: 'UC-2024-0890',
      generatedBy: 'Agent Mike Torres',
      createdAt: '2024-01-15T14:15:00Z',
      status: 'reviewed',
      format: 'pdf',
      size: 3145728,
      confidentiality: 'secret',
      downloadCount: 8,
      lastDownloaded: '2024-01-15T09:45:00Z'
    },
    {
      id: 'RPT-2024-003',
      title: 'Monthly Compliance Report',
      type: 'compliance',
      generatedBy: 'System Auto-Generate',
      createdAt: '2024-01-15T12:00:00Z',
      status: 'final',
      format: 'excel',
      size: 1048576,
      confidentiality: 'unclassified',
      downloadCount: 23,
      lastDownloaded: '2024-01-15T08:15:00Z'
    },
    {
      id: 'RPT-2024-004',
      title: 'Voice Authentication Analysis',
      type: 'investigation',
      caseId: 'UC-2024-0889',
      generatedBy: 'Agent Lisa Wang',
      createdAt: '2024-01-14T18:45:00Z',
      status: 'draft',
      format: 'docx',
      size: 524288,
      confidentiality: 'confidential',
      progress: 65,
      isGenerating: false
    },
    {
      id: 'RPT-2024-005',
      title: 'System Security Status Report',
      type: 'system-status',
      generatedBy: 'AI Security System',
      createdAt: '2024-01-14T06:00:00Z',
      status: 'final',
      format: 'pdf',
      size: 1572864,
      confidentiality: 'unclassified',
      downloadCount: 156,
      lastDownloaded: '2024-01-14T07:00:00Z'
    }
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [isNewReportOpen, setIsNewReportOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [generatingReports, setGeneratingReports] = useState<Set<string>>(new Set())

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setReports(prevReports => 
        prevReports.map(report => {
          if (report.status === 'draft' && report.progress !== undefined && report.progress < 100) {
            const newProgress = Math.min(100, report.progress + Math.floor(Math.random() * 5))
            return {
              ...report,
              progress: newProgress,
              status: newProgress === 100 ? 'final' : 'draft'
            }
          }
          return report
        })
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const filteredAndSortedReports = useCallback(() => {
    return reports
      .filter(report => {
        const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             report.generatedBy.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = typeFilter === "all" || report.type === typeFilter
        const matchesStatus = statusFilter === "all" || report.status === statusFilter
        return matchesSearch && matchesType && matchesStatus
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'createdAt':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          case 'title':
            return a.title.localeCompare(b.title)
          case 'size':
            return b.size - a.size
          case 'downloads':
            return (b.downloadCount || 0) - (a.downloadCount || 0)
          default:
            return 0
        }
      })
  }, [reports, searchTerm, typeFilter, statusFilter, sortBy])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
    toast({
      title: "Reports refreshed",
      description: "Report center has been updated with latest data"
    })
  }

  const handleDownload = (reportId: string) => {
    setReports(prevReports =>
      prevReports.map(report =>
        report.id === reportId
          ? {
              ...report,
              downloadCount: (report.downloadCount || 0) + 1,
              lastDownloaded: new Date().toISOString()
            }
          : report
      )
    )
    toast({
      title: "Download started",
      description: "Report download has been initiated"
    })
  }

  const handleGenerateReport = (type: string, caseId?: string) => {
    const newReport: Report = {
      id: `RPT-2024-${String(reports.length + 1).padStart(3, '0')}`,
      title: `${type.replace('-', ' ')} Report`,
      type: type as Report['type'],
      caseId,
      generatedBy: 'Current User',
      createdAt: new Date().toISOString(),
      status: 'draft',
      format: 'pdf',
      size: 0,
      confidentiality: 'unclassified',
      progress: 0,
      isGenerating: true
    }

    setReports(prev => [newReport, ...prev])
    setGeneratingReports(prev => new Set([...prev, newReport.id]))

    // Simulate report generation
    const interval = setInterval(() => {
      setReports(prevReports =>
        prevReports.map(report => {
          if (report.id === newReport.id && report.progress !== undefined && report.progress < 100) {
            const newProgress = Math.min(100, report.progress + Math.floor(Math.random() * 15) + 5)
            const isComplete = newProgress >= 100
            return {
              ...report,
              progress: newProgress,
              status: isComplete ? 'final' : 'draft',
              size: isComplete ? Math.floor(Math.random() * 5000000) + 1000000 : 0,
              isGenerating: !isComplete
            }
          }
          return report
        })
      )
    }, 1000)

    setTimeout(() => {
      clearInterval(interval)
      setGeneratingReports(prev => {
        const newSet = new Set(prev)
        newSet.delete(newReport.id)
        return newSet
      })
      toast({
        title: "Report generated",
        description: `${newReport.title} has been completed`
      })
    }, 8000)
  }

  const handleViewReport = (report: Report) => {
    setSelectedReport(report)
    setIsDetailViewOpen(true)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'investigation':
        return 'text-cyber-glow border-cyber-glow/20 bg-cyber-glow/10'
      case 'threat-analysis':
        return 'text-cyber-danger border-cyber-danger/20 bg-cyber-danger/10'
      case 'compliance':
        return 'text-accent border-accent/20 bg-accent/10'
      case 'system-status':
        return 'text-cyber-glow-secondary border-cyber-glow-secondary/20 bg-cyber-glow-secondary/10'
      default:
        return 'text-muted-foreground border-muted/20 bg-muted/10'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'final':
        return 'text-accent border-accent/20 bg-accent/10'
      case 'reviewed':
        return 'text-cyber-glow border-cyber-glow/20 bg-cyber-glow/10'
      case 'draft':
        return 'text-cyber-warning border-cyber-warning/20 bg-cyber-warning/10'
      default:
        return 'text-muted-foreground border-muted/20 bg-muted/10'
    }
  }

  const getConfidentialityColor = (level: string) => {
    switch (level) {
      case 'top-secret':
        return 'text-cyber-danger border-cyber-danger/20 bg-cyber-danger/10'
      case 'secret':
        return 'text-cyber-warning border-cyber-warning/20 bg-cyber-warning/10'
      case 'confidential':
        return 'text-cyber-glow border-cyber-glow/20 bg-cyber-glow/10'
      case 'unclassified':
        return 'text-accent border-accent/20 bg-accent/10'
      default:
        return 'text-muted-foreground border-muted/20 bg-muted/10'
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
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
                <FileText className="h-6 w-6 text-cyber-glow" />
                <h1 className="text-2xl font-bold text-cyber-glow font-cyber">
                  Report Center
                </h1>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground font-mono">
                  {filteredAndSortedReports().length} of {reports.length} reports
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
                <Dialog open={isNewReportOpen} onOpenChange={setIsNewReportOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-cyber-glow/10 border border-cyber-glow/20 text-cyber-glow hover:bg-cyber-glow/20">
                      <Plus className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Generate New Report</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="reportType">Report Type</Label>
                        <Select onValueChange={(value) => handleGenerateReport(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select report type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="investigation">Investigation Report</SelectItem>
                            <SelectItem value="threat-analysis">Threat Analysis</SelectItem>
                            <SelectItem value="compliance">Compliance Report</SelectItem>
                            <SelectItem value="system-status">System Status</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={() => setIsNewReportOpen(false)} className="w-full">
                        Generate Report
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
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
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="investigation">Investigation</SelectItem>
                      <SelectItem value="threat-analysis">Threat Analysis</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="system-status">System Status</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Created Date</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="size">File Size</SelectItem>
                      <SelectItem value="downloads">Downloads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-cyber-glow font-cyber mb-1">
              {reports.length}
            </div>
            <div className="text-sm text-muted-foreground font-mono">
              Total Reports
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-accent/20 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent font-cyber mb-1">
              {reports.filter(r => r.status === 'final').length}
            </div>
            <div className="text-sm text-muted-foreground font-mono">
              Final Reports
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-cyber-warning/20 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-cyber-warning font-cyber mb-1">
              {reports.filter(r => r.status === 'draft').length}
            </div>
            <div className="text-sm text-muted-foreground font-mono">
              Draft Reports
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-cyber-danger/20 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-cyber-danger font-cyber mb-1">
              {reports.filter(r => r.confidentiality === 'secret' || r.confidentiality === 'top-secret').length}
            </div>
            <div className="text-sm text-muted-foreground font-mono">
              Classified
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredAndSortedReports().map((report) => (
          <Card key={report.id} className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm hover:border-cyber-glow/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {/* Report Info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-cyber-glow/10 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-cyber-glow" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{report.title}</h3>
                      <Badge variant="outline" className="font-mono text-xs">
                        {report.id}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="outline" className={getTypeColor(report.type)}>
                        {report.type.replace('-', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(report.status)}>
                        {report.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className={getConfidentialityColor(report.confidentiality)}>
                        <Shield className="h-3 w-3 mr-1" />
                        {report.confidentiality.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {report.format.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono flex-wrap">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{report.generatedBy}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(report.createdAt)}</span>
                      </div>
                      <span>{formatFileSize(report.size)}</span>
                      {report.downloadCount !== undefined && (
                        <div className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          <span>{report.downloadCount} downloads</span>
                        </div>
                      )}
                      {report.caseId && (
                        <span>Case: {report.caseId}</span>
                      )}
                    </div>

                    {/* Progress bar for generating reports */}
                    {report.progress !== undefined && report.progress < 100 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground font-mono">Generating...</span>
                          <span className="text-cyber-glow font-mono">{report.progress}%</span>
                        </div>
                        <Progress value={report.progress} className="w-full" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewReport(report)}
                    className="hover:text-cyber-glow hover:bg-cyber-glow/10"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(report.id)}
                    disabled={report.status === 'draft' && (report.progress || 0) < 100}
                    className="hover:text-cyber-glow hover:bg-cyber-glow/10 disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-accent hover:bg-accent/10"
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-cyber-glow hover:bg-cyber-glow/10"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

            {/* Report Detail Modal */}
            <Dialog open={isDetailViewOpen} onOpenChange={setIsDetailViewOpen}>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                {selectedReport && (
                  <>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-cyber-glow" />
                        {selectedReport.title}
                        <Badge variant="outline" className="font-mono text-xs">
                          {selectedReport.id}
                        </Badge>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-muted-foreground font-mono text-xs">Type</Label>
                          <Badge variant="outline" className={getTypeColor(selectedReport.type)}>
                            {selectedReport.type.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-muted-foreground font-mono text-xs">Status</Label>
                          <Badge variant="outline" className={getStatusColor(selectedReport.status)}>
                            {selectedReport.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-muted-foreground font-mono text-xs">Size</Label>
                          <div className="font-mono text-sm">{formatFileSize(selectedReport.size)}</div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground font-mono text-xs">Downloads</Label>
                          <div className="font-mono text-sm">{selectedReport.downloadCount || 0}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground font-mono text-xs">Generated By</Label>
                          <div className="font-mono text-sm">{selectedReport.generatedBy}</div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground font-mono text-xs">Created</Label>
                          <div className="font-mono text-sm">{formatDate(selectedReport.createdAt)}</div>
                        </div>
                      </div>

                      {selectedReport.lastDownloaded && (
                        <div>
                          <Label className="text-muted-foreground font-mono text-xs">Last Downloaded</Label>
                          <div className="font-mono text-sm">{formatDate(selectedReport.lastDownloaded)}</div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleDownload(selectedReport.id)}
                          disabled={selectedReport.status === 'draft'}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Report
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>

      {/* Empty state */}
      {filteredAndSortedReports().length === 0 && reports.length > 0 && (
        <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No reports match your filters</h3>
            <p className="text-muted-foreground font-mono text-sm mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setTypeFilter("all")
                setStatusFilter("all")
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {reports.length === 0 && (
        <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No reports generated</h3>
            <p className="text-muted-foreground font-mono text-sm mb-4">
              Generate your first investigation report to get started
            </p>
            <Button className="bg-cyber-glow/10 border border-cyber-glow/20 text-cyber-glow hover:bg-cyber-glow/20">
              <Plus className="h-4 w-4 mr-2" />
              Generate Report
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

export default ReportCenter