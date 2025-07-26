import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  SlidersHorizontal
} from "lucide-react"
import { format } from "date-fns"
import { FileStatus } from "./FileStatusBadge"

export interface FileFilters {
  search: string
  fileType: string
  status: FileStatus | 'all'
  uploader: string
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
}

interface FileFiltersProps {
  filters: FileFilters
  onFiltersChange: (filters: FileFilters) => void
  uploaders: string[]
  fileTypes: string[]
}

export function FileFilters({ 
  filters, 
  onFiltersChange, 
  uploaders, 
  fileTypes 
}: FileFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateFilter = (key: keyof FileFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      fileType: 'all',
      status: 'all',
      uploader: 'all',
      dateRange: { from: undefined, to: undefined }
    })
  }

  const activeFiltersCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'search' && value) return count + 1
    if (key === 'fileType' && value !== 'all') return count + 1
    if (key === 'status' && value !== 'all') return count + 1
    if (key === 'uploader' && value !== 'all') return count + 1
    if (key === 'dateRange' && (value.from || value.to)) return count + 1
    return count
  }, 0)

  return (
    <div className="space-y-4">
      {/* Primary Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files by name..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10 bg-card/50 border-cyber-glow/20 focus:border-cyber-glow/50"
          />
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`
            border-cyber-glow/30 hover:border-cyber-glow/50 
            ${showAdvanced ? 'bg-cyber-glow/10 text-cyber-glow' : ''}
          `}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-cyber-danger hover:text-cyber-danger hover:bg-cyber-danger/10"
          >
            <X className="h-4 w-4 mr-1" />
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-card/30 rounded-lg border border-cyber-glow/20">
          {/* File Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-cyber-glow">File Type</label>
            <Select value={filters.fileType} onValueChange={(value) => updateFilter('fileType', value)}>
              <SelectTrigger className="bg-card/50 border-cyber-glow/20">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur border-cyber-glow/20">
                <SelectItem value="all">All Types</SelectItem>
                {fileTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-cyber-glow">Status</label>
            <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
              <SelectTrigger className="bg-card/50 border-cyber-glow/20">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur border-cyber-glow/20">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="analyzing">Analyzing</SelectItem>
                <SelectItem value="analyzed">Analyzed</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="quarantined">Quarantined</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Uploader Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-cyber-glow">Uploader</label>
            <Select value={filters.uploader} onValueChange={(value) => updateFilter('uploader', value)}>
              <SelectTrigger className="bg-card/50 border-cyber-glow/20">
                <SelectValue placeholder="All uploaders" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur border-cyber-glow/20">
                <SelectItem value="all">All Uploaders</SelectItem>
                {uploaders.map((uploader) => (
                  <SelectItem key={uploader} value={uploader}>
                    {uploader}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-cyber-glow">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left bg-card/50 border-cyber-glow/20 hover:border-cyber-glow/50"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "LLL dd")} -{" "}
                        {format(filters.dateRange.to, "LLL dd")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-auto p-0 bg-card/95 backdrop-blur border-cyber-glow/20" 
                align="start"
              >
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange.from}
                  selected={filters.dateRange}
                  onSelect={(range) => updateFilter('dateRange', range || { from: undefined, to: undefined })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="outline" className="bg-cyber-glow/10 border-cyber-glow/30 text-cyber-glow">
              Search: {filters.search}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('search', '')}
              />
            </Badge>
          )}
          {filters.fileType !== 'all' && (
            <Badge variant="outline" className="bg-accent/10 border-accent/30 text-accent">
              Type: {filters.fileType.toUpperCase()}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('fileType', 'all')}
              />
            </Badge>
          )}
          {filters.status !== 'all' && (
            <Badge variant="outline" className="bg-muted/20 border-muted text-foreground">
              Status: {filters.status}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('status', 'all')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}