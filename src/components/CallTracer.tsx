import { useState, useRef, useEffect } from "react"
import { 
  Phone, 
  Upload, 
  FileText, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Download, 
  Eye, 
  ChevronDown, 
  ChevronRight,
  ExternalLink,
  Clock,
  User,
  Server,
  Zap,
  RotateCcw,
  History,
  Calendar,
  Map,
  MapPin,
  Globe,
  Search,
  Filter,
  Wifi,
  Smartphone,
  Users,
  Database,
  AlertCircle,
  RefreshCw,
  PlayCircle
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { CallTracerSessionManager } from "./call-tracer/CallTracerSessionManager"

interface PhoneAnalysis {
  id: string
  number: string
  formattedNumber: string
  country: string
  countryCode: string
  carrier: string
  lineType: 'mobile' | 'landline' | 'voip' | 'toll-free' | 'premium'
  isValid: boolean
  riskScore: number
  riskLevel: 'verified' | 'suspicious' | 'high-risk' | 'scammer'
  location: {
    latitude?: number
    longitude?: number
    region?: string
    timezone?: string
  }
  osintData: {
    socialProfiles: Array<{
      platform: string
      username: string
      url: string
      verified: boolean
    }>
    publicRecords: Array<{
      source: string
      data: string
      confidence: number
    }>
  }
  carrierHistory: Array<{
    date: string
    carrier: string
    event: 'registered' | 'ported' | 'disconnected'
  }>
  scamReports: Array<{
    source: string
    reportDate: string
    category: string
    description: string
  }>
  flags: string[]
  lastUpdated: string
}

interface CallObservation {
  id: string
  sessionId: string
  phoneNumbers: PhoneAnalysis[]
  extractionSource: string
  timestamp: string
  metadata: {
    totalNumbers: number
    riskDistribution: Record<string, number>
    countries: string[]
    carriers: string[]
  }
}

interface CallTracerProps {
  isOpen: boolean
  onClose: () => void
}

// Mock data for demonstration
const generateMockPhoneAnalysis = (number: string): PhoneAnalysis => {
  const countries = ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'IN', 'CN', 'RU', 'NG']
  const carriers = ['Verizon', 'AT&T', 'T-Mobile', 'Sprint', 'Vodafone', 'EE', 'O2', 'Three']
  const riskLevels: Array<'verified' | 'suspicious' | 'high-risk' | 'scammer'> = ['verified', 'suspicious', 'high-risk', 'scammer']
  const lineTypes: Array<'mobile' | 'landline' | 'voip' | 'toll-free' | 'premium'> = ['mobile', 'landline', 'voip', 'toll-free', 'premium']
  
  const country = countries[Math.floor(Math.random() * countries.length)]
  const carrier = carriers[Math.floor(Math.random() * carriers.length)]
  const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)]
  const lineType = lineTypes[Math.floor(Math.random() * lineTypes.length)]
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    number,
    formattedNumber: `+1-${number.slice(0, 3)}-${number.slice(3, 6)}-${number.slice(6)}`,
    country,
    countryCode: country === 'US' ? '+1' : '+44',
    carrier,
    lineType,
    isValid: Math.random() > 0.1,
    riskScore: Math.floor(Math.random() * 100),
    riskLevel,
    location: {
      latitude: 40.7128 + (Math.random() - 0.5) * 20,
      longitude: -74.0060 + (Math.random() - 0.5) * 40,
      region: `${country} Region`,
      timezone: 'UTC-5'
    },
    osintData: {
      socialProfiles: Math.random() > 0.6 ? [{
        platform: 'LinkedIn',
        username: `user_${Math.random().toString(36).substr(2, 5)}`,
        url: 'https://linkedin.com/in/sample',
        verified: Math.random() > 0.5
      }] : [],
      publicRecords: []
    },
    carrierHistory: [{
      date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      carrier,
      event: 'registered'
    }],
    scamReports: riskLevel === 'scammer' ? [{
      source: 'ScamNum Database',
      reportDate: new Date().toISOString(),
      category: 'Phishing',
      description: 'Reported for suspicious activity'
    }] : [],
    flags: riskLevel === 'high-risk' || riskLevel === 'scammer' ? ['High Risk', 'Multiple Reports'] : [],
    lastUpdated: new Date().toISOString()
  }
}

