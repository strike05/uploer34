import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface ErrorDisplayProps {
  error: string | null
  className?: string
}

export function ErrorDisplay({ error, className }: ErrorDisplayProps) {
  if (!error) return null

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )
}

