import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Eye, 
  Network, 
  BarChart3, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle,
  Shield,
  Download,
  Share2
} from "lucide-react"
import { UViewCorrelationChart } from "./uview/UViewCorrelationChart"
import { UViewToolResults } from "./uview/UViewToolResults"
import { UViewThreatTimeline } from "./uview/UViewThreatTimeline"
import { UViewRiskMatrix } from "./uview/UViewRiskMatrix"

interface UViewDashboardProps {
  isOpen: boolean
  onClose: () => void
  caseId?: string
  analysisData?: any // Real analysis data from UViewRealTimeEngine
}

// Mock consolidated results from all tools
const mockConsolidatedResults = {
  caseId: "CASE-2024-001",
  caseName: "Device Storage Analysis - iPhone 14",
  analysisDate: new Date().toISOString(),
  totalThreats: 47,
  riskScore: 8.7,
  riskLevel: "HIGH" as const,
  toolResults: {
    emailChecker: {
      totalEmails: 1247,
      threats: 12,
      phishing: 8,
      malware: 4,
      riskLevel: "HIGH" as const
    },
    callTracer: {
      totalCalls: 342,
      suspicious: 15,
      unknown: 23,
      blacklisted: 3,
      riskLevel: "MEDIUM" as const
    },
    phishingDetector: {
      totalUrls: 89,
      malicious: 7,
      suspicious: 12,
      clean: 70,
      riskLevel: "HIGH" as const
    },
    moneyMapper: {
      totalTransactions: 156,
      suspicious: 8,
      highRisk: 3,
      totalAmount: "$2,450",
      riskLevel: "HIGH" as const
    },
    fakeNewsTracker: {
      totalArticles: 234,
      fake: 5,
      misleading: 12,
      verified: 217,
      riskLevel: "LOW" as const
    },
    nmapScanner: {
      openPorts: 12,
      vulnerabilities: 4,
      criticalVulns: 1,
      riskLevel: "MEDIUM" as const
    },
    voiceIdentifier: {
      totalRecordings: 45,
      suspicious: 3,
      deepfake: 1,
      riskLevel: "MEDIUM" as const
    },
    aiSecurity: {
      anomalies: 23,
      criticalAlerts: 5,
      behaviorChanges: 8,
      riskLevel: "HIGH" as const
    },
    socialMediaFinder: {
      totalProfiles: 67,
      suspicious: 9,
      compromised: 2,
      riskLevel: "MEDIUM" as const
    },
    documentHandler: {
      totalFiles: 2456,
      malicious: 6,
      suspicious: 18,
      riskLevel: "MEDIUM" as const
    }
  },
  correlations: [
    {
      id: "corr-1",
      type: "financial_fraud",
      severity: "HIGH",
      confidence: 0.92,
      description: "Suspicious call followed by phishing email leading to unauthorized transaction",
      involvedTools: ["callTracer", "phishingDetector", "moneyMapper"],
      timeline: [
        { time: "2024-01-15 14:23", event: "Received call from +1-555-SCAM", tool: "callTracer" },
        { time: "2024-01-15 14:45", event: "Clicked phishing link in email", tool: "phishingDetector" },
        { time: "2024-01-15 15:12", event: "Unauthorized transaction of $850", tool: "moneyMapper" }
      ]
    },
    {
      id: "corr-2", 
      type: "social_engineering",
      severity: "MEDIUM",
      confidence: 0.78,
      description: "Fake social media profile used to gather personal information",
      involvedTools: ["socialMediaFinder", "fakeNewsTracker"],
      timeline: [
        { time: "2024-01-10 09:15", event: "Connected with suspicious profile", tool: "socialMediaFinder" },
        { time: "2024-01-12 16:30", event: "Shared fake news article", tool: "fakeNewsTracker" }
      ]
    }
  ]
}

export function UViewDashboard({ isOpen, onClose, caseId, analysisData }: UViewDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  
  // Use real analysis data if provided, otherwise fall back to mock data
  const displayData = analysisData ? {
    caseId: analysisData.id,
    caseName: analysisData.name,
    analysisDate: analysisData.timestamp.toISOString(),
    totalThreats: analysisData.totalThreats,
    riskScore: analysisData.riskScore,
    riskLevel: analysisData.riskLevel,
    toolResults: analysisData.toolResults,
    correlations: analysisData.consolidatedResults?.correlations || []
  } : mockConsolidatedResults

  const getRiskColor = (level: string) => {
    switch (level) {
      case "HIGH": return "text-red-500"
      case "MEDIUM": return "text-yellow-500"
      case "LOW": return "text-green-500"
      default: return "text-gray-500"
    }
  }

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case "HIGH": return "destructive"
      case "MEDIUM": return "secondary"
      case "LOW": return "outline"
      default: return "outline"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-cyber-glow font-cyber text-xl">
            <Eye className="h-6 w-6" />
            U-View: Unified Case Analysis
            <Badge variant="outline" className="ml-auto font-mono">
              {displayData.caseId}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Case Summary Header */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-card/30 rounded-lg border border-cyber-glow/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyber-glow">{displayData.totalThreats}</div>
            <div className="text-sm text-muted-foreground font-mono">Total Threats</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getRiskColor(displayData.riskLevel)}`}>
              {displayData.riskScore}/10
            </div>
            <div className="text-sm text-muted-foreground font-mono">Risk Score</div>
          </div>
          <div className="text-center">
            <Badge variant={getRiskBadgeVariant(displayData.riskLevel)} className="text-sm">
              {displayData.riskLevel} RISK
            </Badge>
            <div className="text-sm text-muted-foreground font-mono mt-1">Risk Level</div>
          </div>
          <div className="text-center space-x-2">
            <Button size="sm" variant="outline" className="font-mono">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button size="sm" variant="outline" className="font-mono">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="correlations" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Correlations
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Tool Results
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risk Matrix
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Threat Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-cyber-glow font-cyber">Threat Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-sm">Email Threats</span>
                      <Badge variant="destructive">12</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-sm">Suspicious Calls</span>
                      <Badge variant="secondary">15</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-sm">Malicious URLs</span>
                      <Badge variant="destructive">7</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-sm">Financial Threats</span>
                      <Badge variant="destructive">8</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-sm">Social Engineering</span>
                      <Badge variant="secondary">5</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Correlations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-cyber-glow font-cyber">Critical Correlations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayData.correlations.map((corr: any) => (
                      <div key={corr.id} className="p-3 bg-card/50 rounded border">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-mono text-sm font-medium">{corr.type.replace('_', ' ').toUpperCase()}</span>
                          <Badge variant={getRiskBadgeVariant(corr.severity)}>{corr.severity}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{corr.description}</p>
                        <div className="flex gap-1">
                          {corr.involvedTools.map((tool) => (
                            <Badge key={tool} variant="outline" className="text-xs">{tool}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="correlations" className="mt-4">
            <UViewCorrelationChart correlations={displayData.correlations} />
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <UViewThreatTimeline correlations={displayData.correlations} />
          </TabsContent>

          <TabsContent value="tools" className="mt-4">
            <UViewToolResults toolResults={displayData.toolResults} />
          </TabsContent>

          <TabsContent value="risk" className="mt-4">
            <UViewRiskMatrix toolResults={displayData.toolResults} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}