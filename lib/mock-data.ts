import type { Comic } from "@/types"

export interface User {
  id: string
  username: string
  email: string
  joinDate: string
  avatar: string
  readingStats: {
    totalRead: number
    currentlyReading: number
    completedSeries: number
    totalChaptersRead: number
  }
}

export interface BookmarkedComic extends Comic {
  lastReadChapter?: number
  dateAdded: string
  isNew?: boolean
}

export interface RatedComic extends Comic {
  rating: number
  comment?: string
  dateRated: string
}

export interface ReadingHistoryItem {
  comicId: string
  comicTitle: string
  comicCover: string
  chapterId: string
  chapterNumber: number
  chapterTitle?: string
  readDate: string
  lastReadAt: string
}

export const mockUser: User = {
  id: "user-1",
  username: "MangaFan42",
  email: "mangafan42@example.com",
  joinDate: "January 15, 2023",
  avatar: "/placeholder.svg?height=100&width=100",
  readingStats: {
    totalRead: 42,
    currentlyReading: 7,
    completedSeries: 3,
    totalChaptersRead: 358,
  },
}

export const mockBookmarks: BookmarkedComic[] = [
  {
    id: "1",
    title: "The Dragon King's Daughter",
    cover: "/placeholder.svg?height=400&width=300",
    latestChapter: "Chapter 45",
    updatedAt: "2 hours ago",
    status: "Ongoing",
    genres: ["Action", "Fantasy", "Romance"],
    lastReadChapter: 42,
    dateAdded: "March 10, 2023",
    isNew: true,
  },
  {
    id: "7",
    title: "Omniscient Reader's Viewpoint",
    cover: "/placeholder.svg?height=400&width=300",
    latestChapter: "Chapter 93",
    updatedAt: "4 hours ago",
    status: "Ongoing",
    genres: ["Action", "Adventure", "Fantasy"],
    lastReadChapter: 89,
    dateAdded: "February 5, 2023",
    isNew: true,
  },
  {
    id: "8",
    title: "Tower of God",
    cover: "/placeholder.svg?height=400&width=300",
    latestChapter: "Chapter 550",
    updatedAt: "6 hours ago",
    status: "Ongoing",
    genres: ["Action", "Adventure", "Fantasy", "Mystery"],
    lastReadChapter: 542,
    dateAdded: "January 20, 2023",
    isNew: true,
  },
  {
    id: "9",
    title: "Eleceed",
    cover: "/placeholder.svg?height=400&width=300",
    latestChapter: "Chapter 210",
    updatedAt: "12 hours ago",
    status: "Ongoing",
    genres: ["Action", "Comedy", "Supernatural"],
    lastReadChapter: 205,
    dateAdded: "April 2, 2023",
    isNew: true,
  },
  {
    id: "6",
    title: "Solo Leveling",
    cover: "/placeholder.svg?height=400&width=300",
    latestChapter: "Chapter 179",
    updatedAt: "2 weeks ago",
    status: "Completed",
    genres: ["Action", "Adventure", "Fantasy"],
    lastReadChapter: 179,
    dateAdded: "December 15, 2022",
    isNew: false,
  },
  {
    id: "2",
    title: "Urban Immortal Cultivator",
    cover: "/placeholder.svg?height=400&width=300",
    latestChapter: "Chapter 127",
    updatedAt: "1 day ago",
    status: "Ongoing",
    genres: ["Action", "Fantasy", "Martial Arts"],
    lastReadChapter: 120,
    dateAdded: "March 25, 2023",
    isNew: true,
  },
  {
    id: "3",
    title: "The Scholar's Reincarnation",
    cover: "/placeholder.svg?height=400&width=300",
    latestChapter: "Chapter 89",
    updatedAt: "3 days ago",
    status: "Ongoing",
    genres: ["Action", "Adventure", "Fantasy"],
    lastReadChapter: 85,
    dateAdded: "February 18, 2023",
    isNew: true,
  },
]

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
    comment:
      "Great story with amazing character development. The art style is beautiful and consistent. The world-building is detailed and immersive, making it easy to get lost in the story.",
    dateRated: "April 5, 2023",
  },
  {
    id: "6",
    title: "Solo Leveling",
    cover: "/placeholder.svg?height=400&width=300",
    latestChapter: "Chapter 179",
    updatedAt: "2 weeks ago",
    status: "Completed",
    genres: ["Action", "Adventure", "Fantasy"],
    rating: 5,
    comment:
      "Masterpiece! The art and story are both top-tier. One of the best manhwa I've ever read. The character progression is satisfying and the action scenes are incredibly well drawn. Highly recommended for anyone who enjoys action and fantasy.",
    dateRated: "January 10, 2023",
  },
  {
    id: "8",
    title: "Tower of God",
    cover: "/placeholder.svg?height=400&width=300",
    latestChapter: "Chapter 550",
    updatedAt: "6 hours ago",
    status: "Ongoing",
    genres: ["Action", "Adventure", "Fantasy", "Mystery"],
    rating: 4,
    dateRated: "March 15, 2023",
  },
  {
    id: "9",
    title: "Eleceed",
    cover: "/placeholder.svg?height=400&width=300",
    latestChapter: "Chapter 210",
    updatedAt: "12 hours ago",
    status: "Ongoing",
    genres: ["Action", "Comedy", "Supernatural"],
    rating: 4.5,
    comment:
      "A perfect blend of action and comedy. The characters are lovable and the story keeps getting better with each chapter.",
    dateRated: "February 28, 2023",
  },
  {
    id: "2",
    title: "Urban Immortal Cultivator",
    cover: "/placeholder.svg?height=400&width=300",
    latestChapter: "Chapter 127",
    updatedAt: "1 day ago",
    status: "Ongoing",
    genres: ["Action", "Fantasy", "Martial Arts"],
    rating: 3.5,
    comment: "Good story but pacing issues in some arcs. The art is decent and improves over time.",
    dateRated: "April 1, 2023",
  },
]

