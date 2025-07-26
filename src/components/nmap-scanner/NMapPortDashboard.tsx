import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Server, 
  Search, 
  Filter, 
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface ScanResult {
  id: string
  ip: string
  hostname?: string
  ports: Array<{
    port: number
    service: string
    version?: string
    state: 'open' | 'closed' | 'filtered'
    vulnerabilities: Array<{
      cve: string
      severity: 'low' | 'medium' | 'high' | 'critical'
      description: string
      cvss: number
    }>
  }>
  os?: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  lastScanned: Date
}

interface NMapPortDashboardProps {
  results: ScanResult[]
  selectedHost: ScanResult | null
  onHostSelect: (host: ScanResult) => void
}

export function NMapPortDashboard({ results, selectedHost, onHostSelect }: NMapPortDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterByVuln, setFilterByVuln] = useState(false)
  const [expandedHosts, setExpandedHosts] = useState<Set<string>>(new Set())

  const filteredResults = results.filter(host => {
    const matchesSearch = !searchTerm || 
      host.ip.includes(searchTerm) || 
      host.hostname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      host.ports.some(port => 
        port.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        port.version?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    
    const matchesFilter = !filterByVuln || 
      host.ports.some(port => port.vulnerabilities.length > 0)
    
    return matchesSearch && matchesFilter
  })

  const toggleHostExpansion = (hostId: string) => {
    const newExpanded = new Set(expandedHosts)
    if (newExpanded.has(hostId)) {
      newExpanded.delete(hostId)
    } else {
      newExpanded.add(hostId)
    }
    setExpandedHosts(newExpanded)
  }

  const getPortStateIcon = (state: string) => {
    switch (state) {
      case 'open': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'closed': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Shield className="h-4 w-4 text-yellow-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-black'
      default: return 'bg-blue-500 text-white'
    }
  }

  return (
    <Card className="h-full bg-card/30 border-cyber-glow/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-cyber text-cyber-glow flex items-center gap-2">
          <Server className="h-5 w-5" />
          Port & Service Inventory
        </CardTitle>
        
        {/* Search and Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search hosts, services, versions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 font-mono"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={filterByVuln ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterByVuln(!filterByVuln)}
              className="text-xs"
            >
              <Filter className="h-3 w-3 mr-1" />
              Vulnerable Only
            </Button>
            <Badge variant="outline" className="text-xs font-mono">
              {filteredResults.length} hosts
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2 max-h-96 overflow-y-auto">
        {filteredResults.map((host) => (
          <Collapsible
            key={host.id}
            open={expandedHosts.has(host.id)}
            onOpenChange={() => toggleHostExpansion(host.id)}
          >
            <CollapsibleTrigger asChild>
              <div 
                className={`
                  p-3 rounded-lg border cursor-pointer transition-all duration-200
                  ${selectedHost?.id === host.id 
                    ? 'bg-cyber-glow/10 border-cyber-glow' 
                    : 'bg-card/50 border-border hover:border-cyber-glow/50'
                  }
                `}
                onClick={() => onHostSelect(host)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getRiskColor(host.riskLevel)}`} />
                    <div>
                      <div className="font-mono font-semibold text-sm">{host.ip}</div>
                      {host.hostname && (
                        <div className="text-xs text-muted-foreground">{host.hostname}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {host.ports.filter(p => p.state === 'open').length} ports
                    </Badge>
                    {host.ports.some(p => p.vulnerabilities.length > 0) && (
                      <Badge className="text-xs bg-red-500 text-white">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {host.ports.reduce((acc, port) => acc + port.vulnerabilities.length, 0)} vulns
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-2 ml-4 space-y-2">
              {host.ports.filter(port => port.state === 'open').map((port) => (
                <div key={port.port} className="p-2 bg-card/30 rounded border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getPortStateIcon(port.state)}
                      <span className="font-mono font-semibold">{port.port}</span>
                      <span className="text-sm text-muted-foreground">{port.service}</span>
                      {port.version && (
                        <Badge variant="outline" className="text-xs font-mono">
                          {port.version}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {port.vulnerabilities.length > 0 && (
                    <div className="space-y-1">
                      {port.vulnerabilities.map((vuln, index) => (
                        <div key={index} className="p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                              <span className="font-mono text-sm font-semibold">{vuln.cve}</span>
                              <Badge className={`text-xs ${getSeverityColor(vuln.severity)}`}>
                                {vuln.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <span className="text-xs font-mono text-muted-foreground">
                              CVSS: {vuln.cvss}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{vuln.description}</p>
                          <Button variant="ghost" size="sm" className="h-6 px-2 mt-1">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
        
        {filteredResults.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground font-mono text-sm">
              No hosts match the current filter criteria
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  function getRiskColor(level: string) {
    switch (level) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      default: return 'bg-green-500'
    }
  }
}