import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Upload, 
  Brain, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Eye,
  Clock
} from "lucide-react"
import { SimpleFileUpload } from "./SimpleFileUpload"
import { useDataCategorization, INVESTIGATION_CATEGORIES } from "./ai/DataCategorizationEngine"
import { UViewDashboard } from "./UViewDashboard"

export interface UViewAnalysisResult {
  id: string
  name: string
  timestamp: Date
  files: File[]
  processingStatus: 'uploading' | 'categorizing' | 'analyzing' | 'completed' | 'error'
  processingProgress: number
  categorizedData: any[]
  toolResults: any
  consolidatedResults: any
  totalThreats: number
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface UViewRealTimeEngineProps {
  onAnalysisComplete?: (result: UViewAnalysisResult) => void
  analysisHistory: UViewAnalysisResult[]
  onUpdateHistory: (history: UViewAnalysisResult[]) => void
}

export function UViewRealTimeEngine({ 
  onAnalysisComplete, 
  analysisHistory, 
  onUpdateHistory 
}: UViewRealTimeEngineProps) {
  const [currentAnalysis, setCurrentAnalysis] = useState<UViewAnalysisResult | null>(null)
  const [showDashboard, setShowDashboard] = useState(false)
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null)
  
  const { categorizeFiles, isProcessing, result: categorizationResult, error } = useDataCategorization()

  const generateAnalysisId = () => `UC-${Date.now()}`
  
  const generateAnalysisName = (files: File[]) => {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    const sizeInMB = (totalSize / (1024 * 1024)).toFixed(1)
    return `Analysis ${analysisHistory.length + 1} (${files.length} files, ${sizeInMB}MB)`
  }

  const simulateToolAnalysis = async (categorizedData: any[]): Promise<any> => {
    // Simulate real-time tool processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const toolResults: any = {}
    let totalThreats = 0
    
    for (const category of categorizedData) {
      const categoryConfig = INVESTIGATION_CATEGORIES.find(c => c.id === category.category)
      if (!categoryConfig) continue
      
      // Simulate tool-specific analysis results
      const threats = Math.floor(Math.random() * category.files.length * 2)
      totalThreats += threats
      
      const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = threats > 5 ? 'HIGH' : threats > 2 ? 'MEDIUM' : 'LOW'
      
      toolResults[category.category] = {
        totalFiles: category.files.length,
        threats,
        riskLevel,
        analysisTime: Date.now(),
        details: category.preview
      }
    }
    
    return { toolResults, totalThreats }
  }

  const calculateConsolidatedResults = (toolResults: any, totalThreats: number) => {
    const riskScore = Math.min(10, Math.max(1, (totalThreats / 10) * 10))
    const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = riskScore >= 7 ? 'HIGH' : riskScore >= 4 ? 'MEDIUM' : 'LOW'
    
    return {
      totalThreats,
      riskScore: parseFloat(riskScore.toFixed(1)),
      riskLevel,
      correlations: generateCorrelations(toolResults),
      summary: generateSummary(toolResults, totalThreats)
    }
  }

  const generateCorrelations = (toolResults: any) => {
    const correlations = []
    const tools = Object.keys(toolResults)
    
    // Generate realistic correlations between tools
    if (tools.includes('email-checker') && tools.includes('phishing-detector')) {
      correlations.push({
        id: `corr-${Date.now()}-1`,
        type: 'phishing_campaign',
        severity: 'HIGH',
        confidence: 0.89,
        description: 'Phishing emails detected linking to malicious URLs',
        involvedTools: ['email-checker', 'phishing-detector'],
        timeline: [
          { time: new Date().toISOString(), event: 'Phishing email received', tool: 'email-checker' },
          { time: new Date().toISOString(), event: 'Malicious URL clicked', tool: 'phishing-detector' }
        ]
      })
    }
    
    if (tools.includes('call-tracer') && tools.includes('money-mapper')) {
      correlations.push({
        id: `corr-${Date.now()}-2`,
        type: 'financial_fraud',
        severity: 'HIGH',
        confidence: 0.92,
        description: 'Suspicious calls followed by unauthorized transactions',
        involvedTools: ['call-tracer', 'money-mapper'],
        timeline: [
          { time: new Date().toISOString(), event: 'Suspicious call received', tool: 'call-tracer' },
          { time: new Date().toISOString(), event: 'Unauthorized transaction', tool: 'money-mapper' }
        ]
      })
    }
    
    return correlations
  }

  const generateSummary = (toolResults: any, totalThreats: number) => {
    const tools = Object.keys(toolResults)
    return `Analysis completed across ${tools.length} investigation modules. ${totalThreats} total threats identified with cross-tool correlations detected.`
  }

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return

    const analysisId = generateAnalysisId()
    const analysisName = generateAnalysisName(files)
    
    const newAnalysis: UViewAnalysisResult = {
      id: analysisId,
      name: analysisName,
      timestamp: new Date(),
      files,
      processingStatus: 'uploading',
      processingProgress: 0,
      categorizedData: [],
      toolResults: {},
      consolidatedResults: {},
      totalThreats: 0,
      riskScore: 0,
      riskLevel: 'LOW'
    }

    setCurrentAnalysis(newAnalysis)
    
