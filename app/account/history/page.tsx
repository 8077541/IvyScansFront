"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, BookOpen, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { userService, comicService } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/date-utils";
import type { ReadingHistoryItem, Comic } from "@/types";

export default function HistoryPage() {
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [comicDetails, setComicDetails] = useState<Record<string, Comic>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch reading history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const data = await userService.getReadingHistory();
        setHistory(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching reading history:", err);
        setError("Failed to load reading history. Using mock data instead.");
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Fetch comic details for each unique comic in history
  useEffect(() => {
    const fetchComicDetails = async () => {
      if (history.length === 0) return;

      // Get unique comic IDs
      const uniqueComicIds = [...new Set(history.map((item) => item.comicId))];
      const detailsMap: Record<string, Comic> = {};

      // Fetch details for each comic
      await Promise.all(
        uniqueComicIds.map(async (comicId) => {
          try {
            const details = await comicService.getComicById(comicId);
            detailsMap[comicId] = details;
          } catch (error) {
            console.error(
              `Error fetching details for comic ${comicId}:`,
              error
            );
          }
        })
      );

      setComicDetails(detailsMap);
    };

    if (!isLoading && history.length > 0) {
      fetchComicDetails();
    }
  }, [history, isLoading]);

  // Group history by date
  const historyByDate = history.reduce((acc, item) => {
    try {
      // Safely parse the date
      const date = new Date(item.readDate);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn("Invalid date found:", item.readDate);
        const fallbackDate = "Unknown Date";
        if (!acc[fallbackDate]) {
          acc[fallbackDate] = [];
        }
        acc[fallbackDate].push(item);
        return acc;
      }

      // Format the date for display
      const formattedDate = formatDate(item.readDate);

      if (!acc[formattedDate]) {
        acc[formattedDate] = [];
      }
      acc[formattedDate].push(item);
    } catch (error) {
      console.error("Error processing date:", item.readDate, error);
      // Add to unknown date category
      const fallbackDate = "Unknown Date";
      if (!acc[fallbackDate]) {
        acc[fallbackDate] = [];
      }
      acc[fallbackDate].push(item);
    }
    return acc;
  }, {} as Record<string, typeof history>);

  const sortedDates = Object.keys(historyByDate).sort((a, b) => {
    // Keep "Unknown Date" at the end
    if (a === "Unknown Date") return 1;
    if (b === "Unknown Date") return -1;

    // Sort other dates in descending order (newest first)
    return new Date(b).getTime() - new Date(a).getTime();
  });

  // Filter out "Unknown Date" if it's empty
  const filteredDates = sortedDates.filter((date) => {
    if (date === "Unknown Date" && historyByDate[date].length === 0) {
      return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reading History</h1>
          <p className="text-muted-foreground">
            Track your reading progress and history.
          </p>
        </div>
        <Separator />
        <div className="space-y-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-[200px] w-full" />
            ))}
        </div>
      </div>
    );
  }

  // Get cover image for a history item
  const getCoverImage = (item: ReadingHistoryItem) => {
    // First try to get from comic details
    if (comicDetails[item.comicId]?.cover) {
      return comicDetails[item.comicId].cover;
    }
    // Then try from the item itself
    if (item.comicCover) {
      return item.comicCover;
    }
    // Fallback to placeholder
    return `/placeholder.svg?height=64&width=64&text=${encodeURIComponent(
      item.comicTitle
    )}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reading History</h1>
        <p className="text-muted-foreground">
          Track your reading progress and history.
        </p>
      </div>
      <Separator />

      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {history.length > 0 ? (
        <div className="space-y-8">
          {filteredDates.map((date) => (
            <div key={date} className="space-y-4">
              {date !== "Unknown Date" && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-400" />
                  <h2 className="text-xl font-semibold">{date}</h2>
                </div>
              )}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {historyByDate[date].map((item, index) => (
                      <div
                        key={`${item.comicId}-${item.chapterNumber}-${index}`}
                        className="flex items-start gap-4"
                      >
                        <div className="rounded-md overflow-hidden w-16 h-16 flex-shrink-0 bg-muted">
                          <img
                            src={getCoverImage(item) || "/placeholder.svg"}
                            alt={item.comicTitle}
                            className="w-full h-full object-cover"
                            width={64}
                            height={64}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `/placeholder.svg?height=64&width=64&text=${encodeURIComponent(
                                item.comicTitle
                              )}`;
                            }}
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{item.comicTitle}</p>
                            {formatTime(item.readDate) && (
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTime(item.readDate)}
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Chapter {item.chapterNumber}
                            {item.chapterTitle && `: ${item.chapterTitle}`}
                          </p>
                          <div className="flex gap-2 pt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              asChild
                            >
                              <Link href={`/comics/${item.comicId}`}>
                                <BookOpen className="h-3 w-3 mr-1" />
                                Comic Page
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              className="h-8 text-xs bg-green-400 hover:bg-green-500"
                              asChild
                            >
                              <Link
                                href={`/comics/${item.comicId}/chapters/${item.chapterNumber}`}
                              >
                                Read Again
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              className="h-8 text-xs bg-green-400 hover:bg-green-500"
                              asChild
                            >
                              <Link
                                href={`/comics/${item.comicId}/chapters/${
                                  item.chapterNumber + 1
                                }`}
                              >
                                Next Chapter
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No reading history yet</h3>
          <p className="text-muted-foreground mb-4">
            Start reading comics to track your progress.
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

// Helper function to format time
function formatTime(dateString: string): string {
  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch (error) {
    console.error("Error formatting time:", error);
    return ""; // Return empty string if parsing fails
  }
}
