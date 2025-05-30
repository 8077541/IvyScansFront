import {
  API_BASE_URL,
  AUTH_ENDPOINTS,
  COMIC_ENDPOINTS,
  USER_ENDPOINTS,
  USE_MOCK_API,
} from "./config";
import type {
  Comic,
  User,
  BookmarkedComic,
  RatedComic,
  ReadingHistoryItem,
} from "@/types";
import {
  mockBookmarks,
  mockUser,
  mockRatings,
  mockReadingHistory,
} from "./mock-data";

// Mock data for when API is unavailable
const mockComics: Comic[] = [
  {
    id: "1",
    title: "The Dragon King's Daughter",
    cover: "/placeholder.svg?height=400&width=300",
    latestChapter: "Chapter 45",
    updatedAt: "2 hours ago",
    status: "Ongoing",
    genres: ["Action", "Fantasy", "Romance"],
    isFeatured: true,
  },
  {
    id: "7",
    title: "Omniscient Reader's Viewpoint",
    cover: "/placeholder.svg?height=400&width=300",
    latestChapter: "Chapter 93",
    updatedAt: "4 hours ago",
    status: "Ongoing",
    genres: ["Action", "Adventure", "Fantasy"],
    isFeatured: true,
  },
  {
    id: "8",
    title: "Tower of God",
    cover: "/placeholder.svg?height=400&width=300",
    latestChapter: "Chapter 550",
    updatedAt: "6 hours ago",
    status: "Ongoing",
    genres: ["Action", "Adventure", "Fantasy", "Mystery"],
    isFeatured: false,
  },
  {
    id: "9",
    title: "Eleceed",
    cover: "/placeholder.svg?height=400&width=300",
    latestChapter: "Chapter 210",
    updatedAt: "12 hours ago",
    status: "Ongoing",
    genres: ["Action", "Comedy", "Supernatural"],
    isFeatured: false,
  },
  {
    id: "19",
    title: "Return of the Blossoming Blade",
    cover: "/placeholder.svg?height=400&width=300",
    latestChapter: "Chapter 32",
    updatedAt: "18 hours ago",
    status: "Ongoing",
    genres: ["Action", "Adventure", "Martial Arts"],
    isFeatured: false,
  },
  {
    id: "20",
    title: "The Dark Magician Transmigrates After 66666 Years",
    cover: "/placeholder.svg?height=400&width=300",
    latestChapter: "Chapter 87",
    updatedAt: "20 hours ago",
    status: "Ongoing",
    genres: ["Action", "Adventure", "Fantasy"],
    isFeatured: false,
  },
];

const mockGenres = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Supernatural",
  "Thriller",
  "Martial Arts",
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function for handling API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        const error = await response.json();
        throw new Error(
          error.message ||
            `API error: ${response.status} ${response.statusText}`
        );
      } catch (e) {
        if (e instanceof Error) {
          throw e;
        }
        // If JSON parsing fails, use status text
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
    } else {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
  }

  try {
    return await response.json();
  } catch (e) {
    console.error("Error parsing JSON response:", e);
    throw new Error("Invalid JSON response from server");
  }
}

// Helper function to get auth headers
function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") {
    return { "Content-Type": "application/json" };
  }

  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

// Helper function to log API calls in development
function logApiCall(method: string, url: string, data?: any) {
  if (process.env.NODE_ENV === "development") {
    console.log(`🌐 API ${method} ${url}`, data ? data : "");
  }
}

// Helper function to validate parameters before constructing URLs
function validateParam(param: any, paramName: string): string {
  if (param === undefined || param === null) {
    console.error(`Invalid parameter: ${paramName} is ${param}`);
    throw new Error(
      `Invalid parameter: ${paramName} is required but was ${param}`
    );
  }
  return String(param);
}

