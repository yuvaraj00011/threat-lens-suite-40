import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface UserProfile {
  firstName: string
  lastName: string
  email: string
  department: string
  role: string
  badgeNumber: string
  clearanceLevel: string
  joinDate: string
  lastLogin: string
  phone: string
  emergencyContact: string
}

export interface UserStats {
  casesCompleted: number
  activeCases: number
  totalEvidence: number
  avgResponseTime: string
  successRate: string
  commendations: number
}

export interface ActivityLog {
  id: string
  action: string
  timestamp: string
  type: 'case' | 'analysis' | 'report' | 'evidence' | 'login' | 'setting'
  details?: string
}

const defaultProfile: UserProfile = {
  firstName: 'Sarah',
  lastName: 'Chen',
  email: 'sarah.chen@uciip.gov',
  department: 'Cyber Crimes Division',
  role: 'Senior Investigator',
  badgeNumber: 'UC-4782',
  clearanceLevel: 'Secret',
  joinDate: '2023-03-15',
  lastLogin: '2024-01-15T14:30:00Z',
  phone: '+1-555-0123',
  emergencyContact: '+1-555-0456'
}

const defaultStats: UserStats = {
  casesCompleted: 47,
  activeCases: 8,
  totalEvidence: 1247,
  avgResponseTime: '4.2h',
  successRate: '96.8%',
  commendations: 12
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [stats, setStats] = useState<UserStats>(defaultStats)
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const { toast } = useToast()

  // Load profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('user-profile')
    const savedStats = localStorage.getItem('user-stats')
    const savedActivity = localStorage.getItem('activity-log')
    
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile))
      } catch (error) {
        console.error('Failed to parse saved profile:', error)
      }
    }
    
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats))
      } catch (error) {
        console.error('Failed to parse saved stats:', error)
      }
    }
    
    if (savedActivity) {
      try {
        setActivityLog(JSON.parse(savedActivity))
      } catch (error) {
        console.error('Failed to parse saved activity:', error)
      }
    }
    
    // Initialize with some default activity if none exists
    if (!savedActivity) {
      const defaultActivity: ActivityLog[] = [
        {
          id: '1',
          action: 'Completed case UC-2024-0890',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          type: 'case'
        },
        {
          id: '2',
          action: 'Analyzed financial transactions',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          type: 'analysis'
        },
        {
          id: '3',
          action: 'Generated threat assessment report',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          type: 'report'
        },
        {
          id: '4',
          action: 'Updated case evidence',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          type: 'evidence'
        }
      ]
      setActivityLog(defaultActivity)
    }
  }, [])

  // Real-time save to localStorage
  useEffect(() => {
    if (lastUpdated) {
      localStorage.setItem('user-profile', JSON.stringify(profile))
      localStorage.setItem('user-stats', JSON.stringify(stats))
      localStorage.setItem('activity-log', JSON.stringify(activityLog))
    }
  }, [profile, stats, activityLog, lastUpdated])

  const updateProfile = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Log the profile update activity
    addActivity({
      action: `Updated profile field: ${field}`,
      type: 'setting',
      details: `Changed ${field} to ${value}`
    })
    
    setLastUpdated(new Date())
    
    toast({
      title: "Profile Updated",
      description: `${field} has been updated`,
      duration: 2000,
    })
  }

  const updateStats = (updates: Partial<UserStats>) => {
    setStats(prev => ({
      ...prev,
      ...updates
    }))
    setLastUpdated(new Date())
  }

  const addActivity = (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newActivity: ActivityLog = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    }
    
    setActivityLog(prev => [newActivity, ...prev.slice(0, 49)]) // Keep last 50 activities
    setLastUpdated(new Date())
  }

  const simulateNewCaseCompletion = () => {
    // Update stats
    setStats(prev => ({
      ...prev,
      casesCompleted: prev.casesCompleted + 1,
      activeCases: Math.max(0, prev.activeCases - 1)
    }))
    
    // Add activity
    addActivity({
      action: `Completed case UC-2024-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      type: 'case'
    })
    
    toast({
      title: "Case Completed",
      description: "New case completion recorded",
    })
  }

  const simulateNewEvidence = () => {
    const evidenceCount = Math.floor(Math.random() * 10) + 1
    
    setStats(prev => ({
      ...prev,
      totalEvidence: prev.totalEvidence + evidenceCount
    }))
    
    addActivity({
      action: `Added ${evidenceCount} evidence files`,
      type: 'evidence'
    })
    
    toast({
      title: "Evidence Added",
      description: `${evidenceCount} new evidence files processed`,
    })
  }

  const simulateNewAnalysis = () => {
    const analysisTypes = ['Financial Transaction Analysis', 'Network Traffic Analysis', 'Digital Forensics', 'Communication Analysis']
    const type = analysisTypes[Math.floor(Math.random() * analysisTypes.length)]
    
    addActivity({
      action: `Completed ${type}`,
      type: 'analysis'
    })
    
    toast({
      title: "Analysis Complete",
      description: `${type} has been completed`,
    })
  }

  const saveProfile = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      localStorage.setItem('user-profile', JSON.stringify(profile))
      setLastUpdated(new Date())
      
      addActivity({
        action: 'Updated profile information',
        type: 'setting'
      })
      
      toast({
        title: "Profile Saved",
        description: "Your profile has been saved successfully",
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportProfile = () => {
    const exportData = {
      profile,
      stats,
      activityLog: activityLog.slice(0, 100), // Export last 100 activities
      exportedAt: new Date().toISOString()
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `profile-${profile.badgeNumber}-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    
    addActivity({
      action: 'Exported profile data',
      type: 'setting'
    })
    
    toast({
      title: "Profile Exported",
      description: "Profile data has been exported to file",
    })
  }

  // Real-time activity simulation (for demo purposes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const activities = [
          () => simulateNewEvidence(),
          () => simulateNewAnalysis(),
          () => addActivity({
            action: 'System health check completed',
            type: 'setting'
          })
        ]
        
        const randomActivity = activities[Math.floor(Math.random() * activities.length)]
        randomActivity()
      }
    }, 30000) // Every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const past = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} days ago`
  }

  return {
    profile,
    stats,
    activityLog,
    updateProfile,
    updateStats,
    addActivity,
    saveProfile,
    exportProfile,
    simulateNewCaseCompletion,
    simulateNewEvidence,
    simulateNewAnalysis,
    formatDate,
    formatTimeAgo,
    isLoading,
    lastUpdated
  }
}