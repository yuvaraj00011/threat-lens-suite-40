import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Users, Search, Network, Download } from "lucide-react"
import { SocialMediaInputPanel } from "./social-media/SocialMediaInputPanel"
import { SocialMediaResults } from "./social-media/SocialMediaResults"
import { SocialMediaGraph } from "./social-media/SocialMediaGraph"
import { SocialMediaExport } from "./social-media/SocialMediaExport"

interface SocialMediaFinderProps {
  isOpen: boolean
  onClose: () => void
}

export interface SearchInput {
  id: string
  type: 'email' | 'username' | 'phone' | 'image'
  value: string
}

export interface SocialProfile {
  id: string
  platform: string
  username: string
  profileUrl: string
  profileImage: string
  bio: string
  location: string
  matchedBy: string[]
  risk: 'low' | 'medium' | 'high'
  followers?: number
  verified?: boolean
  lastActive?: string
  notes?: string
  flagged?: boolean
}

export function SocialMediaFinder({ isOpen, onClose }: SocialMediaFinderProps) {
  const [activeTab, setActiveTab] = useState("input")
  const [searchInputs, setSearchInputs] = useState<SearchInput[]>([])
  const [searchResults, setSearchResults] = useState<SocialProfile[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [caseId, setCaseId] = useState("")

  const handleSearch = async (inputs: SearchInput[]) => {
    setIsSearching(true)
    setSearchInputs(inputs)
    
    // Simulate API search delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock search results
    const mockResults: SocialProfile[] = [
      {
        id: "1",
        platform: "Twitter",
        username: "john_doe_dev",
        profileUrl: "https://twitter.com/john_doe_dev",
        profileImage: "/placeholder.svg",
        bio: "Software Engineer | Tech Enthusiast | Coffee Lover",
        location: "San Francisco, CA",
        matchedBy: ["email", "username"],
        risk: "low",
        followers: 1234,
        verified: false,
        lastActive: "2 hours ago"
      },
      {
        id: "2",
        platform: "LinkedIn",
        username: "john-doe-engineer",
        profileUrl: "https://linkedin.com/in/john-doe-engineer",
        profileImage: "/placeholder.svg",
        bio: "Senior Software Engineer at TechCorp | 5+ years experience",
        location: "San Francisco Bay Area",
        matchedBy: ["email"],
        risk: "low",
        followers: 500,
        verified: true,
        lastActive: "1 day ago"
      },
      {
        id: "3",
        platform: "Instagram",
        username: "j.doe.photos",
        profileUrl: "https://instagram.com/j.doe.photos",
        profileImage: "/placeholder.svg",
        bio: "📸 Street Photography | 🌆 SF Based",
        location: "San Francisco",
        matchedBy: ["phone"],
        risk: "medium",
        followers: 2100,
        verified: false,
        lastActive: "5 minutes ago"
      }
    ]
    
    setSearchResults(mockResults)
    setIsSearching(false)
    setActiveTab("results")
  }

  const handleAnnotation = (profileId: string, notes: string, flagged: boolean) => {
    setSearchResults(prev => 
      prev.map(profile => 
        profile.id === profileId 
          ? { ...profile, notes, flagged }
          : profile
      )
    )
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-cyber-glow font-cyber">
            <Users className="h-5 w-5" />
            Social Media Finder
            {searchResults.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {searchResults.length} profiles found
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="input" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search Input
            </TabsTrigger>
            <TabsTrigger value="results" disabled={searchResults.length === 0}>
              Results ({searchResults.length})
            </TabsTrigger>
            <TabsTrigger value="graph" disabled={searchResults.length === 0}>
              <Network className="h-4 w-4" />
              Graph View
            </TabsTrigger>
            <TabsTrigger value="export" disabled={searchResults.length === 0}>
              <Download className="h-4 w-4" />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="mt-4">
            <SocialMediaInputPanel 
              onSearch={handleSearch}
              isSearching={isSearching}
              caseId={caseId}
              onCaseIdChange={setCaseId}
            />
          </TabsContent>

          <TabsContent value="results" className="mt-4">
            <SocialMediaResults 
              results={searchResults}
              onAnnotate={handleAnnotation}
            />
          </TabsContent>

          <TabsContent value="graph" className="mt-4">
            <SocialMediaGraph 
              inputs={searchInputs}
              results={searchResults}
              onProfileSelect={(profileId) => {
                setActiveTab("results")
              }}
            />
          </TabsContent>

          <TabsContent value="export" className="mt-4">
            <SocialMediaExport 
              inputs={searchInputs}
              results={searchResults}
              caseId={caseId}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}