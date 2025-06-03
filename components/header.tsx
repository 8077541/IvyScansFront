"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Logo } from "@/components/logo"

export function Header() {
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check if we're in a browser environment
        if (typeof window === "undefined") {
          setIsLoading(false)
          setMounted(true)
          return
        }

        const token = localStorage.getItem("token")

        // If no token, user is not authenticated
        if (!token) {
          setIsAuthenticated(false)
          setUser(null)
          setIsLoading(false)
          setMounted(true)
          return
        }

        // For preview/development, use mock data if token exists
        // In production, this would validate with a real API
        if (process.env.NEXT_PUBLIC_USE_MOCK_API === "true" || !process.env.NEXT_PUBLIC_API_URL) {
          // Mock successful authentication
          setIsAuthenticated(true)
          setUser({
            id: "mock-user-id",
            username: "MockUser",
            email: "mock@example.com",
            avatar: "/placeholder.svg?height=40&width=40",
          })
          setIsLoading(false)
          setMounted(true)
          return
        }

        // In production with real API
        // This code won't run in preview but would work in production
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => {
            if (!response.ok) throw new Error("Invalid token")
            return response.json()
          })
          .then((userData) => {
            setUser(userData)
            setIsAuthenticated(true)
          })
          .catch(() => {
            // On error, clear token and set unauthenticated
            localStorage.removeItem("token")
            setIsAuthenticated(false)
            setUser(null)
          })
          .finally(() => {
            setIsLoading(false)
            setMounted(true)
          })
      } catch (error) {
        console.error("Auth check error:", error)
        // On any error, assume not authenticated
        setIsAuthenticated(false)
        setUser(null)
        setIsLoading(false)
        setMounted(true)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = () => {
    // Clear local storage
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }

    // Update state
    setIsAuthenticated(false)
    setUser(null)

    console.log("Logout successful, redirecting to home")
    // Force a page reload to ensure all state is cleared
    window.location.href = "/"
  }

  // Return a simpler version during SSR or loading
  if (!mounted || isLoading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center mr-6">
            <Logo size="sm" />
          </Link>
          <div className="flex-1"></div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <div className="mt-6 mb-8">
              <Logo size="lg" />
            </div>
            <nav className="flex flex-col gap-6">
              <Link href="/" className="text-lg font-semibold">
                Home
              </Link>
              <Link href="/comics" className="text-lg font-semibold">
                Comics
              </Link>
              <Link href="/latest" className="text-lg font-semibold">
                Latest Updates
              </Link>
              <Link href="/genres" className="text-lg font-semibold">
                Genres
              </Link>
              {isAuthenticated && (
                <Link href="/account/bookmarks" className="text-lg font-semibold">
                  Bookmarks
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center mr-6">
          <Logo size="sm" className="hidden sm:flex" />
          <Logo size="sm" variant="default" className="sm:hidden" />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium flex-1">
          <Link href="/comics" className="transition-colors hover:text-green-400">
            Comics
          </Link>
          <Link href="/latest" className="transition-colors hover:text-green-400">
            Latest Updates
          </Link>
          <Link href="/genres" className="transition-colors hover:text-green-400">
            Genres
          </Link>
          {isAuthenticated && (
            <Link href="/account/bookmarks" className="transition-colors hover:text-green-400">
              Bookmarks
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          {isAuthenticated && user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 ml-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.username} />
                      <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase() || "US"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.username}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">My Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/bookmarks">My Bookmarks</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/ratings">My Ratings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/history">Reading History</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 hover:text-red-600">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="default" className="bg-green-400 hover:bg-green-500 glow-green">
              <Link href="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