// Comic API services
export const comicService = {
  // Get all comics with optional filtering and pagination
  async getAllComics(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    genres?: string[];
    status?: string;
  }): Promise<{ comics: Comic[]; total: number; totalPages: number }> {
    // Use mock data if flag is set
    if (USE_MOCK_API) {
      await delay(500); // Simulate network delay
      logApiCall("GET", "MOCK /comics", params);

      // Filter mock data based on params
      let filteredComics = [...mockComics];

      if (params?.genres && params.genres.length > 0) {
        filteredComics = filteredComics.filter((comic) =>
          // Make sure ALL selected genres are in the comic's genres
          params.genres!.every((genre) => comic.genres.includes(genre))
        );
      }

      if (params?.status && params.status !== "all") {
        filteredComics = filteredComics.filter(
          (comic) => comic.status.toLowerCase() === params.status!.toLowerCase()
        );
      }

      // Sort comics
      if (params?.sort) {
        filteredComics.sort((a, b) => {
          switch (params.sort) {
            case "a-z":
              return a.title.localeCompare(b.title);
            case "z-a":
              return b.title.localeCompare(a.title);
            case "latest":
            default:
              // First check for "hour" mentions, then "day" mentions for recency
              if (a.updatedAt.includes("hour") && !b.updatedAt.includes("hour"))
                return -1;
              if (!a.updatedAt.includes("hour") && b.updatedAt.includes("hour"))
                return 1;
              if (a.updatedAt.includes("day") && !b.updatedAt.includes("day"))
                return -1;
              if (!a.updatedAt.includes("day") && b.updatedAt.includes("day"))
                return 1;
              return 0;
          }
        });
      }

      // Paginate
      const page = params?.page || 1;
      const limit = params?.limit || 12;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedComics = filteredComics.slice(start, end);

      return {
        comics: paginatedComics,
        total: filteredComics.length,
        totalPages: Math.ceil(filteredComics.length / limit),
      };
    }

    try {
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.sort) queryParams.append("sort", params.sort);
      if (params?.status) queryParams.append("status", params.status);
      if (params?.genres && params.genres.length > 0) {
        params.genres.forEach((genre) => queryParams.append("genres", genre));
      }

      const url = `${API_BASE_URL}${
        COMIC_ENDPOINTS.ALL
      }?${queryParams.toString()}`;
      logApiCall("GET", url);

      const response = await fetch(url, {
        headers: getAuthHeaders(),
        // Add cache: 'no-store' to prevent caching issues during development
        cache: process.env.NODE_ENV === "development" ? "no-store" : "default",
      });

      return handleResponse(response);
    } catch (error) {
      console.error("Error fetching comics:", error);

      // Fall back to mock data if real API fails
      console.warn("Falling back to mock data for comics");
      return this.getAllComics(params);
    }
  },

  // Get featured comics
  async getFeaturedComics(): Promise<Comic[]> {
    if (USE_MOCK_API) {
      await delay(300);
      logApiCall("GET", "MOCK /comics/featured");

      // Filter comics by featured property instead of just taking the first 6
      return mockComics.filter((comic) => comic.isFeatured === true);
    }

    try {
      const url = `${API_BASE_URL}${COMIC_ENDPOINTS.FEATURED}`;
      logApiCall("GET", url);

      const response = await fetch(url, {
        headers: getAuthHeaders(),
        cache: process.env.NODE_ENV === "development" ? "no-store" : "default",
      });

      return handleResponse(response);
    } catch (error) {
      console.error("Error fetching featured comics:", error);
      console.warn("Falling back to mock data for featured comics");

      // Filter comics by featured property in the fallback case too
      return mockComics.filter((comic) => comic.isFeatured === true);
    }
  },

  // Get latest comics
  async getLatestComics(
    page = 1,
    limit = 12
  ): Promise<{ comics: Comic[]; total: number; totalPages: number }> {
    if (USE_MOCK_API) {
      await delay(300);
      logApiCall("GET", `MOCK /comics/latest?page=${page}&limit=${limit}`);

      return {
        comics: mockComics.slice(0, limit),
        total: mockComics.length,
        totalPages: Math.ceil(mockComics.length / limit),
      };
    }

    try {
      const url = `${API_BASE_URL}${COMIC_ENDPOINTS.LATEST}?page=${page}&limit=${limit}`;
      logApiCall("GET", url);

      const response = await fetch(url, {
        headers: getAuthHeaders(),
        cache: process.env.NODE_ENV === "development" ? "no-store" : "default",
      });

      return handleResponse(response);
    } catch (error) {
      console.error("Error fetching latest comics:", error);
      console.warn("Falling back to mock data for latest comics");

      return {
        comics: mockComics.slice(0, limit),
        total: mockComics.length,
        totalPages: Math.ceil(mockComics.length / limit),
      };
    }
  },

  // Get comic details
  async getComicById(id: string): Promise<Comic> {
    // Validate id parameter
    try {
      validateParam(id, "comicId");
    } catch (error) {
      console.error("Invalid comic ID:", error);
      // Return a default comic if in mock mode
      if (USE_MOCK_API) {
        await delay(300);
        logApiCall("GET", `MOCK /comics/[invalid-id]`);
        return {
          ...mockComics[0],
          id: "default",
          title: "Error: Invalid Comic ID",
          description:
            "This is a fallback comic due to an invalid ID being provided.",
          author: "System",
          artist: "System",
          released: "N/A",
          chapters: [],
          isFeatured: false,
        };
      }
      throw error;
    }

    if (USE_MOCK_API) {
      await delay(300);
      logApiCall("GET", `MOCK /comics/${id}`);

      const comic = mockComics.find((c) => c.id === id) || mockComics[0];
      return {
        ...comic,
        description:
          "This is a mock description for the comic. The actual API is currently unavailable.",
        author: "Mock Author",
        artist: "Mock Artist",
        released: "January 1, 2023",
        chapters: Array.from({ length: 10 }, (_, i) => ({
          number: i + 1,
          title: `Chapter ${i + 1}`,
          date: `${10 - i} days ago`,
        })),
      };
    }

    try {
      const url = `${API_BASE_URL}${COMIC_ENDPOINTS.DETAIL(id)}`;
      logApiCall("GET", url);

      const response = await fetch(url, {
        headers: getAuthHeaders(),
        cache: process.env.NODE_ENV === "development" ? "no-store" : "default",
      });

      return handleResponse(response);
    } catch (error) {
      console.error("Error fetching comic details:", error);
      console.warn("Falling back to mock data for comic details");

      const comic = mockComics.find((c) => c.id === id) || mockComics[0];
      return {
        ...comic,
        description:
          "This is a mock description for the comic. The actual API is currently unavailable.",
        author: "Mock Author",
        artist: "Mock Artist",
        released: "January 1, 2023",
        chapters: Array.from({ length: 10 }, (_, i) => ({
          number: i + 1,
          title: `Chapter ${i + 1}`,
          date: `${10 - i} days ago`,
        })),
      };
    }
  },

  // Get comic chapters
  async getComicChapters(id: string): Promise<Comic["chapters"]> {
    // Validate id parameter
    try {
      validateParam(id, "comicId");
    } catch (error) {
      console.error("Invalid comic ID for chapters:", error);
      if (USE_MOCK_API) {
        await delay(300);
        return [];
      }
      throw error;
    }

    if (USE_MOCK_API) {
      await delay(300);
      logApiCall("GET", `MOCK /comics/${id}/chapters`);

      return Array.from({ length: 10 }, (_, i) => ({
        number: i + 1,
        title: `Chapter ${i + 1}`,
        date: `${10 - i} days ago`,
      }));
    }

    try {
      const url = `${API_BASE_URL}${COMIC_ENDPOINTS.CHAPTERS(id)}`;
      logApiCall("GET", url);

      const response = await fetch(url, {
        headers: getAuthHeaders(),
        cache: process.env.NODE_ENV === "development" ? "no-store" : "default",
      });

      return handleResponse(response);
    } catch (error) {
      console.error("Error fetching comic chapters:", error);
      console.warn("Falling back to mock data for comic chapters");

      return Array.from({ length: 10 }, (_, i) => ({
        number: i + 1,
        title: `Chapter ${i + 1}`,
        date: `${10 - i} days ago`,
      }));
    }
  },

  // Get chapter details
  async getChapter(
    id: string,
    chapter: string | number
  ): Promise<{
    images: string[];
    title?: string;
    number: number;
    totalChapters?: number;
    id?: string;
  }> {
    // Validate parameters
    try {
      validateParam(id, "comicId");
      validateParam(chapter, "chapterNumber");

      // Ensure chapter is a number
      const chapterNum =
        typeof chapter === "string" ? Number.parseInt(chapter, 10) : chapter;
      if (isNaN(chapterNum)) {
        throw new Error(`Invalid chapter number: ${chapter}`);
      }

      // Update chapter to be the numeric value for the rest of the function
      chapter = chapterNum;
    } catch (error) {
      console.error("Invalid parameters for chapter:", error);
      if (USE_MOCK_API) {
        await delay(500);
        return {
          images: Array.from(
            { length: 1 },
            () =>
              `/placeholder.svg?height=1200&width=800&text=Error: Invalid Parameters`
          ),
          title: "Error: Invalid Parameters",
          number: 0,
        };
      }
      throw error;
    }

    if (USE_MOCK_API) {
      await delay(500);
      logApiCall("GET", `MOCK /comics/${id}/chapters/${chapter}`);

      const chapterNum =
        typeof chapter === "string" ? Number.parseInt(chapter, 10) : chapter;
      return {
        images: Array.from(
          { length: 10 },
          (_, i) => `/placeholder.svg?height=1200&width=800&text=Page ${i + 1}`
        ),
        title: `Chapter ${chapter}`,
        number: chapterNum,
        totalChapters: 10,
        id: `chapter-${chapterNum}`, // Use id instead of chapterId to match API response
      };
    }

    try {
      const chapterNum =
        typeof chapter === "string" ? Number.parseInt(chapter, 10) : chapter;
      const url = `${API_BASE_URL}${COMIC_ENDPOINTS.CHAPTER(id, chapterNum)}`;
      logApiCall("GET", url);

      const response = await fetch(url, {
        headers: getAuthHeaders(),
        cache: process.env.NODE_ENV === "development" ? "no-store" : "default",
      });

      return handleResponse(response);
    } catch (error) {
      console.error("Error fetching chapter details:", error);
      console.warn("Falling back to mock data for chapter details");

      const chapterNum =
        typeof chapter === "string" ? Number.parseInt(chapter, 10) : chapter;
      return {
        images: Array.from(
          { length: 10 },
          (_, i) => `/placeholder.svg?height=1200&width=800&text=Page ${i + 1}`
        ),
        title: `Chapter ${chapter}`,
        number:
          typeof chapter === "string"
            ? Number.parseInt(chapter, 10) || 0
            : chapter,
        id: `chapter-${chapterNum}`, // Use id instead of chapterId to match API response
      };
    }
  },

  // Get all genres
  async getGenres(): Promise<string[]> {
    if (USE_MOCK_API) {
      await delay(200);
      logApiCall("GET", "MOCK /genres");

      return mockGenres;
    }

    try {
      const url = `${API_BASE_URL}${COMIC_ENDPOINTS.GENRES}`;
      logApiCall("GET", url);

      const response = await fetch(url, {
        headers: getAuthHeaders(),
        cache: process.env.NODE_ENV === "development" ? "no-store" : "default",
      });

      return handleResponse(response);
    } catch (error) {
      console.error("Error fetching genres:", error);
      console.warn("Falling back to mock data for genres");

      return mockGenres;
    }
  },

  // Search comics
  async searchComics(query: string): Promise<Comic[]> {
    if (USE_MOCK_API) {
      await delay(300);
      logApiCall("GET", `MOCK /comics/search?q=${query}`);

      // Simple search in mock data
      const lowerQuery = query.toLowerCase();
      return mockComics.filter(
        (comic) =>
          comic.title.toLowerCase().includes(lowerQuery) ||
          comic.genres.some((g) => g.toLowerCase().includes(lowerQuery))
      );
    }

    try {
      const url = `${API_BASE_URL}${
        COMIC_ENDPOINTS.SEARCH
      }?q=${encodeURIComponent(query)}`;
      logApiCall("GET", url);

      const response = await fetch(url, {
        headers: getAuthHeaders(),
        cache: process.env.NODE_ENV === "development" ? "no-store" : "default",
      });

      return handleResponse(response);
    } catch (error) {
      console.error("Error searching comics:", error);
      console.warn("Falling back to mock data for comic search");

      // Simple search in mock data
      const lowerQuery = query.toLowerCase();
      return mockComics.filter(
        (comic) =>
          comic.title.toLowerCase().includes(lowerQuery) ||
          comic.genres.some((g) => g.toLowerCase().includes(lowerQuery))
      );
    }
  },
};

