import { useState, useCallback } from "react"

// Data categories mapping to investigation tools
export interface DataCategory {
  id: string
  name: string
  tool: string
  description: string
  patterns: string[]
  fileTypes: string[]
  keywords: string[]
}

export interface CategorizedData {
  category: string
  files: File[]
  confidence: number
  dataCount: number
  preview: string[]
}

export interface CategorizationResult {
  totalFiles: number
  categorizedData: CategorizedData[]
  uncategorizedFiles: File[]
  processingTime: number
}

// Define the 10 investigation tool categories
export const INVESTIGATION_CATEGORIES: DataCategory[] = [
  {
    id: 'email-checker',
    name: 'Email Checker',
    tool: 'Email Checker',
    description: 'Email security analysis',
    patterns: ['@', 'gmail', 'yahoo', 'outlook', 'email', 'mail'],
    fileTypes: ['.eml', '.msg', '.mbox', '.pst'],
    keywords: ['from:', 'to:', 'subject:', 'received:', 'smtp']
  },
  {
    id: 'call-tracer',
    name: 'Call Tracer',
    tool: 'Call Tracer',
    description: 'Phone number tracing',
    patterns: ['+', '(', ')', '-', 'call', 'phone'],
    fileTypes: ['.vcf', '.csv', '.log'],
    keywords: ['call_log', 'phone_number', 'duration', 'timestamp', 'contact']
  },
  {
    id: 'phishing-detector',
    name: 'Phishing Detector',
    tool: 'Phishing Detector',
    description: 'URL threat analysis',
    patterns: ['http', 'https', 'www', 'bit.ly', 'tinyurl'],
    fileTypes: ['.url', '.html', '.txt'],
    keywords: ['phishing', 'suspicious', 'malware', 'scam', 'fraud']
  },
  {
    id: 'money-mapper',
    name: 'Money Mapper',
    tool: 'Money Mapper',
    description: 'Financial flow tracking',
    patterns: ['$', '€', '£', '¥', 'transaction', 'payment'],
    fileTypes: ['.csv', '.xls', '.xlsx', '.qif'],
    keywords: ['amount', 'balance', 'transfer', 'account', 'bank']
  },
  {
    id: 'fake-news-tracker',
    name: 'Fake News Tracker',
    tool: 'Fake News Tracker',
    description: 'Information verification',
    patterns: ['news', 'article', 'headline', 'breaking'],
    fileTypes: ['.txt', '.html', '.pdf'],
    keywords: ['fake', 'misinformation', 'propaganda', 'false', 'hoax']
  },
  {
    id: 'nmap-scanner',
    name: 'N-Map Scanner',
    tool: 'N-Map',
    description: 'Network analysis',
    patterns: ['ip', 'port', 'network', 'scan'],
    fileTypes: ['.nmap', '.xml', '.txt'],
    keywords: ['192.168', '10.0', '172.16', 'port', 'service']
  },
  {
    id: 'voice-identifier',
    name: 'Voice Identifier',
    tool: 'Voice Identifier',
    description: 'Voice recording analysis',
    patterns: ['voice', 'audio', 'recording'],
    fileTypes: ['.wav', '.mp3', '.m4a', '.ogg'],
    keywords: ['audio', 'voice', 'speech', 'recording', 'transcript']
  },
  {
    id: 'ai-security',
    name: 'AI Security System',
    tool: 'AI Security System',
    description: 'Security monitoring',
    patterns: ['security', 'log', 'alert', 'threat'],
    fileTypes: ['.log', '.txt', '.json'],
    keywords: ['security', 'intrusion', 'malware', 'virus', 'attack']
  },
  {
    id: 'social-media-finder',
    name: 'Social Media Finder',
    tool: 'Social Media Finder',
    description: 'Social account discovery',
    patterns: ['facebook', 'twitter', 'instagram', 'linkedin'],
    fileTypes: ['.json', '.csv', '.txt'],
    keywords: ['social', 'profile', 'username', 'handle', 'post']
  },
  {
    id: 'document-handler',
    name: 'Safe Document Handler',
    tool: 'Safe Document Handler',
    description: 'Document security scanning',
    patterns: ['document', 'pdf', 'doc', 'file'],
    fileTypes: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
    keywords: ['document', 'attachment', 'file', 'content', 'text']
  }
]

