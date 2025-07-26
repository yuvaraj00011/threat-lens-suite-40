import { useState } from "react"
import { CheckCircle, AlertCircle, FileText, Clock, Brain } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { CategorizationResult, INVESTIGATION_CATEGORIES } from "./DataCategorizationEngine"

interface DataCategorizationResultsProps {
  result: CategorizationResult
  isOpen: boolean
  onClose: () => void
  onConfirm: (selectedCategories: string[]) => void
  onCancel: () => void
}

interface CategorySelectionState {
  [categoryId: string]: boolean
}

export function DataCategorizationResults({ 
  result, 
  isOpen, 
  onClose, 
  onConfirm, 
  onCancel 
}: DataCategorizationResultsProps) {
  const { toast } = useToast()
  const [selectedCategories, setSelectedCategories] = useState<CategorySelectionState>({})
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Initialize selection state when component opens
  useState(() => {
    if (result && isOpen) {
      const initialSelection: CategorySelectionState = {}
      result.categorizedData.forEach(data => {
        initialSelection[data.category] = true // Select all by default
      })
      setSelectedCategories(initialSelection)
    }
  })

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  const handleProceed = () => {
    const selected = Object.entries(selectedCategories)
      .filter(([_, isSelected]) => isSelected)
      .map(([categoryId]) => categoryId)

    if (selected.length === 0) {
      toast({
        title: "No Categories Selected",
        description: "Please select at least one category to proceed with analysis.",
        variant: "destructive"
      })
      return
    }

    setShowConfirmation(true)
  }

  const handleConfirmExecution = () => {
    const selected = Object.entries(selectedCategories)
      .filter(([_, isSelected]) => isSelected)
      .map(([categoryId]) => categoryId)

    onConfirm(selected)
    setShowConfirmation(false)
    onClose()
  }

  const getCategoryInfo = (categoryId: string) => {
    return INVESTIGATION_CATEGORIES.find(cat => cat.id === categoryId)
  }

  const getTotalSelectedFiles = () => {
    return result.categorizedData
      .filter(data => selectedCategories[data.category])
      .reduce((total, data) => total + data.files.length, 0)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-400"
    if (confidence >= 0.6) return "text-yellow-400"
    return "text-orange-400"
  }

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return "High"
    if (confidence >= 0.6) return "Medium"
    return "Low"
  }

  return (
    <>
      <Dialog open={isOpen && !showConfirmation} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur border-cyber-glow/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-cyber-glow font-cyber">
              <Brain className="h-6 w-6" />
              AI Data Categorization Results
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              The AI has analyzed your data dump and categorized it into investigation tools. 
              Review the results and select which tools to run.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-card/50 border-cyber-glow/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-cyber-glow font-cyber">
                    {result.totalFiles}
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">Total Files</p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-accent/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-accent font-cyber">
                    {result.categorizedData.length}
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">Categories Found</p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-cyber-glow-secondary/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-cyber-glow-secondary font-cyber">
                    {getTotalSelectedFiles()}
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">Selected Files</p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-cyber-warning/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-cyber-warning font-cyber">
                    {result.processingTime}ms
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">Processing Time</p>
                </CardContent>
              </Card>
            </div>

            {/* Categorized Data */}
            {result.categorizedData.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-cyber-glow font-cyber flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Categorized Data ({result.categorizedData.length} categories)
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {result.categorizedData.map((data) => {
                    const categoryInfo = getCategoryInfo(data.category)
                    const isSelected = selectedCategories[data.category]

                    return (
                      <Card 
                        key={data.category}
                        className={`
                          cursor-pointer transition-all duration-300 border
                          ${isSelected 
                            ? 'bg-cyber-glow/5 border-cyber-glow shadow-cyber' 
                            : 'bg-card/30 border-cyber-glow/20 hover:border-cyber-glow/50'
                          }
                        `}
                        onClick={() => toggleCategorySelection(data.category)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`
                                w-3 h-3 rounded-full transition-all duration-300
                                ${isSelected ? 'bg-cyber-glow animate-pulse-glow' : 'bg-muted'}
                              `} />
                              <CardTitle className="text-base font-cyber">
                                {categoryInfo?.name || data.category}
                              </CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono text-xs">
                                {data.files.length} files
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`font-mono text-xs ${getConfidenceColor(data.confidence)}`}
                              >
                                {getConfidenceText(data.confidence)}
                              </Badge>
                            </div>
                          </div>
                          <Progress 
                            value={data.confidence * 100} 
                            className="h-2 bg-muted/20"
                          />
                        </CardHeader>

                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground mb-3 font-mono">
                            {categoryInfo?.description}
                          </p>

                          {/* Preview Data */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                              Preview Data:
                            </h4>
                            <div className="space-y-1">
                              {data.preview.slice(0, 3).map((item, index) => (
                                <div 
                                  key={index}
                                  className="text-xs bg-muted/20 rounded px-2 py-1 font-mono"
                                >
                                  {item}
                                </div>
                              ))}
                              {data.preview.length > 3 && (
                                <div className="text-xs text-muted-foreground font-mono">
                                  +{data.preview.length - 3} more items...
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Uncategorized Files */}
            {result.uncategorizedFiles.length > 0 && (
              <Alert className="border-cyber-warning/20 bg-cyber-warning/5">
                <AlertCircle className="h-4 w-4 text-cyber-warning" />
                <AlertDescription className="text-cyber-warning">
                  <strong>{result.uncategorizedFiles.length} files</strong> could not be categorized automatically. 
                  They will be available for manual review in the Safe Document Handler.
                </AlertDescription>
              </Alert>
            )}

            <Separator className="border-cyber-glow/20" />

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground font-mono">
                Ready to run analysis on {getTotalSelectedFiles()} files across {Object.values(selectedCategories).filter(Boolean).length} tools
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={onCancel}
                  className="border-cyber-glow/30 hover:bg-cyber-glow/10"
                >
                  Cancel
                </Button>
                <Button 
                  variant="cyber" 
                  onClick={handleProceed}
                  disabled={getTotalSelectedFiles() === 0}
                  className="min-w-32"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Run Analysis
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md bg-background/95 backdrop-blur border-cyber-glow/20">
          <DialogHeader>
            <DialogTitle className="text-cyber-glow font-cyber flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Confirm Analysis Execution
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to run automated analysis on the selected data categories? 
              This process cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert className="border-cyber-glow/20 bg-cyber-glow/5">
              <Clock className="h-4 w-4 text-cyber-glow" />
              <AlertDescription className="text-cyber-glow">
                <strong>Analysis will run on:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  {Object.entries(selectedCategories)
                    .filter(([_, isSelected]) => isSelected)
                    .map(([categoryId]) => {
                      const categoryInfo = getCategoryInfo(categoryId)
                      const dataCount = result.categorizedData.find(d => d.category === categoryId)?.files.length || 0
                      return (
                        <li key={categoryId} className="flex justify-between">
                          <span>• {categoryInfo?.name}</span>
                          <span className="font-mono">{dataCount} files</span>
                        </li>
                      )
                    })}
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmation(false)}
                className="border-cyber-glow/30 hover:bg-cyber-glow/10"
              >
                Cancel
              </Button>
              <Button 
                variant="cyber" 
                onClick={handleConfirmExecution}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Yes, Run Analysis
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}