export const mockReadingHistory: ReadingHistoryItem[] = [
  {
    comicId: "1",
    comicTitle: "The Dragon King's Daughter",
    comicCover: "/placeholder.svg?height=400&width=300",
    chapterId: "chapter-42", // Updated to use a proper chapter ID format
    chapterNumber: 42,
    chapterTitle: "The Awakening",
    readDate: "April 10, 2023",
    lastReadAt: "2023-04-10T15:30:00Z",
  },
  {
    comicId: "7",
    comicTitle: "Omniscient Reader's Viewpoint",
    comicCover: "/placeholder.svg?height=400&width=300",
    chapterId: "chapter-89", // Updated to use a proper chapter ID format
    chapterNumber: 89,
    chapterTitle: "The Demon King's Banquet",
    readDate: "April 9, 2023",
    lastReadAt: "2023-04-09T12:15:00Z",
  },
  {
    comicId: "8",
    comicTitle: "Tower of God",
    comicCover: "/placeholder.svg?height=400&width=300",
    chapterId: "chapter-542", // Updated to use a proper chapter ID format
    chapterNumber: 542,
    readDate: "April 8, 2023",
    lastReadAt: "2023-04-08T18:45:00Z",
  },
  {
    comicId: "9",
    comicTitle: "Eleceed",
    comicCover: "/placeholder.svg?height=400&width=300",
    chapterId: "chapter-205", // Updated to use a proper chapter ID format
    chapterNumber: 205,
    chapterTitle: "New Awakening",
    readDate: "April 7, 2023",
    lastReadAt: "2023-04-07T14:20:00Z",
  },
  {
    comicId: "1",
    comicTitle: "The Dragon King's Daughter",
    comicCover: "/placeholder.svg?height=400&width=300",
    chapterId: "chapter-41", // Updated to use a proper chapter ID format
    chapterNumber: 41,
    chapterTitle: "The Council's Decision",
    readDate: "April 6, 2023",
    lastReadAt: "2023-04-06T10:05:00Z",
  },
  {
    comicId: "1",
    comicTitle: "The Dragon King's Daughter",
    comicCover: "/placeholder.svg?height=400&width=300",
    chapterId: "chapter-40", // Updated to use a proper chapter ID format
    chapterNumber: 40,
    chapterTitle: "Training Days",
    readDate: "April 6, 2023",
    lastReadAt: "2023-04-06T09:30:00Z",
  },
  {
    comicId: "7",
    comicTitle: "Omniscient Reader's Viewpoint",
    comicCover: "/placeholder.svg?height=400&width=300",
    chapterId: "chapter-88", // Updated to use a proper chapter ID format
    chapterNumber: 88,
    chapterTitle: "The Constellation's Wager",
    readDate: "April 5, 2023",
    lastReadAt: "2023-04-05T16:45:00Z",
  },
  {
    comicId: "2",
    comicTitle: "Urban Immortal Cultivator",
    comicCover: "/placeholder.svg?height=400&width=300",
    chapterId: "chapter-120", // Updated to use a proper chapter ID format
    chapterNumber: 120,
    readDate: "April 4, 2023",
    lastReadAt: "2023-04-04T20:10:00Z",
  },
  {
    comicId: "3",
    comicTitle: "The Scholar's Reincarnation",
    comicCover: "/placeholder.svg?height=400&width=300",
    chapterId: "chapter-85", // Updated to use a proper chapter ID format
    chapterNumber: 85,
    readDate: "April 3, 2023",
    lastReadAt: "2023-04-03T11:25:00Z",
  },
  {
    comicId: "8",
    comicTitle: "Tower of God",
    comicCover: "/placeholder.svg?height=400&width=300",
    chapterId: "chapter-541", // Updated to use a proper chapter ID format
    chapterNumber: 541,
    readDate: "April 2, 2023",
    lastReadAt: "2023-04-02T17:50:00Z",
  },
]

// Helper function to get comics with new chapters
export function getComicsWithNewChapters() {
  return mockBookmarks.filter((comic) => {
    if (!comic.lastReadChapter) return false
    const latestChapterNum = Number(comic.latestChapter.split(" ")[1])
    return comic.lastReadChapter < latestChapterNum
  })
}

// Helper function to get completed comics
export function getCompletedComics() {
  return mockBookmarks.filter(
    (comic) =>
      comic.status === "Completed" &&
      comic.lastReadChapter &&
      Number(comic.latestChapter.split(" ")[1]) === comic.lastReadChapter,
  )
}

// Helper function to get currently reading comics
export function getCurrentlyReadingComics() {
  return mockBookmarks.filter((comic) => {
    if (!comic.lastReadChapter) return false
    const latestChapterNum = Number(comic.latestChapter.split(" ")[1])
    return comic.lastReadChapter < latestChapterNum && comic.status === "Ongoing"
  })
}
