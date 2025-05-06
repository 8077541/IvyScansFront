export interface ReadingHistoryItem {
  comicId: string;
  comicTitle: string;
  comicCover: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle?: string;
  readDate: string;
  lastReadAt: string;
}

export interface BookmarkedComic {
  id: string;
  title: string;
  cover: string;
  latestChapter: string;
  updatedAt: string;
  status: string;
  genres: string[];
  lastReadChapter?: number;
  dateAdded: string;
  isNew?: boolean;
}

export interface RatedComic {
  id: string;
  title: string;
  cover: string;
  latestChapter: string;
  updatedAt: string;
  status: string;
  genres: string[];
  rating: number;
  comment?: string;
  dateRated: string;
}

export const mockUser = {
  id: "user-1",
  username: "coolreader123",
  email: "user@example.com",
  joinDate: "January 1, 2023",
  avatar: "/placeholder.svg?height=100&width=100",
  readingStats: {
    totalRead: 25,
    currentlyReading: 5,
    completedSeries: 2,
    totalChaptersRead: 500,
  },
};

export const mockBookmarks: BookmarkedComic[] = [
  {
    id: "1",
    title: "The Dragon King's Daughter",
    cover: "/placeholder.svg?height=400&width=300",
    latestChapter: "Chapter 45",
    updatedAt: "2 hours ago",
    status: "Ongoing",
    genres: ["Action", "Fantasy", "Romance"],
    lastReadChapter: 40,
    dateAdded: "April 1, 2023",
    isNew: false,
  },
  {
    id: "7",
    title: "Omniscient Reader's Viewpoint",
    cover: "/placeholder.svg?height=400&width=300",
    latestChapter: "Chapter 93",
    updatedAt: "4 hours ago",
    status: "Ongoing",
    genres: ["Action", "Adventure", "Fantasy"],
    lastReadChapter: 80,
    dateAdded: "March 15, 2023",
    isNew: true,
  },
  {
    id: "8",
    title: "Tower of God",
    cover: "/placeholder.svg?height=400&width=300",
    latestChapter: "Chapter 550",
    updatedAt: "6 hours ago",
    status: "Completed",
    genres: ["Action", "Adventure", "Fantasy", "Mystery"],
    lastReadChapter: 550,
    dateAdded: "February 20, 2023",
    isNew: false,
  },
];

export const mockRatings: RatedComic[] = [
  {
    id: "1",
    title: "The Dragon King's Daughter",
    cover: "/placeholder.svg?height=400&width=300",
    latestChapter: "Chapter 45",
    updatedAt: "2 hours ago",
    status: "Ongoing",
    genres: ["Action", "Fantasy", "Romance"],
    rating: 4.5,
    comment: "A great read!",
    dateRated: "April 5, 2023",
  },
  {
    id: "7",
    title: "Omniscient Reader's Viewpoint",
    cover: "/placeholder.svg?height=400&width=300",
    latestChapter: "Chapter 93",
    updatedAt: "4 hours ago",
    status: "Ongoing",
    genres: ["Action", "Adventure", "Fantasy"],
    rating: 5.0,
    comment: "One of my favorites!",
    dateRated: "April 10, 2023",
  },
];

// Update the mock reading history data to include lastReadAt
export const mockReadingHistory: ReadingHistoryItem[] = [
  {
    comicId: "1",
    comicTitle: "The Dragon King's Daughter",
    comicCover: "/placeholder.svg?height=400&width=300",
    chapterId: "40",
    chapterNumber: 40,
    chapterTitle: "The Awakening",
    readDate: "2023-04-10T15:30:00Z",
    lastReadAt: "2023-04-10T15:30:00Z",
    id: "history-1",
  },
  {
    comicId: "7",
    comicTitle: "Omniscient Reader's Viewpoint",
    comicCover: "/placeholder.svg?height=400&width=300",
    chapterId: "80",
    chapterNumber: 80,
    chapterTitle: "The Demon King's Banquet",
    readDate: "2023-04-09T12:15:00Z",
    lastReadAt: "2023-04-09T12:15:00Z",
    id: "history-2",
  },
  {
    comicId: "8",
    comicTitle: "Tower of God",
    comicCover: "/placeholder.svg?height=400&width=300",
    chapterId: "550",
    chapterNumber: 550,
    readDate: "2023-04-08T18:45:00Z",
    lastReadAt: "2023-04-08T18:45:00Z",
    id: "history-3",
  },
];

export const getCurrentlyReadingComics = (): BookmarkedComic[] => {
  return mockBookmarks.filter((comic) => comic.status === "Ongoing");
};

export const getCompletedComics = (): BookmarkedComic[] => {
  return mockBookmarks.filter((comic) => comic.status === "Completed");
};
