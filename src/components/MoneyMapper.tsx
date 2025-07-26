import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileUpload } from "./FileUpload"
import { MoneyMapperNetworkGraph } from "./money-mapper/MoneyMapperNetworkGraph"
import { MoneyMapperRiskDashboard } from "./money-mapper/MoneyMapperRiskDashboard"
import { MoneyMapperTransactionDetails } from "./money-mapper/MoneyMapperTransactionDetails"
import { MoneyMapperSessionManager } from "./money-mapper/MoneyMapperSessionManager"
import { MoneyMapperGeoMap } from "./money-mapper/MoneyMapperGeoMap"
import { MoneyMapperExportPanel } from "./money-mapper/MoneyMapperExportPanel"
import { 
  Upload, 
  Network, 
  AlertTriangle, 
  Activity, 
  History, 
  Download,
  MapPin,
  RefreshCw,
  Shield
} from "lucide-react"
import { toast } from "sonner"

interface MoneyMapperProps {
  isOpen: boolean
  onClose: () => void
}

interface AnalysisSession {
  id: string
  name: string
  timestamp: Date
  dataFormat: string
  transactionCount: number
  riskScore: number
  amlFlags: number
}

interface TransactionData {
  nodes: any[]
  edges: any[]
  riskIndicators: any[]
  complianceAlerts: any[]
  timelineData: any[]
  geoData: any[]
}

