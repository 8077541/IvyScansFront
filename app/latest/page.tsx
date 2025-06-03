"use client"

import { useState, useMemo } from "react"
import { ComicCard } from "@/components/comic-card"
import { SortingControls } from "@/components/sorting-controls"
import { Pagination } from "@/components/pagination"
import { useApi } from "@/hooks/use-api"
import { comicService } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorFallback } from "@/components/error-fallback"

export default function LatestPage() {
  const [sortOption, setSortOption] = useState("latest")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Memoize the API call parameters to prevent unnecessary re-renders
  const apiParams = useMemo(() => ({ page: currentPage, limit: itemsPerPage }), [currentPage])

  const {
    data: comicsData,
    loading,
    error,
    retry,
  } = useApi(
    () => comicService.getLatestComics(apiParams.page, apiParams.limit),
    [currentPage], // Only refetch when page changes
    { retryLimit: 2, retryDelay: 2000 },
  )

  // Memoize sorted comics to prevent unnecessary re-sorting
  const sortedComics = useMemo(() => {
    if (!comicsData?.comics) return []

    const comics = [...comicsData.comics]
    return comics.sort((a, b) => {
      switch (sortOption) {
        case "a-z":
          return a.title.localeCompare(b.title)
        case "z-a":
          return b.title.localeCompare(a.title)
        case "latest":
        default:
          return a.updatedAt.includes("hour")
            ? -1
            : b.updatedAt.includes("hour")
              ? 1
              : a.updatedAt.includes("day")
                ? -1
                : b.updatedAt.includes("day")
                  ? 1
                  : 0
      }
    })
  }, [comicsData?.comics, sortOption])

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Latest Updates</h1>

      <SortingControls sortOption={sortOption} setSortOption={setSortOption} />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-6">
          {Array(itemsPerPage)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-[240px] w-full rounded-md" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
        </div>
      ) : error ? (
        <ErrorFallback error={error} onRetry={retry} title="Failed to load latest comics" />
      ) : sortedComics.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-6">
          {sortedComics.map((comic) => (
            <ComicCard key={comic.id} comic={comic} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No comics found. Please try again later.</p>
        </div>
      )}

      {comicsData && comicsData.totalPages > 1 && !loading && (
        <div className="mt-8">
          <Pagination currentPage={currentPage} totalPages={comicsData.totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </main>
  )
}
