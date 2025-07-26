import { useState, useCallback, useRef } from "react"
import { Upload, Shield, AlertTriangle, Download, Eye, FileText, CheckCircle, XCircle, Brain, Zap, AlertCircle, Trash2, FileCheck, Search, Filter, 
         Camera, Edit3, Code, History, Target, UserCheck, Globe, MessageSquare, Calendar, Database, Microscope, FileImage,
         ScanLine, ShieldCheck, MapPin, Timer, Layers, Palette, Languages, FileX, Archive, Lock, Unlock, PaintBucket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface ScanFile {
  id: string
  name: string
  size: number
  type: string
  uploadTime: string
  status: 'uploading' | 'scanning' | 'safe' | 'suspicious' | 'malicious' | 'quarantined'
  progress: number
  riskScore: number
  threats: ThreatDetection[]
  metadata: FileMetadata
  scanResults: ScanResults
  ocrResults?: OCRResults
  macroAnalysis?: MacroAnalysis
  versionHistory?: VersionHistory
  annotations: Annotation[]
  threatIntel?: ThreatIntelligence
  redactionData?: RedactionData
  customRuleMatches: CustomRuleMatch[]
  fontAnalysis?: FontAnalysis
  isPreviewable?: boolean
  sanitizedVersion?: string
}

interface ThreatDetection {
  type: string
  name: string
  confidence: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  details: string[]
  yaraRule?: string
  signature?: string
}

interface FileMetadata {
  author?: string
  created?: string
  modified?: string
  digitalSignature?: {
    valid: boolean
    issuer?: string
    trusted: boolean
  }
  embeddedObjects: number
  macros: boolean
  scripts: boolean
}

interface ScanResults {
  signatureScan: {
    completed: boolean
    threatsFound: number
    lastUpdate: string
  }
  steganography: {
    completed: boolean
    hiddenData: boolean
    extractedFiles: string[]
  }
  sandbox: {
    completed: boolean
    suspicious: boolean
    behaviors: string[]
  }
  mlClassification: {
    completed: boolean
    riskScore: number
    category: string
  }
}

interface OCRResults {
  extractedText: string
  confidence: number
  language: string
  keywords: string[]
  mismatchDetected: boolean
}

interface MacroAnalysis {
  hasVBA: boolean
  macroCode: string
  riskBehaviors: string[]
  obfuscated: boolean
  canSanitize: boolean
}

interface VersionHistory {
  versions: Array<{
    author: string
    timestamp: string
    changes: string[]
  }>
  anomalies: string[]
  lastEditor: string
  editCount: number
}

interface Annotation {
  id: string
  text: string
  timestamp: string
  author: string
  type: 'note' | 'flag' | 'link'
  position?: { x: number; y: number }
  linkedCaseId?: string
}

interface ThreatIntelligence {
  virusTotalScore: number
  knownCampaigns: string[]
  malwareFamily?: string
  cves: string[]
  lastSeenDate?: string
  reputation: 'clean' | 'suspicious' | 'malicious'
}

interface RedactionData {
  redactedRegions: Array<{
    x: number
    y: number
    width: number
    height: number
    type: 'text' | 'image'
  }>
  sanitizedContent: string
}

interface CustomRuleMatch {
  ruleId: string
  ruleName: string
  matchedContent: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  action: 'alert' | 'quarantine' | 'tag'
}

interface FontAnalysis {
  embeddedFonts: string[]
  unicodeAnomalies: string[]
  homographAttacks: string[]
  hiddenText: boolean
  encoding: string
}

interface ScanOptions {
  enableOCR: boolean
  enableDeepMacroAnalysis: boolean
  enableThreatIntel: boolean
  enableVersionTracking: boolean
  enableFontAnalysis: boolean
  enableCustomRules: boolean
  enableScheduling: boolean
}

const SUPPORTED_FORMATS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.rtf', '.txt', '.zip', '.rar', '.7z'
]

