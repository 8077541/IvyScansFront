"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, BookOpen, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { userService } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { formatRelativeTime } from "@/lib/date-utils"
import type { BookmarkedComic } from "@/types"

export function CurrentlyReading() {
  const [comics, setComics] = useState<BookmarkedComic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchCurrentlyReading = async () => {
      if (!isAuthenticated) {
        setComics([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        // Get bookmarks
        const bookmarks = await userService.getBookmarks()

        // Filter to get only comics that are currently being read (not completed)
        const currentlyReading = bookmarks.filter((comic) => {
          if (!comic.lastReadChapter) return false
          const latestChapterNum = Number(comic.latestChapter?.split(" ")[1] || 0)
          return comic.lastReadChapter < latestChapterNum
        })

        // Sort by dateAdded (most recent first)
        const sortedComics = currentlyReading.sort(
          (a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
        )

        // Take only the first 6
        setComics(sortedComics.slice(0, 6))
      } catch (error) {
        console.error("Error fetching currently reading comics:", error)
        setComics([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrentlyReading()
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return null
  }

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Continue Reading</h2>
          <Link href="/account/history" className="text-green-400 hover:text-green-300 flex items-center">
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
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
      </section>
    )
  }

  if (comics.length === 0) {
    return null
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Continue Reading</h2>
        <Link href="/account/history" className="text-green-400 hover:text-green-300 flex items-center">
          View All <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {comics.map((comic) => (
          <Card
            key={comic.id}
            className="overflow-hidden h-full transition-all duration-200 hover:shadow-md hover:shadow-green-500/10 hover:border-green-500/50"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src={comic.cover || "/placeholder.svg"}
                alt={comic.title}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <Badge variant="secondary" className="text-xs bg-green-500/90 text-white hover:bg-green-600">
                  Chapter {comic.lastReadChapter + 1}
                </Badge>
              </div>
            </div>
            <CardContent className="p-3">
              <h3 className="font-semibold line-clamp-2 text-sm mb-1">{comic.title}</h3>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <div className="flex items-center">
                  <BookOpen className="h-3 w-3 mr-1" />
                  <span>Ch. {comic.lastReadChapter}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{formatRelativeTime(comic.dateAdded)}</span>
                </div>
              </div>
              <Button size="sm" className="w-full mt-2 bg-green-400 hover:bg-green-500 text-xs h-8" asChild>
                <Link href={`/comics/${comic.id}/chapters/${comic.lastReadChapter + 1}`}>Continue</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
