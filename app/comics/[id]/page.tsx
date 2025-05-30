import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, BookOpen, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { comicService } from "@/lib/api";
import { BookmarkButton } from "@/components/bookmark-button";
import { RatingControl } from "@/components/rating-control";
import { formatRelativeTime } from "@/lib/date-utils";

interface ComicPageProps {
  params: {
    id: string;
  };
}

// Loading component for comic details
function ComicDetailsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Skeleton className="aspect-[3/4] w-full rounded-lg" />
      </div>
      <div className="md:col-span-2 space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <div className="flex flex-wrap gap-2">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-6 w-20 rounded-full" />
            ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="flex flex-wrap gap-3">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-10 w-32" />
            ))}
        </div>
      </div>
    </div>
  );
}

// Loading component for chapters
function ChaptersSkeleton() {
  return (
    <div className="space-y-2">
      {Array(10)
        .fill(0)
        .map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
    </div>
  );
}

// Update ComicDetails to be async
async function ComicDetails({ id }: { id: string }) {
  // Validate the ID parameter
  if (!id) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-bold text-red-500">
          Error: Invalid Comic ID
        </h2>
        <p className="text-muted-foreground mt-2">
          The comic ID is missing or invalid.
        </p>
        <Button className="mt-4" asChild>
          <Link href="/comics">Browse Comics</Link>
        </Button>
      </div>
    );
  }

  try {
    // This would fetch from your API in production
    const comic = await comicService.getComicById(id);

    // Extract chapter number safely
    const latestChapterNumber = comic.latestChapter
      ? comic.latestChapter.split(" ")[1]
      : "1";

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg border">
            <Image
              src={comic.cover || "/placeholder.svg"}
              alt={comic.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-2">{comic.title}</h1>

          <div className="flex flex-wrap gap-2 mb-4">
            {comic.genres &&
              comic.genres.map((genre) => (
                <Badge
                  key={genre}
                  variant="outline"
                  className="bg-secondary text-secondary-foreground"
                >
                  {genre}
                </Badge>
              ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center text-sm">
              <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground mr-2">Status:</span>
              <span>{comic.status || "Unknown"}</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground mr-2">Updated:</span>
              <span>{formatRelativeTime(comic.updatedAt) || "Unknown"}</span>
            </div>
            <div className="flex items-center text-sm">
              <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground mr-2">Author:</span>
              <span>{comic.author || "Unknown"}</span>
            </div>
            <div className="flex items-center text-sm">
              <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground mr-2">Artist:</span>
              <span>{comic.artist || "Unknown"}</span>
            </div>
          </div>

          {/* Rating control */}
          <div className="mb-4">
            <RatingControl comicId={id} comicTitle={comic.title} />
          </div>

          <p className="text-muted-foreground mb-6">
            {comic.description || "No description available."}
          </p>

          <div className="flex flex-wrap gap-3">
            <Button className="bg-green-500 hover:bg-green-600">
              <Link href={`/comics/${comic.id}/chapters/1`}>
                Read First Chapter
              </Link>
            </Button>
            {comic.latestChapter && (
              <Button variant="outline">
                <Link
                  href={`/comics/${comic.id}/chapters/${latestChapterNumber}`}
                >
                  Read Latest Chapter
                </Link>
              </Button>
            )}
            <BookmarkButton comicId={id} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching comic details:", error);
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-bold text-red-500">Error Loading Comic</h2>
        <p className="text-muted-foreground mt-2">
          Failed to load comic details. Please try again later.
        </p>
        <Button className="mt-4" asChild>
          <Link href="/comics">Browse Comics</Link>
        </Button>
      </div>
    );
  }
}

// Update Chapters to be async
async function Chapters({ id }: { id: string }) {
  // Validate the ID parameter
  if (!id) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Cannot load chapters: Invalid comic ID.
        </p>
      </div>
    );
  }

  try {
    // This would fetch from your API in production
    const chapters = await comicService.getComicChapters(id);

    return (
      <div className="grid gap-2">
        {chapters && chapters.length > 0 ? (
          chapters.map((chapter) => (
            <Link
              key={chapter.number}
              href={`/comics/${id}/chapters/${chapter.number}`}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center">
                <span className="font-medium">Chapter {chapter.number}</span>
                {chapter.title && (
                  <span className="ml-2 text-muted-foreground">
                    - {chapter.title}
                  </span>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {formatRelativeTime(chapter.date)}
              </span>
            </Link>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No chapters available yet.
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Failed to load chapters. Please try again later.
        </p>
      </div>
    );
  }
}

// Make the ComicPage component async and use React.use() for params
export default function ComicPage({ params }: ComicPageProps) {
  // Unwrap params using React.use()
  const resolvedParams = React.use(Promise.resolve(params));
  const id = resolvedParams.id;

  // If ID is missing, show error
  if (!id) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <h2 className="text-xl font-bold text-red-500">
            Error: Invalid Comic ID
          </h2>
          <p className="text-muted-foreground mt-2">
            The comic ID is missing or invalid.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/comics">Browse Comics</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/comics"
          className="inline-flex items-center text-muted-foreground hover:text-green-400"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Comics
        </Link>
      </div>

      <Suspense fallback={<ComicDetailsSkeleton />}>
        <ComicDetails id={id} />
      </Suspense>

      <Separator className="my-8" />

      <div>
        <h2 className="text-2xl font-bold mb-6">Chapters</h2>
        <Suspense fallback={<ChaptersSkeleton />}>
          <Chapters id={id} />
        </Suspense>
      </div>
    </main>
  );
}