export function CallTracer({ isOpen, onClose }: CallTracerProps) {
  const { toast } = useToast()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [inputText, setInputText] = useState("")
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneAnalysis[]>([])
  const [selectedNumber, setSelectedNumber] = useState<PhoneAnalysis | null>(null)
  const [filterRisk, setFilterRisk] = useState<string>("all")
  const [filterCarrier, setFilterCarrier] = useState<string>("all")
  const [filterCountry, setFilterCountry] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedNumbers, setSelectedNumbers] = useState<Set<string>>(new Set())
  const [currentSession, setCurrentSession] = useState<CallObservation | null>(null)
  const [sessions, setSessions] = useState<CallObservation[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [showMap, setShowMap] = useState(true)
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Phone number extraction regex
  const phoneRegex = /(?:\+?1[-.\s]?)?(?:\(?[2-9]\d{2}\)?[-.\s]?)?[2-9]\d{2}[-.\s]?\d{4}/g

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !isOpen) return

    // For demo purposes, we'll use a fallback visualization
    // In production, you would set: mapboxgl.accessToken = 'your-mapbox-token'
    
    if (!map.current && mapContainer.current) {
      try {
        // Note: This will fail without a token, but we'll handle it gracefully
        mapboxgl.accessToken = 'pk.demo' // Demo token that will fail gracefully
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [-98.5795, 39.8283], // Center of US
          zoom: 3
        })

        map.current.addControl(new mapboxgl.NavigationControl())
      } catch (error) {
        // Fallback: create a simple visual representation
        console.log('Map failed to load, using fallback visualization')
      }
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [isOpen])

  // Update map markers when phone numbers change
  useEffect(() => {
    if (!map.current || !phoneNumbers.length) return

    // Clear existing markers
    const markers = document.querySelectorAll('.mapboxgl-marker')
    markers.forEach(marker => marker.remove())

    // Add markers for each phone number with location
    phoneNumbers.forEach((phone) => {
      if (phone.location.latitude && phone.location.longitude) {
        const color = phone.riskLevel === 'scammer' ? '#ef4444' : 
                     phone.riskLevel === 'high-risk' ? '#f97316' :
                     phone.riskLevel === 'suspicious' ? '#eab308' : '#22c55e'

        const marker = new mapboxgl.Marker({ color })
          .setLngLat([phone.location.longitude, phone.location.latitude])
          .setPopup(new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <div class="font-semibold">${phone.formattedNumber}</div>
              <div class="text-sm text-gray-600">${phone.carrier} • ${phone.lineType}</div>
              <div class="text-sm">Risk: ${phone.riskScore}%</div>
            </div>
          `))
          .addTo(map.current!)

        // Add click handler to select number
        marker.getElement().addEventListener('click', () => {
          setSelectedNumber(phone)
        })
      }
    })
  }, [phoneNumbers])

  const extractPhoneNumbers = (text: string): string[] => {
    const matches = text.match(phoneRegex) || []
    const uniqueNumbers = Array.from(new Set(matches))
    return uniqueNumbers.filter(num => num.replace(/\D/g, '').length === 10)
  }

  const validatePhoneNumber = (number: string): boolean => {
    const cleaned = number.replace(/\D/g, '')
    return cleaned.length === 10 && /^[2-9]\d{2}[2-9]\d{6}$/.test(cleaned)
  }

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcessing(e.dataTransfer.files[0])
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    handleFileProcessing(file)
  }

  const handleFileProcessing = async (file: File) => {
    // Validate file type
    const allowedTypes = ['.txt', '.log', '.csv', '.json', '.eml', '.msg']
    const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    
    if (!allowedTypes.includes(fileExt)) {
      toast({
        title: "Unsupported File Type",
        description: "Please upload TXT, LOG, CSV, JSON, EML, or MSG files.",
        variant: "destructive"
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setInputText(content)
      handleAnalyzeNumbers(content, file.name)
    }
    reader.readAsText(file)
  }

  const handleAnalyzeNumbers = async (text?: string, fileName?: string) => {
    const analysisText = text || inputText
    if (!analysisText.trim()) {
      toast({
        title: "No Input",
        description: "Please enter text or upload a file containing phone numbers",
        variant: "destructive"
      })
      return
    }

    setIsAnalyzing(true)
    setAnalysisProgress(0)

    try {
      // Extract phone numbers
      const extractedNumbers = extractPhoneNumbers(analysisText)
      if (extractedNumbers.length === 0) {
        setIsAnalyzing(false)
        setAnalysisProgress(0)
        toast({
          title: "No Phone Numbers Found",
          description: "No valid phone numbers were detected in the provided text. Please check your input and try again.",
          variant: "destructive"
        })
        return
      }

      // Simulate analysis progress
      const progressSteps = [
        { progress: 20, message: "Extracting phone numbers..." },
        { progress: 40, message: "Validating numbers..." },
        { progress: 60, message: "Gathering OSINT data..." },
        { progress: 80, message: "Checking threat databases..." },
        { progress: 100, message: "Analysis complete" }
      ]

      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 800))
        setAnalysisProgress(step.progress)
        
        toast({
          title: "Analysis Progress",
          description: step.message,
          duration: 1000
        })
      }

      // Generate analysis results
      const analysisResults = extractedNumbers.map(generateMockPhoneAnalysis)
      setPhoneNumbers(analysisResults)

      // Create session
      const newSession: CallObservation = {
        id: Math.random().toString(36).substr(2, 9),
        sessionId: `session_${Date.now()}`,
        phoneNumbers: analysisResults,
        extractionSource: text ? 'uploaded_file' : 'manual_input',
        timestamp: new Date().toISOString(),
        metadata: {
          totalNumbers: analysisResults.length,
          riskDistribution: analysisResults.reduce((acc, phone) => {
            acc[phone.riskLevel] = (acc[phone.riskLevel] || 0) + 1
            return acc
          }, {} as Record<string, number>),
          countries: Array.from(new Set(analysisResults.map(p => p.country))),
          carriers: Array.from(new Set(analysisResults.map(p => p.carrier)))
        }
      }

      setCurrentSession(newSession)
      setSessions(prev => [newSession, ...prev])

      toast({
        title: "Analysis Complete",
        description: `Found and analyzed ${analysisResults.length} phone numbers`,
        duration: 3000
      })

    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "An error occurred during phone number analysis",
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
      setAnalysisProgress(0)
    }
  }

  const handleReset = () => {
    setPhoneNumbers([])
    setSelectedNumber(null)
    setInputText("")
    setCurrentSession(null)
    setFilterRisk("all")
    setFilterCarrier("all")
    
    // Clear map markers
    const markers = document.querySelectorAll('.mapboxgl-marker')
    markers.forEach(marker => marker.remove())
    
    toast({
      title: "Session Reset",
      description: "All data has been cleared. Ready for new analysis.",
      duration: 2000
    })
  }

  const handleExportResults = () => {
    if (phoneNumbers.length === 0) return

    const exportData = {
      session: currentSession,
      phoneNumbers,
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `call_tracer_results_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: "Results have been exported to JSON file",
      duration: 2000
    })
  }

  // Bulk selection handlers
  const handleSelectNumber = (numberId: string, isShiftClick: boolean = false) => {
    const newSelection = new Set(selectedNumbers)
    if (newSelection.has(numberId)) {
      newSelection.delete(numberId)
    } else {
      newSelection.add(numberId)
    }
    setSelectedNumbers(newSelection)
  }

  const handleSelectAll = () => {
    if (selectedNumbers.size === filteredNumbers.length) {
      setSelectedNumbers(new Set())
    } else {
      setSelectedNumbers(new Set(filteredNumbers.map(p => p.id)))
    }
  }

  // Enhanced filtering with search
  const filteredNumbers = phoneNumbers.filter(phone => {
    const riskMatch = filterRisk === "all" || phone.riskLevel === filterRisk
    const carrierMatch = filterCarrier === "all" || phone.carrier === filterCarrier
    const countryMatch = filterCountry === "all" || phone.country === filterCountry
    const searchMatch = searchQuery === "" || 
      phone.formattedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.carrier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.riskLevel.toLowerCase().includes(searchQuery.toLowerCase())
    
    return riskMatch && carrierMatch && countryMatch && searchMatch
  })

  // Enhanced export functionality
  const handleBulkExport = (format: 'csv' | 'pdf' | 'json') => {
    const dataToExport = selectedNumbers.size > 0 
      ? phoneNumbers.filter(p => selectedNumbers.has(p.id))
      : filteredNumbers

    if (dataToExport.length === 0) {
      toast({
        title: "No Data to Export",
        description: "Please select numbers or apply filters to export data.",
        variant: "destructive"
      })
      return
    }

    if (format === 'csv') {
      exportToCSV(dataToExport)
    } else if (format === 'json') {
      exportToJSON(dataToExport)
    } else if (format === 'pdf') {
      exportToPDF(dataToExport)
    }
  }

  const exportToCSV = (data: PhoneAnalysis[]) => {
    const headers = [
      'Phone Number', 'Country', 'Carrier', 'Line Type', 'Risk Level', 
      'Risk Score', 'Valid', 'Location', 'OSINT Profiles', 'Scam Reports'
    ]
    
    const csvContent = [
      headers.join(','),
      ...data.map(phone => [
        phone.formattedNumber,
        phone.country,
        phone.carrier,
        phone.lineType,
        phone.riskLevel,
        phone.riskScore,
        phone.isValid,
        phone.location.region || 'Unknown',
        phone.osintData.socialProfiles.length,
        phone.scamReports.length
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `call_tracer_export_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "CSV Export Complete",
      description: `Exported ${data.length} phone numbers to CSV`,
      duration: 2000
    })
  }

  const exportToJSON = (data: PhoneAnalysis[]) => {
    const exportData = {
      session: currentSession,
      phoneNumbers: data,
      exportedAt: new Date().toISOString(),
      exportType: 'bulk_selection'
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `call_tracer_export_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "JSON Export Complete",
      description: `Exported ${data.length} phone numbers to JSON`,
      duration: 2000
    })
  }

  const exportToPDF = (data: PhoneAnalysis[]) => {
    // For demo purposes, we'll export as a structured text file that could be converted to PDF
    const pdfContent = [
      'UCIIP Call Tracer Analysis Report',
      '=' .repeat(50),
      `Generated: ${new Date().toLocaleString()}`,
      `Session: ${currentSession?.sessionId || 'N/A'}`,
      `Total Numbers: ${data.length}`,
      '',
      'PHONE NUMBER ANALYSIS',
      '=' .repeat(30),
      '',
      ...data.map((phone, idx) => [
        `${idx + 1}. ${phone.formattedNumber}`,
        `   Country: ${phone.country} (${phone.countryCode})`,
        `   Carrier: ${phone.carrier} | Type: ${phone.lineType}`,
        `   Risk Level: ${phone.riskLevel.toUpperCase()} (${phone.riskScore}%)`,
        `   Location: ${phone.location.region || 'Unknown'}`,
        `   Valid: ${phone.isValid ? 'Yes' : 'No'}`,
        phone.osintData.socialProfiles.length > 0 ? `   OSINT: ${phone.osintData.socialProfiles.length} profiles found` : '',
        phone.scamReports.length > 0 ? `   ⚠️  SCAM REPORTS: ${phone.scamReports.length} reports` : '',
        phone.flags.length > 0 ? `   🚩 FLAGS: ${phone.flags.join(', ')}` : '',
        ''
      ].filter(Boolean).join('\n'))
    ].join('\n')

    const blob = new Blob([pdfContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `call_tracer_report_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Report Export Complete",
      description: `Exported detailed report for ${data.length} phone numbers`,
      duration: 2000
    })
  }

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'verified': return 'default'
      case 'suspicious': return 'secondary' 
      case 'high-risk': return 'destructive'
      case 'scammer': return 'destructive'
      default: return 'outline'
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'verified': return 'text-green-500'
      case 'suspicious': return 'text-yellow-500'
      case 'high-risk': return 'text-orange-500'
      case 'scammer': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] bg-card/95 backdrop-blur-sm border-cyber-glow/20">
        <DialogHeader className="border-b border-cyber-glow/20 pb-4">
          <DialogTitle className="text-2xl font-cyber text-cyber-glow flex items-center gap-3">
            <Phone className="h-6 w-6" />
            Call Tracer
            <Badge variant="outline" className="ml-auto border-cyber-glow text-cyber-glow">
              OSINT Analysis
            </Badge>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="ml-2 h-6 w-6 p-0 hover:bg-cyber-glow/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Enhanced Input Area with Drag & Drop */}
          <div className="mb-6 space-y-4 p-4 bg-card/30 rounded-lg border border-cyber-glow/10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Text Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Manual Text Input
                </label>
                <Textarea
                  placeholder="Paste phone numbers, call logs, or transcripts here. Supports plain text with phone numbers in various formats."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[120px] bg-background/50 border-cyber-glow/20 font-mono resize-none"
                />
                <div className="text-xs text-muted-foreground font-mono">
                  Character limit: {inputText.length.toLocaleString()}/10,000
                </div>
              </div>

              {/* File Upload with Drag & Drop */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  File Upload
                </label>
                <div
                  className={`
                    relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 min-h-[120px] flex flex-col justify-center
                    ${dragActive 
                      ? "border-cyber-glow bg-cyber-glow/10 shadow-cyber" 
                      : "border-cyber-glow/30 hover:border-cyber-glow/50 hover:bg-cyber-glow/5"
                    }
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".txt,.log,.csv,.json,.eml,.msg"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  <div className="space-y-2">
                    <div className="w-8 h-8 mx-auto bg-cyber-glow/10 rounded-full flex items-center justify-center">
                      <Upload className="h-4 w-4 text-cyber-glow" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Drop forensic files here
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        or <span className="text-cyber-glow">click to browse</span>
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      TXT, LOG, CSV, JSON, EML, MSG
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="border-cyber-glow/20 hover:bg-cyber-glow/10"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <Button
                onClick={() => handleAnalyzeNumbers()}
                disabled={isAnalyzing || !inputText.trim()}
                className="bg-cyber-glow hover:bg-cyber-glow/80 text-black font-medium"
              >
                {isAnalyzing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Analyze
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-destructive/20 hover:bg-destructive/10 text-destructive"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.log,.csv,.json"
              className="hidden"
            />

            {isAnalyzing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-cyber-glow" />
                  <span className="text-sm text-cyber-glow font-mono">Analyzing phone numbers...</span>
                </div>
                <Progress value={analysisProgress} className="h-2" />
              </div>
            )}

            {phoneNumbers.length > 0 && (
              <div className="space-y-4">
                {/* Search and Enhanced Filters */}
                <div className="flex gap-3 items-center">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search numbers, carriers, countries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-card/50 border-cyber-glow/20 font-mono"
                    />
                  </div>
                  
                  <Select value={filterRisk} onValueChange={setFilterRisk}>
                    <SelectTrigger className="w-40 bg-card/50 border-cyber-glow/20">
                      <SelectValue placeholder="Risk Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk Levels</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="suspicious">Suspicious</SelectItem>
                      <SelectItem value="high-risk">High Risk</SelectItem>
                      <SelectItem value="scammer">Known Scammer</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterCarrier} onValueChange={setFilterCarrier}>
                    <SelectTrigger className="w-40 bg-card/50 border-cyber-glow/20">
                      <SelectValue placeholder="Carrier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Carriers</SelectItem>
                      {Array.from(new Set(phoneNumbers.map(p => p.carrier))).map(carrier => (
                        <SelectItem key={carrier} value={carrier}>{carrier}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterCountry} onValueChange={setFilterCountry}>
                    <SelectTrigger className="w-40 bg-card/50 border-cyber-glow/20">
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {Array.from(new Set(phoneNumbers.map(p => p.country))).map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Bulk Operations Bar */}
                <div className="flex gap-3 items-center justify-between p-3 bg-card/20 rounded-lg border border-cyber-glow/10">
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleSelectAll}
                      variant="outline"
                      size="sm"
                      className="border-cyber-glow/20 hover:bg-cyber-glow/10"
                    >
                      {selectedNumbers.size === filteredNumbers.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    
                    {selectedNumbers.size > 0 && (
                      <div className="text-sm text-muted-foreground font-mono">
                        {selectedNumbers.size} selected
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {selectedNumbers.size > 0 && (
                      <>
                        <Button
                          onClick={() => handleBulkExport('csv')}
                          variant="outline"
                          size="sm"
                          className="border-cyber-glow/20 hover:bg-cyber-glow/10"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          CSV
                        </Button>
                        <Button
                          onClick={() => handleBulkExport('json')}
                          variant="outline"
                          size="sm"
                          className="border-cyber-glow/20 hover:bg-cyber-glow/10"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          JSON
                        </Button>
                        <Button
                          onClick={() => handleBulkExport('pdf')}
                          variant="outline"
                          size="sm"
                          className="border-cyber-glow/20 hover:bg-cyber-glow/10"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Report
                        </Button>
                      </>
                    )}
                    
                    <Button
                      onClick={() => handleBulkExport('json')}
                      variant="outline"
                      size="sm"
                      className="border-cyber-glow/20 hover:bg-cyber-glow/10"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export All
                    </Button>
                  </div>
                </div>

                {/* Results Summary */}
                <div className="text-sm text-muted-foreground font-mono">
                  Showing {filteredNumbers.length} of {phoneNumbers.length} numbers
                  {searchQuery && ` • Search: "${searchQuery}"`}
                  {filterRisk !== "all" && ` • Risk: ${filterRisk}`}
                  {filterCarrier !== "all" && ` • Carrier: ${filterCarrier}`}
                  {filterCountry !== "all" && ` • Country: ${filterCountry}`}
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex gap-4 h-[calc(100%-200px)]">
            {/* Session Manager Sidebar */}
            {sessions.length > 0 && (
              <div className="w-80">
                <CallTracerSessionManager 
                  sessions={sessions}
                  currentSession={currentSession || undefined}
                  onLoadSession={(session) => {
                    setCurrentSession(session)
                    setPhoneNumbers(session.phoneNumbers)
                    setSelectedNumbers(new Set())
                    setSelectedNumber(null)
                    toast({
                      title: "Session Loaded",
                      description: `Loaded ${session.phoneNumbers.length} phone numbers from session ${session.sessionId}`,
                      duration: 2000
                    })
                  }}
                  onDeleteSession={(sessionId) => {
                    setSessions(prev => prev.filter(s => s.id !== sessionId))
                    if (currentSession?.id === sessionId) {
                      setCurrentSession(null)
                      setPhoneNumbers([])
                      setSelectedNumbers(new Set())
                      setSelectedNumber(null)
                    }
                    toast({
                      title: "Session Deleted",
                      description: "Session has been removed from history",
                      duration: 2000
                    })
                  }}
                />
              </div>
            )}

            {/* Left Panel - Map */}
            <div className={sessions.length > 0 ? "flex-1" : "w-1/2"}>
              <Card className="h-full bg-card/30 border-cyber-glow/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-cyber text-cyber-glow flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Geographic Distribution
                    {phoneNumbers.length > 0 && (
                      <Badge variant="outline" className="ml-auto">
                        {phoneNumbers.filter(p => p.location.latitude).length} located
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                 <CardContent className="p-0 h-[calc(100%-80px)] relative">
                   <div 
                     ref={mapContainer} 
                     className="w-full h-full rounded-lg overflow-hidden bg-card/20"
                     style={{ minHeight: '400px' }}
                   />
                   {phoneNumbers.length === 0 && (
                     <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm rounded-lg">
                       <div className="text-center space-y-3">
                         <div className="relative">
                           <Map className="h-16 w-16 mx-auto text-muted-foreground" />
                           <div className="absolute inset-0 rounded-full border-2 border-cyber-glow/20 animate-pulse" />
                         </div>
                         <div>
                           <p className="text-muted-foreground font-mono text-lg font-semibold">Geographic Distribution</p>
                           <p className="text-muted-foreground/70 text-sm mt-1">
                             Upload or paste data containing phone numbers to see their locations plotted on the map
                           </p>
                         </div>
                       </div>
                     </div>
                   )}
                   {/* Fallback visualization when map fails to load */}
                   {phoneNumbers.length > 0 && (
                     <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-cyber-glow/20">
                       <div className="text-sm font-mono text-cyber-glow mb-2">Risk Distribution</div>
                       <div className="space-y-1">
                         {Object.entries(phoneNumbers.reduce((acc, phone) => {
                           acc[phone.riskLevel] = (acc[phone.riskLevel] || 0) + 1
                           return acc
                         }, {} as Record<string, number>)).map(([risk, count]) => (
                           <div key={risk} className="flex items-center gap-2 text-xs">
                             <div className={`w-2 h-2 rounded-full ${
                               risk === 'scammer' ? 'bg-red-500' :
                               risk === 'high-risk' ? 'bg-orange-500' :
                               risk === 'suspicious' ? 'bg-yellow-500' : 'bg-green-500'
                             }`} />
                             <span className="capitalize font-mono">{risk}: {count}</span>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                 </CardContent>
              </Card>
            </div>

            {/* Right Panel - Phone Numbers */}
            <div className="w-1/2">
              <Card className="h-full bg-card/30 border-cyber-glow/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-cyber text-cyber-glow flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Phone Number Analysis
                    {filteredNumbers.length > 0 && (
                      <Badge variant="outline" className="ml-auto">
                        {filteredNumbers.length} numbers
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 h-[calc(100%-80px)] overflow-auto">
                  {filteredNumbers.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <div className="relative">
                        <Phone className="h-16 w-16 mx-auto text-muted-foreground" />
                        <div className="absolute inset-0 rounded-full border-2 border-cyber-glow/20 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-muted-foreground font-mono text-lg font-semibold mb-2">
                          {phoneNumbers.length === 0 
                            ? "No phone numbers analyzed yet" 
                            : "No numbers match current filters"
                          }
                        </p>
                        {phoneNumbers.length === 0 && (
                          <p className="text-muted-foreground/70 text-sm max-w-md mx-auto">
                            Paste phone numbers, call logs, or transcripts in the input area above and click "Analyze" to begin your investigation.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    filteredNumbers.map((phone) => (
                      <Card 
                        key={phone.id}
                        className={`
                          cursor-pointer transition-all duration-200 border
                          ${selectedNumber?.id === phone.id
                            ? 'border-cyber-glow bg-cyber-glow/10 shadow-cyber'
                            : 'border-cyber-glow/20 hover:border-cyber-glow/50 hover:bg-card/50'
                          }
                        `}
                        onClick={() => setSelectedNumber(selectedNumber?.id === phone.id ? null : phone)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3 flex-1">
                              {/* Bulk Selection Checkbox */}
                              <div className="flex items-center pt-1">
                                <input
                                  type="checkbox"
                                  checked={selectedNumbers.has(phone.id)}
                                  onChange={(e) => {
                                    e.stopPropagation()
                                    handleSelectNumber(phone.id)
                                  }}
                                  className="h-4 w-4 text-cyber-glow bg-transparent border-cyber-glow/50 rounded focus:ring-cyber-glow focus:ring-2 cursor-pointer"
                                />
                              </div>
                              
                              <div className="flex-1">
                                <div className="font-mono font-semibold text-lg">
                                  {phone.formattedNumber}
                                </div>
                                <div className="text-sm text-muted-foreground font-mono">
                                  {phone.carrier} • {phone.lineType} • {phone.country}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                              <Badge variant={getRiskBadgeVariant(phone.riskLevel)}>
                                {phone.riskLevel}
                              </Badge>
                              <div className={`text-sm font-mono ${getRiskColor(phone.riskLevel)}`}>
                                Risk: {phone.riskScore}%
                              </div>
                            </div>
                          </div>

                          {phone.flags.length > 0 && (
                            <div className="flex gap-1 mb-3">
                              {phone.flags.map((flag, idx) => (
                                <Badge key={idx} variant="destructive" className="text-xs">
                                  {flag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Valid:</span> 
                              <CheckCircle className={`inline h-4 w-4 ml-1 ${phone.isValid ? 'text-green-500' : 'text-red-500'}`} />
                            </div>
                            <div>
                              <span className="text-muted-foreground">Location:</span> 
                              {phone.location.region || 'Unknown'}
                            </div>
                          </div>

                          {phone.osintData.socialProfiles.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-cyber-glow/20">
                              <div className="text-xs text-muted-foreground mb-2">OSINT Findings:</div>
                              <div className="flex gap-2">
                                {phone.osintData.socialProfiles.map((profile, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    <Users className="h-3 w-3 mr-1" />
                                    {profile.platform}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {phone.scamReports.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-red-500/20">
                              <div className="text-xs text-red-400 mb-2 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Scam Reports ({phone.scamReports.length})
                              </div>
                            </div>
                          )}

                          {/* Expanded Details */}
                          {selectedNumber?.id === phone.id && (
                            <Collapsible defaultOpen>
                              <CollapsibleContent>
                                <Separator className="my-4" />
                                <Tabs defaultValue="details" className="w-full">
                                  <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="details">Details</TabsTrigger>
                                    <TabsTrigger value="osint">OSINT</TabsTrigger>
                                    <TabsTrigger value="history">History</TabsTrigger>
                                    <TabsTrigger value="reports">Reports</TabsTrigger>
                                  </TabsList>
                                  
                                  <TabsContent value="details" className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <div className="text-muted-foreground">Country Code:</div>
                                        <div className="font-mono">{phone.countryCode}</div>
                                      </div>
                                      <div>
                                        <div className="text-muted-foreground">Timezone:</div>
                                        <div className="font-mono">{phone.location.timezone}</div>
                                      </div>
                                      <div>
                                        <div className="text-muted-foreground">Coordinates:</div>
                                        <div className="font-mono text-xs">
                                          {phone.location.latitude?.toFixed(4)}, {phone.location.longitude?.toFixed(4)}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-muted-foreground">Last Updated:</div>
                                        <div className="font-mono text-xs">
                                          {new Date(phone.lastUpdated).toLocaleString()}
                                        </div>
                                      </div>
                                    </div>
                                  </TabsContent>
                                  
                                  <TabsContent value="osint" className="space-y-3">
                                    {phone.osintData.socialProfiles.length > 0 ? (
                                      <div className="space-y-2">
                                        {phone.osintData.socialProfiles.map((profile, idx) => (
                                          <div key={idx} className="flex items-center justify-between p-2 bg-card/50 rounded">
                                            <div className="flex items-center gap-2">
                                              <Users className="h-4 w-4" />
                                              <span className="font-mono">{profile.platform}</span>
                                              <span className="text-muted-foreground">@{profile.username}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              {profile.verified && <CheckCircle className="h-4 w-4 text-green-500" />}
                                              <Button variant="ghost" size="sm">
                                                <ExternalLink className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-center text-muted-foreground py-4">
                                        No OSINT data found
                                      </div>
                                    )}
                                  </TabsContent>
                                  
                                  <TabsContent value="history" className="space-y-3">
                                    {phone.carrierHistory.map((event, idx) => (
                                      <div key={idx} className="flex items-center gap-3 p-2 bg-card/50 rounded">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex-1">
                                          <div className="font-mono text-sm">{event.event}</div>
                                          <div className="text-xs text-muted-foreground">
                                            {event.carrier} • {new Date(event.date).toLocaleDateString()}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </TabsContent>
                                  
                                  <TabsContent value="reports" className="space-y-3">
                                    {phone.scamReports.length > 0 ? (
                                      phone.scamReports.map((report, idx) => (
                                        <div key={idx} className="p-3 bg-red-500/10 border border-red-500/20 rounded">
                                          <div className="flex items-center gap-2 mb-2">
                                            <AlertTriangle className="h-4 w-4 text-red-400" />
                                            <span className="font-semibold text-red-400">{report.category}</span>
                                            <span className="text-xs text-muted-foreground ml-auto">
                                              {new Date(report.reportDate).toLocaleDateString()}
                                            </span>
                                          </div>
                                          <div className="text-sm">{report.description}</div>
                                          <div className="text-xs text-muted-foreground mt-1">
                                            Source: {report.source}
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-center text-muted-foreground py-4">
                                        No scam reports found
                                      </div>
                                    )}
                                  </TabsContent>
                                </Tabs>
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}