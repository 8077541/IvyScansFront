"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { userService } from "@/lib/api";
import type { BookmarkedComic } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

// Update the formatDate function to be more robust
function formatDate(dateString: string): string {
  if (!dateString) return "Unknown date";

  try {
    // Try to parse the date
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn("Invalid date:", dateString);
      return "Unknown date";
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error, dateString);
    return "Unknown date";
  }
}

// Add a function to format relative time or timestamps
function formatTimestamp(timestamp: string): string {
  if (!timestamp) return "Unknown";

  try {
    // Check if it's a relative time string (e.g., "2 hours ago")
    if (
      timestamp.includes("ago") ||
      timestamp.includes("hour") ||
      timestamp.includes("day") ||
      timestamp.includes("week") ||
      timestamp.includes("month")
    ) {
      return timestamp;
    }

    // Otherwise, try to parse as date
    const date = new Date(timestamp);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return timestamp; // Return original if can't parse
    }

    // If it's today, show time
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // If it's yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    // Otherwise show date
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting timestamp:", error, timestamp);
    return timestamp; // Return original on error
  }
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkedComic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setIsLoading(true);
        const data = await userService.getBookmarks();
        setBookmarks(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching bookmarks:", err);
        setError("Failed to load bookmarks. Using mock data instead.");
        setBookmarks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  const removeBookmark = async (id: string) => {
    try {
      await userService.removeBookmark(id);
      setBookmarks(bookmarks.filter((bookmark) => bookmark.id !== id));
      toast({
        title: "Bookmark Removed",
        description: "Comic has been removed from your bookmarks",
      });
    } catch (error) {
      console.error("Error removing bookmark:", error);
      toast({
        title: "Error",
        description: "Failed to remove bookmark. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Bookmarks</h1>
          <p className="text-muted-foreground">
            Manage your bookmarked comics and continue reading where you left
            off.
          </p>
        </div>
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-[200px] w-full" />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Bookmarks</h1>
        <p className="text-muted-foreground">
          Manage your bookmarked comics and continue reading where you left off.
        </p>
      </div>
      <Separator />

      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {bookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((comic) => (
            <BookmarkCard
              key={comic.id}
              comic={comic}
              onRemove={removeBookmark}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No bookmarks yet</h3>
          <p className="text-muted-foreground mb-4">
            Start exploring comics and bookmark your favorites to read later.
          </p>
          <Button
            asChild
            className="bg-green-400 hover:bg-green-500 glow-green"
          >
            <Link href="/comics">Browse Comics</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function BookmarkCard({
  comic,
  onRemove,
}: {
  comic: BookmarkedComic;
  onRemove: (id: string) => void;
}) {
  const [isRemoving, setIsRemoving] = useState(false);
  const latestChapterNum = Number(comic.latestChapter?.split(" ")[1] || 0);
  const hasNewChapters =
    comic.lastReadChapter && comic.lastReadChapter < latestChapterNum;
  const newChaptersCount = latestChapterNum - (comic.lastReadChapter || 0);

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove(comic.id);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md hover:shadow-green-500/10 hover:border-green-500/50">
      <div className="flex h-full">
        <div className="relative w-1/3">
          <Image
            src={comic.cover || "/placeholder.svg"}
            alt={comic.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 33vw, 20vw"
          />
          {hasNewChapters && (
            <div className="absolute top-2 right-2">
              <div className="bg-green-400 text-white text-xs font-medium px-2 py-1 rounded-full animate-pulse">
                +{newChaptersCount}
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1">
          <CardContent className="p-4 flex-1">
            <h3 className="font-semibold line-clamp-2 mb-1">{comic.title}</h3>
            <div className="flex flex-wrap gap-1 mb-2">
              {comic.genres && comic.genres.length > 0
                ? comic.genres.slice(0, 2).map((genre, index) => (
                    <div
                      key={`${genre}-${index}`}
                      className="bg-secondary text-xs px-2 py-0.5 rounded-full text-secondary-foreground"
                    >
                      {genre}
                    </div>
                  ))
                : null}
              {comic.genres && comic.genres.length > 2 && (
                <div className="bg-secondary text-xs px-2 py-0.5 rounded-full text-secondary-foreground">
                  +{comic.genres.length - 2}
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Latest: {comic.latestChapter || "Unknown"}</p>
              {comic.lastReadChapter && (
                <p>Last Read: Chapter {comic.lastReadChapter}</p>
              )}
              <p>Updated: {formatTimestamp(comic.updatedAt)}</p>
              <p>Added: {formatDate(comic.dateAdded)}</p>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  disabled={isRemoving}
                >
                  {isRemoving ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-1" />
                  )}
                  Remove
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove Bookmark</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove "{comic.title}" from your
                    bookmarks? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600"
                    onClick={handleRemove}
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              asChild
              size="sm"
              className="bg-green-400 hover:bg-green-500"
            >
              <Link
                href={`/comics/${comic.id}/chapters/${
                  comic.lastReadChapter ? comic.lastReadChapter + 1 : 1
                }`}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Continue
              </Link>
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
