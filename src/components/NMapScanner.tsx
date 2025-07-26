import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Activity, 
  Play, 
  Pause, 
  Download, 
  AlertTriangle, 
  Shield, 
  Network, 
  FileText,
  Target,
  Zap,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react"
import { toast } from "sonner"
import { NMapNetworkMap } from "./nmap-scanner/NMapNetworkMap"
import { NMapPortDashboard } from "./nmap-scanner/NMapPortDashboard"
import { NMapVulnerabilityHeatmap } from "./nmap-scanner/NMapVulnerabilityHeatmap"
import { NMapScanProgress } from "./nmap-scanner/NMapScanProgress"
import { NMapResultsExport } from "./nmap-scanner/NMapResultsExport"

interface NMapScannerProps {
  isOpen: boolean
  onClose: () => void
  autoDetectedIPs?: string[]
}

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

export function NMapScanner({ isOpen, onClose, autoDetectedIPs = [] }: NMapScannerProps) {
  const [targetIPs, setTargetIPs] = useState("")
  const [scanType, setScanType] = useState<'quick' | 'full' | 'custom'>('quick')
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanStage, setScanStage] = useState("")
  const [scanResults, setScanResults] = useState<ScanResult[]>([])
  const [selectedHost, setSelectedHost] = useState<ScanResult | null>(null)
  const [activeTab, setActiveTab] = useState("input")

  useEffect(() => {
    if (autoDetectedIPs.length > 0) {
      setTargetIPs(autoDetectedIPs.join(", "))
      toast.success(`Auto-detected ${autoDetectedIPs.length} IP addresses`)
    }
  }, [autoDetectedIPs])

  const validateIPs = (input: string): boolean => {
    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:[0-9]|[1-2][0-9]|3[0-2]))?$/
    const ips = input.split(/[,\s]+/).filter(ip => ip.trim())
    return ips.every(ip => ipPattern.test(ip.trim()))
  }

  const startScan = async () => {
    if (!targetIPs.trim()) {
      toast.error("Please enter IP addresses to scan")
      return
    }

    if (!validateIPs(targetIPs)) {
      toast.error("Invalid IP address format")
      return
    }

    setIsScanning(true)
    setScanProgress(0)
    setActiveTab("scanning")
    
    // Simulate scanning process
    const stages = [
      "Initializing scan engine...",
      "Host discovery (ping/ARP)",
      "Port scanning",
      "Service fingerprinting", 
      "OS detection",
      "Vulnerability analysis",
      "CVE database lookup",
      "Generating report"
    ]

    for (let i = 0; i < stages.length; i++) {
      setScanStage(stages[i])
      setScanProgress((i + 1) / stages.length * 100)
      await new Promise(resolve => setTimeout(resolve, 1500))
    }

    // Generate mock results
    const mockResults = generateMockResults(targetIPs)
    setScanResults(mockResults)
    setIsScanning(false)
    setActiveTab("results")
    
    toast.success(`Scan completed! Found ${mockResults.length} hosts with ${mockResults.reduce((acc, host) => acc + host.ports.filter(p => p.vulnerabilities.length > 0).length, 0)} vulnerabilities`)
  }

  const generateMockResults = (ips: string): ScanResult[] => {
    const ipList = ips.split(/[,\s]+/).filter(ip => ip.trim())
    return ipList.map((ip, index) => ({
      id: `host-${index}`,
      ip: ip.trim(),
      hostname: `host-${index}.local`,
      ports: [
        {
          port: 22,
          service: "SSH",
          version: "OpenSSH 7.4",
          state: "open" as const,
          vulnerabilities: Math.random() > 0.7 ? [{
            cve: "CVE-2023-1234",
            severity: "medium" as const,
            description: "SSH version enumeration vulnerability",
            cvss: 5.3
          }] : []
        },
        {
          port: 80,
          service: "HTTP",
          version: "Apache 2.4.6",
          state: "open" as const,
          vulnerabilities: Math.random() > 0.5 ? [{
            cve: "CVE-2023-5678",
            severity: "high" as const,
            description: "Apache HTTP Server vulnerability",
            cvss: 7.5
          }] : []
        },
        {
          port: 443,
          service: "HTTPS",
          version: "Apache 2.4.6",
          state: "open" as const,
          vulnerabilities: []
        }
      ],
      os: Math.random() > 0.5 ? "Linux 3.x" : "Windows Server 2019",
      riskLevel: Math.random() > 0.7 ? "high" : Math.random() > 0.4 ? "medium" : "low",
      lastScanned: new Date()
    }))
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-500'
      case 'high': return 'text-red-400' 
      case 'medium': return 'text-yellow-500'
      default: return 'text-green-500'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] bg-card/95 backdrop-blur-sm border-cyber-glow/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-cyber text-cyber-glow flex items-center gap-3">
            <div className="relative">
              <Activity className="h-8 w-8" />
              {isScanning && (
                <div className="absolute inset-0 animate-pulse-glow">
                  <Activity className="h-8 w-8 text-cyber-glow" />
                </div>
              )}
            </div>
            N-Map – Network Vulnerability Scanner
            {isScanning && (
              <Badge variant="outline" className="animate-pulse-glow border-cyber-glow text-cyber-glow">
                SCANNING
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 bg-card/50">
            <TabsTrigger value="input" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Target Input
            </TabsTrigger>
            <TabsTrigger value="scanning" className="flex items-center gap-2" disabled={!isScanning && scanResults.length === 0}>
              <Zap className="h-4 w-4" />
              Scanning
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2" disabled={scanResults.length === 0}>
              <Shield className="h-4 w-4" />
              Results
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2" disabled={scanResults.length === 0}>
              <Download className="h-4 w-4" />
              Export
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="input" className="h-full space-y-6 p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* Input Panel */}
                <Card className="bg-card/30 border-cyber-glow/20">
                  <CardHeader>
                    <CardTitle className="text-lg font-cyber text-cyber-glow">
                      Scan Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="targets" className="font-mono">Target IP Addresses</Label>
                      <Input
                        id="targets"
                        placeholder="192.168.1.1, 10.0.0.0/24, 172.16.1.100"
                        value={targetIPs}
                        onChange={(e) => setTargetIPs(e.target.value)}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground font-mono">
                        Enter single IPs, CIDR ranges, or comma-separated lists
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label className="font-mono">Scan Type</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="quick"
                            name="scanType"
                            checked={scanType === 'quick'}
                            onChange={() => setScanType('quick')}
                            className="accent-cyber-glow"
                          />
                          <Label htmlFor="quick" className="font-mono">Quick Scan (Top 100 ports)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="full"
                            name="scanType"
                            checked={scanType === 'full'}
                            onChange={() => setScanType('full')}
                            className="accent-cyber-glow"
                          />
                          <Label htmlFor="full" className="font-mono">Full Port Scan (All 65535 ports)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="custom"
                            name="scanType"
                            checked={scanType === 'custom'}
                            onChange={() => setScanType('custom')}
                            className="accent-cyber-glow"
                          />
                          <Label htmlFor="custom" className="font-mono">Custom Scan (Vulnerability scripts)</Label>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={startScan}
                      disabled={isScanning || !targetIPs.trim()}
                      className="w-full bg-cyber-glow hover:bg-cyber-glow/80 text-black font-mono"
                    >
                      {isScanning ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start Vulnerability Scan
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Auto-detected IPs */}
                {autoDetectedIPs.length > 0 && (
                  <Card className="bg-card/30 border-cyber-glow/20">
                    <CardHeader>
                      <CardTitle className="text-lg font-cyber text-cyber-glow">
                        Auto-Detected Targets
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {autoDetectedIPs.map((ip, index) => (
                          <Badge key={index} variant="outline" className="mr-2 mb-2 font-mono">
                            {ip}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTargetIPs(autoDetectedIPs.join(", "))}
                        className="mt-3"
                      >
                        Use All Auto-Detected IPs
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="scanning" className="h-full">
              <NMapScanProgress 
                isScanning={isScanning}
                progress={scanProgress}
                stage={scanStage}
                targetCount={targetIPs.split(/[,\s]+/).filter(ip => ip.trim()).length}
              />
            </TabsContent>

            <TabsContent value="results" className="h-full">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                <div className="lg:col-span-2 space-y-4">
                  <NMapNetworkMap 
                    results={scanResults}
                    selectedHost={selectedHost}
                    onHostSelect={setSelectedHost}
                  />
                  <NMapVulnerabilityHeatmap results={scanResults} />
                </div>
                <div className="space-y-4">
                  <NMapPortDashboard 
                    results={scanResults}
                    selectedHost={selectedHost}
                    onHostSelect={setSelectedHost}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="export" className="h-full">
              <NMapResultsExport results={scanResults} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}