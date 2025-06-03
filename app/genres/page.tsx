"use client"
import Link from "next/link"
import { useApi } from "@/hooks/use-api"
import { comicService } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorFallback } from "@/components/error-fallback"

export default function GenresPage() {
  const {
    data: genres,
    loading,
    error,
    retry,
  } = useApi(
    () => comicService.getGenres(),
    [], // No dependencies - only fetch once
    { retryLimit: 2, retryDelay: 2000 },
  )

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Browse by Genre</h1>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array(15)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
        </div>
      ) : error ? (
        <ErrorFallback error={error} onRetry={retry} title="Failed to load genres" />
      ) : genres && genres.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {genres.map((genre) => (
            <Link key={genre} href={`/genres/${genre.toLowerCase()}`}>
              <Card className="h-24 hover:border-green-500/50 transition-colors">
                <CardContent className="flex items-center justify-center h-full">
                  <h2 className="text-lg font-medium text-center">{genre}</h2>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No genres available at the moment.</p>
        </div>
      )}
    </main>
  )
}
