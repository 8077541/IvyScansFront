// Validate required environment variables
if (typeof window === "undefined") {
  // Server-side validation
  if (!process.env.NEXT_PUBLIC_API_BASE_URL && !process.env.NEXT_PUBLIC_API_URL) {
    console.warn("Warning: No API URL configured. Using fallback URL.")
  }
}

// API configuration with proper fallback URL
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "https://api.ivyscans.com"

// Authentication settings
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  REFRESH_TOKEN: "/auth/refresh-token",
  ME: "/auth/me",
}

// Comic endpoints
export const COMIC_ENDPOINTS = {
  ALL: "/comics",
  FEATURED: "/comics/featured",
  LATEST: "/comics/latest",
  DETAIL: (id: string) => {
    if (id === undefined || id === null) {
      console.error("Comic ID is undefined or null in DETAIL endpoint")
      return "/comics/error-invalid-id"
    }
    return `/comics/${id}`
  },
  CHAPTERS: (id: string) => {
    if (id === undefined || id === null) {
      console.error("Comic ID is undefined or null in CHAPTERS endpoint")
      return "/comics/error-invalid-id/chapters"
    }
    return `/comics/${id}/chapters`
  },
  CHAPTER: (id: string, chapter: number) => {
    if (id === undefined || id === null) {
      console.error("Comic ID is undefined or null in CHAPTER endpoint")
      return "/comics/error-invalid-id/chapters/error-invalid-chapter"
    }
    if (chapter === undefined || chapter === null || isNaN(Number(chapter))) {
      console.error("Chapter number is invalid in CHAPTER endpoint:", chapter)
      return `/comics/${id}/chapters/error-invalid-chapter`
    }
    return `/comics/${id}/chapters/${chapter}`
  },
  GENRES: "/genres",
  SEARCH: "/comics/search",
}

// User endpoints
export const USER_ENDPOINTS = {
  BOOKMARKS: "/user/bookmarks",
  BOOKMARK: (id: string) => {
    if (id === undefined || id === null) {
      console.error("Comic ID is undefined or null in BOOKMARK endpoint")
      return "/user/bookmarks/error-invalid-id"
    }
    return `/user/bookmarks/${id}`
  },
  RATINGS: "/user/ratings",
  RATING: (id: string) => {
    if (id === undefined || id === null) {
      console.error("Comic ID is undefined or null in RATING endpoint")
      return "/user/ratings/error-invalid-id"
    }
    return `/user/ratings/${id}`
  },
  HISTORY: "/user/history",
  PROFILE: "/user/profile",
  UPDATE_PROFILE: "/user/profile",
}

// Mock API flag - set to true for development/demo, false for production
export const USE_MOCK_API = process.env.NODE_ENV === "development" || !process.env.NEXT_PUBLIC_API_URL

// Log configuration for debugging
console.log("API Configuration:")
console.log("- API_BASE_URL:", API_BASE_URL)
console.log("- USE_MOCK_API:", USE_MOCK_API)
console.log("- NODE_ENV:", process.env.NODE_ENV)
