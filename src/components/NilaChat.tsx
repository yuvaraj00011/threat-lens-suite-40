import { useState } from "react"
import { Send, Paperclip, Bot, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { VoiceInput } from "@/components/ai/VoiceInput"
import { CaseAnalysisPanel } from "@/components/ai/CaseAnalysisPanel"
import { detectiveAI } from "@/lib/detectiveAI"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import nilaAvatar from "@/assets/nila-avatar.png"

interface Message {
  id: string
  content: string
  sender: 'user' | 'nila'
  timestamp: Date
  analysis?: any
}

interface NilaChatProps {
  onNewQuery?: (query: string) => void
  systemOnline?: boolean
}

export function NilaChat({ onNewQuery, systemOnline = true }: NilaChatProps = {}) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello Officer. I'm NILA, your AI Detective Assistant. Report any incident and I'll provide immediate analysis, investigation recommendations, and next steps. You can speak or type your report.",
      sender: 'nila',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null)

  const handleVoiceTranscription = (transcription: string) => {
    setInput(transcription);
    // Auto-send voice transcriptions for immediate analysis
    processMessage(transcription);
  }

  const processMessage = async (messageText: string) => {
    onNewQuery?.(messageText)
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsAnalyzing(true)

    // Analyze the case using detective AI
    try {
      const analysis = detectiveAI.analyzeCase(messageText);
      setCurrentAnalysis(analysis);
      
      // Generate detective response
      const response = generateDetectiveResponse(messageText, analysis);
      
      setTimeout(() => {
        const nilaResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: response,
          sender: 'nila',
          timestamp: new Date(),
          analysis: analysis
        }
        setMessages(prev => [...prev, nilaResponse])
        setIsAnalyzing(false)
        
        toast({
          title: "Case Analysis Complete",
          description: `${analysis.caseType.toUpperCase()} case analyzed - Priority: ${analysis.priority.toUpperCase()}`,
        });
      }, 2000)
    } catch (error) {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);
    }
  }

  const sendMessage = () => {
    if (!input.trim()) return
    processMessage(input)
  }

  const generateDetectiveResponse = (userInput: string, analysis: any): string => {
    const responses = [
      `**CASE ANALYSIS COMPLETE**\n\n**Classification:** ${analysis.caseType.replace('_', ' ').toUpperCase()}\n**Priority Level:** ${analysis.priority.toUpperCase()}\n\n`,
      
      analysis.riskFactors.length > 0 
        ? `⚠️ **CRITICAL ALERTS:**\n${analysis.riskFactors.map((risk: string) => `• ${risk}`).join('\n')}\n\n`
        : '',
        
      `**IMMEDIATE ACTIONS REQUIRED:**\n${analysis.nextSteps.slice(0, 3).map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}\n\n`,
      
      analysis.questions.length > 0 
        ? `**KEY QUESTIONS TO INVESTIGATE:**\n${analysis.questions.slice(0, 3).map((q: string) => `❓ ${q}`).join('\n')}\n\n`
        : '',
        
      analysis.digitalTrails.length > 0 
        ? `**DIGITAL EVIDENCE PATHS:**\n${analysis.digitalTrails.slice(0, 2).map((trail: string) => `🔍 ${trail}`).join('\n')}\n\n`
        : '',
        
      `I'm ready to assist with follow-up analysis. What additional information can you provide?`
    ].join('')

    return responses;
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Chat Interface */}
      <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm flex-1 flex flex-col">
        <CardHeader className="pb-3 border-b border-cyber-glow/20">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-cyber-glow/30 shadow-cyber">
              <AvatarImage src={nilaAvatar} alt="Nila AI" />
              <AvatarFallback className="bg-cyber-glow/10 text-cyber-glow font-cyber">
                N
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-cyber text-cyber-glow font-semibold">NILA AI</h3>
              <p className="text-xs text-muted-foreground font-mono">
                AI Investigation Assistant • Active
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {isAnalyzing && (
                <div className="flex items-center gap-1 text-xs text-accent font-mono">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  Analyzing...
                </div>
              )}
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse-glow" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-4">
          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto mb-4 pr-2">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div
                  className={`flex gap-3 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender === 'nila' && (
                    <Avatar className="w-8 h-8 border border-cyber-glow/30">
                      <AvatarImage src={nilaAvatar} alt="Nila" />
                      <AvatarFallback className="bg-cyber-glow/10 text-cyber-glow text-xs">
                        N
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`
                      max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-wrap
                      ${message.sender === 'user'
                        ? 'bg-cyber-glow/20 border border-cyber-glow/30 text-cyber-glow font-mono'
                        : 'bg-card/30 border border-muted text-foreground'
                      }
                    `}
                  >
                    {message.content}
                  </div>
                </div>
                
                {/* Show analysis panel for NILA responses with analysis */}
                {message.sender === 'nila' && message.analysis && (
                  <div className="ml-11">
                    <CaseAnalysisPanel analysis={message.analysis} isAnalyzing={false} />
                  </div>
                )}
              </div>
            ))}
            
            {/* Show analyzing state */}
            {isAnalyzing && (
              <div className="flex justify-start">
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 border border-cyber-glow/30">
                    <AvatarImage src={nilaAvatar} alt="Nila" />
                    <AvatarFallback className="bg-cyber-glow/10 text-cyber-glow text-xs">
                      N
                    </AvatarFallback>
                  </Avatar>
                  <CaseAnalysisPanel analysis={null} isAnalyzing={true} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Report incident details or ask investigation questions..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="pr-20 bg-card/30 border-cyber-glow/20 focus:border-cyber-glow/50 font-mono text-sm"
              />
              <div className="absolute right-1 top-1 flex gap-1">
                <VoiceInput 
                  onTranscription={handleVoiceTranscription}
                  isListening={isListening}
                  onToggleListening={() => setIsListening(!isListening)}
                />
              </div>
            </div>
            <Button 
              onClick={sendMessage}
              variant="cyber"
              size="icon"
              className="shadow-cyber"
              disabled={isAnalyzing}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}