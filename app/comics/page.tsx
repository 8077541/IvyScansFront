"use client"

import { useState, useEffect, useMemo } from "react"
import { ComicCard } from "@/components/comic-card"
import { SortingControls } from "@/components/sorting-controls"
import { FilterControls } from "@/components/filter-controls"
import { Pagination } from "@/components/pagination"
import { ErrorFallback } from "@/components/error-fallback"
import { LoadingFallback } from "@/components/loading-fallback"
import { useApi } from "@/hooks/use-api"
import { comicService } from "@/lib/api"

export default function ComicsPage() {
  // Filter and sort state
  const [sortOption, setSortOption] = useState("latest")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const itemsPerPage = 18

  // Memoize API call parameters to prevent unnecessary re-renders
  const apiParams = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      sort: sortOption,
      genres: selectedGenres,
      status: statusFilter !== "all" ? statusFilter : undefined,
    }),
    [currentPage, sortOption, selectedGenres, statusFilter],
  )

  // Use custom hook for comics API call
  const {
    data: comicsData,
    loading: comicsLoading,
    error: comicsError,
    retry: retryComics,
    retryCount: comicsRetryCount,
  } = useApi(() => comicService.getAllComics(apiParams), [apiParams], { retryLimit: 2, retryDelay: 2000 })

  // Use custom hook for genres API call
  const {
    data: genres,
    loading: genresLoading,
    error: genresError,
    retry: retryGenres,
  } = useApi(() => comicService.getGenres(), [], { retryLimit: 1, retryDelay: 1000 })

  // Extract comics data safely
  const comics = comicsData?.comics || []
  const totalPages = comicsData?.totalPages || 1

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [sortOption, selectedGenres, statusFilter])

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Comics</h1>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-64">
          {genresError ? (
            <ErrorFallback error="Failed to load genres" onRetry={retryGenres} showRetryButton={true} />
          ) : (
            <FilterControls
              selectedGenres={selectedGenres}
              setSelectedGenres={setSelectedGenres}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              allGenres={genres || []}
              disabled={genresLoading}
            />
          )}
        </div>

        <div className="flex-1">
          <SortingControls sortOption={sortOption} setSortOption={setSortOption} disabled={comicsLoading} />

          {comicsError ? (
            <div className="mt-6">
              <ErrorFallback
                error={comicsError}
                onRetry={retryComics}
                retryCount={comicsRetryCount}
                maxRetries={2}
                showRetryButton={true}
              />
            </div>
          ) : comicsLoading ? (
            <div className="mt-6">
              <LoadingFallback
                type="grid"
                count={itemsPerPage}
                message={comicsRetryCount > 0 ? `Retrying... (${comicsRetryCount}/2)` : undefined}
              />
            </div>
          ) : comics.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-6">
                {comics.map((comic) => (
                  <ComicCard key={comic.id} comic={comic} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 mt-6">
              <p className="text-muted-foreground">No comics found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
