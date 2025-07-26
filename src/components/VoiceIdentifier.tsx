import { useState, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Mic, 
  Upload, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Users, 
  Activity,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  BarChart3,
  Clock,
  Brain,
  Zap,
  Eye,
  History,
  X,
  Info
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AudioFile {
  id: string
  name: string
  size: number
  duration: number
  format: string
  uploadedAt: Date
  file?: File
}

interface Speaker {
  id: string
  name: string
  confidence: number
  segments: Array<{
    start: number
    end: number
    confidence: number
  }>
  characteristics: {
    pitch: number
    frequency: number
    stress: number
    accent?: string
    dialect?: string
  }
  authenticity: number
  emotional_state: string[]
}

interface AnalysisResult {
  id: string
  audioFile: AudioFile
  speakers: Speaker[]
  totalSpeakers: number
  processingStages: {
    normalization: boolean
    voiceActivity: boolean
    segmentation: boolean
    voiceprint: boolean
    matching: boolean
    analysis: boolean
  }
  timeline: Array<{
    start: number
    end: number
    speakerId: string
    confidence: number
  }>
  createdAt: Date
}

interface VoiceIdentifierProps {
  isOpen: boolean
  onClose: () => void
}

export function VoiceIdentifier({ isOpen, onClose }: VoiceIdentifierProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [currentSession, setCurrentSession] = useState<AnalysisResult | null>(null)
  const [history, setHistory] = useState<AnalysisResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("upload")
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleReset = useCallback(() => {
    setCurrentSession(null)
    setIsProcessing(false)
    setProcessingProgress(0)
    setActiveTab("upload")
    setSelectedSpeaker(null)
    setIsPlaying(false)
    setCurrentTime(0)
    setError(null)
    toast({
      title: "Session Reset",
      description: "Voice Identifier has been reset to start a new scan.",
    })
  }, [toast])

  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    const file = files[0]
    if (!file) return

    const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg']
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a WAV or MP3 audio file.")
      return
    }

    setError(null)
    setIsProcessing(true)
    setActiveTab("processing")

    const audioFile: AudioFile = {
      id: `audio_${Date.now()}`,
      name: file.name,
      size: file.size,
      duration: 0, // Will be calculated
      format: file.type,
      uploadedAt: new Date(),
      file
    }

    // Simulate processing stages
    const stages = [
      { key: 'normalization', label: 'WAV Normalization', duration: 1500 },
      { key: 'voiceActivity', label: 'Voice Activity Detection', duration: 2000 },
      { key: 'segmentation', label: 'Speaker Segmentation', duration: 2500 },
      { key: 'voiceprint', label: 'Voiceprint Extraction', duration: 3000 },
      { key: 'matching', label: 'Pattern Matching', duration: 2000 },
      { key: 'analysis', label: 'Forensic Analysis', duration: 2500 }
    ]

    const processingStages = {
      normalization: false,
      voiceActivity: false,
      segmentation: false,
      voiceprint: false,
      matching: false,
      analysis: false
    }

    let progress = 0
    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, stage.duration))
      processingStages[stage.key as keyof typeof processingStages] = true
      progress += 100 / stages.length
      setProcessingProgress(progress)
    }

    // Generate mock analysis results
    const mockSpeakers: Speaker[] = [
      {
        id: 'speaker_1',
        name: 'Speaker 1',
        confidence: 94.2,
        segments: [
          { start: 0, end: 15.3, confidence: 96.1 },
          { start: 32.1, end: 45.8, confidence: 91.7 }
        ],
        characteristics: {
          pitch: 180,
          frequency: 2400,
          stress: 32,
          accent: 'North American',
          dialect: 'General American'
        },
        authenticity: 97.8,
        emotional_state: ['calm', 'confident']
      },
      {
        id: 'speaker_2',
        name: 'Speaker 2',
        confidence: 87.6,
        segments: [
          { start: 15.3, end: 32.1, confidence: 89.2 },
          { start: 45.8, end: 60.0, confidence: 85.4 }
        ],
        characteristics: {
          pitch: 220,
          frequency: 2100,
          stress: 68,
          accent: 'British',
          dialect: 'Received Pronunciation'
        },
        authenticity: 92.1,
        emotional_state: ['stressed', 'uncertain']
      }
    ]

    const result: AnalysisResult = {
      id: `analysis_${Date.now()}`,
      audioFile,
      speakers: mockSpeakers,
      totalSpeakers: mockSpeakers.length,
      processingStages,
      timeline: [
        { start: 0, end: 15.3, speakerId: 'speaker_1', confidence: 96.1 },
        { start: 15.3, end: 32.1, speakerId: 'speaker_2', confidence: 89.2 },
        { start: 32.1, end: 45.8, speakerId: 'speaker_1', confidence: 91.7 },
        { start: 45.8, end: 60.0, speakerId: 'speaker_2', confidence: 85.4 }
      ],
      createdAt: new Date()
    }

    setCurrentSession(result)
    setHistory(prev => [result, ...prev])
    setIsProcessing(false)
    setActiveTab("results")

    toast({
      title: "Analysis Complete",
      description: `Detected ${mockSpeakers.length} speakers with ${Math.round(mockSpeakers.reduce((sum, s) => sum + s.confidence, 0) / mockSpeakers.length)}% average confidence.`,
    })
  }, [toast])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const handleExport = useCallback(() => {
    if (!currentSession) return

    const reportData = {
      analysis_id: currentSession.id,
      audio_file: currentSession.audioFile.name,
      timestamp: currentSession.createdAt.toISOString(),
      speakers_detected: currentSession.totalSpeakers,
      speakers: currentSession.speakers.map(speaker => ({
        id: speaker.id,
        confidence: speaker.confidence,
        segments: speaker.segments,
        characteristics: speaker.characteristics,
        authenticity: speaker.authenticity,
        emotional_state: speaker.emotional_state
      })),
      timeline: currentSession.timeline
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `voice_analysis_${currentSession.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Report Exported",
      description: "Forensic analysis report has been downloaded.",
    })
  }, [currentSession, toast])

  const loadHistorySession = useCallback((session: AnalysisResult) => {
    setCurrentSession(session)
    setActiveTab("results")
    toast({
      title: "Session Loaded",
      description: `Loaded analysis from ${session.createdAt.toLocaleDateString()}.`,
    })
  }, [toast])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] bg-card border-cyber-glow/20">
        <DialogHeader className="border-b border-cyber-glow/20 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyber-warning/20">
                <Mic className="h-6 w-6 text-cyber-warning animate-pulse-glow" />
              </div>
              <div>
                <DialogTitle className="text-xl font-cyber text-cyber-glow">
                  Voice Identifier
                </DialogTitle>
                <p className="text-sm text-muted-foreground font-mono">
                  Advanced speaker recognition & forensic analysis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentSession && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="border-cyber-warning/20 text-cyber-warning hover:bg-cyber-warning/10"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Scan
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 bg-card/30 border border-cyber-glow/20">
              <TabsTrigger value="upload" className="data-[state=active]:bg-cyber-glow/20">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="processing" disabled={!isProcessing && !currentSession}>
                <Activity className="h-4 w-4 mr-2" />
                Processing
              </TabsTrigger>
              <TabsTrigger value="results" disabled={!currentSession}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Results
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="upload" className="h-full">
                <div className="h-full flex items-center justify-center">
                  <Card className="w-full max-w-2xl bg-card/30 border-cyber-glow/20">
                    <CardContent className="p-8">
                      <div
                        className={`
                          border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 cursor-pointer
                          ${dragActive 
                            ? 'border-cyber-glow bg-cyber-glow/10' 
                            : 'border-cyber-glow/30 hover:border-cyber-glow/60 hover:bg-cyber-glow/5'
                          }
                        `}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <FileAudio className="h-16 w-16 mx-auto mb-4 text-cyber-glow/60" />
                        <h3 className="text-lg font-semibold mb-2 text-cyber-glow">
                          Upload Audio File
                        </h3>
                        <p className="text-muted-foreground mb-4 font-mono text-sm">
                          Drag and drop your audio file here, or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          Supported formats: WAV, MP3 • Max size: 100MB
                        </p>
                        
                        {error && (
                          <Alert className="mt-4 border-red-500/20 bg-red-500/10">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-red-400">{error}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".wav,.mp3,.mpeg"
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="processing" className="h-full">
                <div className="h-full flex items-center justify-center">
                  <Card className="w-full max-w-2xl bg-card/30 border-cyber-glow/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-cyber-glow">
                        <Brain className="h-5 w-5 animate-pulse-glow" />
                        Processing Audio
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground font-mono">Overall Progress</span>
                          <span className="text-cyber-glow font-mono">{Math.round(processingProgress)}%</span>
                        </div>
                        <Progress value={processingProgress} className="h-2" />
                      </div>

                      {currentSession && (
                        <div className="space-y-3">
                          {Object.entries(currentSession.processingStages).map(([key, completed]) => (
                            <div key={key} className="flex items-center gap-3">
                              {completed ? (
                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-cyber-glow/30 animate-pulse" />
                              )}
                              <span className={`font-mono text-sm ${completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {key === 'normalization' && 'WAV Normalization'}
                                {key === 'voiceActivity' && 'Voice Activity Detection'}
                                {key === 'segmentation' && 'Speaker Segmentation'}
                                {key === 'voiceprint' && 'Voiceprint Extraction'}
                                {key === 'matching' && 'Pattern Matching'}
                                {key === 'analysis' && 'Forensic Analysis'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="results" className="h-full">
                {currentSession ? (
                  <div className="h-full flex gap-4">
                    {/* Main Results Panel */}
                    <div className="flex-1 space-y-4">
                      {/* Summary Cards */}
                      <div className="grid grid-cols-4 gap-4">
                        <Card className="bg-card/30 border-cyber-glow/20">
                          <CardContent className="p-4 text-center">
                            <Users className="h-8 w-8 mx-auto mb-2 text-cyber-glow" />
                            <div className="text-2xl font-bold text-cyber-glow">
                              {currentSession.totalSpeakers}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              Speakers Detected
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-card/30 border-cyber-glow/20">
                          <CardContent className="p-4 text-center">
                            <Activity className="h-8 w-8 mx-auto mb-2 text-cyber-glow" />
                            <div className="text-2xl font-bold text-cyber-glow">
                              {Math.round(currentSession.speakers.reduce((sum, s) => sum + s.confidence, 0) / currentSession.speakers.length)}%
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              Avg. Confidence
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-card/30 border-cyber-glow/20">
                          <CardContent className="p-4 text-center">
                            <Zap className="h-8 w-8 mx-auto mb-2 text-cyber-glow" />
                            <div className="text-2xl font-bold text-cyber-glow">
                              {Math.round(currentSession.speakers.reduce((sum, s) => sum + s.authenticity, 0) / currentSession.speakers.length)}%
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              Authenticity
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-card/30 border-cyber-glow/20">
                          <CardContent className="p-4 text-center">
                            <Clock className="h-8 w-8 mx-auto mb-2 text-cyber-glow" />
                            <div className="text-2xl font-bold text-cyber-glow">
                              {currentSession.timeline.length}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              Segments
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Waveform Visualization */}
                      <Card className="bg-card/30 border-cyber-glow/20">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-cyber-glow">
                            <Activity className="h-5 w-5" />
                            Audio Timeline
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-32 bg-black/20 rounded-lg relative overflow-hidden">
                            {/* Mock waveform */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full h-full flex items-end justify-around px-4">
                                {Array.from({ length: 50 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className="bg-cyber-glow/60 w-1 transition-all duration-200"
                                    style={{
                                      height: `${Math.random() * 80 + 20}%`,
                                      filter: 'drop-shadow(0 0 2px hsl(var(--cyber-glow)))'
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                            
                            {/* Speaker segments overlay */}
                            <div className="absolute inset-0">
                              {currentSession.timeline.map((segment, index) => (
                                <div
                                  key={index}
                                  className={`absolute top-0 h-full opacity-30 ${
                                    segment.speakerId === 'speaker_1' ? 'bg-blue-500' : 'bg-green-500'
                                  }`}
                                  style={{
                                    left: `${(segment.start / 60) * 100}%`,
                                    width: `${((segment.end - segment.start) / 60) * 100}%`
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsPlaying(!isPlaying)}
                              className="border-cyber-glow/20"
                            >
                              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <div className="flex-1">
                              <Progress value={(currentTime / 60) * 100} className="h-2" />
                            </div>
                            <span className="text-sm font-mono text-muted-foreground">
                              {Math.floor(currentTime)}s / 60s
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Export Controls */}
                      <div className="flex gap-2">
                        <Button
                          onClick={handleExport}
                          className="bg-cyber-glow/20 border-cyber-glow/20 text-cyber-glow hover:bg-cyber-glow/30"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export Report
                        </Button>
                        <Button variant="outline" className="border-cyber-glow/20">
                          <Eye className="h-4 w-4 mr-2" />
                          Chain to Social Media Finder
                        </Button>
                      </div>
                    </div>

                    {/* Speaker Details Sidebar */}
                    <div className="w-80">
                      <Card className="bg-card/30 border-cyber-glow/20 h-full">
                        <CardHeader>
                          <CardTitle className="text-cyber-glow">Speaker Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-[500px]">
                            <div className="space-y-4">
                              {currentSession.speakers.map((speaker) => (
                                <Card
                                  key={speaker.id}
                                  className={`cursor-pointer transition-all duration-200 ${
                                    selectedSpeaker?.id === speaker.id
                                      ? 'bg-cyber-glow/20 border-cyber-glow'
                                      : 'bg-card/50 border-cyber-glow/20 hover:border-cyber-glow/50'
                                  }`}
                                  onClick={() => setSelectedSpeaker(speaker)}
                                >
                                  <CardContent className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-semibold text-cyber-glow">{speaker.name}</h4>
                                      <Badge variant="secondary" className="bg-cyber-glow/20 text-cyber-glow">
                                        {speaker.confidence.toFixed(1)}%
                                      </Badge>
                                    </div>
                                    
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Authenticity:</span>
                                        <span className="text-foreground">{speaker.authenticity.toFixed(1)}%</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Segments:</span>
                                        <span className="text-foreground">{speaker.segments.length}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Accent:</span>
                                        <span className="text-foreground">{speaker.characteristics.accent}</span>
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1">
                                      {speaker.emotional_state.map((emotion) => (
                                        <Badge key={emotion} variant="outline" className="text-xs">
                                          {emotion}
                                        </Badge>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground font-mono">No analysis results available.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="h-full">
                <div className="h-full">
                  <Card className="bg-card/30 border-cyber-glow/20 h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-cyber-glow">
                        <History className="h-5 w-5" />
                        Analysis History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[600px]">
                        {history.length > 0 ? (
                          <div className="space-y-4">
                            {history.map((session) => (
                              <Card
                                key={session.id}
                                className="cursor-pointer transition-all duration-200 bg-card/50 border-cyber-glow/20 hover:border-cyber-glow/50 hover:bg-cyber-glow/5"
                                onClick={() => loadHistorySession(session)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-foreground">
                                      {session.audioFile.name}
                                    </h4>
                                    <Badge variant="secondary" className="bg-cyber-glow/20 text-cyber-glow">
                                      {session.totalSpeakers} speakers
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground space-y-1">
                                    <p>Analyzed: {session.createdAt.toLocaleDateString()} at {session.createdAt.toLocaleTimeString()}</p>
                                    <p>Duration: {session.audioFile.duration || 60}s • Format: {session.audioFile.format}</p>
                                    <p>Avg. Confidence: {Math.round(session.speakers.reduce((sum, s) => sum + s.confidence, 0) / session.speakers.length)}%</p>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <FileAudio className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                            <p className="text-muted-foreground font-mono">No previous analyses found.</p>
                            <p className="text-sm text-muted-foreground/60 font-mono mt-2">
                              Complete your first voice analysis to see history here.
                            </p>
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}