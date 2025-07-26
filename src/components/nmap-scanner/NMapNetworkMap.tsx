import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Network, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Monitor,
  AlertTriangle,
  Shield
} from "lucide-react"
import { toast } from "sonner"

interface ScanResult {
  id: string
  ip: string
  hostname?: string
  ports: Array<{
    port: number
    service: string
    version?: string
    state: 'open' | 'closed' | 'filtered'
    vulnerabilities: Array<{
      cve: string
      severity: 'low' | 'medium' | 'high' | 'critical'
      description: string
      cvss: number
    }>
  }>
  os?: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  lastScanned: Date
}

interface NMapNetworkMapProps {
  results: ScanResult[]
  selectedHost: ScanResult | null
  onHostSelect: (host: ScanResult) => void
}

export function NMapNetworkMap({ results, selectedHost, onHostSelect }: NMapNetworkMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [zoomLevel, setZoomLevel] = useState(100)

  useEffect(() => {
    if (!svgRef.current || results.length === 0) return
    renderNetworkMap()
  }, [results, selectedHost])

  const renderNetworkMap = () => {
    const svg = svgRef.current
    if (!svg) return

    svg.innerHTML = ''
    const width = svg.clientWidth
    const height = svg.clientHeight
    const centerX = width / 2
    const centerY = height / 2

    // Create central router/gateway node
    const gatewayNode = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    gatewayNode.setAttribute('cx', centerX.toString())
    gatewayNode.setAttribute('cy', centerY.toString())
    gatewayNode.setAttribute('r', '20')
    gatewayNode.setAttribute('fill', '#06b6d4')
    gatewayNode.setAttribute('stroke', '#0891b2')
    gatewayNode.setAttribute('stroke-width', '3')
    svg.appendChild(gatewayNode)

    const gatewayLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    gatewayLabel.setAttribute('x', centerX.toString())
    gatewayLabel.setAttribute('y', (centerY + 35).toString())
    gatewayLabel.setAttribute('text-anchor', 'middle')
    gatewayLabel.setAttribute('class', 'text-xs font-mono fill-cyber-glow')
    gatewayLabel.textContent = 'Gateway'
    svg.appendChild(gatewayLabel)

    // Arrange hosts in a circle around the gateway
    const radius = Math.min(width, height) / 3
    results.forEach((host, index) => {
      const angle = (index / results.length) * 2 * Math.PI
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      // Draw connection line to gateway
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('x1', centerX.toString())
      line.setAttribute('y1', centerY.toString())
      line.setAttribute('x2', x.toString())
      line.setAttribute('y2', y.toString())
      line.setAttribute('stroke', '#374151')
      line.setAttribute('stroke-width', '2')
      line.setAttribute('opacity', '0.6')
      svg.appendChild(line)

      // Draw host node
      const hostNode = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      hostNode.setAttribute('cx', x.toString())
      hostNode.setAttribute('cy', y.toString())
      hostNode.setAttribute('r', '15')
      hostNode.setAttribute('fill', getRiskColor(host.riskLevel))
      hostNode.setAttribute('stroke', selectedHost?.id === host.id ? '#ffffff' : getRiskColor(host.riskLevel))
      hostNode.setAttribute('stroke-width', selectedHost?.id === host.id ? '3' : '2')
      hostNode.setAttribute('class', 'cursor-pointer transition-all duration-300 hover:r-18')
      
      if (host.riskLevel === 'high' || host.riskLevel === 'critical') {
        hostNode.classList.add('animate-pulse')
      }

      hostNode.addEventListener('click', () => {
        onHostSelect(host)
        toast.info(`Selected host ${host.ip}`)
      })

      svg.appendChild(hostNode)

      // Add vulnerability indicator
      const vulnCount = host.ports.reduce((acc, port) => acc + port.vulnerabilities.length, 0)
      if (vulnCount > 0) {
        const indicator = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        indicator.setAttribute('cx', (x + 12).toString())
        indicator.setAttribute('cy', (y - 12).toString())
        indicator.setAttribute('r', '6')
        indicator.setAttribute('fill', '#ef4444')
        indicator.setAttribute('stroke', '#ffffff')
        indicator.setAttribute('stroke-width', '2')
        indicator.classList.add('animate-pulse')
        svg.appendChild(indicator)

        const vulnText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        vulnText.setAttribute('x', (x + 12).toString())
        vulnText.setAttribute('y', (y - 8).toString())
        vulnText.setAttribute('text-anchor', 'middle')
        vulnText.setAttribute('class', 'text-xs font-mono fill-white')
        vulnText.textContent = vulnCount.toString()
        svg.appendChild(vulnText)
      }

      // Add host label
      const hostLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      hostLabel.setAttribute('x', x.toString())
      hostLabel.setAttribute('y', (y + 25).toString())
      hostLabel.setAttribute('text-anchor', 'middle')
      hostLabel.setAttribute('class', 'text-xs font-mono fill-current text-muted-foreground')
      hostLabel.textContent = host.ip
      svg.appendChild(hostLabel)

      // Add OS info if available
      if (host.os) {
        const osLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        osLabel.setAttribute('x', x.toString())
        osLabel.setAttribute('y', (y + 38).toString())
        osLabel.setAttribute('text-anchor', 'middle')
        osLabel.setAttribute('class', 'text-xs font-mono fill-current text-muted-foreground opacity-70')
        osLabel.textContent = host.os
        svg.appendChild(osLabel)
      }
    })
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return '#dc2626'
      case 'high': return '#ea580c'
      case 'medium': return '#ca8a04'
      default: return '#16a34a'
    }
  }

  const zoomIn = () => {
    setZoomLevel(Math.min(200, zoomLevel + 25))
  }

  const zoomOut = () => {
    setZoomLevel(Math.max(50, zoomLevel - 25))
  }

  const resetView = () => {
    setZoomLevel(100)
    renderNetworkMap()
  }

  return (
    <Card className="h-full bg-card/30 border-cyber-glow/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-cyber text-cyber-glow flex items-center gap-2">
            <Network className="h-5 w-5" />
            Network Topology
          </CardTitle>
          <div className="flex items-center gap-2">
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
      <CardContent className="p-0 h-96 relative">
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ transform: `scale(${zoomLevel / 100})` }}
        />
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur-sm border border-cyber-glow/20 rounded-lg p-3">
          <div className="text-xs font-mono text-muted-foreground mb-2">Risk Levels</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600" />
              <span className="text-xs font-mono">Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-600" />
              <span className="text-xs font-mono">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-600" />
              <span className="text-xs font-mono">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600" />
              <span className="text-xs font-mono">Low</span>
            </div>
          </div>
        </div>

        {/* Selected Host Info */}
        {selectedHost && (
          <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm border border-cyber-glow/20 rounded-lg p-4 max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <Monitor className="h-4 w-4 text-cyber-glow" />
              <span className="font-mono font-semibold">{selectedHost.ip}</span>
              <Badge variant="outline" className={`text-xs ${getRiskLevel(selectedHost.riskLevel)}`}>
                {selectedHost.riskLevel.toUpperCase()}
              </Badge>
            </div>
            <div className="space-y-1 text-xs font-mono">
              {selectedHost.hostname && (
                <div>Hostname: {selectedHost.hostname}</div>
              )}
              {selectedHost.os && (
                <div>OS: {selectedHost.os}</div>
              )}
              <div>Open Ports: {selectedHost.ports.filter(p => p.state === 'open').length}</div>
              <div>Vulnerabilities: {selectedHost.ports.reduce((acc, port) => acc + port.vulnerabilities.length, 0)}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  function getRiskLevel(level: string) {
    switch (level) {
      case 'critical': return 'text-red-500 border-red-500'
      case 'high': return 'text-orange-500 border-orange-500'
      case 'medium': return 'text-yellow-500 border-yellow-500'
      default: return 'text-green-500 border-green-500'
    }
  }
}