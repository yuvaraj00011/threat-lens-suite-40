import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, User, Phone, Image, ExternalLink } from "lucide-react"
import type { SearchInput, SocialProfile } from "../SocialMediaFinder"

interface SocialMediaGraphProps {
  inputs: SearchInput[]
  results: SocialProfile[]
  onProfileSelect: (profileId: string) => void
}

// Custom node component for social profiles
function ProfileNode({ data }: { data: any }) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'border-green-500/50 bg-green-500/10'
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/10'
      case 'high': return 'border-red-500/50 bg-red-500/10'
      default: return 'border-gray-500/50 bg-gray-500/10'
    }
  }

  const getPlatformIcon = (platform: string) => {
    // You could use actual platform icons here
    return platform.charAt(0).toUpperCase()
  }

  if (data.type === 'input') {
    const getInputIcon = () => {
      switch (data.inputType) {
        case 'email': return <Mail className="h-4 w-4" />
        case 'username': return <User className="h-4 w-4" />
        case 'phone': return <Phone className="h-4 w-4" />
        case 'image': return <Image className="h-4 w-4" />
        default: return <User className="h-4 w-4" />
      }
    }

    return (
      <div className="p-4 border-2 border-cyber-glow/50 bg-cyber-glow/10 rounded-lg min-w-[200px]">
        <div className="flex items-center gap-2 mb-2">
          {getInputIcon()}
          <span className="font-mono text-sm font-semibold text-cyber-glow">
            {data.inputType.toUpperCase()}
          </span>
        </div>
        <div className="text-xs text-muted-foreground break-all">
          {data.value}
        </div>
      </div>
    )
  }

  return (
    <div className={`p-3 border-2 rounded-lg min-w-[180px] ${getRiskColor(data.profile.risk)}`}>
      <div className="flex items-center gap-2 mb-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={data.profile.profileImage} />
          <AvatarFallback>{getPlatformIcon(data.profile.platform)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-xs font-semibold truncate">
            @{data.profile.username}
          </div>
          <div className="text-xs text-muted-foreground">
            {data.profile.platform}
          </div>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="text-xs text-muted-foreground line-clamp-1">
          {data.profile.bio}
        </div>
        
        <div className="flex items-center justify-between">
          <Badge className={`text-xs ${getRiskColor(data.profile.risk)}`}>
            {data.profile.risk}
          </Badge>
          
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => data.onSelect?.(data.profile.id)}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-1">
          {data.profile.matchedBy.map((match: string) => (
            <span key={match} className="text-xs bg-secondary/50 px-1 rounded">
              {match}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

const nodeTypes = {
  profile: ProfileNode,
  input: ProfileNode,
}

export function SocialMediaGraph({ inputs, results, onProfileSelect }: SocialMediaGraphProps) {
  // Generate nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []

    // Create input nodes
    inputs.forEach((input, index) => {
      const x = (index % 3) * 250 - 250
      const y = -200
      
      nodes.push({
        id: `input-${input.id}`,
        type: 'input',
        position: { x, y },
        data: {
          type: 'input',
          inputType: input.type,
          value: input.value,
        },
      })
    })

    // Create profile nodes and edges
    results.forEach((profile, index) => {
      const angle = (index / results.length) * 2 * Math.PI
      const radius = 300
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius + 100

      nodes.push({
        id: `profile-${profile.id}`,
        type: 'profile',
        position: { x, y },
        data: {
          type: 'profile',
          profile,
          onSelect: onProfileSelect,
        },
      })

      // Create edges from matching inputs to this profile
      profile.matchedBy.forEach((matchType) => {
        const matchingInput = inputs.find(input => input.type === matchType)
        if (matchingInput) {
          edges.push({
            id: `edge-${matchingInput.id}-${profile.id}`,
            source: `input-${matchingInput.id}`,
            target: `profile-${profile.id}`,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#00f5ff' },
          })
        }
      })
    })

    return { initialNodes: nodes, initialEdges: edges }
  }, [inputs, results, onProfileSelect])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  if (inputs.length === 0 || results.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="text-muted-foreground">
              No data to visualize yet
            </div>
            <p className="text-sm text-muted-foreground">
              The graph will show connections between your search inputs and found social media profiles
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-[600px]">
      <CardHeader>
        <CardTitle className="text-sm font-cyber flex items-center justify-between">
          <span>Social Media Connection Graph</span>
          <div className="flex gap-2">
            <Badge variant="secondary">{inputs.length} inputs</Badge>
            <Badge variant="secondary">{results.length} profiles</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[500px] p-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="top-right"
          style={{ backgroundColor: 'transparent' }}
        >
          <Controls className="border-border bg-card" />
          <MiniMap 
            className="border-border bg-card"
            nodeColor={(node) => {
              if (node.type === 'input') return '#00f5ff'
              const profile = node.data?.profile as SocialProfile
              if (!profile) return '#6b7280'
              
              switch (profile.risk) {
                case 'low': return '#10b981'
                case 'medium': return '#f59e0b'
                case 'high': return '#ef4444'
                default: return '#6b7280'
              }
            }}
          />
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1}
            className="opacity-30"
          />
        </ReactFlow>
      </CardContent>
    </Card>
  )
}