import { useCallback } from 'react'
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Background,
  Controls,
  MiniMap,
  MarkerType
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Correlation {
  id: string
  type: string
  severity: string
  confidence: number
  description: string
  involvedTools: string[]
  timeline: Array<{
    time: string
    event: string
    tool: string
  }>
}

interface UViewCorrelationChartProps {
  correlations: Correlation[]
}

const initialNodes: Node[] = [
  {
    id: 'victim',
    type: 'default',
    position: { x: 400, y: 50 },
    data: { label: '👤 Victim Device' },
    style: { 
      background: 'hsl(var(--cyber-glow) / 0.1)', 
      border: '2px solid hsl(var(--cyber-glow))',
      borderRadius: '8px',
      padding: '10px'
    }
  },
  {
    id: 'scammer-call',
    type: 'default',
    position: { x: 100, y: 200 },
    data: { label: '📞 Suspicious Call\n+1-555-SCAM' },
    style: { 
      background: 'hsl(var(--destructive) / 0.1)', 
      border: '2px solid hsl(var(--destructive))',
      borderRadius: '8px',
      padding: '10px',
      whiteSpace: 'pre-line',
      textAlign: 'center'
    }
  },
  {
    id: 'phishing-email',
    type: 'default',
    position: { x: 700, y: 200 },
    data: { label: '📧 Phishing Email\nfake-bank@scam.com' },
    style: { 
      background: 'hsl(var(--destructive) / 0.1)', 
      border: '2px solid hsl(var(--destructive))',
      borderRadius: '8px',
      padding: '10px',
      whiteSpace: 'pre-line',
      textAlign: 'center'
    }
  },
  {
    id: 'financial-loss',
    type: 'default',
    position: { x: 400, y: 350 },
    data: { label: '💰 Financial Loss\n$850 Unauthorized' },
    style: { 
      background: 'hsl(var(--destructive) / 0.2)', 
      border: '3px solid hsl(var(--destructive))',
      borderRadius: '8px',
      padding: '10px',
      whiteSpace: 'pre-line',
      textAlign: 'center',
      fontWeight: 'bold'
    }
  },
  {
    id: 'social-profile',
    type: 'default',
    position: { x: 200, y: 500 },
    data: { label: '👥 Fake Profile\n@fake_friend_2024' },
    style: { 
      background: 'hsl(var(--secondary) / 0.1)', 
      border: '2px solid hsl(var(--secondary))',
      borderRadius: '8px',
      padding: '10px',
      whiteSpace: 'pre-line',
      textAlign: 'center'
    }
  },
  {
    id: 'fake-news',
    type: 'default',
    position: { x: 600, y: 500 },
    data: { label: '📰 Fake News\nMisleading Article' },
    style: { 
      background: 'hsl(var(--secondary) / 0.1)', 
      border: '2px solid hsl(var(--secondary))',
      borderRadius: '8px',
      padding: '10px',
      whiteSpace: 'pre-line',
      textAlign: 'center'
    }
  }
]

const initialEdges: Edge[] = [
  {
    id: 'e1',
    source: 'scammer-call',
    target: 'victim',
    label: '14:23 Call Received',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: 'hsl(var(--destructive))', strokeWidth: 2 },
    labelStyle: { fill: 'hsl(var(--foreground))', fontWeight: 600, fontSize: '12px' }
  },
  {
    id: 'e2',
    source: 'phishing-email',
    target: 'victim',
    label: '14:45 Email Clicked',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: 'hsl(var(--destructive))', strokeWidth: 2 },
    labelStyle: { fill: 'hsl(var(--foreground))', fontWeight: 600, fontSize: '12px' }
  },
  {
    id: 'e3',
    source: 'victim',
    target: 'financial-loss',
    label: '15:12 Transaction',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: 'hsl(var(--destructive))', strokeWidth: 3 },
    labelStyle: { fill: 'hsl(var(--destructive))', fontWeight: 700, fontSize: '14px' }
  },
  {
    id: 'e4',
    source: 'social-profile',
    target: 'victim',
    label: 'Social Engineering',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: 'hsl(var(--secondary))', strokeWidth: 2, strokeDasharray: '5,5' },
    labelStyle: { fill: 'hsl(var(--foreground))', fontWeight: 600, fontSize: '12px' }
  },
  {
    id: 'e5',
    source: 'fake-news',
    target: 'social-profile',
    label: 'Information Gathering',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: 'hsl(var(--secondary))', strokeWidth: 2, strokeDasharray: '5,5' },
    labelStyle: { fill: 'hsl(var(--foreground))', fontWeight: 600, fontSize: '12px' }
  },
  {
    id: 'e6',
    source: 'scammer-call',
    target: 'phishing-email',
    label: 'Coordinated Attack',
    type: 'smoothstep',
    style: { stroke: 'hsl(var(--cyber-glow))', strokeWidth: 2, strokeDasharray: '10,5' },
    labelStyle: { fill: 'hsl(var(--cyber-glow))', fontWeight: 600, fontSize: '12px' }
  }
]

export function UViewCorrelationChart({ correlations }: UViewCorrelationChartProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-cyber-glow font-cyber">
            Threat Correlation Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] border rounded-lg bg-background/50">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              attributionPosition="bottom-left"
            >
              <Background />
              <Controls />
              <MiniMap 
                nodeColor="#hsl(var(--cyber-glow))"
                nodeStrokeWidth={3}
                zoomable
                pannable
              />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>

      {/* Correlation Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {correlations.map((correlation) => (
          <Card key={correlation.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-cyber">
                  {correlation.type.replace('_', ' ').toUpperCase()}
                </CardTitle>
                <Badge variant={correlation.severity === 'HIGH' ? 'destructive' : 'secondary'}>
                  {correlation.severity}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {correlation.description}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-mono">Confidence:</span>
                  <span className="font-bold text-cyber-glow">
                    {(correlation.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {correlation.involvedTools.map((tool) => (
                    <Badge key={tool} variant="outline" className="text-xs font-mono">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}