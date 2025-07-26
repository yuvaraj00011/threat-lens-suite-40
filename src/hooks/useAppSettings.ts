
import { useState, useEffect } from 'react'

export interface AppSettings {
  // Security Settings
  mfaEnabled: boolean
  sessionTimeout: string
  auditLogging: boolean
  encryptionLevel: string
  
  // Notifications
  realTimeAlerts: boolean
  emailNotifications: boolean
  criticalThresholdAlert: boolean
  systemStatusNotifications: boolean
  
  // API & Integrations
  apiRateLimit: string
  thirdPartyIntegrations: boolean
  autoBackup: boolean
  backupFrequency: string
  
  // UI Preferences
  theme: string
  language: string
  dateFormat: string
  timeZone: string
  
  // Investigation Settings
  defaultToolActivation: boolean
  autoAnalysis: boolean
  riskThreshold: string
  retentionPeriod: string
}

const defaultSettings: AppSettings = {
  // Security Settings
  mfaEnabled: true,
  sessionTimeout: '30',
  auditLogging: true,
  encryptionLevel: 'aes-256',
  
  // Notifications
  realTimeAlerts: true,
  emailNotifications: true,
  criticalThresholdAlert: true,
  systemStatusNotifications: false,
  
  // API & Integrations
  apiRateLimit: '1000',
  thirdPartyIntegrations: true,
  autoBackup: true,
  backupFrequency: 'daily',
  
  // UI Preferences
  theme: 'dark',
  language: 'en',
  dateFormat: 'iso',
  timeZone: 'UTC',
  
  // Investigation Settings
  defaultToolActivation: true,
  autoAnalysis: true,
  riskThreshold: '0.7',
  retentionPeriod: '365'
}

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('app-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error('Failed to parse saved settings:', error)
      }
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (lastSaved) {
      localStorage.setItem('app-settings', JSON.stringify(settings))
    }
  }, [settings, lastSaved])

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const saveSettings = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      localStorage.setItem('app-settings', JSON.stringify(settings))
      setLastSaved(new Date())
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetToDefaults = () => {
    setSettings(defaultSettings)
    localStorage.removeItem('app-settings')
    setLastSaved(null)
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `app-settings-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importSettings = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        setSettings({ ...defaultSettings, ...imported })
        setLastSaved(new Date())
      } catch (error) {
        console.error('Failed to import settings:', error)
      }
    }
    reader.readAsText(file)
  }

  return {
    settings,
    updateSetting,
    saveSettings,
    resetToDefaults,
    exportSettings,
    importSettings,
    isLoading,
    lastSaved
  }
}
