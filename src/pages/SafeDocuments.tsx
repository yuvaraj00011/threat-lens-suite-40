import { SafeDocumentHandler } from "@/components/SafeDocumentHandler"

export default function SafeDocuments() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <SafeDocumentHandler />
      </div>
    </div>
  )
}