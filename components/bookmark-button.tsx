"use client"

import { useState, useEffect } from "react"
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { authService, userService } from "@/lib/api"

interface BookmarkButtonProps {
  comicId: string
}

export function BookmarkButton({ comicId }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { toast } = useToast()

  // Check authentication status safely
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have a token in localStorage
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

        if (!token) {
          setIsAuthenticated(false)
          setIsLoading(false)
          return
        }

        // Try to get current user to verify token is valid - using authService
        await authService.getCurrentUser()
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Auth check failed:", error)
        setIsAuthenticated(false)
        // Clear invalid token
        if (typeof window !== "undefined") {
          localStorage.removeItem("token")
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Check if comic is bookmarked
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!isAuthenticated) {
        return
      }

      try {
        const bookmarks = await userService.getBookmarks()
        const isBookmarked = bookmarks.some((bookmark) => bookmark.id === comicId || bookmark.comicId === comicId)
        setIsBookmarked(isBookmarked)
      } catch (error) {
        console.error("Error checking bookmark status:", error)
      }
    }

    if (isAuthenticated) {
      checkBookmarkStatus()
    }
  }, [comicId, isAuthenticated])

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to bookmark comics",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)

    try {
      if (isBookmarked) {
        await userService.removeBookmark(comicId)
        setIsBookmarked(false)
        toast({
          title: "Bookmark Removed",
          description: "Comic removed from your bookmarks",
        })
      } else {
        await userService.addBookmark(comicId)
        setIsBookmarked(true)
        toast({
          title: "Bookmark Added",
          description: "Comic added to your bookmarks",
        })
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error)
      toast({
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading...
      </Button>
    )
  }

  if (!isAuthenticated) {
    return (
      <Button variant="outline" onClick={handleToggleBookmark}>
        <Bookmark className="h-4 w-4 mr-2" />
        Sign in to Bookmark
      </Button>
    )
  }

  return (
    <Button
      variant={isBookmarked ? "default" : "outline"}
      onClick={handleToggleBookmark}
      disabled={isUpdating}
      className={isBookmarked ? "bg-green-500 hover:bg-green-600" : ""}
    >
      {isUpdating ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : isBookmarked ? (
        <BookmarkCheck className="h-4 w-4 mr-2" />
      ) : (
        <Bookmark className="h-4 w-4 mr-2" />
      )}
      {isUpdating ? "Updating..." : isBookmarked ? "Bookmarked" : "Add Bookmark"}
    </Button>
  )
}
