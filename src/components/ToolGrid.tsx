import { useState } from "react"
import { 
  Mail, 
  Phone, 
  Shield, 
  DollarSign, 
  Newspaper, 
  Smartphone, 
  Mic, 
  Lock, 
  Users, 
  FileCheck,
  Activity,
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmailChecker } from "./EmailChecker"
import { CallTracer } from "./CallTracer"
import { PhishingDetector } from "./PhishingDetector"
import { FakeNewsTracker } from "./FakeNewsTracker"
import { VoiceIdentifier } from "./VoiceIdentifier"
import { MoneyMapper } from "./MoneyMapper"
import { NMapScanner } from "./NMapScanner"
import { SecurityDashboard } from "./SecurityDashboard"
import { SocialMediaFinder } from "./SocialMediaFinder"
import { SafeDocumentHandlerModal } from "./SafeDocumentHandlerModal"
import { UViewDashboard } from "./UViewDashboard"

const tools = [
  {
    id: 'email-checker',
    name: 'Email Checker',
    icon: Mail,
    description: 'Analyze email security',
    color: 'cyber-glow'
  },
  {
    id: 'call-tracer',
    name: 'Call Tracer',
    icon: Phone,
    description: 'Trace phone numbers',
    color: 'cyber-glow-secondary'
  },
  {
    id: 'phishing-detector',
    name: 'Phishing Detector',
    icon: Shield,
    description: 'URL threat analysis & detection',
    color: 'cyber-warning'
  },
  {
    id: 'money-mapper',
    name: 'Money Mapper',
    icon: DollarSign,
    description: 'Track financial flows',
    color: 'cyber-glow'
  },
  {
    id: 'fake-news-tracker',
    name: 'Fake News Tracker',
    icon: Newspaper,
    description: 'Verify information accuracy',
    color: 'cyber-glow-secondary'
  },
  {
    id: 'nmap-scanner',
    name: 'N-Map',
    icon: Activity,
    description: 'Network vulnerability scanner',
    color: 'cyber-glow'
  },
  {
    id: 'voice-identifier',
    name: 'Voice Identifier',
    icon: Mic,
    description: 'Match voice recordings',
    color: 'cyber-warning'
  },
  {
    id: 'ai-security',
    name: 'AI Security System',
    icon: Lock,
    description: 'Monitor system security',
    color: 'cyber-danger'
  },
  {
    id: 'social-media-finder',
    name: 'Social Media Finder',
    icon: Users,
    description: 'Find linked social accounts',
    color: 'cyber-glow-secondary'
  },
  {
    id: 'document-handler',
    name: 'Safe Document Handler',
    icon: FileCheck,
    description: 'Advanced malware detection & document security scanning',
    color: 'cyber-glow',
    component: 'SafeDocumentHandler'
  }
]

interface ToolGridProps {
  activatedTools?: string[]
}

