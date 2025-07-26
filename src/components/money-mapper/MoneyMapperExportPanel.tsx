import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Download, 
  FileText, 
  Image, 
  Database,
  Shield,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import { toast } from "sonner"

interface ExportPanelProps {
  session: any
  data: any
}

export function MoneyMapperExportPanel({ session, data }: ExportPanelProps) {
  const [selectedExports, setSelectedExports] = useState<string[]>([])
  const [sarReportType, setSarReportType] = useState("suspicious-activity")
  const [reportNotes, setReportNotes] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  const exportOptions = [
    {
      id: "network-graph",
      name: "Network Graph",
      description: "Interactive network visualization (PNG/SVG)",
      icon: Image,
      size: "2.5 MB"
    },
    {
      id: "transaction-data",
      name: "Transaction Data",
      description: "Complete transaction dataset (CSV/JSON)",
      icon: Database,
      size: "850 KB"
    },
    {
      id: "risk-summary",
      name: "Risk Analysis Summary",
      description: "Detailed risk assessment report (PDF)",
      icon: FileText,
      size: "425 KB"
    },
    {
      id: "compliance-alerts",
      name: "Compliance Alerts",
      description: "AML flags and sanctions hits (PDF)",
      icon: Shield,
      size: "180 KB"
    },
    {
      id: "sar-report",
      name: "SAR Report",
      description: "Suspicious Activity Report (PDF)",
      icon: AlertTriangle,
      size: "320 KB"
    }
  ]

  const handleExportToggle = (exportId: string) => {
    setSelectedExports(prev => 
      prev.includes(exportId) 
        ? prev.filter(id => id !== exportId)
        : [...prev, exportId]
    )
  }

  const handleExport = async () => {
    if (selectedExports.length === 0) {
      toast.error("Please select at least one export option")
      return
    }

    setIsExporting(true)
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(`Successfully exported ${selectedExports.length} files`)
      
      // Reset selection
      setSelectedExports([])
    } catch (error) {
      toast.error("Export failed")
    } finally {
      setIsExporting(false)
    }
  }

  const generateSARReport = async () => {
    setIsExporting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success("SAR report generated and ready for review")
    } catch (error) {
      toast.error("Failed to generate SAR report")
    } finally {
      setIsExporting(false)
    }
  }

  const getTotalSize = () => {
    const sizes = selectedExports.map(id => {
      const option = exportOptions.find(opt => opt.id === id)
      return parseFloat(option?.size.split(' ')[0] || '0')
    })
    return sizes.reduce((sum, size) => sum + size, 0).toFixed(1)
  }

  return (
    <div className="h-full space-y-6 overflow-auto">
      {/* Export Selection */}
      <Card className="bg-card/30 border-cyber-glow/20">
        <CardHeader>
          <CardTitle className="text-lg font-cyber text-cyber-glow flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {exportOptions.map((option) => (
            <div
              key={option.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                selectedExports.includes(option.id)
                  ? 'border-cyber-glow bg-cyber-glow/10'
                  : 'border-cyber-glow/20 hover:border-cyber-glow/40'
              }`}
              onClick={() => handleExportToggle(option.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedExports.includes(option.id)}
                    onChange={() => handleExportToggle(option.id)}
                  />
                  <div className="w-8 h-8 rounded-lg bg-cyber-glow/20 flex items-center justify-center">
                    <option.icon className="h-4 w-4 text-cyber-glow" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-mono font-semibold text-sm mb-1">
                      {option.name}
                    </h4>
                    <p className="text-xs text-muted-foreground font-mono">
                      {option.description}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {option.size}
                </Badge>
              </div>
            </div>
          ))}

          {selectedExports.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-cyber-glow/5 border border-cyber-glow/20 rounded-lg">
              <span className="text-sm font-mono">
                {selectedExports.length} files selected • {getTotalSize()} MB total
              </span>
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="bg-cyber-glow hover:bg-cyber-glow/80"
              >
                {isExporting ? "Exporting..." : "Export Selected"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SAR Report Generator */}
      <Card className="bg-card/30 border-cyber-glow/20">
        <CardHeader>
          <CardTitle className="text-lg font-cyber text-cyber-glow flex items-center gap-2">
            <FileText className="h-5 w-5" />
            SAR Report Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-mono text-muted-foreground">Report Type</label>
            <Select value={sarReportType} onValueChange={setSarReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="suspicious-activity">Suspicious Activity Report</SelectItem>
                <SelectItem value="threshold-breach">Threshold Breach Report</SelectItem>
                <SelectItem value="sanctions-hit">Sanctions Screening Hit</SelectItem>
                <SelectItem value="pattern-analysis">Pattern Analysis Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-mono text-muted-foreground">Investigator Notes</label>
            <Textarea
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
              placeholder="Add any additional context or findings..."
              className="min-h-20 font-mono text-sm"
            />
          </div>

          <Alert className="border-cyber-warning/20">
            <AlertTriangle className="h-4 w-4 text-cyber-warning" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-mono text-sm">SAR Report will include:</p>
                <ul className="text-xs font-mono text-muted-foreground space-y-1 ml-4">
                  <li>• Transaction network analysis</li>
                  <li>• Risk assessment summary</li>
                  <li>• AML compliance findings</li>
                  <li>• Suspicious pattern details</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          <Button
            onClick={generateSARReport}
            disabled={isExporting}
            className="w-full bg-cyber-warning hover:bg-cyber-warning/80 text-black"
          >
            {isExporting ? "Generating..." : "Generate SAR Report"}
          </Button>
        </CardContent>
      </Card>

      {/* Session Summary */}
      <Card className="bg-card/30 border-cyber-glow/20">
        <CardHeader>
          <CardTitle className="text-lg font-cyber text-cyber-glow">
            Session Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs font-mono text-muted-foreground">Session Name</div>
              <div className="text-sm font-mono">{session.name}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-mono text-muted-foreground">Analysis Date</div>
              <div className="text-sm font-mono">
                {new Date(session.timestamp).toLocaleDateString()}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-mono text-muted-foreground">Transaction Count</div>
              <div className="text-sm font-mono">{session.transactionCount.toLocaleString()}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-mono text-muted-foreground">Risk Score</div>
              <div className="text-sm font-mono text-cyber-warning">{session.riskScore}%</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-mono text-muted-foreground">Key Findings</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono">
                <CheckCircle className="h-3 w-3 text-cyber-glow" />
                {data.riskIndicators.length} risk indicators identified
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <CheckCircle className="h-3 w-3 text-cyber-glow" />
                {data.complianceAlerts.length} compliance alerts generated
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <CheckCircle className="h-3 w-3 text-cyber-glow" />
                {data.edges.filter((e: any) => e.suspicious).length} suspicious transactions flagged
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}