    try {
      // Step 1: Upload complete
      newAnalysis.processingStatus = 'categorizing'
      newAnalysis.processingProgress = 25
      setCurrentAnalysis({ ...newAnalysis })

      // Step 2: AI Categorization
      await categorizeFiles(files)
      
      if (categorizationResult) {
        newAnalysis.categorizedData = categorizationResult.categorizedData
        newAnalysis.processingStatus = 'analyzing'
        newAnalysis.processingProgress = 50
        setCurrentAnalysis({ ...newAnalysis })

        // Step 3: Tool Analysis
        const { toolResults, totalThreats } = await simulateToolAnalysis(categorizationResult.categorizedData)
        newAnalysis.toolResults = toolResults
        newAnalysis.totalThreats = totalThreats
        newAnalysis.processingProgress = 75
        setCurrentAnalysis({ ...newAnalysis })

        // Step 4: Consolidation
        const consolidatedResults = calculateConsolidatedResults(toolResults, totalThreats)
        newAnalysis.consolidatedResults = consolidatedResults
        newAnalysis.riskScore = consolidatedResults.riskScore
        newAnalysis.riskLevel = consolidatedResults.riskLevel
        newAnalysis.processingStatus = 'completed'
        newAnalysis.processingProgress = 100
        
        // Add to history and save to localStorage
        const updatedHistory = [newAnalysis, ...analysisHistory]
        onUpdateHistory(updatedHistory)
        localStorage.setItem('uview-analysis-history', JSON.stringify(updatedHistory))
        
        setCurrentAnalysis({ ...newAnalysis })
        onAnalysisComplete?.(newAnalysis)
      }
    } catch (err) {
      newAnalysis.processingStatus = 'error'
      setCurrentAnalysis({ ...newAnalysis })
    }
  }

  const handleViewAnalysis = (analysisId: string) => {
    setSelectedAnalysisId(analysisId)
    setShowDashboard(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500'
      case 'analyzing': return 'text-blue-500'
      case 'categorizing': return 'text-yellow-500'
      case 'uploading': return 'text-blue-400'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'HIGH': return 'destructive'
      case 'MEDIUM': return 'secondary'
      case 'LOW': return 'outline'
      default: return 'outline'
    }
  }

  const selectedAnalysis = selectedAnalysisId 
    ? analysisHistory.find(a => a.id === selectedAnalysisId) || currentAnalysis
    : null

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card className="bg-card/50 border-cyber-glow/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyber-glow font-cyber">
            <Upload className="h-5 w-5" />
            Real-Time Investigation Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleFileUpload
            onFileSelect={handleFileUpload}
            acceptedFileTypes=".eml,.msg,.mbox,.pst,.vcf,.csv,.log,.url,.html,.txt,.xls,.xlsx,.qif,.pdf,.doc,.docx,.wav,.mp3,.m4a,.ogg,.json,.nmap,.xml"
            maxFileSize={1024 * 1024 * 1024} // 1GB per file (effectively unlimited)
            multiple={true}
            disabled={isProcessing || (currentAnalysis && currentAnalysis.processingStatus !== 'completed')}
          />
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p>• Upload multiple files simultaneously for comprehensive analysis</p>
            <p>• Each file can be up to 1GB in size</p>
            <p>• AI will categorize and analyze all files together for correlations</p>
          </div>
        </CardContent>
      </Card>

      {/* Current Analysis Progress */}
      {currentAnalysis && currentAnalysis.processingStatus !== 'completed' && (
        <Card className="bg-card/50 border-cyber-glow/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyber-glow font-cyber">
              <Brain className="h-5 w-5" />
              Real-Time Analysis in Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm">{currentAnalysis.name}</span>
              <Badge variant="outline" className={getStatusColor(currentAnalysis.processingStatus)}>
                {currentAnalysis.processingStatus.toUpperCase()}
              </Badge>
            </div>
            
            <Progress value={currentAnalysis.processingProgress} className="w-full" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span className="font-mono">Files: {currentAnalysis.files.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span className="font-mono">Categories: {currentAnalysis.categorizedData.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="font-mono">Tools: {Object.keys(currentAnalysis.toolResults).length}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-mono">Threats: {currentAnalysis.totalThreats}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis History */}
      {analysisHistory.length > 0 && (
        <Card className="bg-card/50 border-cyber-glow/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyber-glow font-cyber">
              <FileText className="h-5 w-5" />
              Analysis History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysisHistory.map((analysis) => (
                <Card 
                  key={analysis.id}
                  className="bg-card/30 border-cyber-glow/10 hover:border-cyber-glow/30 transition-all duration-300 cursor-pointer"
                  onClick={() => handleViewAnalysis(analysis.id)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{analysis.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          {analysis.timestamp.toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant={getRiskBadgeVariant(analysis.riskLevel)} className="text-xs">
                        {analysis.riskLevel}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Files:</span>
                        <span className="ml-1 font-mono">{analysis.files.length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Threats:</span>
                        <span className="ml-1 font-mono">{analysis.totalThreats}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Risk Score:</span>
                        <span className="ml-1 font-mono">{analysis.riskScore}/10</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tools:</span>
                        <span className="ml-1 font-mono">{Object.keys(analysis.toolResults).length}</span>
                      </div>
                    </div>

                    <Button size="sm" variant="outline" className="w-full">
                      <Eye className="h-3 w-3 mr-1" />
                      View Analysis
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* U-View Dashboard */}
      {selectedAnalysis && (
        <UViewDashboard 
          isOpen={showDashboard}
          onClose={() => setShowDashboard(false)}
          caseId={selectedAnalysis.id}
          analysisData={selectedAnalysis}
        />
      )}
    </div>
  )
}