class AICategorizationEngine {
  // Simulate AI analysis with realistic processing
  async categorizeFiles(files: File[]): Promise<CategorizationResult> {
    const startTime = Date.now()
    const categorizedData: CategorizedData[] = []
    const uncategorizedFiles: File[] = []

    // Process each file
    for (const file of files) {
      const category = await this.analyzeFile(file)
      
      if (category) {
        // Find existing category or create new one
        let existingCategory = categorizedData.find(cd => cd.category === category.id)
        
        if (!existingCategory) {
          existingCategory = {
            category: category.id,
            files: [],
            confidence: 0,
            dataCount: 0,
            preview: []
          }
          categorizedData.push(existingCategory)
        }
        
        existingCategory.files.push(file)
        existingCategory.dataCount++
        
        // Generate preview data
        const preview = await this.generatePreview(file, category)
        existingCategory.preview.push(...preview)
        
        // Calculate confidence based on matches
        const confidence = await this.calculateConfidence(file, category)
        existingCategory.confidence = Math.max(existingCategory.confidence, confidence)
      } else {
        uncategorizedFiles.push(file)
      }
    }

    const processingTime = Date.now() - startTime

    return {
      totalFiles: files.length,
      categorizedData,
      uncategorizedFiles,
      processingTime
    }
  }

