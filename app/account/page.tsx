"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, BookOpen, BookMarked, History, Star } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { userService, authService } from "@/lib/api"
import { formatDate, formatRelativeTime } from "@/lib/date-utils"
import { ReadingStreak } from "@/components/reading-streak"
import type { ReadingHistoryItem, User } from "@/types"

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [recentHistory, setRecentHistory] = useState<ReadingHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check authentication status and fetch user data
  useEffect(() => {
    const checkAuthAndFetchUser = async () => {
      try {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("token")
          if (token) {
            try {
              // Get current user from API
              const userData = await authService.getCurrentUser()
              console.log("[Account] User data from API:", userData)
              setUser(userData)
              setUsername(userData.username)
              setEmail(userData.email)
              setIsAuthenticated(true)
            } catch (error) {
              console.error("[Account] Auth error:", error)
              // Clear invalid token
              localStorage.removeItem("token")
              document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
              setIsAuthenticated(false)
              // Redirect to login
              window.location.href = "/auth?callbackUrl=" + encodeURIComponent(window.location.pathname)
            }
          } else {
            setIsAuthenticated(false)
            // Redirect to login if no token
            window.location.href = "/auth?callbackUrl=" + encodeURIComponent(window.location.pathname)
          }
        }
      } catch (error) {
        console.error("[Account] Authentication check failed:", error)
        setError("Failed to load user data")
        setIsAuthenticated(false)
        if (typeof window !== "undefined") {
          window.location.href = "/auth?callbackUrl=" + encodeURIComponent(window.location.pathname)
        }
      } finally {
        setAuthChecked(true)
        setIsLoading(false)
      }
    }

    checkAuthAndFetchUser()
  }, [])

  // Fetch recent reading history from API
  useEffect(() => {
    const fetchRecentHistory = async () => {
      if (!isAuthenticated || !authChecked) return

      setHistoryLoading(true)
      try {
        console.log("[Account] Fetching reading history from API...")
        const history = await userService.getReadingHistory()
        console.log("[Account] Reading history from API:", history)

        // Get the 5 most recent items and ensure they have proper image URLs
        const processedHistory = history.slice(0, 5).map((item) => ({
          ...item,
          comicCover:
            item.comicCover || `/placeholder.svg?height=48&width=48&text=${encodeURIComponent(item.comicTitle)}`,
        }))
        setRecentHistory(processedHistory)
      } catch (error) {
        console.error("[Account] Error fetching reading history:", error)
        setError("Failed to load reading history")
        // Don't use fallback data - show the error state instead
        setRecentHistory([])
      } finally {
        setHistoryLoading(false)
      }
    }

    fetchRecentHistory()
  }, [isAuthenticated, authChecked])

  const handleSaveChanges = async () => {
    if (!isAuthenticated || !user) return

    setIsSaving(true)
    setError(null)
    try {
      console.log("[Account] Updating user profile...")
      // Use the actual API to update user profile
      const updatedUser = await userService.updateProfile({
        username,
        email,
      })
      console.log("[Account] Profile updated:", updatedUser)
      setUser(updatedUser)
    } catch (error) {
      console.error("[Account] Error saving changes:", error)
      setError("Failed to save changes")
    } finally {
      setIsSaving(false)
    }
  }

  // Show loading while checking authentication
  if (!authChecked || isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and profile information.</p>
        </div>
        <Separator />
        <div className="grid gap-6">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    )
  }

  // If not authenticated, show message (though user should be redirected)
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Please sign in to view your profile.</p>
        </div>
        <Separator />
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
              <p className="text-muted-foreground mb-4">You need to sign in to access your account page.</p>
              <Button asChild className="bg-green-400 hover:bg-green-500">
                <Link href="/auth">Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If no user data, show error
  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and profile information.</p>
        </div>
        <Separator />
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">Error Loading Profile</h3>
              <p className="text-muted-foreground mb-4">{error || "Failed to load user data"}</p>
              <Button onClick={() => window.location.reload()} className="bg-green-400 hover:bg-green-500">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and profile information.</p>
      </div>
      <Separator />

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your profile details and public information.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <Avatar className="w-20 h-20 border">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                <AvatarFallback className="text-lg">{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Member Since</Label>
                <Input value={formatDate(user.joinDate)} disabled />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="bg-green-400 hover:bg-green-500 glow-green"
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="flex items-center">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Reading Streak Card */}
        <ReadingStreak />

        <Card>
          <CardHeader>
            <CardTitle>Reading Statistics</CardTitle>
            <CardDescription>Your reading activity and progress.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-secondary p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-green-400">{user.readingStats?.totalRead || 0}</p>
                <p className="text-sm text-muted-foreground">Comics Read</p>
              </div>
              <div className="bg-secondary p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-green-400">{user.readingStats?.currentlyReading || 0}</p>
                <p className="text-sm text-muted-foreground">Currently Reading</p>
              </div>
              <div className="bg-secondary p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-green-400">{user.readingStats?.completedSeries || 0}</p>
                <p className="text-sm text-muted-foreground">Completed Series</p>
              </div>
              <div className="bg-secondary p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-green-400">{user.readingStats?.totalChaptersRead || 0}</p>
                <p className="text-sm text-muted-foreground">Chapters Read</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Reading Activity</CardTitle>
              <CardDescription>Your recently read chapters.</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/account/history">
                <History className="h-4 w-4 mr-2" />
                View All
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="space-y-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Skeleton className="h-12 w-12 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-8 w-32" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : recentHistory.length > 0 ? (
              <div className="space-y-4">
                {recentHistory.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex items-start gap-4">
                    <div className="rounded-md overflow-hidden w-12 h-12 flex-shrink-0 bg-muted relative">
                      <Image
                        src={item.comicCover || "/placeholder.svg"}
                        alt={item.comicTitle}
                        fill
                        className="object-cover"
                        sizes="48px"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `/placeholder.svg?height=48&width=48&text=${encodeURIComponent(item.comicTitle)}`
                        }}
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{item.comicTitle}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatRelativeTime(item.readDate)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Chapter {item.chapterNumber}
                        {item.chapterTitle && `: ${item.chapterTitle}`}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                          <Link href={`/comics/${item.comicId}`}>
                            <BookOpen className="h-3 w-3 mr-1" />
                            Comic Page
                          </Link>
                        </Button>
                        <Button size="sm" className="h-7 text-xs bg-green-400 hover:bg-green-500" asChild>
                          <Link href={`/comics/${item.comicId}/chapters/${item.chapterNumber + 1}`}>
                            Continue Reading
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No reading history yet</h3>
                <p className="text-muted-foreground mb-4">Start reading comics to track your progress.</p>
                <Button asChild className="bg-green-400 hover:bg-green-500">
                  <Link href="/comics">Browse Comics</Link>
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-6">
            <div className="flex items-center justify-between w-full">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/account/bookmarks">
                    <BookMarked className="h-4 w-4 mr-2" />
                    Bookmarks
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/account/history">
                    <History className="h-4 w-4 mr-2" />
                    Reading History
                  </Link>
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>

        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Ratings</CardTitle>
              <CardDescription>Your recently rated comics.</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/account/ratings">
                <Star className="h-4 w-4 mr-2" />
                View All
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8">
                <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">View your ratings</h3>
                <p className="text-muted-foreground mb-4">Rate comics to help other readers find great content.</p>
                <Button asChild className="bg-green-400 hover:bg-green-500">
                  <Link href="/account/ratings">View Ratings</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
