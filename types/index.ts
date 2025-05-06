export interface Comic {
  id: string;
  title: string;
  cover: string;
  latestChapter: string;
  updatedAt: string;
  status: string;
  genres: string[];
  description?: string;
  author?: string;
  artist?: string;
  released?: string;
  lastReadChapter?: number;
  chapters?: {
    number: number;
    title?: string;
    date: string;
  }[];
  isFeatured?: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  joinDate: string;
  avatar: string;
  readingStats: {
    totalRead: number;
    currentlyReading: number;
    completedSeries: number;
    totalChaptersRead: number;
  };
}

export interface BookmarkedComic extends Comic {
  lastReadChapter?: number;
  dateAdded: string;
  isNew?: boolean;
}

export interface RatedComic extends Comic {
  rating: number;
  comment?: string; // Changed from review to comment
  dateRated: string;
  comicId?: string; // Add comicId for compatibility
}

export interface ReadingHistoryItem {
  id?: string;
  comicId: string;
  comicTitle: string;
  comicCover: string;
  chapterId: string; // Explicitly a string
  chapterNumber: number;
  chapterTitle?: string;
  readDate: string;
  lastReadAt: string; // Required field
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface ApiError {
  message: string;
  status: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
