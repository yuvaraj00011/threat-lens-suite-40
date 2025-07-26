import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SafeDocumentHandler } from "./SafeDocumentHandler"

interface SafeDocumentHandlerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SafeDocumentHandlerModal({ isOpen, onClose }: SafeDocumentHandlerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur border-cyber-glow/20">
        <DialogHeader>
          <DialogTitle className="text-cyber-glow font-cyber">
            Safe Document Handler
          </DialogTitle>
        </DialogHeader>
        <SafeDocumentHandler />
      </DialogContent>
    </Dialog>
  )
}