import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Play, 
  Pause,
  Filter,
  AlertTriangle,
  Shield
} from "lucide-react"
import { toast } from "sonner"

interface NetworkGraphProps {
  data: any
  onNodeSelect: (node: any) => void
}

export function MoneyMapperNetworkGraph({ data, onNodeSelect }: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [riskFilter, setRiskFilter] = useState([0])
  const [selectedNode, setSelectedNode] = useState<any>(null)

  useEffect(() => {
    if (!svgRef.current || !data) return
    
    // Initialize D3 network visualization
    initializeNetworkGraph()
  }, [data])

  const initializeNetworkGraph = () => {
    const svg = svgRef.current
    if (!svg) return

    // Clear previous content
    svg.innerHTML = ''

    const width = svg.clientWidth
    const height = svg.clientHeight

    // Create sample network visualization
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 3

    // Draw nodes
    data.nodes.forEach((node: any, index: number) => {
      const angle = (index / data.nodes.length) * 2 * Math.PI
      const x = centerX + Math.cos(angle) * radius * (0.5 + Math.random() * 0.5)
      const y = centerY + Math.sin(angle) * radius * (0.5 + Math.random() * 0.5)

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('cx', x.toString())
      circle.setAttribute('cy', y.toString())
      circle.setAttribute('r', (5 + node.riskScore / 10).toString())
      circle.setAttribute('fill', getNodeColor(node.type))
      circle.setAttribute('stroke', node.type === 'high-risk' ? '#ef4444' : '#06b6d4')
      circle.setAttribute('stroke-width', '2')
      circle.setAttribute('class', 'cursor-pointer transition-all duration-300 hover:r-8')
      
      if (node.type === 'high-risk') {
        circle.classList.add('animate-pulse')
      }

      circle.addEventListener('click', () => {
        setSelectedNode(node)
        onNodeSelect(node)
        toast.info(`Selected ${node.label}`)
      })

      svg.appendChild(circle)

      // Add label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.setAttribute('x', x.toString())
      text.setAttribute('y', (y + 20).toString())
      text.setAttribute('text-anchor', 'middle')
      text.setAttribute('class', 'text-xs font-mono fill-current text-muted-foreground')
      text.textContent = node.label
      svg.appendChild(text)
    })

    // Draw edges (transactions)
    data.edges.forEach((edge: any) => {
      const sourceNode = data.nodes.find((n: any) => n.id === edge.source)
      const targetNode = data.nodes.find((n: any) => n.id === edge.target)
      
      if (sourceNode && targetNode) {
        const sourceIndex = data.nodes.indexOf(sourceNode)
        const targetIndex = data.nodes.indexOf(targetNode)
        
        const sourceAngle = (sourceIndex / data.nodes.length) * 2 * Math.PI
        const targetAngle = (targetIndex / data.nodes.length) * 2 * Math.PI
        
        const x1 = centerX + Math.cos(sourceAngle) * radius * (0.5 + Math.random() * 0.5)
        const y1 = centerY + Math.sin(sourceAngle) * radius * (0.5 + Math.random() * 0.5)
        const x2 = centerX + Math.cos(targetAngle) * radius * (0.5 + Math.random() * 0.5)
        const y2 = centerY + Math.sin(targetAngle) * radius * (0.5 + Math.random() * 0.5)

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        line.setAttribute('x1', x1.toString())
        line.setAttribute('y1', y1.toString())
        line.setAttribute('x2', x2.toString())
        line.setAttribute('y2', y2.toString())
        line.setAttribute('stroke', edge.suspicious ? '#ef4444' : '#06b6d4')
        line.setAttribute('stroke-width', edge.suspicious ? '3' : '1')
        line.setAttribute('opacity', '0.6')
        
        if (edge.suspicious) {
          line.classList.add('animate-pulse')
        }

        svg.appendChild(line)
      }
    })
  }

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'high-risk': return '#ef4444'
      case 'medium-risk': return '#f59e0b'
      default: return '#06b6d4'
    }
  }

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating)
    if (!isAnimating) {
      // Start money flow animation
      toast.success("Money flow animation started")
    } else {
      toast.info("Animation paused")
    }
  }

  const resetView = () => {
    setZoomLevel(100)
    setRiskFilter([0])
    initializeNetworkGraph()
    toast.info("View reset to default")
  }

  const zoomIn = () => {
    setZoomLevel(Math.min(200, zoomLevel + 25))
  }

  const zoomOut = () => {
    setZoomLevel(Math.max(50, zoomLevel - 25))
  }

  return (
    <div className="h-full flex gap-4">
      {/* Network Graph */}
      <Card className="flex-1 bg-card/30 border-cyber-glow/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-cyber text-cyber-glow flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Transaction Network
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAnimation}
                className="border-cyber-glow/20"
              >
                {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isAnimating ? 'Pause' : 'Animate'}
              </Button>
              <Button variant="outline" size="sm" onClick={zoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={zoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={resetView}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 h-full">
          <div className="relative h-full">
            <svg
              ref={svgRef}
              className="w-full h-full"
              style={{ transform: `scale(${zoomLevel / 100})` }}
            />
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur-sm border border-cyber-glow/20 rounded-lg p-3">
              <div className="text-xs font-mono text-muted-foreground mb-2">Legend</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-xs font-mono">High Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-xs font-mono">Medium Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500" />
                  <span className="text-xs font-mono">Normal</span>
                </div>
              </div>
            </div>

            {/* Stats Overlay */}
            <div className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm border border-cyber-glow/20 rounded-lg p-3">
              <div className="text-xs font-mono text-muted-foreground mb-2">Network Stats</div>
              <div className="space-y-1">
                <div className="flex justify-between gap-4">
                  <span className="text-xs font-mono">Nodes:</span>
                  <span className="text-xs font-mono text-cyber-glow">{data.nodes.length}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-xs font-mono">Edges:</span>
                  <span className="text-xs font-mono text-cyber-glow">{data.edges.length}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-xs font-mono">High Risk:</span>
                  <span className="text-xs font-mono text-red-500">
                    {data.nodes.filter((n: any) => n.type === 'high-risk').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls & Filters */}
      <Card className="w-80 bg-card/30 border-cyber-glow/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-cyber text-cyber-glow flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Analysis Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Zoom Control */}
          <div className="space-y-2">
            <label className="text-sm font-mono text-muted-foreground">Zoom Level</label>
            <Slider
              value={[zoomLevel]}
              onValueChange={(value) => setZoomLevel(value[0])}
              min={50}
              max={200}
              step={25}
              className="w-full"
            />
            <div className="text-xs font-mono text-center text-muted-foreground">
              {zoomLevel}%
            </div>
          </div>

          {/* Risk Filter */}
          <div className="space-y-2">
            <label className="text-sm font-mono text-muted-foreground">Risk Threshold</label>
            <Slider
              value={riskFilter}
              onValueChange={setRiskFilter}
              min={0}
              max={100}
              step={10}
              className="w-full"
            />
            <div className="text-xs font-mono text-center text-muted-foreground">
              Show nodes with risk ≥ {riskFilter[0]}%
            </div>
          </div>

          {/* Selected Node Info */}
          {selectedNode && (
            <div className="space-y-3 p-3 border border-cyber-glow/20 rounded-lg bg-card/20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-cyber-warning" />
                <span className="text-sm font-mono font-semibold">Selected Node</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs font-mono text-muted-foreground">ID:</span>
                  <span className="text-xs font-mono">{selectedNode.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-mono text-muted-foreground">Type:</span>
                  <Badge variant="outline" className="text-xs">
                    {selectedNode.type}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-mono text-muted-foreground">Risk Score:</span>
                  <span className="text-xs font-mono text-cyber-warning">
                    {selectedNode.riskScore.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-mono text-muted-foreground">Amount:</span>
                  <span className="text-xs font-mono text-cyber-glow">
                    ${selectedNode.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Modes */}
          <div className="space-y-3">
            <label className="text-sm font-mono text-muted-foreground">Analysis Mode</label>
            <div className="grid grid-cols-1 gap-2">
              <Button variant="outline" size="sm" className="justify-start">
                Money Laundering Detection
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                Sanctions Screening
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                Pattern Recognition
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                Velocity Analysis
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}