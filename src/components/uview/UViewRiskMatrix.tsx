import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ToolResult {
  [key: string]: any
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface UViewRiskMatrixProps {
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

const toolNames = {
  emailChecker: 'Email Checker',
  callTracer: 'Call Tracer',
  phishingDetector: 'Phishing Detector',
  moneyMapper: 'Money Mapper',
  fakeNewsTracker: 'Fake News Tracker',
  nmapScanner: 'Network Scanner',
  voiceIdentifier: 'Voice Identifier',
  aiSecurity: 'AI Security',
  socialMediaFinder: 'Social Media',
  documentHandler: 'Document Handler'
}

const riskLevels = ['LOW', 'MEDIUM', 'HIGH'] as const
const impactLevels = ['Financial', 'Privacy', 'Security', 'Social'] as const

// Mock impact mapping for tools
const toolImpactMapping = {
  emailChecker: ['Privacy', 'Security'],
  callTracer: ['Privacy', 'Social'],
  phishingDetector: ['Financial', 'Security'],
  moneyMapper: ['Financial'],
  fakeNewsTracker: ['Social'],
  nmapScanner: ['Security'],
  voiceIdentifier: ['Privacy', 'Social'],
  aiSecurity: ['Security'],
  socialMediaFinder: ['Privacy', 'Social'],
  documentHandler: ['Security', 'Privacy']
}

const getRiskColor = (level: string) => {
  switch (level) {
    case 'HIGH': return 'bg-red-500'
    case 'MEDIUM': return 'bg-yellow-500'
    case 'LOW': return 'bg-green-500'
    default: return 'bg-gray-500'
  }
}

const getRiskScore = (level: string) => {
  switch (level) {
    case 'HIGH': return 3
    case 'MEDIUM': return 2
    case 'LOW': return 1
    default: return 0
  }
}

export function UViewRiskMatrix({ toolResults }: UViewRiskMatrixProps) {
  // Calculate risk distribution
  const riskDistribution = riskLevels.map(level => ({
    level,
    count: Object.values(toolResults).filter(result => result.riskLevel === level).length,
    tools: Object.entries(toolResults)
      .filter(([_, result]) => result.riskLevel === level)
      .map(([key, _]) => toolNames[key as keyof typeof toolNames])
  }))

  // Calculate impact matrix
  const impactMatrix = impactLevels.map(impact => {
    const affectedTools = Object.entries(toolImpactMapping)
      .filter(([_, impacts]) => impacts.includes(impact))
      .map(([tool, _]) => ({
        tool: toolNames[tool as keyof typeof toolNames],
        risk: toolResults[tool as keyof typeof toolResults].riskLevel,
        score: getRiskScore(toolResults[tool as keyof typeof toolResults].riskLevel)
      }))
    
    const totalScore = affectedTools.reduce((sum, tool) => sum + tool.score, 0)
    const avgScore = affectedTools.length > 0 ? totalScore / affectedTools.length : 0
    
    return {
      impact,
      tools: affectedTools,
      avgScore,
      riskLevel: avgScore >= 2.5 ? 'HIGH' : avgScore >= 1.5 ? 'MEDIUM' : 'LOW'
    }
  })

  return (
    <div className="space-y-6">
      {/* Risk Distribution Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-cyber-glow font-cyber">Risk Distribution Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {riskDistribution.map((risk) => (
              <div key={risk.level} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${getRiskColor(risk.level)}`} />
                  <span className="font-semibold font-mono">{risk.level} RISK</span>
                  <Badge variant="outline" className="ml-auto">
                    {risk.count} tools
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  {risk.tools.map((tool) => (
                    <div key={tool} className="text-sm text-muted-foreground bg-card/50 p-2 rounded border">
                      {tool}
                    </div>
                  ))}
                  {risk.tools.length === 0 && (
                    <div className="text-sm text-muted-foreground italic">No tools in this category</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Impact Assessment Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-cyber-glow font-cyber">Impact Assessment Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {impactMatrix.map((impact) => (
              <div key={impact.impact} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold font-mono">{impact.impact} Impact</h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${getRiskColor(impact.riskLevel)}`} />
                    <Badge variant={
                      impact.riskLevel === 'HIGH' ? 'destructive' :
                      impact.riskLevel === 'MEDIUM' ? 'secondary' : 'outline'
                    }>
                      {impact.riskLevel}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {impact.tools.map((tool) => (
                    <div key={tool.tool} className="flex items-center justify-between text-sm bg-card/30 p-2 rounded">
                      <span className="font-mono">{tool.tool}</span>
                      <div className={`w-2 h-2 rounded ${getRiskColor(tool.risk)}`} />
                    </div>
                  ))}
                </div>
                
                {impact.tools.length === 0 && (
                  <div className="text-sm text-muted-foreground italic">No tools affect this impact area</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-cyber-glow font-cyber">Risk Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(toolResults).map(([toolKey, result]) => {
              const toolName = toolNames[toolKey as keyof typeof toolNames]
              const riskScore = getRiskScore(result.riskLevel)
              
              return (
                <div
                  key={toolKey}
                  className={`
                    aspect-square rounded-lg flex flex-col items-center justify-center p-2 text-center
                    ${getRiskColor(result.riskLevel)} text-white
                    opacity-${riskScore === 3 ? '100' : riskScore === 2 ? '70' : '40'}
                  `}
                >
                  <div className="text-xs font-bold font-mono leading-tight">
                    {toolName.split(' ').map(word => word[0]).join('')}
                  </div>
                  <div className="text-2xs mt-1 opacity-90">
                    {result.riskLevel}
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="mt-4 flex justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded opacity-40" />
              <span>Low Risk</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded opacity-70" />
              <span>Medium Risk</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded opacity-100" />
              <span>High Risk</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}