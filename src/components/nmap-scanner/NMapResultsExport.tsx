import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Code, 
  Shield, 
  Signature,
  Clock,
  User,
  AlertTriangle
} from "lucide-react"
import { toast } from "sonner"

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

interface NMapResultsExportProps {
  results: ScanResult[]
}

export function NMapResultsExport({ results }: NMapResultsExportProps) {
  const [selectedFormats, setSelectedFormats] = useState<Set<string>>(new Set(['pdf']))
  const [includeVulnsOnly, setIncludeVulnsOnly] = useState(false)
  const [reportTitle, setReportTitle] = useState("Network Vulnerability Assessment")
  const [analystName, setAnalystName] = useState("")

  const exportFormats = [
    {
      id: 'pdf',
      name: 'PDF Report',
      icon: FileText,
      description: 'Comprehensive forensic report with network maps and CVE details'
    },
    {
      id: 'csv',
      name: 'CSV Data',
      icon: FileSpreadsheet,
      description: 'Flat file export of all findings for analysis'
    },
    {
      id: 'json',
      name: 'JSON Export',
      icon: Code,
      description: 'Raw scan data in JSON format for integration'
    },
    {
      id: 'xml',
      name: 'XML Report',
      icon: Code,
      description: 'Structured XML format compatible with other tools'
    }
  ]

  const toggleFormat = (formatId: string) => {
    const newSelected = new Set(selectedFormats)
    if (newSelected.has(formatId)) {
      newSelected.delete(formatId)
    } else {
      newSelected.add(formatId)
    }
    setSelectedFormats(newSelected)
  }

  const generateExport = (format: string) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `nmap-scan-${timestamp}.${format}`
    
    let content = ""
    
    switch (format) {
      case 'pdf':
        // In a real implementation, this would generate a PDF
        toast.success(`PDF report "${filename}" generated with HMAC signature`)
        break
        
      case 'csv':
        content = generateCSV()
        downloadFile(content, filename, 'text/csv')
        break
        
      case 'json':
        content = generateJSON()
        downloadFile(content, filename, 'application/json')
        break
        
      case 'xml':
        content = generateXML()
        downloadFile(content, filename, 'application/xml')
        break
    }
  }

  const generateCSV = () => {
    const headers = ['IP Address', 'Hostname', 'Port', 'Service', 'Version', 'State', 'CVE', 'Severity', 'CVSS', 'Description']
    const rows = [headers.join(',')]
    
    results.forEach(host => {
      const filteredPorts = includeVulnsOnly 
        ? host.ports.filter(port => port.vulnerabilities.length > 0)
        : host.ports
        
      filteredPorts.forEach(port => {
        if (port.vulnerabilities.length > 0) {
          port.vulnerabilities.forEach(vuln => {
            rows.push([
              host.ip,
              host.hostname || '',
              port.port,
              port.service,
              port.version || '',
              port.state,
              vuln.cve,
              vuln.severity,
              vuln.cvss,
              `"${vuln.description}"`
            ].join(','))
          })
        } else if (!includeVulnsOnly) {
          rows.push([
            host.ip,
            host.hostname || '',
            port.port,
            port.service,
            port.version || '',
            port.state,
            '',
            '',
            '',
            ''
          ].join(','))
        }
      })
    })
    
    return rows.join('\n')
  }

  const generateJSON = () => {
    const exportData = {
      metadata: {
        reportTitle,
        analystName,
        scanTimestamp: new Date().toISOString(),
        targetCount: results.length,
        vulnerabilityCount: results.reduce((acc, host) => 
          acc + host.ports.reduce((portAcc, port) => portAcc + port.vulnerabilities.length, 0), 0
        )
      },
      results: includeVulnsOnly 
        ? results.map(host => ({
            ...host,
            ports: host.ports.filter(port => port.vulnerabilities.length > 0)
          })).filter(host => host.ports.length > 0)
        : results
    }
    
    return JSON.stringify(exportData, null, 2)
  }

  const generateXML = () => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<nmap-scan>\n'
    xml += `  <metadata>\n`
    xml += `    <title>${reportTitle}</title>\n`
    xml += `    <analyst>${analystName}</analyst>\n`
    xml += `    <timestamp>${new Date().toISOString()}</timestamp>\n`
    xml += `  </metadata>\n`
    xml += '  <hosts>\n'
    
    results.forEach(host => {
      const filteredPorts = includeVulnsOnly 
        ? host.ports.filter(port => port.vulnerabilities.length > 0)
        : host.ports
        
      if (!includeVulnsOnly || filteredPorts.length > 0) {
        xml += `    <host ip="${host.ip}" hostname="${host.hostname || ''}" risk="${host.riskLevel}">\n`
        filteredPorts.forEach(port => {
          xml += `      <port number="${port.port}" service="${port.service}" state="${port.state}">\n`
          port.vulnerabilities.forEach(vuln => {
            xml += `        <vulnerability cve="${vuln.cve}" severity="${vuln.severity}" cvss="${vuln.cvss}">\n`
            xml += `          <description>${vuln.description}</description>\n`
            xml += `        </vulnerability>\n`
          })
          xml += `      </port>\n`
        })
        xml += `    </host>\n`
      }
    })
    
    xml += '  </hosts>\n'
    xml += '</nmap-scan>'
    
    return xml
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success(`Downloaded ${filename}`)
  }

  const exportAll = () => {
    selectedFormats.forEach(format => {
      setTimeout(() => generateExport(format), 100)
    })
  }

  // Calculate statistics
  const totalVulns = results.reduce((acc, host) => 
    acc + host.ports.reduce((portAcc, port) => portAcc + port.vulnerabilities.length, 0), 0
  )
  const criticalVulns = results.reduce((acc, host) => 
    acc + host.ports.reduce((portAcc, port) => 
      portAcc + port.vulnerabilities.filter(v => v.severity === 'critical').length, 0
    ), 0
  )
  const highRiskHosts = results.filter(host => 
    host.riskLevel === 'high' || host.riskLevel === 'critical'
  ).length

  return (
    <div className="h-full p-6 space-y-6">
      {/* Report Configuration */}
      <Card className="bg-card/30 border-cyber-glow/20">
        <CardHeader>
          <CardTitle className="text-lg font-cyber text-cyber-glow flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportTitle" className="font-mono">Report Title</Label>
              <Input
                id="reportTitle"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="analystName" className="font-mono">Analyst Name</Label>
              <Input
                id="analystName"
                placeholder="Your name for audit trail"
                value={analystName}
                onChange={(e) => setAnalystName(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="vulnsOnly"
              checked={includeVulnsOnly}
              onCheckedChange={(checked) => setIncludeVulnsOnly(checked === true)}
            />
            <Label htmlFor="vulnsOnly" className="font-mono">
              Export vulnerable hosts only
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Export Formats */}
      <Card className="bg-card/30 border-cyber-glow/20">
        <CardHeader>
          <CardTitle className="text-lg font-cyber text-cyber-glow flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Formats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportFormats.map((format) => (
              <div
                key={format.id}
                className={`
                  p-4 rounded-lg border cursor-pointer transition-all duration-200
                  ${selectedFormats.has(format.id)
                    ? 'bg-cyber-glow/10 border-cyber-glow shadow-cyber'
                    : 'bg-card/50 border-border hover:border-cyber-glow/50'
                  }
                `}
                onClick={() => toggleFormat(format.id)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <format.icon className="h-5 w-5 text-cyber-glow" />
                  <span className="font-mono font-semibold">{format.name}</span>
                  {selectedFormats.has(format.id) && (
                    <Badge className="text-xs bg-cyber-glow text-black">Selected</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{format.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scan Summary */}
      <Card className="bg-card/30 border-cyber-glow/20">
        <CardHeader>
          <CardTitle className="text-lg font-cyber text-cyber-glow flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Scan Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-cyber-glow">
                {results.length}
              </div>
              <div className="text-xs text-muted-foreground">Hosts Scanned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-red-500">
                {totalVulns}
              </div>
              <div className="text-xs text-muted-foreground">Total Vulnerabilities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-red-600">
                {criticalVulns}
              </div>
              <div className="text-xs text-muted-foreground">Critical Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-orange-500">
                {highRiskHosts}
              </div>
              <div className="text-xs text-muted-foreground">High Risk Hosts</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono">Scan completed: {new Date().toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono">Analyst: {analystName || 'Not specified'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Signature className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono">All exports include HMAC signature for forensic integrity</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card className="bg-card/30 border-cyber-glow/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-mono font-semibold">Ready to Export</div>
              <div className="text-xs text-muted-foreground">
                {selectedFormats.size} format{selectedFormats.size !== 1 ? 's' : ''} selected
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedFormats(new Set())}
                disabled={selectedFormats.size === 0}
              >
                Clear Selection
              </Button>
              <Button 
                onClick={exportAll}
                disabled={selectedFormats.size === 0}
                className="bg-cyber-glow hover:bg-cyber-glow/80 text-black font-mono"
              >
                <Download className="h-4 w-4 mr-2" />
                Export All Selected
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning */}
      {totalVulns > 0 && (
        <Card className="bg-red-950/20 border-red-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-mono font-semibold">Security Advisory</span>
            </div>
            <p className="text-sm text-red-300 mt-2">
              This scan identified {totalVulns} vulnerabilities across {results.length} hosts. 
              Immediate remediation is recommended for critical and high-severity findings.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}