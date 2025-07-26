import { useState, useEffect, useCallback } from "react"

// Data structures for monitoring streams
export interface UserBehaviorData {
  userId: string
  loginTime: string
  location: string
  device: string
  actionFrequency: number
  ipAddress: string
  userAgent: string
}

export interface NetworkActivityData {
  timestamp: string
  sourceIp: string
  destinationIp: string
  port: number
  protocol: string
  trafficVolume: number
  isOutbound: boolean
  domain?: string
}

export interface ResourceUsageData {
  timestamp: string
  processId: string
  sessionId: string
  cpuUsage: number
  ramUsage: number
  diskUsage: number
  networkIo: number
}

export interface ApiUsageData {
  timestamp: string
  endpoint: string
  method: string
  responseTime: number
  statusCode: number
  userId?: string
  sessionId?: string
  errorCount: number
}

export interface BaselineProfile {
  userId: string
  avgLoginHour: number
  commonLocations: string[]
  typicalDevices: string[]
  normalActionRate: number
  usualSessionDuration: number
  baselineUpdated: string
}

export interface MonitoringConfig {
  samplingInterval: number // milliseconds
  baselineWindowDays: number
  anomalyThreshold: number
  isEnabled: boolean
}

class SecurityMonitoringEngine {
  private userBaselines: Map<string, BaselineProfile> = new Map()
  private monitoringStreams: {
    userBehavior: UserBehaviorData[]
    networkActivity: NetworkActivityData[]
    resourceUsage: ResourceUsageData[]
    apiUsage: ApiUsageData[]
  } = {
    userBehavior: [],
    networkActivity: [],
    resourceUsage: [],
    apiUsage: []
  }

  private config: MonitoringConfig = {
    samplingInterval: 5000, // 5 seconds
    baselineWindowDays: 7,
    anomalyThreshold: 0.6,
    isEnabled: true
  }