// Auth API services
export const authService = {
  // Login
  async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: User }> {
    if (USE_MOCK_API) {
      await delay(800); // Simulate network delay
      logApiCall("POST", "MOCK /auth/login", { email });

      console.log("Using mock authentication with email:", email);

      // Accept any credentials in mock mode for easier testing
      const token = "mock-token-" + Math.random().toString(36).substring(2);
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
      }

      return {
        token,
        user: {
          ...mockUser,
          email,
        },
      };
    }

    try {
      const url = `${API_BASE_URL}${AUTH_ENDPOINTS.LOGIN}`;
      logApiCall("POST", url, { email });

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await handleResponse<{ token: string; user: User }>(
        response
      );

      // Store the token
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Register
  async register(
    username: string,
    email: string,
    password: string
  ): Promise<{ token: string; user: User }> {
    if (USE_MOCK_API) {
      await delay(1000); // Simulate network delay
      logApiCall("POST", "MOCK /auth/register", { username, email });

      console.log(
        "Using mock registration with username:",
        username,
        "and email:",
        email
      );

      // For demo purposes only
      const token = "mock-token-" + Math.random().toString(36).substring(2);
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
      }

      return {
        token,
        user: {
          id: "user-" + Date.now(),
          username,
          email,
          joinDate: new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          avatar: "/placeholder.svg?height=100&width=100",
          readingStats: {
            totalRead: 0,
            currentlyReading: 0,
            completedSeries: 0,
            totalChaptersRead: 0,
          },
        },
      };
    }

    try {
      const url = `${API_BASE_URL}${AUTH_ENDPOINTS.REGISTER}`;
      logApiCall("POST", url, { username, email });

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await handleResponse<{ token: string; user: User }>(
        response
      );

      // Store the token
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
      }

      return data;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  },

  // Logout
  async logout(): Promise<void> {
    if (USE_MOCK_API) {
      await delay(300);
      logApiCall("POST", "MOCK /auth/logout");

      localStorage.removeItem("token");
      return;
    }

    try {
      const url = `${API_BASE_URL}${AUTH_ENDPOINTS.LOGOUT}`;
      logApiCall("POST", url);

      const response = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      await handleResponse(response);

      // Always remove the token, even if the API call succeeds
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Logout error:", error);

      // Even if the API call fails, we should still clear the local token
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }

      throw error;
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    if (USE_MOCK_API) {
      await delay(500);
      logApiCall("GET", "MOCK /auth/me");

      // Check if token exists
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      return mockUser;
    }

    try {
      const url = `${API_BASE_URL}${AUTH_ENDPOINTS.ME}`;
      logApiCall("GET", url);

      const response = await fetch(url, {
        headers: getAuthHeaders(),
        cache: "no-store", // Always fetch fresh user data
      });

      return handleResponse(response);
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  },

  // Refresh token
  async refreshToken(): Promise<{ token: string }> {
    if (USE_MOCK_API) {
      await delay(300);
      logApiCall("POST", "MOCK /auth/refresh-token");

      const token =
        "refreshed-mock-token-" + Math.random().toString(36).substring(2);
      localStorage.setItem("token", token);
      return { token };
    }

    try {
      const url = `${API_BASE_URL}${AUTH_ENDPOINTS.REFRESH_TOKEN}`;
      logApiCall("POST", url);

      const response = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      const data = await handleResponse<{ token: string }>(response);

      // Store the new token
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
      }

      return data;
    } catch (error) {
      console.error("Refresh token error:", error);
      throw new Error("Failed to refresh token");
    }
  },
};

