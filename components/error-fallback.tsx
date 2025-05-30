"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ErrorFallbackProps {
  error: string
  onRetry?: () => void
  retryCount?: number
  maxRetries?: number
  showRetryButton?: boolean
}

export function ErrorFallback({
  error,
  onRetry,
  retryCount = 0,
  maxRetries = 3,
  showRetryButton = true,
}: ErrorFallbackProps) {
  const canRetry = retryCount < maxRetries && showRetryButton && onRetry

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error Loading Content</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">{error}</p>
        {canRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="flex items-center gap-2">
            <RefreshCw className="h-3 w-3" />
            Retry ({retryCount}/{maxRetries})
          </Button>
        )}
        {!canRetry && retryCount >= maxRetries && (
          <p className="text-sm text-muted-foreground mt-2">
            Maximum retry attempts reached. Please check your connection and refresh the page.
          </p>
        )}
      </AlertDescription>
    </Alert>
  )
}
