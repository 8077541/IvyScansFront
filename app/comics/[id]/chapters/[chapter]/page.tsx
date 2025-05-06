"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  ArrowUp,
  Maximize,
  Minimize,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { comicService, userService } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";

interface ChapterPageProps {
  params: {
    id: string;
    chapter: string;
  };
}

export default function ChapterPage({ params }: ChapterPageProps) {
  // Define state for params to handle the Promise
  const [comicId, setComicId] = useState<string>("");
  const [chapterParam, setChapterParam] = useState<string>("");
  const [chapterNumber, setChapterNumber] = useState<number>(0);

  // Define all state hooks at the top level
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chapterData, setChapterData] = useState<{
    images: string[];
    title?: string;
    number: number;
    totalChapters?: number;
    id?: string; // Changed from chapterId to id to match API response
  } | null>(null);
  const [prevChapter, setPrevChapter] = useState<number | null>(null);
  const [nextChapter, setNextChapter] = useState<number | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageQuality, setImageQuality] = useState("high");
  const [readingDirection, setReadingDirection] = useState("vertical");
  const [comicTitle, setComicTitle] = useState("");
  const [historyRecorded, setHistoryRecorded] = useState(false);
  const [isValidParams, setIsValidParams] = useState(false);

  // Get auth and toast hooks
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Handle params Promise
  useEffect(() => {
    const resolveParams = async () => {
      try {
        // Handle params as a Promise
        const resolvedParams = await Promise.resolve(params);
        const id = resolvedParams?.id || "";
        const chapter = resolvedParams?.chapter || "";
        const chapterNum = Number.parseInt(chapter) || 0;

        setComicId(id);
        setChapterParam(chapter);
        setChapterNumber(chapterNum);
        setIsValidParams(Boolean(id && chapter && !isNaN(chapterNum)));
      } catch (err) {
        console.error("Error resolving params:", err);
        setError("Invalid route parameters");
        setIsValidParams(false);
      }
    };

    resolveParams();
  }, [params]);

  // Fetch comic title for reading history
  useEffect(() => {
    const fetchComicTitle = async () => {
      if (!isValidParams || !comicId) return;

      try {
        const comic = await comicService.getComicById(comicId);
        setComicTitle(comic.title);
      } catch (err) {
        console.error("Error fetching comic title:", err);
      }
    };

    if (comicId) {
      fetchComicTitle();
    }
  }, [comicId, isValidParams]);

  // Record reading history
  useEffect(() => {
    const recordReadingHistory = async () => {
      // Skip if already recorded, not authenticated, or missing data
      if (
        historyRecorded ||
        !isAuthenticated ||
        !isValidParams ||
        !comicId ||
        !comicTitle
      )
        return;

      try {
        // Use the id from the API response if available, otherwise fall back to the chapter parameter
        const actualChapterId = chapterData?.id || chapterParam;

        await userService.addToHistory(comicId, actualChapterId, chapterNumber);
        setHistoryRecorded(true);
        console.log(
          "Reading history recorded:",
          comicId,
          actualChapterId,
          chapterNumber
        );

        // Show toast notification
        toast({
          title: "Reading Progress Saved",
          description: `Your progress for ${comicTitle} Chapter ${chapterNumber} has been saved.`,
          variant: "default",
        });
      } catch (err) {
        console.error("Failed to record reading history:", err);
      }
    };

    if (comicId && comicTitle && chapterData) {
      recordReadingHistory();
    }
  }, [
    isAuthenticated,
    comicId,
    chapterParam,
    chapterNumber,
    comicTitle,
    historyRecorded,
    toast,
    isValidParams,
    chapterData,
  ]);

  // Fetch chapter data
  useEffect(() => {
    const fetchChapterData = async () => {
      // Skip fetching if parameters are invalid
      if (!isValidParams || !comicId) {
        setError("Invalid comic ID or chapter number");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await comicService.getChapter(comicId, chapterParam);
        setChapterData(data);

        // Determine prev/next chapters
        const chapters = await comicService.getComicChapters(comicId);
        if (chapters) {
          const chapterNumbers = chapters
            .map((c) => c.number)
            .sort((a, b) => a - b);
          const currentIndex = chapterNumbers.indexOf(chapterNumber);

          setPrevChapter(
            currentIndex > 0 ? chapterNumbers[currentIndex - 1] : null
          );
          setNextChapter(
            currentIndex < chapterNumbers.length - 1
              ? chapterNumbers[currentIndex + 1]
              : null
          );
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching chapter:", err);
        setError("Failed to load chapter. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (comicId && chapterParam) {
      fetchChapterData();
      // Reset history recorded state when chapter changes
      setHistoryRecorded(false);
    }
  }, [comicId, chapterNumber, isValidParams, chapterParam]);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show controls when scrolling up
      if (currentScrollY < lastScrollY) {
        setIsScrollingUp(true);
        setShowControls(true);
      } else {
        setIsScrollingUp(false);
        // Hide controls after scrolling down a bit
        if (currentScrollY > 100 && currentScrollY > lastScrollY + 30) {
          setShowControls(false);
        }
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Helper functions
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // If parameters are invalid, show an error message
  if (!isValidParams) {
    return (
      <main className="reading-container">
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[50vh]">
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            Error: Invalid Parameters
          </h1>
          <p className="text-muted-foreground mb-6">
            The comic ID or chapter number is missing or invalid.
          </p>
          <Button asChild>
            <Link href="/comics">Browse Comics</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="reading-container">
      {/* Navigation controls */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur transition-transform duration-300 ${
          showControls ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/comics/${comicId}`}
              className="inline-flex items-center text-muted-foreground hover:text-green-400"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Comic
            </Link>
            <h1 className="text-lg font-medium hidden md:block">
              {comicTitle && `${comicTitle} - `}
              Chapter {chapterParam}
              {chapterData?.title && ` - ${chapterData.title}`}
            </h1>
            {chapterData && (
              <div className="hidden md:flex items-center gap-2 ml-4 flex-1 max-w-md">
                <span className="text-xs text-muted-foreground">Progress:</span>
                <Progress
                  value={
                    (chapterNumber / (chapterData.totalChapters || 10)) * 100
                  }
                  className="h-2"
                />
                <span className="text-xs text-muted-foreground">
                  {chapterNumber}/{chapterData.totalChapters || 10}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {prevChapter && (
              <Link href={`/comics/${comicId}/chapters/${prevChapter}`}>
                <Button variant="outline" size="sm" className="gap-1">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
              </Link>
            )}

            {nextChapter && (
              <Link href={`/comics/${comicId}/chapters/${nextChapter}`}>
                <Button variant="outline" size="sm" className="gap-1">
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            )}

            <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
              <span className="sr-only">
                {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    setReadingDirection(
                      readingDirection === "vertical"
                        ? "horizontal"
                        : "vertical"
                    )
                  }
                >
                  Reading Direction:{" "}
                  {readingDirection === "vertical"
                    ? "Vertical"
                    : readingDirection === "horizontal"
                    ? "Horizontal"
                    : "Unknown"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setImageQuality(imageQuality === "high" ? "medium" : "high")
                  }
                >
                  Image Quality: {imageQuality === "high" ? "High" : "Medium"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Comic reader */}
      <div className="container mx-auto px-0 md:px-4 pt-20 pb-20 comic-reader">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <Skeleton key={index} className="w-full max-w-3xl h-[600px]" />
              ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[50vh]">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div
            className={`flex ${
              readingDirection === "vertical"
                ? "flex-col"
                : "flex-row overflow-x-auto"
            } items-center gap-1`}
          >
            {chapterData?.images.map((image, index) => (
              <div
                key={index}
                className={`${
                  readingDirection === "vertical"
                    ? "w-full max-w-3xl"
                    : "min-w-fit"
                }`}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Page ${index + 1}`}
                  width={800}
                  height={1200}
                  className="w-full h-auto"
                  priority={index < 2}
                  sizes="(max-width: 768px) 100vw, 800px"
                  quality={imageQuality === "high" ? 100 : 75}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {prevChapter && (
            <Link href={`/comics/${comicId}/chapters/${prevChapter}`}>
              <Button variant="outline" size="sm" className="gap-1">
                <ChevronLeft className="h-4 w-4" />
                Previous Chapter
              </Button>
            </Link>
          )}

          <Button
            variant="secondary"
            size="icon"
            onClick={scrollToTop}
            className="rounded-full"
          >
            <ArrowUp className="h-4 w-4" />
            <span className="sr-only">Scroll to top</span>
          </Button>

          {nextChapter && (
            <Link href={`/comics/${comicId}/chapters/${nextChapter}`}>
              <Button variant="outline" size="sm" className="gap-1">
                Next Chapter
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
