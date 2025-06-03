"use client"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { ComicCard } from "@/components/comic-card"
import { useApi } from "@/hooks/use-api"
import { comicService } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorFallback } from "@/components/error-fallback"

// Loading component for featured comics
function FeaturedComicsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-[240px] w-full rounded-md" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
    </div>
  )
}

// Featured comics component
function FeaturedComics() {
  const {
    data: featuredComics,
    loading,
    error,
    retry,
  } = useApi(
    () => comicService.getFeaturedComics(),
    [], // No dependencies - only fetch once
    { retryLimit: 2, retryDelay: 2000 },
  )

  if (loading) {
    return <FeaturedComicsSkeleton />
  }

  if (error) {
    return <ErrorFallback error={error} onRetry={retry} title="Failed to load featured comics" />
  }

  if (!featuredComics || featuredComics.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No featured comics available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {featuredComics.map((comic) => (
        <ComicCard key={comic.id} comic={comic} />
      ))}
    </div>
  )
}

// Latest updates component
function LatestUpdates() {
  const {
    data: latestData,
    loading,
    error,
    retry,
  } = useApi(
    () => comicService.getLatestComics(1, 6),
    [], // No dependencies - only fetch once
    { retryLimit: 2, retryDelay: 2000 },
  )

  if (loading) {
    return <FeaturedComicsSkeleton />
  }

  if (error) {
    return <ErrorFallback error={error} onRetry={retry} title="Failed to load latest updates" />
  }

  const latestComics = latestData?.comics || []

  if (latestComics.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No latest updates available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {latestComics.map((comic) => (
        <ComicCard key={comic.id} comic={comic} />
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Comics</h2>
          <Link href="/comics" className="text-green-400 hover:text-green-300 flex items-center">
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <FeaturedComics />
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Latest Updates</h2>
          <Link href="/latest" className="text-green-400 hover:text-green-300 flex items-center">
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <LatestUpdates />
      </section>
    </main>
  )
}
