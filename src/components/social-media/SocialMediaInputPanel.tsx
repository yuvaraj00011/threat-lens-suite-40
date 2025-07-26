import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Mail, User, Phone, Image, X, Plus, Search, Loader2, History, RotateCcw } from "lucide-react"
import type { SearchInput } from "../SocialMediaFinder"

interface SocialMediaInputPanelProps {
  onSearch: (inputs: SearchInput[]) => void
  isSearching: boolean
  caseId: string
  onCaseIdChange: (caseId: string) => void
}

export function SocialMediaInputPanel({ 
  onSearch, 
  isSearching, 
  caseId, 
  onCaseIdChange 
}: SocialMediaInputPanelProps) {
  const [inputs, setInputs] = useState<SearchInput[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [inputType, setInputType] = useState<'email' | 'username' | 'phone' | 'image'>('email')
  const [savedSessions, setSavedSessions] = useState<any[]>([])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('osint-sessions') || '[]')
    setSavedSessions(saved)
  }, [])

  const addInput = () => {
    if (!currentInput.trim()) return

    const newInput: SearchInput = {
      id: Date.now().toString(),
      type: inputType,
      value: currentInput.trim()
    }

    setInputs(prev => [...prev, newInput])
    setCurrentInput("")
  }

  const removeInput = (id: string) => {
    setInputs(prev => prev.filter(input => input.id !== id))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addInput()
    }
  }

  const handleFileUpload = (file: File) => {
    if (file.type.startsWith('image/')) {
      const newInput: SearchInput = {
        id: Date.now().toString(),
        type: 'image',
        value: file.name
      }
      setInputs(prev => [...prev, newInput])
    } else if (file.type === 'text/csv') {
      // Mock CSV parsing
      const csvInputs: SearchInput[] = [
        { id: Date.now().toString(), type: 'email', value: 'user1@example.com' },
        { id: (Date.now() + 1).toString(), type: 'username', value: 'user1_handle' },
        { id: (Date.now() + 2).toString(), type: 'phone', value: '+1234567890' },
      ]
      setInputs(prev => [...prev, ...csvInputs])
    }
  }

  const getInputIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-3 w-3" />
      case 'username': return <User className="h-3 w-3" />
      case 'phone': return <Phone className="h-3 w-3" />
      case 'image': return <Image className="h-3 w-3" />
      default: return null
    }
  }

  const getInputColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'username': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'phone': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'image': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Case ID Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-cyber">Case Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="case-id">Case ID (Optional)</Label>
            <Input
              id="case-id"
              placeholder="CASE-2025-001"
              value={caseId}
              onChange={(e) => onCaseIdChange(e.target.value)}
              className="font-mono"
            />
          </div>
        </CardContent>
      </Card>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-cyber">Search Identifiers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Input Type</Label>
              <select 
                value={inputType}
                onChange={(e) => setInputType(e.target.value as any)}
                className="w-full p-2 bg-card border border-border rounded-md text-sm"
              >
                <option value="email">Email</option>
                <option value="username">Username</option>
                <option value="phone">Phone</option>
                <option value="image">Image</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Value</Label>
              <Input
                placeholder={
                  inputType === 'email' ? 'user@example.com' :
                  inputType === 'username' ? 'username123' :
                  inputType === 'phone' ? '+1234567890' :
                  'Select image file...'
                }
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={inputType === 'image'}
              />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={addInput} className="w-full" disabled={!currentInput.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>File Upload</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              <input
                type="file"
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyber-glow/10 file:text-cyber-glow hover:file:bg-cyber-glow/20"
                accept=".csv,.jpg,.png,.jpeg"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Upload CSV with identifiers or image files for reverse image search
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Input Chips */}
      {inputs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-cyber">
              Added Identifiers ({inputs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {inputs.map((input) => (
                <Badge
                  key={input.id}
                  variant="secondary"
                  className={`${getInputColor(input.type)} flex items-center gap-1 px-3 py-1`}
                >
                  {getInputIcon(input.type)}
                  <span className="font-mono text-xs">{input.value}</span>
                  <button
                    onClick={() => removeInput(input.id)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={() => onSearch(inputs)}
          disabled={inputs.length === 0 || isSearching}
          size="lg"
          className="min-w-48"
        >
          {isSearching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching Platforms...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Start OSINT Search
            </>
          )}
        </Button>
        
        {inputs.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const session = {
                  id: Date.now().toString(),
                  caseId,
                  inputs,
                  timestamp: new Date().toISOString()
                }
                const saved = JSON.parse(localStorage.getItem('osint-sessions') || '[]')
                saved.push(session)
                localStorage.setItem('osint-sessions', JSON.stringify(saved))
                alert('Session saved to history!')
              }}
            >
              Save Session
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setInputs([])
                setCurrentInput("")
                onCaseIdChange("")
              }}
            >
              New Scan
            </Button>
          </div>
        )}
      </div>

      {/* Session History */}
      {savedSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-cyber flex items-center gap-2">
              <History className="h-4 w-4" />
              Session History ({savedSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {savedSessions.slice(-5).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm"
                >
                  <div>
                    <div className="font-mono">{session.caseId || 'No Case ID'}</div>
                    <div className="text-xs text-muted-foreground">
                      {session.inputs.length} identifiers • {new Date(session.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setInputs(session.inputs)
                      onCaseIdChange(session.caseId || '')
                    }}
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isSearching && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Searching platforms...</span>
                <span className="text-muted-foreground">Please wait</span>
              </div>
              <div className="w-full bg-secondary/20 rounded-full h-2">
                <div className="bg-cyber-glow h-2 rounded-full animate-pulse w-2/3"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                <div>✓ Twitter</div>
                <div>✓ LinkedIn</div>
                <div className="animate-pulse">• Instagram</div>
                <div className="text-muted-foreground/50">○ Facebook</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}