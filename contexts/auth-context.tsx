"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authService } from "@/lib/api"
import { USE_MOCK_API } from "@/lib/config"
import type { User } from "@/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Function to check if a token exists in localStorage
  const hasTokenInStorage = () => {
    if (typeof window === "undefined") return false
    return !!localStorage.getItem("token")
  }

  // Function to set a token in both localStorage and as a cookie
  const setToken = (token: string) => {
    if (typeof window === "undefined") return

    // Set in localStorage
    localStorage.setItem("token", token)

    // Also set as a cookie for middleware access
    document.cookie = `token=${token}; path=/; max-age=2592000; SameSite=Lax` // 30 days

    console.log("[Auth] Token set in localStorage and cookie:", token.substring(0, 10) + "...")
  }

  // Function to remove token from both localStorage and cookies
  const removeToken = () => {
    if (typeof window === "undefined") return

    // Remove from localStorage
    localStorage.removeItem("token")

    // Remove cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

    console.log("[Auth] Token removed from localStorage and cookie")
  }

  // Initialize component
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if user is logged in on initial load
  useEffect(() => {
    if (!mounted) return

    const checkAuth = async () => {
      try {
        console.log("[Auth] Checking authentication, USE_MOCK_API =", USE_MOCK_API)

        // Only run in browser environment
        if (typeof window !== "undefined") {
          const hasToken = hasTokenInStorage()
          console.log("[Auth] Token found in localStorage:", hasToken)

          if (hasToken) {
            try {
              // For preview/development, use mock data if token exists
              if (process.env.NEXT_PUBLIC_USE_MOCK_API === "true" || !process.env.NEXT_PUBLIC_API_URL) {
                console.log("[Auth] Using mock user data in preview/development")
                // Mock successful authentication
                setUser({
                  id: "mock-user-id",
                  username: "MockUser",
                  email: "mock@example.com",
                  avatar: "/placeholder.svg?height=40&width=40",
                })
                setIsAuthenticated(true)
              } else {
                // Try to get the current user from the API
                const userData = await authService.getCurrentUser()
                console.log("[Auth] User data retrieved:", userData)
                setUser(userData)
                setIsAuthenticated(true)
              }
            } catch (err) {
              console.error("[Auth] Authentication error:", err)
              removeToken()
              setIsAuthenticated(false)
            }
          } else {
            console.log("[Auth] No authentication token found")
            setIsAuthenticated(false)
          }
        }
      } catch (err) {
        console.error("[Auth] Authentication error:", err)
        if (typeof window !== "undefined") {
          removeToken()
        }
        setIsAuthenticated(false)
      } finally {
        setAuthChecked(true)
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [mounted])

  // Handle redirects after authentication check
  useEffect(() => {
    if (!authChecked || !mounted) return

    // Handle redirects using window.location instead of router hooks
    const handleRedirects = () => {
      try {
        // Get current path and search params
        const pathname = window.location.pathname
        const searchParams = new URLSearchParams(window.location.search)
        const callbackUrl = searchParams.get("callbackUrl") || "/"

        // If authenticated and on auth page, redirect
        if (isAuthenticated && pathname.startsWith("/auth")) {
          if (callbackUrl) {
            console.log("[Auth] Redirecting to callback URL:", callbackUrl)
            window.location.href = callbackUrl
          } else {
            console.log("[Auth] Redirecting to home from auth page")
            window.location.href = "/"
          }
        }

        // If not authenticated and on protected page, redirect
        if (!isAuthenticated && !isLoading && pathname.startsWith("/account")) {
          console.log("[Auth] Redirecting to login from protected page")
          window.location.href = `/auth?callbackUrl=${encodeURIComponent(pathname)}`
        }
      } catch (error) {
        console.error("Error handling redirects:", error)
      }
    }

    handleRedirects()
  }, [authChecked, isAuthenticated, isLoading])

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      // For preview/development, use mock data
      if (process.env.NEXT_PUBLIC_USE_MOCK_API === "true" || !process.env.NEXT_PUBLIC_API_URL) {
        console.log("[Auth] Using mock login in preview/development")
        // Mock successful login
        const mockToken = "mock-token-" + Math.random().toString(36).substring(2)
        const mockUser = {
          id: "mock-user-id",
          username: "MockUser",
          email: email,
          avatar: "/placeholder.svg?height=40&width=40",
        }

        // Set token in both localStorage and cookie
        setToken(mockToken)
        setUser(mockUser)
        setIsAuthenticated(true)
      } else {
        // Real API login
        const { token, user } = await authService.login(email, password)
        console.log("[Auth] Login successful")

        // Set token in both localStorage and cookie
        setToken(token)
        setUser(user)
        setIsAuthenticated(true)
      }
    } catch (err) {
      console.error("[Auth] Login error:", err)
      setError(err instanceof Error ? err.message : "Login failed")
      setIsAuthenticated(false)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (username: string, email: string, password: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      // For preview/development, use mock data
      if (process.env.NEXT_PUBLIC_USE_MOCK_API === "true" || !process.env.NEXT_PUBLIC_API_URL) {
        console.log("[Auth] Using mock registration in preview/development")
        // Mock successful registration
        const mockToken = "mock-token-" + Math.random().toString(36).substring(2)
        const mockUser = {
          id: "mock-user-id",
          username: username,
          email: email,
          avatar: "/placeholder.svg?height=40&width=40",
        }

        // Set token in both localStorage and cookie
        setToken(mockToken)
        setUser(mockUser)
        setIsAuthenticated(true)
      } else {
        // Real API registration
        const { token, user } = await authService.register(username, email, password)
        console.log("[Auth] Registration successful")

        // Set token in both localStorage and cookie
        setToken(token)
        setUser(user)
        setIsAuthenticated(true)
      }
    } catch (err) {
      console.error("[Auth] Registration error:", err)
      setError(err instanceof Error ? err.message : "Registration failed")
      setIsAuthenticated(false)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      // For preview/development, just clear local state
      if (process.env.NEXT_PUBLIC_USE_MOCK_API === "true" || !process.env.NEXT_PUBLIC_API_URL) {
        console.log("[Auth] Using mock logout in preview/development")
        removeToken()
        setUser(null)
        setIsAuthenticated(false)
      } else {
        // Real API logout
        await authService.logout()
        removeToken()
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (err) {
      console.error("[Auth] Logout error:", err)
      // Even if the API call fails, we should still clear the local token
      removeToken()
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