export function MoneyMapper({ isOpen, onClose }: MoneyMapperProps) {
  const [currentSession, setCurrentSession] = useState<AnalysisSession | null>(null)
  const [sessionHistory, setSessionHistory] = useState<AnalysisSession[]>([])
  const [analysisData, setAnalysisData] = useState<TransactionData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState("network")
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)

  // Load last session on open
  useEffect(() => {
    if (isOpen && !currentSession && sessionHistory.length > 0) {
      const lastSession = sessionHistory[sessionHistory.length - 1]
      loadSession(lastSession)
    }
  }, [isOpen])

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return

    setIsProcessing(true)
    try {
      // Simulate data processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const file = files[0]
      const newSession: AnalysisSession = {
        id: `session_${Date.now()}`,
        name: `Analysis: ${file.name}`,
        timestamp: new Date(),
        dataFormat: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
        transactionCount: Math.floor(Math.random() * 5000) + 1000,
        riskScore: Math.floor(Math.random() * 100),
        amlFlags: Math.floor(Math.random() * 15)
      }

      // Generate mock analysis data
      const mockData = generateMockAnalysisData()
      
      setCurrentSession(newSession)
      setAnalysisData(mockData)
      setSessionHistory(prev => [...prev, newSession])
      
      toast.success(`Financial data analyzed: ${newSession.transactionCount} transactions processed`)
    } catch (error) {
      toast.error("Failed to process financial data")
    } finally {
      setIsProcessing(false)
    }
  }

  const generateMockAnalysisData = (): TransactionData => {
    // Generate mock network data
    const nodes = Array.from({ length: 50 }, (_, i) => ({
      id: `account_${i}`,
      label: `Account ${i}`,
      type: i < 5 ? 'high-risk' : i < 15 ? 'medium-risk' : 'normal',
      amount: Math.random() * 1000000,
      country: ['US', 'UK', 'DE', 'SG', 'CH', 'PA'][Math.floor(Math.random() * 6)],
      riskScore: Math.random() * 100
    }))

    const edges = Array.from({ length: 80 }, (_, i) => ({
      id: `tx_${i}`,
      source: `account_${Math.floor(Math.random() * 20)}`,
      target: `account_${Math.floor(Math.random() * 50)}`,
      amount: Math.random() * 100000,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      suspicious: Math.random() > 0.8,
      riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
    }))

    return {
      nodes,
      edges,
      riskIndicators: [
        { type: 'structuring', count: 12, severity: 'high' },
        { type: 'layering', count: 8, severity: 'medium' },
        { type: 'velocity', count: 15, severity: 'high' },
        { type: 'sanctions', count: 3, severity: 'critical' }
      ],
      complianceAlerts: [
        { id: 1, type: 'AML Threshold Breach', account: 'Account 3', amount: 25000, status: 'open' },
        { id: 2, type: 'Sanctions List Match', account: 'Account 7', entity: 'Shell Corp Ltd', status: 'investigating' },
        { id: 3, type: 'Suspicious Pattern', account: 'Account 12', pattern: 'Rapid Layering', status: 'flagged' }
      ],
      timelineData: edges.map(edge => ({
        timestamp: edge.timestamp,
        amount: edge.amount,
        risk: edge.riskLevel
      })),
      geoData: nodes.map(node => ({
        country: node.country,
        amount: node.amount,
        riskScore: node.riskScore
      }))
    }
  }

  const loadSession = (session: AnalysisSession) => {
    setCurrentSession(session)
    // In real implementation, load actual data from backend
    setAnalysisData(generateMockAnalysisData())
    toast.success(`Loaded session: ${session.name}`)
  }

  const resetSession = () => {
    setCurrentSession(null)
    setAnalysisData(null)
    setSelectedTransaction(null)
    setActiveTab("network")
    toast.info("Session reset - ready for new analysis")
  }

  const hasData = currentSession && analysisData

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 bg-background border-cyber-glow/20">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyber-glow/20 flex items-center justify-center">
                <Activity className="h-4 w-4 text-cyber-glow" />
              </div>
              <div>
                <DialogTitle className="text-xl font-cyber text-cyber-glow">
                  Money Mapper
                </DialogTitle>
                <p className="text-sm text-muted-foreground font-mono">
                  Advanced Financial Investigation & AML Analysis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentSession && (
                <Badge variant="outline" className="border-cyber-glow/20 text-cyber-glow font-mono">
                  Session: {currentSession.name}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={resetSession}
                className="border-cyber-warning/20 text-cyber-warning hover:bg-cyber-warning/10"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 p-6 pt-4 overflow-hidden">
          {!hasData ? (
            <div className="h-full flex flex-col items-center justify-center space-y-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-xl bg-cyber-glow/10 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-cyber-glow" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-cyber-glow font-cyber">
                    Upload Financial Data
                  </h3>
                  <p className="text-muted-foreground font-mono text-sm">
                    Upload bank statements, blockchain data, or transaction logs for analysis
                  </p>
                </div>
              </div>

              <div className="w-full max-w-md">
                <input
                  type="file"
                  accept=".csv,.xlsx,.json,.txt"
                  onChange={(e) => e.target.files && handleFileUpload(Array.from(e.target.files))}
                  className="hidden"
                  id="money-mapper-upload"
                />
                <label
                  htmlFor="money-mapper-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-cyber-glow/20 border-dashed rounded-lg cursor-pointer hover:bg-card/50 transition-all duration-200"
                >
                  <Upload className="h-8 w-8 text-cyber-glow mb-2" />
                  <span className="text-sm font-mono text-cyber-glow">Click to upload financial data</span>
                  <span className="text-xs font-mono text-muted-foreground">CSV, XLSX, JSON, TXT</span>
                </label>
              </div>

              <Alert className="w-full max-w-md border-cyber-glow/20">
                <Shield className="h-4 w-4 text-cyber-glow" />
                <AlertDescription className="font-mono text-xs">
                  Supports: Bank MT940, CSV transactions, blockchain ledgers, JSON networks
                </AlertDescription>
              </Alert>

              {sessionHistory.length > 0 && (
                <MoneyMapperSessionManager
                  sessions={sessionHistory}
                  onLoadSession={loadSession}
                />
              )}
            </div>
          ) : (
            <div className="h-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-6 bg-card/30">
                  <TabsTrigger value="network" className="flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    Network
                  </TabsTrigger>
                  <TabsTrigger value="risk" className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Risk Analysis
                  </TabsTrigger>
                  <TabsTrigger value="transactions" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Transactions
                  </TabsTrigger>
                  <TabsTrigger value="geography" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Geography
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    History
                  </TabsTrigger>
                  <TabsTrigger value="export" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 mt-4 overflow-hidden">
                  <TabsContent value="network" className="h-full">
                    <MoneyMapperNetworkGraph
                      data={analysisData}
                      onNodeSelect={setSelectedTransaction}
                    />
                  </TabsContent>

                  <TabsContent value="risk" className="h-full">
                    <MoneyMapperRiskDashboard
                      session={currentSession}
                      data={analysisData}
                    />
                  </TabsContent>

                  <TabsContent value="transactions" className="h-full">
                    <MoneyMapperTransactionDetails
                      data={analysisData}
                      selectedTransaction={selectedTransaction}
                      onTransactionSelect={setSelectedTransaction}
                    />
                  </TabsContent>

                  <TabsContent value="geography" className="h-full">
                    <MoneyMapperGeoMap data={analysisData} />
                  </TabsContent>

                  <TabsContent value="history" className="h-full">
                    <MoneyMapperSessionManager
                      sessions={sessionHistory}
                      currentSession={currentSession}
                      onLoadSession={loadSession}
                      showDetailed={true}
                    />
                  </TabsContent>

                  <TabsContent value="export" className="h-full">
                    <MoneyMapperExportPanel
                      session={currentSession}
                      data={analysisData}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}