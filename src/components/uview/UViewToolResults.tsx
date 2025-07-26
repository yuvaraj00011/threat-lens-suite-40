import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Mail, 
  Phone, 
  Shield, 
  DollarSign, 
  Newspaper, 
  Activity,
  Mic, 
  Lock, 
  Users, 
  FileCheck
} from "lucide-react"

interface ToolResult {
  [key: string]: any
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface UViewToolResultsProps {
  toolResults: {
    emailChecker: ToolResult
    callTracer: ToolResult
    phishingDetector: ToolResult
    moneyMapper: ToolResult
    fakeNewsTracker: ToolResult
    nmapScanner: ToolResult
    voiceIdentifier: ToolResult
    aiSecurity: ToolResult
    socialMediaFinder: ToolResult
    documentHandler: ToolResult
  }
}

const toolConfig = [
  {
    key: 'emailChecker',
    name: 'Email Checker',
    icon: Mail,
    color: 'text-blue-500',
    metrics: ['totalEmails', 'threats', 'phishing', 'malware']
  },
  {
    key: 'callTracer',
    name: 'Call Tracer',
    icon: Phone,
    color: 'text-green-500',
    metrics: ['totalCalls', 'suspicious', 'unknown', 'blacklisted']
  },
  {
    key: 'phishingDetector',
    name: 'Phishing Detector',
    icon: Shield,
    color: 'text-red-500',
    metrics: ['totalUrls', 'malicious', 'suspicious', 'clean']
  },
  {
    key: 'moneyMapper',
    name: 'Money Mapper',
    icon: DollarSign,
    color: 'text-yellow-500',
    metrics: ['totalTransactions', 'suspicious', 'highRisk', 'totalAmount']
  },
  {
    key: 'fakeNewsTracker',
    name: 'Fake News Tracker',
    icon: Newspaper,
    color: 'text-purple-500',
    metrics: ['totalArticles', 'fake', 'misleading', 'verified']
  },
  {
    key: 'nmapScanner',
    name: 'Network Scanner',
    icon: Activity,
    color: 'text-orange-500',
    metrics: ['openPorts', 'vulnerabilities', 'criticalVulns']
  },
  {
    key: 'voiceIdentifier',
    name: 'Voice Identifier',
    icon: Mic,
    color: 'text-pink-500',
    metrics: ['totalRecordings', 'suspicious', 'deepfake']
  },
  {
    key: 'aiSecurity',
    name: 'AI Security System',
    icon: Lock,
    color: 'text-cyan-500',
    metrics: ['anomalies', 'criticalAlerts', 'behaviorChanges']
  },
  {
    key: 'socialMediaFinder',
    name: 'Social Media Finder',
    icon: Users,
    color: 'text-indigo-500',
    metrics: ['totalProfiles', 'suspicious', 'compromised']
  },
  {
    key: 'documentHandler',
    name: 'Document Handler',
    icon: FileCheck,
    color: 'text-teal-500',
    metrics: ['totalFiles', 'malicious', 'suspicious']
  }
]

const getRiskBadgeVariant = (level: string) => {
  switch (level) {
    case 'HIGH': return 'destructive'
    case 'MEDIUM': return 'secondary'
    case 'LOW': return 'outline'
    default: return 'outline'
  }
}

const getRiskScore = (level: string) => {
  switch (level) {
    case 'HIGH': return 85
    case 'MEDIUM': return 60
    case 'LOW': return 25
    default: return 0
  }
}

export function UViewToolResults({ toolResults }: UViewToolResultsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {toolConfig.map((tool) => {
          const result = toolResults[tool.key as keyof typeof toolResults]
          const Icon = tool.icon
          const riskScore = getRiskScore(result.riskLevel)
          
          return (
            <Card key={tool.key} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon className={`h-5 w-5 ${tool.color}`} />
                  <span className="font-cyber">{tool.name}</span>
                  <Badge 
                    variant={getRiskBadgeVariant(result.riskLevel)} 
                    className="ml-auto text-xs"
                  >
                    {result.riskLevel}
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Risk Score Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-mono">Risk Score</span>
                    <span className="font-bold">{riskScore}%</span>
                  </div>
                  <Progress value={riskScore} className="h-2" />
                </div>
                
                {/* Metrics */}
                <div className="space-y-2">
                  {tool.metrics.map((metric) => (
                    <div key={metric} className="flex justify-between items-center text-sm">
                      <span className="font-mono capitalize text-muted-foreground">
                        {metric.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                      <span className="font-bold font-mono">
                        {result[metric] || 0}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Tool-specific highlights */}
                {result.riskLevel === 'HIGH' && (
                  <div className="mt-3 p-2 bg-destructive/10 rounded border border-destructive/20">
                    <p className="text-xs text-destructive font-medium">
                      ⚠️ High-risk activity detected
                    </p>
                  </div>
                )}
              </CardContent>
              
              {/* Visual indicator */}
              <div 
                className={`absolute top-0 right-0 w-1 h-full ${
                  result.riskLevel === 'HIGH' ? 'bg-destructive' :
                  result.riskLevel === 'MEDIUM' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
              />
            </Card>
          )
        })}
      </div>
      
      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-cyber-glow font-cyber">Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {Object.values(toolResults).filter(r => r.riskLevel === 'HIGH').length}
              </div>
              <div className="text-sm text-muted-foreground font-mono">High Risk Tools</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {Object.values(toolResults).filter(r => r.riskLevel === 'MEDIUM').length}
              </div>
              <div className="text-sm text-muted-foreground font-mono">Medium Risk Tools</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {Object.values(toolResults).filter(r => r.riskLevel === 'LOW').length}
              </div>
              <div className="text-sm text-muted-foreground font-mono">Low Risk Tools</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyber-glow">
                {Object.keys(toolResults).length}
              </div>
              <div className="text-sm text-muted-foreground font-mono">Total Tools</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}