export function ToolGrid({ activatedTools = [] }: ToolGridProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [isEmailCheckerOpen, setIsEmailCheckerOpen] = useState(false)
  const [isCallTracerOpen, setIsCallTracerOpen] = useState(false)
  const [isPhishingDetectorOpen, setIsPhishingDetectorOpen] = useState(false)
  const [isFakeNewsTrackerOpen, setIsFakeNewsTrackerOpen] = useState(false)
  const [isVoiceIdentifierOpen, setIsVoiceIdentifierOpen] = useState(false)
  const [isMoneyMapperOpen, setIsMoneyMapperOpen] = useState(false)
  const [isNMapScannerOpen, setIsNMapScannerOpen] = useState(false)
  const [isSecurityDashboardOpen, setIsSecurityDashboardOpen] = useState(false)
  const [isSocialMediaFinderOpen, setIsSocialMediaFinderOpen] = useState(false)
  const [isSafeDocumentHandlerOpen, setIsSafeDocumentHandlerOpen] = useState(false)
  const [isUViewDashboardOpen, setIsUViewDashboardOpen] = useState(false)

  const isToolActive = (toolId: string) => activatedTools.includes(toolId)
  
  const handleToolClick = (toolId: string) => {
    if (toolId === 'email-checker') {
      setIsEmailCheckerOpen(true)
    } else if (toolId === 'call-tracer') {
      setIsCallTracerOpen(true)
    } else if (toolId === 'phishing-detector') {
      setIsPhishingDetectorOpen(true)
    } else if (toolId === 'fake-news-tracker') {
      setIsFakeNewsTrackerOpen(true)
    } else if (toolId === 'voice-identifier') {
      setIsVoiceIdentifierOpen(true)
    } else if (toolId === 'money-mapper') {
      setIsMoneyMapperOpen(true)
    } else if (toolId === 'nmap-scanner') {
      setIsNMapScannerOpen(true)
    } else if (toolId === 'ai-security') {
      setIsSecurityDashboardOpen(true)
    } else if (toolId === 'social-media-finder') {
      setIsSocialMediaFinderOpen(true)
    } else if (toolId === 'document-handler') {
      setIsSafeDocumentHandlerOpen(true)
    } else {
      setSelectedTool(selectedTool === toolId ? null : toolId)
      console.log(`Opening ${toolId} module...`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-cyber-glow" />
        <h3 className="text-lg font-semibold text-cyber-glow font-cyber">
          Investigation Tools
        </h3>
        {activatedTools.length > 0 && (
          <span className="ml-auto text-sm text-accent font-mono">
            {activatedTools.length} tools activated
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {tools.map((tool) => {
          const isActive = isToolActive(tool.name)
          const isSelected = selectedTool === tool.id
          const Icon = tool.icon

          return (
            <Card
              key={tool.id}
              className={`
                relative group cursor-pointer transition-all duration-300 overflow-hidden
                ${isActive 
                  ? 'bg-cyber-glow/10 border-cyber-glow shadow-cyber animate-pulse-glow' 
                  : 'bg-card/30 border-cyber-glow/20 hover:border-cyber-glow/50 hover:shadow-cyber'
                }
                ${isSelected ? 'scale-105 shadow-cyber-strong' : ''}
              `}
              onClick={() => handleToolClick(tool.id)}
            >
              <CardContent className="p-4 text-center space-y-3">
                <div className={`
                  w-12 h-12 mx-auto rounded-lg flex items-center justify-center transition-all duration-300
                  ${isActive 
                    ? 'bg-cyber-glow/20 shadow-cyber' 
                    : 'bg-card/50 group-hover:bg-cyber-glow/10'
                  }
                `}>
                  <Icon className={`
                    h-6 w-6 transition-all duration-300
                    ${isActive 
                      ? 'text-cyber-glow animate-pulse-glow' 
                      : 'text-muted-foreground group-hover:text-cyber-glow'
                    }
                  `} />
                </div>
                
                <div className="space-y-1">
                  <h4 className={`
                    text-sm font-medium font-mono transition-colors duration-300
                    ${isActive 
                      ? 'text-cyber-glow' 
                      : 'text-foreground group-hover:text-cyber-glow'
                    }
                  `}>
                    {tool.name}
                  </h4>
                  <p className="text-xs text-muted-foreground font-mono leading-tight">
                    {tool.description}
                  </p>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full animate-pulse-glow" />
                )}

                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyber-glow/0 via-cyber-glow/5 to-cyber-glow/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* U-View Button - Shows when tools are activated */}
      {activatedTools.length > 0 && (
        <div className="text-center py-6">
          <Button
            onClick={() => setIsUViewDashboardOpen(true)}
            className="bg-gradient-to-r from-cyber-glow to-cyber-glow-secondary hover:from-cyber-glow/80 hover:to-cyber-glow-secondary/80 text-background font-cyber text-lg px-8 py-6 h-auto rounded-xl shadow-cyber transition-all duration-300 hover:scale-105"
          >
            <Eye className="h-6 w-6 mr-2" />
            U-View: Unified Case Analysis
            <Activity className="h-5 w-5 ml-2 animate-pulse" />
          </Button>
          <p className="text-muted-foreground font-mono text-sm mt-2">
            View consolidated results from all {activatedTools.length} activated tools
          </p>
        </div>
      )}

      {activatedTools.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground font-mono text-sm">
            Upload a data dump above to activate relevant investigation tools
          </p>
        </div>
      )}

      {/* Email Checker Modal */}
      <EmailChecker 
        isOpen={isEmailCheckerOpen} 
        onClose={() => setIsEmailCheckerOpen(false)} 
      />
      
      {/* Call Tracer Modal */}
      <CallTracer 
        isOpen={isCallTracerOpen} 
        onClose={() => setIsCallTracerOpen(false)} 
      />
      
      {/* Phishing Detector Modal */}
      <PhishingDetector 
        isOpen={isPhishingDetectorOpen} 
        onClose={() => setIsPhishingDetectorOpen(false)} 
      />
      
      {/* Fake News Tracker Modal */}
      <FakeNewsTracker 
        isOpen={isFakeNewsTrackerOpen} 
        onClose={() => setIsFakeNewsTrackerOpen(false)} 
      />
      
      {/* Voice Identifier Modal */}
      <VoiceIdentifier 
        isOpen={isVoiceIdentifierOpen} 
        onClose={() => setIsVoiceIdentifierOpen(false)} 
      />
      
      {/* Money Mapper Modal */}
      <MoneyMapper 
        isOpen={isMoneyMapperOpen} 
        onClose={() => setIsMoneyMapperOpen(false)} 
      />
      
      {/* N-Map Scanner Modal */}
      <NMapScanner 
        isOpen={isNMapScannerOpen} 
        onClose={() => setIsNMapScannerOpen(false)} 
      />
      
      {/* Security Dashboard Modal */}
      <SecurityDashboard 
        isOpen={isSecurityDashboardOpen} 
        onClose={() => setIsSecurityDashboardOpen(false)} 
      />
      
      {/* Social Media Finder Modal */}
      <SocialMediaFinder 
        isOpen={isSocialMediaFinderOpen} 
        onClose={() => setIsSocialMediaFinderOpen(false)} 
      />
      
      {/* Safe Document Handler Modal */}
      <SafeDocumentHandlerModal 
        isOpen={isSafeDocumentHandlerOpen} 
        onClose={() => setIsSafeDocumentHandlerOpen(false)} 
      />
      
      {/* U-View Dashboard Modal */}
      <UViewDashboard 
        isOpen={isUViewDashboardOpen} 
        onClose={() => setIsUViewDashboardOpen(false)} 
      />
    </div>
  )
}