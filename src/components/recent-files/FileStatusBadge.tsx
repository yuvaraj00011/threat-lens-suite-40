import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Clock, Eye, CheckCircle, AlertTriangle, Shield, Archive, Loader2 } from "lucide-react"

export type FileStatus = 'queued' | 'analyzing' | 'analyzed' | 'error' | 'quarantined' | 'archived'

interface FileStatusBadgeProps {
  status: FileStatus
  className?: string
}

const statusConfig = {
  queued: {
    label: 'Queued',
    icon: Clock,
    className: 'border-[hsl(var(--status-queued))] bg-[hsl(var(--status-queued)/0.1)] text-[hsl(var(--status-queued))]',
    tooltip: 'File is queued for analysis and will be processed soon.',
    animate: false
  },
  analyzing: {
    label: 'Analyzing',
    icon: Loader2,
    className: 'border-[hsl(var(--status-analyzing))] bg-[hsl(var(--status-analyzing)/0.1)] text-[hsl(var(--status-analyzing))]',
    tooltip: 'File is currently being analyzed by our security systems.',
    animate: true
  },
  analyzed: {
    label: 'Analyzed',
    icon: CheckCircle,
    className: 'border-[hsl(var(--status-analyzed))] bg-[hsl(var(--status-analyzed)/0.1)] text-[hsl(var(--status-analyzed))]',
    tooltip: 'File has been successfully analyzed and is safe to access.',
    animate: false
  },
  error: {
    label: 'Error',
    icon: AlertTriangle,
    className: 'border-[hsl(var(--status-error))] bg-[hsl(var(--status-error)/0.1)] text-[hsl(var(--status-error))]',
    tooltip: 'An error occurred during analysis. The file may be corrupted or unsupported.',
    animate: false
  },
  quarantined: {
    label: 'Quarantined',
    icon: Shield,
    className: 'border-[hsl(var(--status-quarantined))] bg-[hsl(var(--status-quarantined)/0.1)] text-[hsl(var(--status-quarantined))]',
    tooltip: 'File has been quarantined due to security threats. Access is restricted.',
    animate: false
  },
  archived: {
    label: 'Archived',
    icon: Archive,
    className: 'border-[hsl(var(--status-archived))] bg-[hsl(var(--status-archived)/0.1)] text-[hsl(var(--status-archived))]',
    tooltip: 'File has been archived and moved to long-term storage.',
    animate: false
  }
}

export function FileStatusBadge({ status, className }: FileStatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`${config.className} ${className} font-mono text-xs gap-1.5 transition-all duration-300`}
          >
            <Icon className={`h-3 w-3 ${config.animate ? 'animate-spin' : ''}`} />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm">{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}