  private async analyzeFile(file: File): Promise<DataCategory | null> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))

    const fileName = file.name.toLowerCase()
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'))
    
    // Try to read file content for text files (simulate)
    let content = ''
    if (file.type.startsWith('text/') || fileExtension === '.txt') {
      try {
        content = await this.readFileContent(file)
      } catch (error) {
        console.warn('Could not read file content:', error)
      }
    }

    // Score each category
    const scores = INVESTIGATION_CATEGORIES.map(category => ({
      category,
      score: this.calculateCategoryScore(fileName, fileExtension, content, category)
    }))

    // Find best match
    const bestMatch = scores.reduce((best, current) => 
      current.score > best.score ? current : best
    )

    // Return category if confidence is above threshold
    return bestMatch.score > 0.3 ? bestMatch.category : null
  }

  private calculateCategoryScore(fileName: string, fileExtension: string, content: string, category: DataCategory): number {
    let score = 0
    const text = `${fileName} ${content}`.toLowerCase()

    // File type match (high weight)
    if (category.fileTypes.includes(fileExtension)) {
      score += 0.4
    }

    // Pattern matches (medium weight)
    const patternMatches = category.patterns.filter(pattern => 
      text.includes(pattern.toLowerCase())
    ).length
    score += (patternMatches / category.patterns.length) * 0.3

    // Keyword matches (medium weight)
    const keywordMatches = category.keywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    ).length
    score += (keywordMatches / category.keywords.length) * 0.3

    return Math.min(score, 1.0)
  }

  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string || '')
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file.slice(0, 1024)) // Read first 1KB only
    })
  }

  private async generatePreview(file: File, category: DataCategory): Promise<string[]> {
    // Generate realistic preview data based on category
    const previews: Record<string, string[]> = {
      'email-checker': [
        `📧 Email from: ${this.generateRandomEmail()}`,
        `📧 Subject: ${this.generateRandomSubject()}`,
        `📧 Suspicious attachment detected`
      ],
      'call-tracer': [
        `📞 Call to: ${this.generateRandomPhone()}`,
        `📞 Duration: ${Math.floor(Math.random() * 300)}s`,
        `📞 Location: ${this.generateRandomLocation()}`
      ],
      'phishing-detector': [
        `🔗 Suspicious URL: ${this.generateRandomURL()}`,
        `🔗 Threat level: ${['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]}`,
        `🔗 Domain reputation: Suspicious`
      ],
      'money-mapper': [
        `💰 Transaction: $${(Math.random() * 10000).toFixed(2)}`,
        `💰 Account: ***${Math.floor(Math.random() * 9999)}`,
        `💰 Type: ${['Transfer', 'Withdrawal', 'Deposit'][Math.floor(Math.random() * 3)]}`
      ],
      'fake-news-tracker': [
        `📰 Article: ${this.generateRandomHeadline()}`,
        `📰 Credibility: ${Math.floor(Math.random() * 100)}%`,
        `📰 Sources verified: ${Math.floor(Math.random() * 5)}`
      ],
      'nmap-scanner': [
        `🌐 IP: ${this.generateRandomIP()}`,
        `🌐 Open ports: ${Math.floor(Math.random() * 10)}`,
        `🌐 Services: ${['HTTP', 'HTTPS', 'SSH', 'FTP'][Math.floor(Math.random() * 4)]}`
      ],
      'voice-identifier': [
        `🎤 Voice sample: ${Math.floor(Math.random() * 60)}s`,
        `🎤 Speaker: ${['Unknown', 'Match found', 'No match'][Math.floor(Math.random() * 3)]}`,
        `🎤 Quality: ${['Good', 'Fair', 'Poor'][Math.floor(Math.random() * 3)]}`
      ],
      'ai-security': [
        `🛡️ Threat detected: ${['Malware', 'Intrusion', 'Anomaly'][Math.floor(Math.random() * 3)]}`,
        `🛡️ Risk level: ${['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]}`,
        `🛡️ Action required: Review`
      ],
      'social-media-finder': [
        `👥 Profile: @${this.generateRandomUsername()}`,
        `👥 Platform: ${['Facebook', 'Twitter', 'Instagram'][Math.floor(Math.random() * 3)]}`,
        `👥 Activity: ${Math.floor(Math.random() * 100)} posts`
      ],
      'document-handler': [
        `📄 Document: ${file.name}`,
        `📄 Size: ${(file.size / 1024).toFixed(1)} KB`,
        `📄 Security scan: ${['Clean', 'Suspicious', 'Quarantined'][Math.floor(Math.random() * 3)]}`
      ]
    }

    return previews[category.id] || [`📁 File: ${file.name}`]
  }

  private async calculateConfidence(file: File, category: DataCategory): Promise<number> {
    // Simulate confidence calculation
    return 0.7 + Math.random() * 0.3 // 70-100% confidence
  }

  // Helper functions for generating realistic preview data
  private generateRandomEmail(): string {
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'suspicious-domain.com']
    const users = ['user123', 'victim', 'scammer', 'unknown']
    return `${users[Math.floor(Math.random() * users.length)]}@${domains[Math.floor(Math.random() * domains.length)]}`
  }

  private generateRandomSubject(): string {
    const subjects = [
      'Urgent: Verify your account',
      'You have won $1,000,000!',
      'Security alert',
      'Important document attached',
      'Meeting invitation'
    ]
    return subjects[Math.floor(Math.random() * subjects.length)]
  }

  private generateRandomPhone(): string {
    return `+1-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`
  }

  private generateRandomLocation(): string {
    const locations = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Unknown', 'International']
    return locations[Math.floor(Math.random() * locations.length)]
  }

  private generateRandomURL(): string {
    const domains = ['suspicious-site.com', 'fake-bank.net', 'phishing-attempt.org', 'malware-host.ru']
    return `https://${domains[Math.floor(Math.random() * domains.length)]}/login`
  }

  private generateRandomHeadline(): string {
    const headlines = [
      'Breaking: Major security breach reported',
      'Exclusive: New fraud scheme discovered',
      'Alert: Fake news spreading rapidly',
      'Investigation reveals shocking truth'
    ]
    return headlines[Math.floor(Math.random() * headlines.length)]
  }

  private generateRandomIP(): string {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
  }

  private generateRandomUsername(): string {
    const usernames = ['suspect123', 'victim_user', 'unknown_person', 'fake_account']
    return usernames[Math.floor(Math.random() * usernames.length)]
  }
}

// Singleton instance
export const aiCategorizationEngine = new AICategorizationEngine()

// React hook for using the categorization engine
export function useDataCategorization() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<CategorizationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const categorizeFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) {
      setError('No files provided')
      return
    }

    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      const categorizationResult = await aiCategorizationEngine.categorizeFiles(files)
      setResult(categorizationResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Categorization failed')
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setIsProcessing(false)
  }, [])

  return {
    categorizeFiles,
    isProcessing,
    result,
    error,
    reset
  }
}