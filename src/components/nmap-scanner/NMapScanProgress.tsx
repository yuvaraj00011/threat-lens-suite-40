import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Activity, 
  Zap, 
  Target, 
  Search, 
  Shield, 
  Database,
  FileText,
  CheckCircle,
  Clock
} from "lucide-react"

interface NMapScanProgressProps {
  isScanning: boolean
  progress: number
  stage: string
  targetCount: number
}

export function NMapScanProgress({ isScanning, progress, stage, targetCount }: NMapScanProgressProps) {
  const scanStages = [
    {
      id: 'init',
      name: 'Initializing',
      icon: Activity,
      description: 'Starting scan engine and validating targets'
    },
    {
      id: 'discovery',
      name: 'Host Discovery',
      icon: Target,
      description: 'Ping/ARP sweep to identify live hosts'
    },
    {
      id: 'ports',
      name: 'Port Scanning',
      icon: Search,
      description: 'Enumerating open ports and services'
    },
    {
      id: 'fingerprint',
      name: 'Service Detection',
      icon: Zap,
      description: 'Identifying service versions and protocols'
    },
    {
      id: 'os',
      name: 'OS Detection',
      icon: Shield,
      description: 'Operating system fingerprinting'
    },
    {
      id: 'vulns',
      name: 'Vulnerability Analysis',
      icon: Shield,
      description: 'Running vulnerability detection scripts'
    },
    {
      id: 'cve',
      name: 'CVE Lookup',
      icon: Database,
      description: 'Cross-referencing with vulnerability databases'
    },
    {
      id: 'report',
      name: 'Report Generation',
      icon: FileText,
      description: 'Compiling results and generating report'
    }
  ]

  const getCurrentStageIndex = () => {
    if (stage.includes('Initializing')) return 0
    if (stage.includes('discovery') || stage.includes('ping') || stage.includes('ARP')) return 1
    if (stage.includes('Port') || stage.includes('scanning')) return 2
    if (stage.includes('fingerprint') || stage.includes('Service')) return 3
    if (stage.includes('OS') || stage.includes('detection')) return 4
    if (stage.includes('Vulnerability') || stage.includes('analysis')) return 5
    if (stage.includes('CVE') || stage.includes('database')) return 6
    if (stage.includes('report') || stage.includes('Generating')) return 7
    return 0
  }

  const currentStageIndex = getCurrentStageIndex()

  return (
    <div className="h-full p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="relative mx-auto w-20 h-20">
          <Activity className="w-20 h-20 text-cyber-glow animate-pulse-glow" />
          <div className="absolute inset-0 animate-spin">
            <div className="w-20 h-20 border-4 border-transparent border-t-cyber-glow rounded-full" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-cyber text-cyber-glow mb-2">
            Network Vulnerability Scan in Progress
          </h2>
          <p className="text-muted-foreground font-mono">
            Scanning {targetCount} target{targetCount !== 1 ? 's' : ''} for security vulnerabilities
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="bg-card/30 border-cyber-glow/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-muted-foreground">Overall Progress</span>
              <span className="font-mono text-sm font-semibold text-cyber-glow">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-sm text-muted-foreground">{stage}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scan Stages */}
      <Card className="bg-card/30 border-cyber-glow/20">
        <CardHeader>
          <CardTitle className="text-lg font-cyber text-cyber-glow">
            Scan Stages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scanStages.map((scanStage, index) => {
              const isCompleted = index < currentStageIndex
              const isActive = index === currentStageIndex && isScanning
              const isPending = index > currentStageIndex
              
              const Icon = scanStage.icon
              
              return (
                <div 
                  key={scanStage.id}
                  className={`
                    flex items-center gap-4 p-3 rounded-lg border transition-all duration-300
                    ${isActive 
                      ? 'bg-cyber-glow/10 border-cyber-glow shadow-cyber' 
                      : isCompleted 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-card/20 border-border/50'
                    }
                  `}
                >
                  <div className={`
                    relative flex items-center justify-center w-10 h-10 rounded-lg
                    ${isActive 
                      ? 'bg-cyber-glow/20' 
                      : isCompleted 
                        ? 'bg-green-500/20' 
                        : 'bg-card/50'
                    }
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Icon className={`
                        h-5 w-5 
                        ${isActive 
                          ? 'text-cyber-glow animate-pulse-glow' 
                          : isPending 
                            ? 'text-muted-foreground' 
                            : 'text-muted-foreground'
                        }
                      `} />
                    )}
                    
                    {isActive && (
                      <div className="absolute inset-0 animate-pulse-glow">
                        <div className="w-10 h-10 border-2 border-cyber-glow rounded-lg animate-pulse" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`
                        font-mono font-semibold text-sm
                        ${isActive 
                          ? 'text-cyber-glow' 
                          : isCompleted 
                            ? 'text-green-500' 
                            : 'text-muted-foreground'
                        }
                      `}>
                        {scanStage.name}
                      </span>
                      
                      {isActive && (
                        <Badge variant="outline" className="text-xs animate-pulse-glow border-cyber-glow text-cyber-glow">
                          ACTIVE
                        </Badge>
                      )}
                      
                      {isCompleted && (
                        <Badge className="text-xs bg-green-500 text-white">
                          COMPLETED
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {scanStage.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Stats */}
      <Card className="bg-card/30 border-cyber-glow/20">
        <CardHeader>
          <CardTitle className="text-lg font-cyber text-cyber-glow">
            Real-time Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-mono font-bold text-cyber-glow">
                {targetCount}
              </div>
              <div className="text-xs text-muted-foreground">Targets</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-mono font-bold text-green-500">
                {Math.min(Math.floor(progress / 12.5), targetCount)}
              </div>
              <div className="text-xs text-muted-foreground">Hosts Scanned</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-mono font-bold text-yellow-500">
                {Math.floor(progress / 2)}
              </div>
              <div className="text-xs text-muted-foreground">Ports Found</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-mono font-bold text-red-500">
                {Math.floor(progress / 10)}
              </div>
              <div className="text-xs text-muted-foreground">Vulnerabilities</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}