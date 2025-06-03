"use client"

import { useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Home, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { comicService, userService } from "@/lib/api"
import { useApi } from "@/hooks/use-api"
import { ErrorFallback } from "@/components/error-fallback"
import { LoadingFallback } from "@/components/loading-fallback"

interface ChapterPageProps {
  params: {
    id: string
    chapter: string
  }
}

export default function ChapterPage({ params }: ChapterPageProps) {
  // Access params directly since this is a client component
  const comicId = params.id
  const chapterParam = params.chapter

  // Memoize chapter number to prevent unnecessary re-computations
  const chapterNumber = useMemo(() => {
    const num = Number.parseInt(chapterParam, 10)
    return isNaN(num) ? 1 : num
  }, [chapterParam])

  // Fetch chapter data
  const {
    data: chapterData,
    loading: chapterLoading,
    error: chapterError,
    retry: retryChapter,
    retryCount: chapterRetryCount,
  } = useApi(() => comicService.getChapter(comicId, chapterNumber), [comicId, chapterNumber], {
    retryLimit: 2,
    retryDelay: 1000,
  })

  // Fetch comic details for navigation
  const {
    data: comic,
    loading: comicLoading,
    error: comicError,
    retry: retryComic,
  } = useApi(() => comicService.getComicById(comicId), [comicId], { retryLimit: 2, retryDelay: 1000 })

  // Add to reading history when chapter loads successfully
  useEffect(() => {
    if (chapterData && comic) {
      const addToHistory = async () => {
        try {
          await userService.addToHistory(comicId, chapterData.id || `chapter-${chapterNumber}`, chapterNumber)
        } catch (error) {
          console.error("Failed to add to reading history:", error)
          // Don't show error to user for history tracking failures
        }
      }

      addToHistory()
    }
  }, [chapterData, comic, comicId, chapterNumber])

  // Show loading state
  if (chapterLoading || comicLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <LoadingFallback type="card" message="Loading chapter..." />
      </main>
    )
  }

  // Show error state
  if (chapterError || comicError) {
    return (
      <main className="container mx-auto px-4 py-8">
        <ErrorFallback
          error={chapterError || comicError || "Failed to load chapter"}
          onRetry={chapterError ? retryChapter : retryComic}
          retryCount={chapterRetryCount}
          maxRetries={2}
        />
      </main>
    )
  }

  // Show not found state
  if (!chapterData || !comic) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <h2 className="text-xl font-bold text-red-500">Chapter Not Found</h2>
          <p className="text-muted-foreground mt-2">The requested chapter could not be found.</p>
          <Button className="mt-4" asChild>
            <Link href={`/comics/${comicId}`}>Back to Comic</Link>
          </Button>
        </div>
      </main>
    )
  }

  const prevChapter = chapterNumber > 1 ? chapterNumber - 1 : null
  const nextChapter = chapterNumber < (chapterData.totalChapters || 999) ? chapterNumber + 1 : null

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                <Home className="h-5 w-5" />
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-600" />
              <Link
                href={`/comics/${comicId}`}
                className="text-gray-400 hover:text-white transition-colors truncate max-w-[200px]"
              >
                {comic.title}
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-600" />
              <Badge variant="outline" className="text-white border-gray-600">
                Chapter {chapterNumber}
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              {prevChapter && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/comics/${comicId}/chapters/${prevChapter}`}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Prev
                  </Link>
                </Button>
              )}
              {nextChapter && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/comics/${comicId}/chapters/${nextChapter}`}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Chapter Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Chapter Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">{chapterData.title || `Chapter ${chapterNumber}`}</h1>
            <p className="text-gray-400">{comic.title}</p>
          </div>

          {/* Chapter Images */}
          <div className="space-y-2">
            {chapterData.images.map((image, index) => (
              <div key={index} className="relative w-full">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Page ${index + 1}`}
                  width={800}
                  height={1200}
                  className="w-full h-auto"
                  priority={index < 3} // Prioritize first 3 images
                  loading={index < 3 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>

          {/* Navigation Footer */}
          <div className="flex justify-between items-center mt-8 pt-8 border-t border-gray-800">
            {prevChapter ? (
              <Button variant="outline" asChild>
                <Link href={`/comics/${comicId}/chapters/${prevChapter}`}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous Chapter
                </Link>
              </Button>
            ) : (
              <div />
            )}

            <Button variant="outline" asChild>
              <Link href={`/comics/${comicId}`}>
                <BookOpen className="h-4 w-4 mr-2" />
                All Chapters
              </Link>
            </Button>

            {nextChapter ? (
              <Button variant="outline" asChild>
                <Link href={`/comics/${comicId}/chapters/${nextChapter}`}>
                  Next Chapter
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