export function SafeDocumentHandler() {
  const [files, setFiles] = useState<ScanFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFile, setSelectedFile] = useState<ScanFile | null>(null)
  const [scanOptions, setScanOptions] = useState<ScanOptions>({
    enableOCR: false,
    enableDeepMacroAnalysis: false,
    enableThreatIntel: false,
    enableVersionTracking: false,
    enableFontAnalysis: false,
    enableCustomRules: false,
    enableScheduling: false
  })
  const [activeTab, setActiveTab] = useState("files")
  const [customRules, setCustomRules] = useState<Array<{id: string, name: string, pattern: string, type: 'regex' | 'yara', severity: string}>>([])
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [scheduledScans, setScheduledScans] = useState<Array<{id: string, name: string, schedule: string, enabled: boolean}>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (uploadedFiles: File[]) => {
    const validFiles = uploadedFiles.filter(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase()
      return SUPPORTED_FORMATS.includes(ext)
    })

    if (validFiles.length !== uploadedFiles.length) {
      toast({
        title: "Unsupported files detected",
        description: `Only ${SUPPORTED_FORMATS.join(', ')} files are supported`,
        variant: "destructive"
      })
    }

    validFiles.forEach(file => {
      const scanFile: ScanFile = {
        id: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type || 'unknown',
        uploadTime: new Date().toISOString(),
        status: 'uploading',
        progress: 0,
        riskScore: 0,
        threats: [],
        metadata: {
          embeddedObjects: 0,
          macros: false,
          scripts: false
        },
        scanResults: {
          signatureScan: { completed: false, threatsFound: 0, lastUpdate: '' },
          steganography: { completed: false, hiddenData: false, extractedFiles: [] },
          sandbox: { completed: false, suspicious: false, behaviors: [] },
          mlClassification: { completed: false, riskScore: 0, category: '' }
        },
        annotations: [],
        customRuleMatches: [],
        isPreviewable: ['pdf', 'txt', 'doc', 'docx'].some(ext => file.name.toLowerCase().endsWith(ext))
      }

      setFiles(prev => [...prev, scanFile])
      startScanPipeline(scanFile, file)
    })

    toast({
      title: "Files uploaded",
      description: `${validFiles.length} file(s) uploaded and scanning started`,
    })
  }

  const startScanPipeline = async (scanFile: ScanFile, file: File) => {
    // Stage 1: Upload and Metadata Analysis
    updateFileProgress(scanFile.id, 10, 'scanning')
    await simulateMetadataAnalysis(scanFile, file)

    // Stage 2: OCR Processing (if enabled)
    if (scanOptions.enableOCR) {
      updateFileProgress(scanFile.id, 15, 'scanning')
      await simulateOCRProcessing(scanFile)
    }

    // Stage 3: Signature-based scanning
    updateFileProgress(scanFile.id, 25, 'scanning')
    await simulateSignatureScan(scanFile)

    // Stage 4: Deep Macro Analysis (if enabled)
    if (scanOptions.enableDeepMacroAnalysis) {
      updateFileProgress(scanFile.id, 35, 'scanning')
      await simulateMacroAnalysis(scanFile)
    }

    // Stage 5: Font & Language Analysis (if enabled)
    if (scanOptions.enableFontAnalysis) {
      updateFileProgress(scanFile.id, 45, 'scanning')
      await simulateFontAnalysis(scanFile)
    }

    // Stage 6: Steganography detection
    updateFileProgress(scanFile.id, 55, 'scanning')
    await simulateSteganographyDetection(scanFile)

    // Stage 7: Version History Analysis (if enabled)
    if (scanOptions.enableVersionTracking) {
      updateFileProgress(scanFile.id, 65, 'scanning')
      await simulateVersionAnalysis(scanFile)
    }

    // Stage 8: Custom Rules Check (if enabled)
    if (scanOptions.enableCustomRules) {
      updateFileProgress(scanFile.id, 70, 'scanning')
      await simulateCustomRulesCheck(scanFile)
    }

    // Stage 9: Sandbox execution
    updateFileProgress(scanFile.id, 80, 'scanning')
    await simulateSandboxAnalysis(scanFile)

    // Stage 10: ML classification
    updateFileProgress(scanFile.id, 85, 'scanning')
    await simulateMLClassification(scanFile)

    // Stage 11: Threat Intelligence (if enabled)
    if (scanOptions.enableThreatIntel) {
      updateFileProgress(scanFile.id, 95, 'scanning')
      await simulateThreatIntelEnrichment(scanFile)
    }

    // Final assessment
    updateFileProgress(scanFile.id, 100, determineFileStatus(scanFile))
  }

  // Simulation functions for all advanced features
  const simulateOCRProcessing = async (scanFile: ScanFile) => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const ocrResults: OCRResults = {
      extractedText: "Sample extracted text from OCR processing...",
      confidence: Math.floor(Math.random() * 40) + 60,
      language: Math.random() > 0.5 ? "English" : "Mixed",
      keywords: ["confidential", "payment", "account", "password"],
      mismatchDetected: Math.random() > 0.8
    }

    if (ocrResults.mismatchDetected) {
      const threat: ThreatDetection = {
        type: 'OCR Fraud Detection',
        name: 'Content Mismatch',
        confidence: 75,
        severity: 'medium',
        description: 'Mismatch between visible and extracted text detected',
        details: ['Hidden text differs from visible content', 'Potential document fraud'],
      }
      
      setFiles(prev => prev.map(f => 
        f.id === scanFile.id ? { 
          ...f, 
          threats: [...f.threats, threat],
          ocrResults
        } : f
      ))
    } else {
      setFiles(prev => prev.map(f => 
        f.id === scanFile.id ? { ...f, ocrResults } : f
      ))
    }
  }

  const simulateMacroAnalysis = async (scanFile: ScanFile) => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const hasVBA = Math.random() > 0.7
    if (hasVBA) {
      const macroAnalysis: MacroAnalysis = {
        hasVBA: true,
        macroCode: `Sub AutoOpen()\n    Shell "cmd.exe /c calc.exe"\n    MsgBox "Document loaded"\nEnd Sub`,
        riskBehaviors: ['System shell execution', 'Registry modification attempts', 'File system access'],
        obfuscated: Math.random() > 0.6,
        canSanitize: Math.random() > 0.3
      }

      const threat: ThreatDetection = {
        type: 'Macro Analysis',
        name: 'Suspicious VBA Code',
        confidence: 88,
        severity: macroAnalysis.obfuscated ? 'high' : 'medium',
        description: 'Potentially malicious VBA macro detected',
        details: macroAnalysis.riskBehaviors,
      }
      
      setFiles(prev => prev.map(f => 
        f.id === scanFile.id ? { 
          ...f, 
          threats: [...f.threats, threat],
          macroAnalysis
        } : f
      ))
    }
  }

  const simulateFontAnalysis = async (scanFile: ScanFile) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const fontAnalysis: FontAnalysis = {
      embeddedFonts: ['CustomFont.ttf', 'Arial.ttf'],
      unicodeAnomalies: Math.random() > 0.8 ? ['Cyrillic characters in Latin text'] : [],
      homographAttacks: Math.random() > 0.9 ? ['Domain spoofing detected: раураl.com'] : [],
      hiddenText: Math.random() > 0.85,
      encoding: 'UTF-8'
    }

    if (fontAnalysis.homographAttacks.length > 0 || fontAnalysis.hiddenText) {
      const threat: ThreatDetection = {
        type: 'Font Analysis',
        name: 'Suspicious Font Usage',
        confidence: 72,
        severity: 'medium',
        description: 'Suspicious font or encoding patterns detected',
        details: [...fontAnalysis.homographAttacks, ...(fontAnalysis.hiddenText ? ['Hidden text detected'] : [])],
      }
      
      setFiles(prev => prev.map(f => 
        f.id === scanFile.id ? { 
          ...f, 
          threats: [...f.threats, threat],
          fontAnalysis
        } : f
      ))
    } else {
      setFiles(prev => prev.map(f => 
        f.id === scanFile.id ? { ...f, fontAnalysis } : f
      ))
    }
  }

  const simulateVersionAnalysis = async (scanFile: ScanFile) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const versionHistory: VersionHistory = {
      versions: [
        { author: 'John Doe', timestamp: '2024-01-15T10:30:00Z', changes: ['Initial creation'] },
        { author: 'Unknown', timestamp: '2024-01-20T15:45:00Z', changes: ['Content modification', 'Metadata changes'] }
      ],
      anomalies: Math.random() > 0.7 ? ['Recent modification with old content timestamps'] : [],
      lastEditor: 'Unknown',
      editCount: 15
    }

    if (versionHistory.anomalies.length > 0) {
      const threat: ThreatDetection = {
        type: 'Version Analysis',
        name: 'Document Tampering',
        confidence: 68,
        severity: 'medium',
        description: 'Suspicious version history detected',
        details: versionHistory.anomalies,
      }
      
      setFiles(prev => prev.map(f => 
        f.id === scanFile.id ? { 
          ...f, 
          threats: [...f.threats, threat],
          versionHistory
        } : f
      ))
    } else {
      setFiles(prev => prev.map(f => 
        f.id === scanFile.id ? { ...f, versionHistory } : f
      ))
    }
  }

  const simulateCustomRulesCheck = async (scanFile: ScanFile) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const matches: CustomRuleMatch[] = []
    
    customRules.forEach(rule => {
      if (Math.random() > 0.8) {
        matches.push({
          ruleId: rule.id,
          ruleName: rule.name,
          matchedContent: `Pattern match found in ${scanFile.name}`,
          severity: rule.severity as any,
          action: 'alert'
        })
      }
    })

    if (matches.length > 0) {
      const threats = matches.map(match => ({
        type: 'Custom Rule',
        name: match.ruleName,
        confidence: 90,
        severity: match.severity,
        description: 'Custom rule violation detected',
        details: [match.matchedContent],
      }))
      
      setFiles(prev => prev.map(f => 
        f.id === scanFile.id ? { 
          ...f, 
          threats: [...f.threats, ...threats],
          customRuleMatches: matches
        } : f
      ))
    }
  }

  const simulateThreatIntelEnrichment = async (scanFile: ScanFile) => {
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    const virusTotalScore = Math.floor(Math.random() * 100)
    const threatIntel: ThreatIntelligence = {
      virusTotalScore,
      knownCampaigns: Math.random() > 0.8 ? ['APT29 Campaign', 'Lazarus Group'] : [],
      malwareFamily: Math.random() > 0.9 ? 'Emotet' : undefined,
      cves: Math.random() > 0.85 ? ['CVE-2024-1234', 'CVE-2024-5678'] : [],
      lastSeenDate: Math.random() > 0.7 ? '2024-01-15' : undefined,
      reputation: virusTotalScore > 70 ? 'malicious' : virusTotalScore > 30 ? 'suspicious' : 'clean'
    }

    if (threatIntel.reputation !== 'clean') {
      const threat: ThreatDetection = {
        type: 'Threat Intelligence',
        name: 'Known Threat',
        confidence: threatIntel.virusTotalScore,
        severity: threatIntel.reputation === 'malicious' ? 'critical' : 'high',
        description: 'File matches known threat indicators',
        details: [
          ...(threatIntel.knownCampaigns.length > 0 ? [`Linked to: ${threatIntel.knownCampaigns.join(', ')}`] : []),
          ...(threatIntel.malwareFamily ? [`Malware family: ${threatIntel.malwareFamily}`] : []),
          ...(threatIntel.cves.length > 0 ? [`CVEs: ${threatIntel.cves.join(', ')}`] : [])
        ],
      }
      
      setFiles(prev => prev.map(f => 
        f.id === scanFile.id ? { 
          ...f, 
          threats: [...f.threats, threat],
          threatIntel
        } : f
      ))
    } else {
      setFiles(prev => prev.map(f => 
        f.id === scanFile.id ? { ...f, threatIntel } : f
      ))
    }
  }

  const simulateMetadataAnalysis = async (scanFile: ScanFile, file: File) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const metadata: FileMetadata = {
      author: Math.random() > 0.5 ? "Unknown Author" : "System User",
      created: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      modified: new Date().toISOString(),
      digitalSignature: {
        valid: Math.random() > 0.3,
        issuer: Math.random() > 0.5 ? "VeriSign" : undefined,
        trusted: Math.random() > 0.7
      },
      embeddedObjects: Math.floor(Math.random() * 5),
      macros: Math.random() > 0.8,
      scripts: Math.random() > 0.9
    }

    setFiles(prev => prev.map(f => 
      f.id === scanFile.id ? { ...f, metadata } : f
    ))
  }

  const simulateSignatureScan = async (scanFile: ScanFile) => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const threats: ThreatDetection[] = []
    const fileName = scanFile.name.toLowerCase()
    
    // Simulate finding threats based on filename patterns
    if (fileName.includes('malware') || fileName.includes('virus')) {
      threats.push({
        type: 'Malware',
        name: 'Win32.GenKryptik.ABCD',
        confidence: 95,
        severity: 'critical',
        description: 'Known malware signature detected',
        details: ['YARA rule: malware_family_xyz', 'First seen: 2024-01-15', 'Threat family: Trojan'],
        yaraRule: 'rule_malware_detection_v1.2',
        signature: 'SHA256:abc123...'
      })
    }

    if (fileName.includes('phish') || fileName.includes('scam')) {
      threats.push({
        type: 'Phishing',
        name: 'Generic.Phishing.Document',
        confidence: 87,
        severity: 'high',
        description: 'Document contains phishing indicators',
        details: ['Suspicious URLs detected', 'Credential harvesting forms', 'Social engineering patterns'],
        yaraRule: 'rule_phishing_detection_v2.1'
      })
    }

    const scanResults = {
      ...scanFile.scanResults,
      signatureScan: {
        completed: true,
        threatsFound: threats.length,
        lastUpdate: new Date().toISOString()
      }
    }

    setFiles(prev => prev.map(f => 
      f.id === scanFile.id ? { ...f, threats, scanResults } : f
    ))
  }

  const simulateSteganographyDetection = async (scanFile: ScanFile) => {
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    const hiddenData = Math.random() > 0.8
    const extractedFiles = hiddenData ? ['hidden_payload.exe', 'secret_data.txt'] : []
    
    if (hiddenData) {
      const threat: ThreatDetection = {
        type: 'Steganography',
        name: 'Hidden Data Detected',
        confidence: 82,
        severity: 'medium',
        description: 'Steganographic content found in document',
        details: extractedFiles.map(f => `Extracted: ${f}`),
      }
      
      setFiles(prev => prev.map(f => 
        f.id === scanFile.id ? { 
          ...f, 
          threats: [...f.threats, threat],
          scanResults: {
            ...f.scanResults,
            steganography: { completed: true, hiddenData, extractedFiles }
          }
        } : f
      ))
    } else {
      setFiles(prev => prev.map(f => 
        f.id === scanFile.id ? { 
          ...f,
          scanResults: {
            ...f.scanResults,
            steganography: { completed: true, hiddenData: false, extractedFiles: [] }
          }
        } : f
      ))
    }
  }

  const simulateSandboxAnalysis = async (scanFile: ScanFile) => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const suspicious = Math.random() > 0.7
    const behaviors = suspicious ? [
      'Attempted registry modification',
      'Network connection to suspicious IP',
      'File system enumeration'
    ] : ['Normal document behavior']
    
    if (suspicious) {
      const threat: ThreatDetection = {
        type: 'Suspicious Behavior',
        name: 'Sandbox Alert',
        confidence: 75,
        severity: 'medium',
        description: 'Suspicious behavior detected in sandbox',
        details: behaviors,
      }
      
      setFiles(prev => prev.map(f => 
        f.id === scanFile.id ? { 
          ...f, 
          threats: [...f.threats, threat],
          scanResults: {
            ...f.scanResults,
            sandbox: { completed: true, suspicious, behaviors }
          }
        } : f
      ))
    } else {
      setFiles(prev => prev.map(f => 
        f.id === scanFile.id ? { 
          ...f,
          scanResults: {
            ...f.scanResults,
            sandbox: { completed: true, suspicious: false, behaviors }
          }
        } : f
      ))
    }
  }

  const simulateMLClassification = async (scanFile: ScanFile) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const riskScore = Math.floor(Math.random() * 100)
    const category = riskScore > 70 ? 'High Risk' : riskScore > 40 ? 'Medium Risk' : 'Low Risk'
    
    if (riskScore > 70) {
      const threat: ThreatDetection = {
        type: 'ML Classification',
        name: 'High Risk Document',
        confidence: riskScore,
        severity: 'high',
        description: 'Machine learning model flagged as high risk',
        details: ['Anomalous file structure', 'Suspicious content patterns', 'Evasion techniques detected'],
      }
      
      setFiles(prev => prev.map(f => 
        f.id === scanFile.id ? { 
          ...f, 
          threats: [...f.threats, threat],
          riskScore,
          scanResults: {
            ...f.scanResults,
            mlClassification: { completed: true, riskScore, category }
          }
        } : f
      ))
    } else {
      setFiles(prev => prev.map(f => 
        f.id === scanFile.id ? { 
          ...f,
          riskScore,
          scanResults: {
            ...f.scanResults,
            mlClassification: { completed: true, riskScore, category }
          }
        } : f
      ))
    }
  }

  const determineFileStatus = (scanFile: ScanFile): ScanFile['status'] => {
    const criticalThreats = scanFile.threats.filter(t => t.severity === 'critical')
    const highThreats = scanFile.threats.filter(t => t.severity === 'high')
    
    if (criticalThreats.length > 0) return 'malicious'
    if (highThreats.length > 0 || scanFile.riskScore > 70) return 'suspicious'
    return 'safe'
  }

  const updateFileProgress = (fileId: string, progress: number, status?: ScanFile['status']) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, progress, ...(status && { status }) } : f
    ))
  }

  const getStatusBadge = (status: ScanFile['status']) => {
    switch (status) {
      case 'safe':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Safe</Badge>
      case 'suspicious':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Suspicious</Badge>
      case 'malicious':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Malicious</Badge>
      case 'quarantined':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Quarantined</Badge>
      case 'scanning':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Scanning</Badge>
      default:
        return <Badge className="bg-muted/20 text-muted-foreground border-muted/30">Uploading</Badge>
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400'
      case 'high': return 'text-orange-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-muted-foreground'
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-400'
    if (score >= 40) return 'text-yellow-400'
    return 'text-green-400'
  }

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || file.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const quarantineFile = (fileId: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'quarantined' as const } : f
    ))
    toast({
      title: "File quarantined",
      description: "File has been moved to quarantine",
    })
  }

  const downloadFile = (file: ScanFile) => {
    if (file.status === 'safe') {
      toast({
        title: "Download started",
        description: `Downloading ${file.name}`,
      })
    } else if (file.sanitizedVersion) {
      toast({
        title: "Sanitized version downloaded",
        description: `Downloading cleaned version of ${file.name}`,
      })
    } else {
      toast({
        title: "Download blocked",
        description: "Cannot download unsafe files",
        variant: "destructive"
      })
    }
  }

  const deleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
    if (selectedFile?.id === fileId) {
      setSelectedFile(null)
    }
    toast({
      title: "File deleted",
      description: "File has been removed",
    })
  }

  const addAnnotation = (fileId: string, text: string, type: 'note' | 'flag' | 'link') => {
    const annotation: Annotation = {
      id: `ann-${Date.now()}`,
      text,
      timestamp: new Date().toISOString(),
      author: 'Current User',
      type
    }

    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, annotations: [...f.annotations, annotation] } : f
    ))

    toast({
      title: "Annotation added",
      description: "Note has been saved to file",
    })
  }

  const addCustomRule = (name: string, pattern: string, type: 'regex' | 'yara', severity: string) => {
    const rule = {
      id: `rule-${Date.now()}`,
      name,
      pattern,
      type,
      severity
    }
    setCustomRules(prev => [...prev, rule])
    toast({
      title: "Custom rule added",
      description: `Rule "${name}" has been created`,
    })
  }

  const addScheduledScan = (name: string, schedule: string) => {
    const scan = {
      id: `sched-${Date.now()}`,
      name,
      schedule,
      enabled: true
    }
    setScheduledScans(prev => [...prev, scan])
    toast({
      title: "Scheduled scan created",
      description: `Scan "${name}" scheduled for ${schedule}`,
    })
  }

  const exportResults = () => {
    const data = {
      exportTime: new Date().toISOString(),
      totalFiles: files.length,
      safeFiles: files.filter(f => f.status === 'safe').length,
      suspiciousFiles: files.filter(f => f.status === 'suspicious').length,
      maliciousFiles: files.filter(f => f.status === 'malicious').length,
      files: files.map(f => ({
        name: f.name,
        status: f.status,
        riskScore: f.riskScore,
        threats: f.threats.length,
        scanResults: f.scanResults,
        annotations: f.annotations.length,
        customRuleMatches: f.customRuleMatches.length
      }))
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `document-scan-results-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Results exported",
      description: "Scan results have been exported as JSON",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header with Advanced Options */}
      <Card className="border-cyber-glow/20 bg-background/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyber-glow/20 border border-cyber-glow/30">
                <Shield className="h-6 w-6 text-cyber-glow" />
              </div>
              <div>
                <CardTitle className="text-cyber-glow font-cyber">Safe Document Handler</CardTitle>
                <p className="text-sm text-muted-foreground">Advanced malware detection with AI-powered analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-cyber-glow/30">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Scan Options
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Advanced Scan Options</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="ocr" 
                          checked={scanOptions.enableOCR}
                          onCheckedChange={(checked) => setScanOptions(prev => ({...prev, enableOCR: checked}))}
                        />
                        <Label htmlFor="ocr" className="flex items-center gap-2">
                          <ScanLine className="h-4 w-4" />
                          OCR & Text Indexing
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="macro" 
                          checked={scanOptions.enableDeepMacroAnalysis}
                          onCheckedChange={(checked) => setScanOptions(prev => ({...prev, enableDeepMacroAnalysis: checked}))}
                        />
                        <Label htmlFor="macro" className="flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          Deep Macro Analysis
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="intel" 
                          checked={scanOptions.enableThreatIntel}
                          onCheckedChange={(checked) => setScanOptions(prev => ({...prev, enableThreatIntel: checked}))}
                        />
                        <Label htmlFor="intel" className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Threat Intelligence
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="version" 
                          checked={scanOptions.enableVersionTracking}
                          onCheckedChange={(checked) => setScanOptions(prev => ({...prev, enableVersionTracking: checked}))}
                        />
                        <Label htmlFor="version" className="flex items-center gap-2">
                          <History className="h-4 w-4" />
                          Version Tracking
                        </Label>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="font" 
                          checked={scanOptions.enableFontAnalysis}
                          onCheckedChange={(checked) => setScanOptions(prev => ({...prev, enableFontAnalysis: checked}))}
                        />
                        <Label htmlFor="font" className="flex items-center gap-2">
                          <Languages className="h-4 w-4" />
                          Font & Language Analysis
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="rules" 
                          checked={scanOptions.enableCustomRules}
                          onCheckedChange={(checked) => setScanOptions(prev => ({...prev, enableCustomRules: checked}))}
                        />
                        <Label htmlFor="rules" className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Custom Rules
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="schedule" 
                          checked={scanOptions.enableScheduling}
                          onCheckedChange={(checked) => setScanOptions(prev => ({...prev, enableScheduling: checked}))}
                        />
                        <Label htmlFor="schedule" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Batch Scheduling
                        </Label>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={exportResults} variant="outline" size="sm" className="border-cyber-glow/30">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 bg-background/50 border-cyber-glow/20">
          <TabsTrigger value="files" className="data-[state=active]:bg-cyber-glow/20">
            <FileText className="h-4 w-4 mr-2" />
            Files
          </TabsTrigger>
          <TabsTrigger value="preview" className="data-[state=active]:bg-cyber-glow/20">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="rules" className="data-[state=active]:bg-cyber-glow/20">
            <Target className="h-4 w-4 mr-2" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="schedule" className="data-[state=active]:bg-cyber-glow/20">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="analysis" className="data-[state=active]:bg-cyber-glow/20">
            <Brain className="h-4 w-4 mr-2" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="intel" className="data-[state=active]:bg-cyber-glow/20">
            <Globe className="h-4 w-4 mr-2" />
            Threat Intel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          {/* Upload Zone */}
          <Card 
            className={`border-dashed border-2 transition-all duration-300 ${
              dragActive 
                ? 'border-cyber-glow bg-cyber-glow/5 shadow-lg shadow-cyber-glow/20' 
                : 'border-cyber-glow/30 hover:border-cyber-glow/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="p-4 rounded-full bg-cyber-glow/20 mb-4">
                <Upload className="h-8 w-8 text-cyber-glow" />
              </div>
              <h3 className="text-lg font-semibold text-cyber-glow mb-2">
                Upload Documents for Analysis
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Drag and drop files here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Supported: {SUPPORTED_FORMATS.join(', ')}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={SUPPORTED_FORMATS.join(',')}
                onChange={handleFileInput}
                className="hidden"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-cyber-glow hover:bg-cyber-glow/80 text-dark"
              >
                <Upload className="h-4 w-4 mr-2" />
                Select Files
              </Button>
            </CardContent>
          </Card>

          {/* File Management Controls */}
          {files.length > 0 && (
            <Card className="border-cyber-glow/20 bg-background/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex gap-2 flex-wrap">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search files..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-background/50 border-cyber-glow/30"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40 bg-background/50 border-cyber-glow/30">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Files</SelectItem>
                        <SelectItem value="safe">Safe</SelectItem>
                        <SelectItem value="suspicious">Suspicious</SelectItem>
                        <SelectItem value="malicious">Malicious</SelectItem>
                        <SelectItem value="quarantined">Quarantined</SelectItem>
                        <SelectItem value="scanning">Scanning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const selectedFilesToQuarantine = files.filter(f => selectedFiles.includes(f.id))
                        selectedFilesToQuarantine.forEach(f => quarantineFile(f.id))
                        setSelectedFiles([])
                      }}
                      disabled={selectedFiles.length === 0}
                      className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Quarantine Selected
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        selectedFiles.forEach(id => deleteFile(id))
                        setSelectedFiles([])
                      }}
                      disabled={selectedFiles.length === 0}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Files Grid */}
          <div className="grid gap-4">
            {filteredFiles.map(file => (
              <Card 
                key={file.id} 
                className={`border-cyber-glow/20 bg-background/80 backdrop-blur hover:border-cyber-glow/40 transition-all cursor-pointer ${
                  selectedFiles.includes(file.id) ? 'ring-2 ring-cyber-glow/50' : ''
                }`}
                onClick={() => setSelectedFile(file)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox 
                        checked={selectedFiles.includes(file.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedFiles(prev => [...prev, file.id])
                          } else {
                            setSelectedFiles(prev => prev.filter(id => id !== file.id))
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                        <FileText className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-cyber-glow truncate">{file.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          <span>{new Date(file.uploadTime).toLocaleTimeString()}</span>
                          <span className={getRiskScoreColor(file.riskScore)}>
                            Risk: {file.riskScore}%
                          </span>
                          {file.threats.length > 0 && (
                            <span className="text-red-400">{file.threats.length} threat(s)</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(file.status)}
                      {file.status === 'scanning' && (
                        <div className="w-24">
                          <Progress value={file.progress} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress and Actions */}
                  {file.status !== 'scanning' && (
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex gap-2">
                        {file.status === 'safe' && (
                          <Button size="sm" onClick={(e) => { e.stopPropagation(); downloadFile(file) }}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
                        {file.sanitizedVersion && (
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); downloadFile(file) }}>
                            <FileCheck className="h-4 w-4 mr-2" />
                            Download Clean
                          </Button>
                        )}
                        {file.isPreviewable && (
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setIsPreviewMode(true) }}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={(e) => { e.stopPropagation(); quarantineFile(file.id) }}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Quarantine
                        </Button>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={(e) => { e.stopPropagation(); deleteFile(file.id) }}
                        className="text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Threat Summary */}
                  {file.threats.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <h5 className="text-sm font-medium text-red-400">Detected Threats:</h5>
                      {file.threats.slice(0, 3).map((threat, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <AlertTriangle className={`h-4 w-4 ${getSeverityColor(threat.severity)}`} />
                          <span className="text-muted-foreground">{threat.name}</span>
                          <Badge variant="outline" className={getSeverityColor(threat.severity)}>
                            {threat.severity}
                          </Badge>
                        </div>
                      ))}
                      {file.threats.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{file.threats.length - 3} more threats
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card className="border-cyber-glow/20 bg-background/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Secure Document Preview & Redaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedFile && selectedFile.isPreviewable ? (
                <div className="space-y-4">
                  <Alert>
                    <ShieldCheck className="h-4 w-4" />
                    <AlertDescription>
                      Preview mode is secure - all scripts, links, and macros are disabled.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="border border-cyber-glow/20 rounded-lg p-4 min-h-96 bg-background/50">
                    <div className="text-center text-muted-foreground">
                      <FileImage className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Secure preview of: {selectedFile.name}</p>
                      <p className="text-sm mt-2">Document content would be displayed here with all active elements disabled</p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline">
                      <PaintBucket className="h-4 w-4 mr-2" />
                      Redaction Tool
                    </Button>
                    <Button variant="outline">
                      <Lock className="h-4 w-4 mr-2" />
                      Disable Macros
                    </Button>
                    <Button variant="outline">
                      <FileCheck className="h-4 w-4 mr-2" />
                      Create Sanitized Copy
                    </Button>
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Add Annotation
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <FileX className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Select a previewable file to view in secure mode</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card className="border-cyber-glow/20 bg-background/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Custom Rules & Watchlist Engine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Create New Rule</h4>
                  <div className="space-y-2">
                    <Input placeholder="Rule name" />
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Rule type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regex">Regex Pattern</SelectItem>
                        <SelectItem value="yara">YARA Rule</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea placeholder="Rule pattern or YARA code" />
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => addCustomRule("Sample Rule", "/pattern/", "regex", "medium")}>
                      <Target className="h-4 w-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Active Rules ({customRules.length})</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {customRules.map(rule => (
                      <div key={rule.id} className="border border-cyber-glow/20 rounded p-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">{rule.name}</h5>
                          <Badge variant="outline" className={getSeverityColor(rule.severity)}>
                            {rule.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{rule.type}</p>
                        <code className="text-xs bg-muted/20 p-1 rounded mt-2 block">{rule.pattern}</code>
                      </div>
                    ))}
                    {customRules.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No custom rules defined</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card className="border-cyber-glow/20 bg-background/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Batch Scheduling & Automation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Schedule New Scan</h4>
                  <div className="space-y-2">
                    <Input placeholder="Scan name" />
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Schedule frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Every Hour</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => addScheduledScan("Daily Security Scan", "Daily at 2:00 AM")}>
                      <Timer className="h-4 w-4 mr-2" />
                      Schedule Scan
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Scheduled Scans ({scheduledScans.length})</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {scheduledScans.map(scan => (
                      <div key={scan.id} className="border border-cyber-glow/20 rounded p-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">{scan.name}</h5>
                          <Switch checked={scan.enabled} />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{scan.schedule}</p>
                      </div>
                    ))}
                    {scheduledScans.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No scheduled scans</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {selectedFile && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-cyber-glow/20 bg-background/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Macro & Script Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedFile.macroAnalysis ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>VBA Macros Detected</span>
                        <Badge variant={selectedFile.macroAnalysis.hasVBA ? "destructive" : "default"}>
                          {selectedFile.macroAnalysis.hasVBA ? "Yes" : "No"}
                        </Badge>
                      </div>
                      {selectedFile.macroAnalysis.hasVBA && (
                        <>
                          <div>
                            <h5 className="font-medium mb-2">Macro Code:</h5>
                            <code className="bg-muted/20 p-3 rounded text-xs block whitespace-pre-wrap">
                              {selectedFile.macroAnalysis.macroCode}
                            </code>
                          </div>
                          <div>
                            <h5 className="font-medium mb-2">Risk Behaviors:</h5>
                            <ul className="text-sm space-y-1">
                              {selectedFile.macroAnalysis.riskBehaviors.map((behavior, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-red-400" />
                                  {behavior}
                                </li>
                              ))}
                            </ul>
                          </div>
                          {selectedFile.macroAnalysis.canSanitize && (
                            <Button variant="outline">
                              <FileCheck className="h-4 w-4 mr-2" />
                              Strip Macros & Save Clean
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No macro analysis available</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-cyber-glow/20 bg-background/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Font & Language Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedFile.fontAnalysis ? (
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium mb-2">Embedded Fonts:</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedFile.fontAnalysis.embeddedFonts.map((font, index) => (
                            <Badge key={index} variant="outline">{font}</Badge>
                          ))}
                        </div>
                      </div>
                      {selectedFile.fontAnalysis.unicodeAnomalies.length > 0 && (
                        <div>
                          <h5 className="font-medium mb-2 text-yellow-400">Unicode Anomalies:</h5>
                          <ul className="text-sm space-y-1">
                            {selectedFile.fontAnalysis.unicodeAnomalies.map((anomaly, index) => (
                              <li key={index} className="text-yellow-400">{anomaly}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedFile.fontAnalysis.homographAttacks.length > 0 && (
                        <div>
                          <h5 className="font-medium mb-2 text-red-400">Homograph Attacks:</h5>
                          <ul className="text-sm space-y-1">
                            {selectedFile.fontAnalysis.homographAttacks.map((attack, index) => (
                              <li key={index} className="text-red-400">{attack}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No font analysis available</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-cyber-glow/20 bg-background/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    OCR Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedFile.ocrResults ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Confidence</span>
                        <span className={getRiskScoreColor(selectedFile.ocrResults.confidence)}>
                          {selectedFile.ocrResults.confidence}%
                        </span>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Extracted Keywords:</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedFile.ocrResults.keywords.map((keyword, index) => (
                            <Badge key={index} variant="outline">{keyword}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Extracted Text (Preview):</h5>
                        <div className="bg-muted/20 p-3 rounded text-sm max-h-32 overflow-y-auto">
                          {selectedFile.ocrResults.extractedText}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No OCR analysis available</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-cyber-glow/20 bg-background/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Version History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedFile.versionHistory ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        {selectedFile.versionHistory.versions.map((version, index) => (
                          <div key={index} className="border border-cyber-glow/20 rounded p-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{version.author}</span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(version.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {version.changes.join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                      {selectedFile.versionHistory.anomalies.length > 0 && (
                        <div>
                          <h5 className="font-medium mb-2 text-yellow-400">Anomalies:</h5>
                          <ul className="text-sm space-y-1">
                            {selectedFile.versionHistory.anomalies.map((anomaly, index) => (
                              <li key={index} className="text-yellow-400">{anomaly}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No version history available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          {!selectedFile && (
            <Card className="border-cyber-glow/20 bg-background/80 backdrop-blur">
              <CardContent className="text-center py-12">
                <Brain className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Select a file to view detailed analysis</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="intel" className="space-y-4">
          {selectedFile && selectedFile.threatIntel && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-cyber-glow/20 bg-background/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Threat Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>VirusTotal Score</span>
                    <span className={getRiskScoreColor(selectedFile.threatIntel.virusTotalScore)}>
                      {selectedFile.threatIntel.virusTotalScore}/100
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reputation</span>
                    <Badge variant={
                      selectedFile.threatIntel.reputation === 'malicious' ? 'destructive' :
                      selectedFile.threatIntel.reputation === 'suspicious' ? 'secondary' : 'default'
                    }>
                      {selectedFile.threatIntel.reputation}
                    </Badge>
                  </div>
                  {selectedFile.threatIntel.knownCampaigns.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Known Campaigns:</h5>
                      <div className="space-y-1">
                        {selectedFile.threatIntel.knownCampaigns.map((campaign, index) => (
                          <Badge key={index} variant="outline" className="text-red-400 border-red-400/30">
                            {campaign}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedFile.threatIntel.cves.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Related CVEs:</h5>
                      <div className="space-y-1">
                        {selectedFile.threatIntel.cves.map((cve, index) => (
                          <Badge key={index} variant="outline" className="text-orange-400 border-orange-400/30">
                            {cve}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-cyber-glow/20 bg-background/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Annotations & Evidence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input placeholder="Add annotation..." />
                      <Button size="sm" onClick={() => addAnnotation(selectedFile.id, "Sample annotation", "note")}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedFile.annotations.map(annotation => (
                        <div key={annotation.id} className="border border-cyber-glow/20 rounded p-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{annotation.author}</span>
                            <Badge variant="outline">{annotation.type}</Badge>
                          </div>
                          <p className="text-sm mt-1">{annotation.text}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(annotation.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      {selectedFile.annotations.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">No annotations</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {!selectedFile && (
            <Card className="border-cyber-glow/20 bg-background/80 backdrop-blur">
              <CardContent className="text-center py-12">
                <Globe className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Select a file to view threat intelligence</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}