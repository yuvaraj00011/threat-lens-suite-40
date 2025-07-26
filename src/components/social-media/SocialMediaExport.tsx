import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Download, FileText, Image, Table, Loader2 } from "lucide-react"
import type { SearchInput, SocialProfile } from "../SocialMediaFinder"

interface SocialMediaExportProps {
  inputs: SearchInput[]
  results: SocialProfile[]
  caseId: string
}

export function SocialMediaExport({ inputs, results, caseId }: SocialMediaExportProps) {
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>(results.map(r => r.id))
  const [includeGraph, setIncludeGraph] = useState(true)
  const [includeNotes, setIncludeNotes] = useState(true)
  const [exportNotes, setExportNotes] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  const handleProfileToggle = (profileId: string, checked: boolean) => {
    setSelectedProfiles(prev => 
      checked 
        ? [...prev, profileId]
        : prev.filter(id => id !== profileId)
    )
  }

  const handleSelectAll = () => {
    setSelectedProfiles(results.map(r => r.id))
  }

  const handleSelectNone = () => {
    setSelectedProfiles([])
  }

  const generateCSV = () => {
    const selectedResults = results.filter(r => selectedProfiles.includes(r.id))
    
    const headers = [
      'Platform',
      'Username', 
      'Profile URL',
      'Bio',
      'Location',
      'Risk Level',
      'Matched By',
      'Followers',
      'Verified',
      'Last Active',
      'Notes',
      'Flagged'
    ]

    const rows = selectedResults.map(profile => [
      profile.platform,
      profile.username,
      profile.profileUrl,
      `"${profile.bio.replace(/"/g, '""')}"`,
      profile.location,
      profile.risk,
      profile.matchedBy.join('; '),
      profile.followers || '',
      profile.verified || false,
      profile.lastActive || '',
      `"${(profile.notes || '').replace(/"/g, '""')}"`,
      profile.flagged || false
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n')

    return csvContent
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExport = async (format: 'csv' | 'pdf' | 'png') => {
    setIsExporting(true)
    
    // Simulate export processing
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const timestamp = new Date().toISOString().split('T')[0]
    const casePrefix = caseId ? `${caseId}_` : ''
    
    try {
      switch (format) {
        case 'csv':
          const csvContent = generateCSV()
          downloadFile(csvContent, `${casePrefix}social_media_results_${timestamp}.csv`, 'text/csv')
          break
          
        case 'pdf':
          // In a real app, you'd use a PDF library like jsPDF or react-pdf
          const pdfContent = generateReportContent()
          downloadFile(pdfContent, `${casePrefix}social_media_report_${timestamp}.pdf`, 'application/pdf')
          break
          
        case 'png':
          // In a real app, you'd capture the graph component as an image
          alert('PNG export would capture the current graph view')
          break
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    }
    
    setIsExporting(false)
  }

  const generateReportContent = () => {
    const selectedResults = results.filter(r => selectedProfiles.includes(r.id))
    
    const report = `
SOCIAL MEDIA OSINT INVESTIGATION REPORT
======================================

Case ID: ${caseId || 'N/A'}
Generated: ${new Date().toLocaleDateString()}
Total Profiles Found: ${selectedResults.length}

SEARCH INPUTS:
${inputs.map(input => `- ${input.type.toUpperCase()}: ${input.value}`).join('\n')}

INVESTIGATION SUMMARY:
${exportNotes || 'No additional notes provided.'}

PROFILE DETAILS:
${selectedResults.map(profile => `
Platform: ${profile.platform}
Username: @${profile.username}
URL: ${profile.profileUrl}
Bio: ${profile.bio}
Location: ${profile.location}
Risk Level: ${profile.risk.toUpperCase()}
Matched By: ${profile.matchedBy.join(', ')}
Followers: ${profile.followers || 'N/A'}
Verified: ${profile.verified ? 'Yes' : 'No'}
${profile.notes ? `Notes: ${profile.notes}` : ''}
${profile.flagged ? '[FLAGGED AS SUSPICIOUS]' : ''}
${'='.repeat(50)}
`).join('\n')}

RISK ASSESSMENT:
- High Risk Profiles: ${selectedResults.filter(p => p.risk === 'high').length}
- Medium Risk Profiles: ${selectedResults.filter(p => p.risk === 'medium').length}
- Low Risk Profiles: ${selectedResults.filter(p => p.risk === 'low').length}
- Flagged Profiles: ${selectedResults.filter(p => p.flagged).length}

This report was generated by the OSINT Social Media Finder tool.
    `.trim()
    
    return report
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <Download className="h-12 w-12 text-muted-foreground mx-auto" />
            <div className="text-muted-foreground">
              No results to export yet
            </div>
            <p className="text-sm text-muted-foreground">
              Run a search first to generate data for export
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-cyber">Export Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Profile Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Select Profiles to Export</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={handleSelectNone}>
                  Select None
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-2">
              {results.map((profile) => (
                <div key={profile.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={profile.id}
                    checked={selectedProfiles.includes(profile.id)}
                    onCheckedChange={(checked) => 
                      handleProfileToggle(profile.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={profile.id}
                    className="text-sm font-mono cursor-pointer flex-1 truncate"
                  >
                    {profile.platform} - @{profile.username}
                  </label>
                  <Badge className={`text-xs ${
                    profile.risk === 'high' ? 'bg-red-500/20 text-red-400' :
                    profile.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {profile.risk}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <Label>Include Additional Data</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeGraph"
                  checked={includeGraph}
                  onCheckedChange={(checked) => setIncludeGraph(checked as boolean)}
                />
                <Label htmlFor="includeGraph">Include connection graph (PDF only)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeNotes"
                  checked={includeNotes}
                  onCheckedChange={(checked) => setIncludeNotes(checked as boolean)}
                />
                <Label htmlFor="includeNotes">Include investigation notes</Label>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="exportNotes">Investigation Summary (Optional)</Label>
            <Textarea
              id="exportNotes"
              placeholder="Add summary notes for this export..."
              value={exportNotes}
              onChange={(e) => setExportNotes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Export Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-cyber">Export Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-cyber-glow">
                {selectedProfiles.length}
              </div>
              <div className="text-xs text-muted-foreground">Profiles Selected</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">
                {results.filter(r => selectedProfiles.includes(r.id) && r.risk === 'high').length}
              </div>
              <div className="text-xs text-muted-foreground">High Risk</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {results.filter(r => selectedProfiles.includes(r.id) && r.risk === 'medium').length}
              </div>
              <div className="text-xs text-muted-foreground">Medium Risk</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">
                {results.filter(r => selectedProfiles.includes(r.id) && r.flagged).length}
              </div>
              <div className="text-xs text-muted-foreground">Flagged</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-cyber">Export Formats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => handleExport('csv')}
              disabled={selectedProfiles.length === 0 || isExporting}
              className="h-16 flex-col gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Table className="h-5 w-5" />
              )}
              <span className="text-xs">CSV Spreadsheet</span>
            </Button>

            <Button
              onClick={() => handleExport('pdf')}
              disabled={selectedProfiles.length === 0 || isExporting}
              className="h-16 flex-col gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
              <span className="text-xs">PDF Report</span>
            </Button>

            <Button
              onClick={() => handleExport('png')}
              disabled={selectedProfiles.length === 0 || isExporting}
              className="h-16 flex-col gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Image className="h-5 w-5" />
              )}
              <span className="text-xs">Graph Image</span>
            </Button>
          </div>
          
          {selectedProfiles.length === 0 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Select at least one profile to enable export options
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}