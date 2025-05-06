"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ComicCard } from "@/components/comic-card"
import { Skeleton } from "@/components/ui/skeleton"
import { comicService } from "@/lib/api"
import type { Comic } from "@/types"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  const [results, setResults] = useState<Comic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const searchComics = async () => {
      if (!query) {
        setResults([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const data = await comicService.searchComics(query)
        setResults(data)
        setError(null)
      } catch (err) {
        console.error("Error searching comics:", err)
        setError("Failed to search comics. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    searchComics()
  }, [query])

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Results for "{query}"</h1>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {Array(12)
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
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {results.map((comic) => (
            <ComicCard key={comic.id} comic={comic} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No comics found matching your search.</p>
        </div>
      )}
    </main>
  )
}
