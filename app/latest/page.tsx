"use client"

import { useState, useEffect } from "react"
import type { Comic } from "@/types"
import { ComicCard } from "@/components/comic-card"
import { SortingControls } from "@/components/sorting-controls"
import { Pagination } from "@/components/pagination"
import { comicService } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function LatestPage() {
  const [comics, setComics] = useState<Comic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortOption, setSortOption] = useState("latest")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 12

  // Fetch latest comics
  useEffect(() => {
    const fetchLatestComics = async () => {
      setIsLoading(true)
      try {
        const { comics, totalPages } = await comicService.getLatestComics(currentPage, itemsPerPage)

        // Validate comics data
        if (!comics || !Array.isArray(comics)) {
          console.error("Invalid comics data received:", comics)
          setError("Received invalid data from the server. Please try again.")
          setComics([])
          setTotalPages(1)
        } else {
          // Filter out any comics with missing IDs
          const validComics = comics.filter((comic) => comic && comic.id)
          if (validComics.length < comics.length) {
            console.warn(`Filtered out ${comics.length - validComics.length} comics with missing IDs`)
          }

          setComics(validComics)
          setTotalPages(totalPages)
          setError(null)
        }
      } catch (err) {
        console.error("Error fetching latest comics:", err)
        setError("Failed to load latest comics. Please try again later.")
        setComics([])
        setTotalPages(1)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLatestComics()
  }, [currentPage])

  // Sort comics based on selected option
  const sortedComics = [...comics].sort((a, b) => {
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

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Latest Updates</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <SortingControls sortOption={sortOption} setSortOption={setSortOption} />

      {isLoading ? (
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

      {totalPages > 1 && !isLoading && (
        <div className="mt-8">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </main>
  )
}