// User API services
export const userService = {
  // Get user bookmarks
  async getBookmarks(): Promise<BookmarkedComic[]> {
    if (USE_MOCK_API) {
      await delay(500);
      logApiCall("GET", "MOCK /user/bookmarks");
      return mockBookmarks;
    }

    try {
      const url = `${API_BASE_URL}${USER_ENDPOINTS.BOOKMARKS}`;
      logApiCall("GET", url);

      const response = await fetch(url, {
        headers: getAuthHeaders(),
        cache: "no-store", // Always fetch fresh bookmark data
      });

      return handleResponse(response);
    } catch (error) {
      console.error("Get bookmarks error:", error);
      console.warn("Falling back to mock data for bookmarks");
      return mockBookmarks;
    }
  },

  // Add bookmark
  async addBookmark(comicId: string): Promise<BookmarkedComic> {
    if (USE_MOCK_API) {
      await delay(500);
      logApiCall("POST", "MOCK /user/bookmarks", { comicId });

      // Find the comic in mock data
      const comic = mockComics.find((c) => c.id === comicId);
      if (!comic) throw new Error("Comic not found");

      const newBookmark: BookmarkedComic = {
        ...comic,
        dateAdded: new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        lastReadChapter: 1,
        isNew: true,
      };

      // Add to mock bookmarks
      mockBookmarks.push(newBookmark);

      return newBookmark;
    }

    try {
      const url = `${API_BASE_URL}${USER_ENDPOINTS.BOOKMARKS}`;
      logApiCall("POST", url, { comicId });

      const response = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ comicId }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error("Add bookmark error:", error);
      throw error;
    }
  },

  // Remove bookmark
  async removeBookmark(comicId: string): Promise<void> {
    if (USE_MOCK_API) {
      await delay(300);
      logApiCall("DELETE", `MOCK /user/bookmarks/${comicId}`);

      // Remove from mock bookmarks
      const index = mockBookmarks.findIndex((b) => b.id === comicId);
      if (index !== -1) {
        mockBookmarks.splice(index, 1);
      }

      return;
    }

    try {
      const url = `${API_BASE_URL}${USER_ENDPOINTS.BOOKMARK(comicId)}`;
      logApiCall("DELETE", url);

      const response = await fetch(url, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      return handleResponse(response);
    } catch (error) {
      console.error("Remove bookmark error:", error);
      throw error;
    }
  },

  // Get user ratings
  async getRatings(): Promise<RatedComic[]> {
    if (USE_MOCK_API) {
      await delay(500);
      logApiCall("GET", "MOCK /user/ratings");

      // Log the mock ratings for debugging
      console.log("[API] Using mock ratings:", mockRatings);

      // Make sure each rating has both id and comicId for compatibility
      const enhancedRatings = mockRatings.map((rating) => ({
        ...rating,
        comicId: rating.comicId || rating.id, // Ensure comicId exists
      }));

      return enhancedRatings;
    }

    try {
      const url = `${API_BASE_URL}${USER_ENDPOINTS.RATINGS}`;
      logApiCall("GET", url);

      const response = await fetch(url, {
        headers: getAuthHeaders(),
        cache: "no-store", // Always fetch fresh ratings data
      });

      const data = await handleResponse<RatedComic[]>(response);
      console.log("[API] Received ratings data:", data);

      // Ensure each rating has both id and comicId for compatibility
      const enhancedData = data.map((rating) => ({
        ...rating,
        comicId: rating.comicId || rating.id, // Ensure comicId exists
        id: rating.id || rating.comicId, // Ensure id exists
      }));

      return enhancedData;
    } catch (error) {
      console.error("Get ratings error:", error);
      console.warn("Falling back to mock data for ratings");

      // Make sure each rating has both id and comicId for compatibility
      const enhancedRatings = mockRatings.map((rating) => ({
        ...rating,
        comicId: rating.comicId || rating.id, // Ensure comicId exists
      }));

      return enhancedRatings;
    }
  },

  // Add or update rating
  async rateComic(
    comicId: string,
    rating: number,
    comment?: string
  ): Promise<RatedComic> {
    if (USE_MOCK_API) {
      await delay(500);
      logApiCall("POST", "MOCK /user/ratings", { comicId, rating, comment });

      // Find the comic in mock data
      const comic = mockComics.find((c) => c.id === comicId);
      if (!comic) throw new Error("Comic not found");

      // Check if comic is already rated
      const existingRatingIndex = mockRatings.findIndex(
        (r) => r.id === comicId || r.comicId === comicId
      );

      const ratedComic: RatedComic = {
        ...comic,
        id: comicId,
        comicId: comicId, // Ensure both id and comicId are set
        rating,
        comment, // Store as comment
        dateRated: new Date().toISOString(),
      };

      if (existingRatingIndex !== -1) {
        // Update existing rating
        mockRatings[existingRatingIndex] = ratedComic;
        console.log("[API] Updated rating:", ratedComic);
      } else {
        // Add new rating
        mockRatings.push(ratedComic);
        console.log("[API] Added new rating:", ratedComic);
      }

      return ratedComic;
    }

    try {
      const url = `${API_BASE_URL}${USER_ENDPOINTS.RATINGS}`;
      logApiCall("POST", url, { comicId, rating, comment });

      const response = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          comicId,
          rating,
          comment, // Send as comment
        }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error("Rate comic error:", error);
      throw error;
    }
  },

  // Delete rating
  async deleteRating(comicId: string): Promise<void> {
    if (USE_MOCK_API) {
      await delay(300);
      logApiCall("DELETE", `MOCK /user/ratings/${comicId}`);

      // Remove from mock ratings
      const index = mockRatings.findIndex((r) => r.id === comicId);
      if (index !== -1) {
        mockRatings.splice(index, 1);
      }

      return;
    }

    try {
      const url = `${API_BASE_URL}${USER_ENDPOINTS.RATING(comicId)}`;
      logApiCall("DELETE", url);

      const response = await fetch(url, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      return handleResponse(response);
    } catch (error) {
      console.error("Delete rating error:", error);
      throw error;
    }
  },

  // Get reading history
  async getReadingHistory(): Promise<ReadingHistoryItem[]> {
    if (USE_MOCK_API) {
      await delay(500);
      logApiCall("GET", "MOCK /user/history");
      return mockReadingHistory;
    }

    try {
      const url = `${API_BASE_URL}${USER_ENDPOINTS.HISTORY}`;
      logApiCall("GET", url);

      const response = await fetch(url, {
        headers: getAuthHeaders(),
        cache: "no-store", // Always fetch fresh history data
      });

      return handleResponse(response);
    } catch (error) {
      console.error("Get reading history error:", error);
      console.warn("Falling back to mock data for reading history");
      return mockReadingHistory;
    }
  },

  // Add to reading history
  async addToHistory(
    comicId: string,
    chapterId: string,
    chapterNumber: number
  ): Promise<ReadingHistoryItem> {
    if (USE_MOCK_API) {
      await delay(300);
      logApiCall("POST", "MOCK /user/history", {
        comicId,
        chapterId,
        chapterNumber,
      });

      // Find the comic in mock data
      const comic = mockComics.find((c) => c.id === comicId);
      if (!comic) throw new Error("Comic not found");

      // Create mock history item
      const historyItem = {
        id: `history-${Date.now()}`,
        comicId,
        comicTitle: comic.title,
        comicCover: comic.cover,
        chapterId, // Use the provided chapterId
        chapterNumber,
        readDate: new Date().toISOString(),
        lastReadAt: new Date().toISOString(), // Add lastReadAt field
      };

      // Add to mock history at the beginning (most recent first)
      mockReadingHistory.unshift(historyItem);

      // Update bookmark's lastReadChapter if it exists
      const bookmarkIndex = mockBookmarks.findIndex((b) => b.id === comicId);
      if (bookmarkIndex !== -1) {
        mockBookmarks[bookmarkIndex].lastReadChapter = chapterNumber;
      } else {
        // If not bookmarked, add it to bookmarks
        mockBookmarks.push({
          ...comic,
          lastReadChapter: chapterNumber,
          dateAdded: new Date().toISOString(),
        });
      }

      return historyItem;
    }

    try {
      const url = `${API_BASE_URL}${USER_ENDPOINTS.HISTORY}`;
      logApiCall("POST", url, { comicId, chapterId, chapterNumber });

      const response = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          comicId,
          chapterId,
          chapterNumber,
        }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error("Add to history error:", error);
      throw error;
    }
  },

  // Get user profile
  async getProfile(): Promise<User> {
    if (USE_MOCK_API) {
      await delay(500);
      logApiCall("GET", "MOCK /user/profile");
      return mockUser;
    }

    try {
      const url = `${API_BASE_URL}${USER_ENDPOINTS.PROFILE}`;
      logApiCall("GET", url);

      const response = await fetch(url, {
        headers: getAuthHeaders(),
        cache: "no-store", // Always fetch fresh profile data
      });

      return handleResponse(response);
    } catch (error) {
      console.error("Get profile error:", error);
      console.warn("Falling back to mock data for user profile");
      return mockUser;
    }
  },

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    if (USE_MOCK_API) {
      await delay(800);
      logApiCall("PUT", "MOCK /user/profile", data);

      return {
        ...mockUser,
        ...data,
      };
    }

    try {
      const url = `${API_BASE_URL}${USER_ENDPOINTS.UPDATE_PROFILE}`;
      logApiCall("PUT", url, data);

      const response = await fetch(url, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      return handleResponse(response);
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  },
};

// Update the COMIC_ENDPOINTS.CHAPTER function
// Find this line:
// Replace with:
const comicEndpoints = {
  ALL: "/comics",
  FEATURED: "/comics/featured",
  LATEST: "/comics/latest",
  DETAIL: (id: string) => `/comics/${id}`,
  CHAPTERS: (id: string) => `/comics/${id}/chapters`,
  CHAPTER: (id: string, chapter: number | string) => {
    if (id === undefined || id === null) {
      console.error("Comic ID is undefined or null in CHAPTER endpoint");
      return "/comics/error-invalid-id/chapters/error-invalid-chapter";
    }
    if (chapter === undefined || chapter === null) {
      console.error("Chapter number is invalid in CHAPTER endpoint:", chapter);
      return `/comics/${id}/chapters/error-invalid-chapter`;
    }
    return `/comics/${id}/chapters/${chapter}`;
  },
  GENRES: "/comics/genres",
  SEARCH: "/comics/search",
};

export { comicEndpoints as COMIC_ENDPOINTS };
