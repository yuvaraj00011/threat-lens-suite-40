import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Settings, Shield, Bell, Database, Palette, Gavel, Download, Upload } from "lucide-react"
import { useAppSettings } from "@/hooks/useAppSettings"
import { AppSidebar } from "@/components/AppSidebar"
import { AppHeader } from "@/components/AppHeader"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

const AppSettings = () => {
  const { 
    settings, 
    updateSetting, 
    saveSettings, 
    resetToDefaults, 
    exportSettings, 
    importSettings, 
    isLoading, 
    lastSaved 
  } = useAppSettings()

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      importSettings(file)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className="flex-1 min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
          <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="h-8 w-8 text-cyber-glow" />
                <div>
                  <h1 className="text-3xl font-bold text-cyber-glow font-cyber">System Settings</h1>
                  <p className="text-muted-foreground font-mono">Configure your UCIIP platform</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {lastSaved && (
                  <Badge variant="outline" className="text-cyber-glow border-cyber-glow/20">
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </Badge>
                )}
                <Button 
                  onClick={saveSettings} 
                  disabled={isLoading}
                  className="bg-cyber-glow hover:bg-cyber-glow/80 text-dark"
                >
                  {isLoading ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </div>

            {/* Security Settings */}
            <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyber-glow font-cyber">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mfa" className="text-foreground">Multi-Factor Authentication</Label>
                    <Switch
                      id="mfa"
                      checked={settings.mfaEnabled}
                      onCheckedChange={(checked) => updateSetting('mfaEnabled', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Session Timeout (minutes)</Label>
                    <Select
                      value={settings.sessionTimeout}
                      onValueChange={(value) => updateSetting('sessionTimeout', value)}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="audit" className="text-foreground">Audit Logging</Label>
                    <Switch
                      id="audit"
                      checked={settings.auditLogging}
                      onCheckedChange={(checked) => updateSetting('auditLogging', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Encryption Level</Label>
                    <Select
                      value={settings.encryptionLevel}
                      onValueChange={(value) => updateSetting('encryptionLevel', value)}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aes-128">AES-128</SelectItem>
                        <SelectItem value="aes-256">AES-256</SelectItem>
                        <SelectItem value="rsa-2048">RSA-2048</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyber-glow font-cyber">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="realtime-alerts" className="text-foreground">Real-time Alerts</Label>
                    <Switch
                      id="realtime-alerts"
                      checked={settings.realTimeAlerts}
                      onCheckedChange={(checked) => updateSetting('realTimeAlerts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications" className="text-foreground">Email Notifications</Label>
                    <Switch
                      id="email-notifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="critical-threshold" className="text-foreground">Critical Threshold Alerts</Label>
                    <Switch
                      id="critical-threshold"
                      checked={settings.criticalThresholdAlert}
                      onCheckedChange={(checked) => updateSetting('criticalThresholdAlert', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="system-status" className="text-foreground">System Status Notifications</Label>
                    <Switch
                      id="system-status"
                      checked={settings.systemStatusNotifications}
                      onCheckedChange={(checked) => updateSetting('systemStatusNotifications', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API & Integrations */}
            <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyber-glow font-cyber">
                  <Database className="h-5 w-5" />
                  API & Integrations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-foreground">API Rate Limit</Label>
                    <Select
                      value={settings.apiRateLimit}
                      onValueChange={(value) => updateSetting('apiRateLimit', value)}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="500">500 requests/hour</SelectItem>
                        <SelectItem value="1000">1000 requests/hour</SelectItem>
                        <SelectItem value="5000">5000 requests/hour</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="third-party" className="text-foreground">Third-Party Integrations</Label>
                    <Switch
                      id="third-party"
                      checked={settings.thirdPartyIntegrations}
                      onCheckedChange={(checked) => updateSetting('thirdPartyIntegrations', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-backup" className="text-foreground">Auto Backup</Label>
                    <Switch
                      id="auto-backup"
                      checked={settings.autoBackup}
                      onCheckedChange={(checked) => updateSetting('autoBackup', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Backup Frequency</Label>
                    <Select
                      value={settings.backupFrequency}
                      onValueChange={(value) => updateSetting('backupFrequency', value)}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* UI Preferences */}
            <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyber-glow font-cyber">
                  <Palette className="h-5 w-5" />
                  UI Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-foreground">Theme</Label>
                    <Select
                      value={settings.theme}
                      onValueChange={(value) => updateSetting('theme', value)}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Language</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => updateSetting('language', value)}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Date Format</Label>
                    <Select
                      value={settings.dateFormat}
                      onValueChange={(value) => updateSetting('dateFormat', value)}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="iso">YYYY-MM-DD</SelectItem>
                        <SelectItem value="us">MM/DD/YYYY</SelectItem>
                        <SelectItem value="eu">DD.MM.YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Time Zone</Label>
                    <Select
                      value={settings.timeZone}
                      onValueChange={(value) => updateSetting('timeZone', value)}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/Los_Angeles">
                          Los Angeles (PST)
                        </SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investigation Settings */}
            <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyber-glow font-cyber">
                  <Gavel className="h-5 w-5" />
                  Investigation Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="default-tools" className="text-foreground">Default Tool Activation</Label>
                    <Switch
                      id="default-tools"
                      checked={settings.defaultToolActivation}
                      onCheckedChange={(checked) => updateSetting('defaultToolActivation', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-analysis" className="text-foreground">Auto Analysis</Label>
                    <Switch
                      id="auto-analysis"
                      checked={settings.autoAnalysis}
                      onCheckedChange={(checked) => updateSetting('autoAnalysis', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Risk Threshold</Label>
                    <Select
                      value={settings.riskThreshold}
                      onValueChange={(value) => updateSetting('riskThreshold', value)}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.3">Low (0.3)</SelectItem>
                        <SelectItem value="0.5">Medium (0.5)</SelectItem>
                        <SelectItem value="0.7">High (0.7)</SelectItem>
                        <SelectItem value="0.9">Critical (0.9)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Data Retention Period (days)</Label>
                    <Select
                      value={settings.retentionPeriod}
                      onValueChange={(value) => updateSetting('retentionPeriod', value)}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                        <SelectItem value="365">365 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyber-glow font-cyber">
                  <Gavel className="h-5 w-5" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Button 
                      variant="destructive" 
                      onClick={resetToDefaults}
                      className="w-full"
                    >
                      Reset to Defaults
                    </Button>
                  </div>

                  <div>
                    <Button 
                      variant="outline" 
                      onClick={exportSettings}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Settings
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor="import-settings" className="w-full">
                      <Button 
                        variant="secondary" 
                        asChild
                        className="w-full"
                      >
                        <div>
                          <Upload className="h-4 w-4 mr-2" />
                          Import Settings
                        </div>
                      </Button>
                      <input
                        type="file"
                        id="import-settings"
                        className="hidden"
                        accept=".json"
                        onChange={handleFileImport}
                      />
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default AppSettings
