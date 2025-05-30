// API configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://mock-api.example.com/api";

// Authentication settings
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  REFRESH_TOKEN: "/auth/refresh-token",
  ME: "/auth/me",
};

// Comic endpoints
export const COMIC_ENDPOINTS = {
  ALL: "/comics",
  FEATURED: "/comics/featured",
  LATEST: "/comics/latest",
  DETAIL: (id: string) => {
    if (id === undefined || id === null) {
      console.error("Comic ID is undefined or null in DETAIL endpoint");
      return "/comics/error-invalid-id";
    }
    return `/comics/${id}`;
  },
  CHAPTERS: (id: string) => {
    if (id === undefined || id === null) {
      console.error("Comic ID is undefined or null in CHAPTERS endpoint");
      return "/comics/error-invalid-id/chapters";
    }
    return `/comics/${id}/chapters`;
  },
  CHAPTER: (id: string, chapter: number) => {
    if (id === undefined || id === null) {
      console.error("Comic ID is undefined or null in CHAPTER endpoint");
      return "/comics/error-invalid-id/chapters/error-invalid-chapter";
    }
    if (chapter === undefined || chapter === null || isNaN(Number(chapter))) {
      console.error("Chapter number is invalid in CHAPTER endpoint:", chapter);
      return `/comics/${id}/chapters/error-invalid-chapter`;
    }
    return `/comics/${id}/chapters/${chapter}`;
  },
  GENRES: "/genres",
  SEARCH: "/comics/search",
};

// User endpoints
export const USER_ENDPOINTS = {
  BOOKMARKS: "/user/bookmarks",
  BOOKMARK: (id: string) => {
    if (id === undefined || id === null) {
      console.error("Comic ID is undefined or null in BOOKMARK endpoint");
      return "/user/bookmarks/error-invalid-id";
    }
    return `/user/bookmarks/${id}`;
  },
  RATINGS: "/user/ratings",
  RATING: (id: string) => {
    if (id === undefined || id === null) {
      console.error("Comic ID is undefined or null in RATING endpoint");
      return "/user/ratings/error-invalid-id";
    }
    return `/user/ratings/${id}`;
  },
  HISTORY: "/user/history",
  PROFILE: "/user/profile",
  UPDATE_PROFILE: "/user/profile",
};

// Mock API flag - set to false to use real API
export const USE_MOCK_API = false;
console.log("API Configuration: Using mock API =", USE_MOCK_API);
