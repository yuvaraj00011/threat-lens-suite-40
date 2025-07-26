import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  ExternalLink, 
  MapPin, 
  Users, 
  Clock, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Edit3,
  Flag
} from "lucide-react"
import type { SocialProfile } from "../SocialMediaFinder"

interface SocialMediaResultsProps {
  results: SocialProfile[]
  onAnnotate: (profileId: string, notes: string, flagged: boolean) => void
}

export function SocialMediaResults({ results, onAnnotate }: SocialMediaResultsProps) {
  const [selectedProfile, setSelectedProfile] = useState<SocialProfile | null>(null)
  const [notes, setNotes] = useState("")
  const [flagged, setFlagged] = useState(false)
  const [filter, setFilter] = useState("")

  const filteredResults = results.filter(profile => 
    profile.username.toLowerCase().includes(filter.toLowerCase()) ||
    profile.platform.toLowerCase().includes(filter.toLowerCase()) ||
    profile.bio.toLowerCase().includes(filter.toLowerCase())
  )

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <CheckCircle className="h-3 w-3" />
      case 'medium': return <Shield className="h-3 w-3" />
      case 'high': return <AlertTriangle className="h-3 w-3" />
      default: return null
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter': return 'bg-blue-500/20 text-blue-400'
      case 'linkedin': return 'bg-blue-600/20 text-blue-300'
      case 'instagram': return 'bg-pink-500/20 text-pink-400'
      case 'facebook': return 'bg-blue-700/20 text-blue-200'
      case 'github': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const handleOpenProfile = (profile: SocialProfile) => {
    setSelectedProfile(profile)
    setNotes(profile.notes || "")
    setFlagged(profile.flagged || false)
  }

  const handleSaveAnnotation = () => {
    if (selectedProfile) {
      onAnnotate(selectedProfile.id, notes, flagged)
      setSelectedProfile(null)
    }
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No search results yet</h3>
        <p className="text-muted-foreground">
          Start a search from the Input tab to see social media profiles here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold font-cyber">Search Results</h3>
          <p className="text-sm text-muted-foreground">
            Found {results.length} profiles across {new Set(results.map(r => r.platform)).size} platforms
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Input
            placeholder="Filter results..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredResults.map((profile) => (
          <Card key={profile.id} className="relative group hover:shadow-cyber transition-all duration-300">
            {profile.flagged && (
              <div className="absolute top-2 right-2 z-10">
                <Flag className="h-4 w-4 text-red-400" />
              </div>
            )}
            
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profile.profileImage} alt={profile.username} />
                    <AvatarFallback>{profile.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm truncate font-mono">
                        @{profile.username}
                      </h4>
                      {profile.verified && (
                        <CheckCircle className="h-3 w-3 text-blue-400" />
                      )}
                    </div>
                    <Badge className={`${getPlatformColor(profile.platform)} text-xs mt-1`}>
                      {profile.platform}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {profile.bio}
              </p>

              <div className="space-y-2 text-xs">
                {profile.location && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{profile.location}</span>
                  </div>
                )}
                
                {profile.followers && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{profile.followers.toLocaleString()} followers</span>
                  </div>
                )}

                {profile.lastActive && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Active {profile.lastActive}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Badge className={`${getRiskColor(profile.risk)} text-xs flex items-center gap-1`}>
                  {getRiskIcon(profile.risk)}
                  {profile.risk} risk
                </Badge>

                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    asChild
                    className="h-7 w-7 p-0"
                  >
                    <a href={profile.profileUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => handleOpenProfile(profile)}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={profile.profileImage} />
                            <AvatarFallback>{profile.username.charAt(0)}</AvatarFallback>
                          </Avatar>
                          Annotate Profile: @{profile.username}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="notes">Investigation Notes</Label>
                          <Textarea
                            id="notes"
                            placeholder="Add notes about this profile..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="flagged"
                            checked={flagged}
                            onCheckedChange={setFlagged}
                          />
                          <Label htmlFor="flagged">Flag as suspicious</Label>
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={handleSaveAnnotation} className="flex-1">
                            Save Annotation
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {profile.matchedBy.map((match) => (
                  <Badge key={match} variant="outline" className="text-xs">
                    matched by {match}
                  </Badge>
                ))}
              </div>

              {profile.notes && (
                <div className="bg-secondary/20 p-2 rounded text-xs">
                  <p className="text-muted-foreground">Notes:</p>
                  <p>{profile.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResults.length === 0 && filter && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No results match your filter</p>
        </div>
      )}
    </div>
  )
}