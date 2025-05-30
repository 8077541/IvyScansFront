import { Skeleton } from "@/components/ui/skeleton"

interface LoadingFallbackProps {
  type?: "grid" | "list" | "card"
  count?: number
  message?: string
}

export function LoadingFallback({ type = "grid", count = 6, message }: LoadingFallbackProps) {
  if (type === "grid") {
    return (
      <div className="space-y-4">
        {message && <p className="text-sm text-muted-foreground text-center">{message}</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {Array(count)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-[240px] w-full rounded-md" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
        </div>
      </div>
    )
  }

  if (type === "list") {
    return (
      <div className="space-y-4">
        {message && <p className="text-sm text-muted-foreground text-center">{message}</p>}
        {Array(count)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex space-x-4">
              <Skeleton className="h-20 w-20 rounded-md" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {message && <p className="text-sm text-muted-foreground text-center">{message}</p>}
      <Skeleton className="h-[200px] w-full rounded-md" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}
