import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Users, 
  DollarSign,
  FileText,
  Download,
  Eye
} from "lucide-react"

interface RiskDashboardProps {
  session: any
  data: any
}

export function MoneyMapperRiskDashboard({ session, data }: RiskDashboardProps) {
  const highRiskNodes = data.nodes.filter((n: any) => n.type === 'high-risk').length
  const mediumRiskNodes = data.nodes.filter((n: any) => n.type === 'medium-risk').length
  const suspiciousTransactions = data.edges.filter((e: any) => e.suspicious).length

  return (
    <div className="h-full space-y-6 overflow-auto">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/30 border-cyber-glow/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-mono text-muted-foreground">Overall Risk</p>
                <p className="text-2xl font-bold text-cyber-warning font-cyber">
                  {session.riskScore}%
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-cyber-warning/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-cyber-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/30 border-cyber-glow/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-mono text-muted-foreground">AML Flags</p>
                <p className="text-2xl font-bold text-red-500 font-cyber">
                  {session.amlFlags}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/30 border-cyber-glow/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-mono text-muted-foreground">High Risk Nodes</p>
                <p className="text-2xl font-bold text-red-500 font-cyber">
                  {highRiskNodes}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/30 border-cyber-glow/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-mono text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold text-cyber-glow font-cyber">
                  ${(data.edges.reduce((sum: number, e: any) => sum + e.amount, 0) / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-cyber-glow/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-cyber-glow" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Indicators */}
        <Card className="bg-card/30 border-cyber-glow/20">
          <CardHeader>
            <CardTitle className="text-lg font-cyber text-cyber-glow flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Risk Indicators
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.riskIndicators.map((indicator: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono capitalize">{indicator.type}</span>
                  <Badge 
                    variant="outline"
                    className={`
                      ${indicator.severity === 'critical' ? 'border-red-500 text-red-500' : ''}
                      ${indicator.severity === 'high' ? 'border-cyber-warning text-cyber-warning' : ''}
                      ${indicator.severity === 'medium' ? 'border-yellow-500 text-yellow-500' : ''}
                    `}
                  >
                    {indicator.severity} - {indicator.count} detected
                  </Badge>
                </div>
                <Progress 
                  value={(indicator.count / 20) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Compliance Alerts */}
        <Card className="bg-card/30 border-cyber-glow/20">
          <CardHeader>
            <CardTitle className="text-lg font-cyber text-cyber-glow flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Compliance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.complianceAlerts.map((alert: any) => (
              <Alert key={alert.id} className="border-cyber-warning/20">
                <AlertTriangle className="h-4 w-4 text-cyber-warning" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-sm">{alert.type}</span>
                      <Badge variant="outline" className="text-xs">
                        {alert.status}
                      </Badge>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">
                      Account: {alert.account}
                    </p>
                    {alert.amount && (
                      <p className="text-xs font-mono text-cyber-glow">
                        Amount: ${alert.amount.toLocaleString()}
                      </p>
                    )}
                    {alert.entity && (
                      <p className="text-xs font-mono text-red-500">
                        Entity: {alert.entity}
                      </p>
                    )}
                    {alert.pattern && (
                      <p className="text-xs font-mono text-cyber-warning">
                        Pattern: {alert.pattern}
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AML Actions */}
      <Card className="bg-card/30 border-cyber-glow/20">
        <CardHeader>
          <CardTitle className="text-lg font-cyber text-cyber-glow flex items-center gap-2">
            <FileText className="h-5 w-5" />
            AML Actions & Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center gap-2 border-cyber-glow/20">
              <FileText className="h-4 w-4" />
              Generate SAR Report
            </Button>
            <Button variant="outline" className="flex items-center gap-2 border-cyber-warning/20 text-cyber-warning">
              <Eye className="h-4 w-4" />
              Review Flagged Entities
            </Button>
            <Button variant="outline" className="flex items-center gap-2 border-cyber-glow/20">
              <Download className="h-4 w-4" />
              Export Compliance Summary
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suspicious Pattern Analysis */}
      <Card className="bg-card/30 border-cyber-glow/20">
        <CardHeader>
          <CardTitle className="text-lg font-cyber text-cyber-glow">
            Detected Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 border border-red-500/20 rounded-lg bg-red-500/5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="font-mono font-semibold text-red-500">Structuring Pattern Detected</span>
              </div>
              <p className="text-xs font-mono text-muted-foreground">
                Multiple transactions just below $10,000 threshold detected across 3 accounts
              </p>
            </div>

            <div className="p-3 border border-cyber-warning/20 rounded-lg bg-cyber-warning/5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-cyber-warning" />
                <span className="font-mono font-semibold text-cyber-warning">Rapid Layering</span>
              </div>
              <p className="text-xs font-mono text-muted-foreground">
                Complex chain of transfers through 8 intermediary accounts within 24 hours
              </p>
            </div>

            <div className="p-3 border border-yellow-500/20 rounded-lg bg-yellow-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-yellow-500" />
                <span className="font-mono font-semibold text-yellow-500">High-Risk Jurisdiction</span>
              </div>
              <p className="text-xs font-mono text-muted-foreground">
                Transactions involving accounts in 2 high-risk jurisdictions identified
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}