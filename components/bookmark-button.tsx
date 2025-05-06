"use client";

import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { userService } from "@/lib/api";

interface BookmarkButtonProps {
  comicId: string;
}

export function BookmarkButton({ comicId }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  // Check if the comic is already bookmarked
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        const bookmarks = await userService.getBookmarks();
        const isAlreadyBookmarked = bookmarks.some(
          (bookmark) => bookmark.id === comicId
        );
        setIsBookmarked(isAlreadyBookmarked);
      } catch (error) {
        console.error("Error checking bookmark status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkBookmarkStatus();
  }, [comicId, isAuthenticated]);

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to bookmark comics",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      if (isBookmarked) {
        // Remove bookmark
        await userService.removeBookmark(comicId);
        setIsBookmarked(false);
        toast({
          title: "Bookmark Removed",
          description: "Comic has been removed from your bookmarks",
        });
      } else {
        // Add bookmark
        await userService.addBookmark(comicId);
        setIsBookmarked(true);
        toast({
          title: "Bookmark Added",
          description: "Comic has been added to your bookmarks",
        });
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast({
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  return (
    <Button
      variant={isBookmarked ? "default" : "outline"}
      onClick={handleToggleBookmark}
      disabled={isProcessing}
      className={isBookmarked ? "bg-green-400 hover:bg-green-500" : ""}
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : isBookmarked ? (
        <BookmarkCheck className="h-4 w-4 mr-2" />
      ) : (
        <Bookmark className="h-4 w-4 mr-2" />
      )}
      {isBookmarked ? "Bookmarked" : "Add to Bookmarks"}
    </Button>
  );
}