  // Simulate real monitoring streams
  startMonitoring(onDataUpdate: (streams: typeof this.monitoringStreams) => void): () => void {
    if (!this.config.isEnabled) return () => {}

    const interval = setInterval(() => {
      // Simulate user behavior data
      this.monitoringStreams.userBehavior.push({
        userId: `UC_${Math.floor(Math.random() * 9999)}`,
        loginTime: new Date().toISOString(),
        location: ['US-CA', 'US-NY', 'GB-LN', 'DE-BE'][Math.floor(Math.random() * 4)],
        device: ['Desktop-Chrome', 'Mobile-Safari', 'Laptop-Firefox'][Math.floor(Math.random() * 3)],
        actionFrequency: Math.random() * 50 + 10,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Compatible Agent)'
      })

      // Simulate network activity
      this.monitoringStreams.networkActivity.push({
        timestamp: new Date().toISOString(),
        sourceIp: `192.168.1.${Math.floor(Math.random() * 255)}`,
        destinationIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.1.1`,
        port: [80, 443, 22, 3389, 8080][Math.floor(Math.random() * 5)],
        protocol: ['HTTP', 'HTTPS', 'SSH', 'RDP'][Math.floor(Math.random() * 4)],
        trafficVolume: Math.random() * 1000000 + 1000,
        isOutbound: Math.random() > 0.5,
        domain: ['api.platform.com', 'cdn.assets.com', 'unknown-domain.ru'][Math.floor(Math.random() * 3)]
      })

      // Simulate resource usage
      this.monitoringStreams.resourceUsage.push({
        timestamp: new Date().toISOString(),
        processId: `proc_${Math.floor(Math.random() * 999)}`,
        sessionId: `sess_${Math.floor(Math.random() * 999)}`,
        cpuUsage: Math.random() * 100,
        ramUsage: Math.random() * 8192,
        diskUsage: Math.random() * 1000,
        networkIo: Math.random() * 50000
      })

      // Simulate API usage
      this.monitoringStreams.apiUsage.push({
        timestamp: new Date().toISOString(),
        endpoint: ['/api/auth', '/api/data', '/api/files', '/api/users'][Math.floor(Math.random() * 4)],
        method: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
        responseTime: Math.random() * 2000 + 100,
        statusCode: [200, 201, 400, 401, 403, 500][Math.floor(Math.random() * 6)],
        userId: `UC_${Math.floor(Math.random() * 9999)}`,
        sessionId: `sess_${Math.floor(Math.random() * 999)}`,
        errorCount: Math.random() > 0.8 ? Math.floor(Math.random() * 5) : 0
      })

      // Keep only recent data (last 1000 entries per stream)
      Object.keys(this.monitoringStreams).forEach(key => {
        const stream = this.monitoringStreams[key as keyof typeof this.monitoringStreams]
        if (stream.length > 1000) {
          stream.splice(0, stream.length - 1000)
        }
      })

      onDataUpdate(this.monitoringStreams)
    }, this.config.samplingInterval)

    return () => clearInterval(interval)
  }

  // Learn user baseline behavior
  updateUserBaseline(userId: string, behaviorData: UserBehaviorData[]): BaselineProfile {
    const recentData = behaviorData.filter(data => 
      data.userId === userId && 
      new Date(data.loginTime) > new Date(Date.now() - this.config.baselineWindowDays * 24 * 60 * 60 * 1000)
    )

    if (recentData.length < 5) {
      // Not enough data for baseline
      return {
        userId,
        avgLoginHour: 12,
        commonLocations: ['unknown'],
        typicalDevices: ['unknown'],
        normalActionRate: 25,
        usualSessionDuration: 3600,
        baselineUpdated: new Date().toISOString()
      }
    }

    // Calculate baseline metrics
    const loginHours = recentData.map(d => new Date(d.loginTime).getHours())
    const avgLoginHour = loginHours.reduce((a, b) => a + b, 0) / loginHours.length

    const locationFreq = recentData.reduce((acc, d) => {
      acc[d.location] = (acc[d.location] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const deviceFreq = recentData.reduce((acc, d) => {
      acc[d.device] = (acc[d.device] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const commonLocations = Object.entries(locationFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([location]) => location)

    const typicalDevices = Object.entries(deviceFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([device]) => device)

    const avgActionRate = recentData.reduce((sum, d) => sum + d.actionFrequency, 0) / recentData.length

    const baseline: BaselineProfile = {
      userId,
      avgLoginHour,
      commonLocations,
      typicalDevices,
      normalActionRate: avgActionRate,
      usualSessionDuration: 3600, // Placeholder
      baselineUpdated: new Date().toISOString()
    }

    this.userBaselines.set(userId, baseline)
    return baseline
  }

  getUserBaseline(userId: string): BaselineProfile | null {
    return this.userBaselines.get(userId) || null
  }

  getAllBaselines(): BaselineProfile[] {
    return Array.from(this.userBaselines.values())
  }

  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): MonitoringConfig {
    return { ...this.config }
  }

  getMonitoringStats() {
    return {
      totalUsers: this.userBaselines.size,
      dataPoints: {
        userBehavior: this.monitoringStreams.userBehavior.length,
        networkActivity: this.monitoringStreams.networkActivity.length,
        resourceUsage: this.monitoringStreams.resourceUsage.length,
        apiUsage: this.monitoringStreams.apiUsage.length
      },
      baselineProfiles: this.userBaselines.size,
      monitoringEnabled: this.config.isEnabled
    }
  }
}

// Singleton instance
export const securityMonitoring = new SecurityMonitoringEngine()

// Hook for React components
export function useSecurityMonitoring() {
  const [monitoringData, setMonitoringData] = useState(securityMonitoring.getMonitoringStats())
  const [isMonitoring, setIsMonitoring] = useState(false)

  const startMonitoring = useCallback(() => {
    if (isMonitoring) return

    setIsMonitoring(true)
    const cleanup = securityMonitoring.startMonitoring((streams) => {
      setMonitoringData(securityMonitoring.getMonitoringStats())
    })

    return cleanup
  }, [isMonitoring])

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)
  }, [])

  useEffect(() => {
    if (isMonitoring) {
      const cleanup = startMonitoring()
      return cleanup
    }
  }, [isMonitoring, startMonitoring])

  return {
    monitoringData,
    isMonitoring,
    startMonitoring: () => setIsMonitoring(true),
    stopMonitoring,
    getUserBaseline: securityMonitoring.getUserBaseline.bind(securityMonitoring),
    getAllBaselines: securityMonitoring.getAllBaselines.bind(securityMonitoring),
    updateConfig: securityMonitoring.updateConfig.bind(securityMonitoring),
    getConfig: securityMonitoring.getConfig.bind(securityMonitoring)
  }
}
