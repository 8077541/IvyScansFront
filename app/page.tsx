import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ComicCard } from "@/components/comic-card";
import { comicService } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Loading component for featured comics
function FeaturedComicsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-[240px] w-full rounded-md" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
    </div>
  );
}

// Loading component for latest updates
function LatestUpdatesSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-[240px] w-full rounded-md" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
    </div>
  );
}

// Featured comics component
async function FeaturedComics() {
  try {
    // This would fetch from your API in production
    const featuredComics = await comicService.getFeaturedComics();

    // Validate comics data
    if (!featuredComics || !Array.isArray(featuredComics)) {
      console.error("Invalid featured comics data received:", featuredComics);
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load featured comics. Please try again later.
          </AlertDescription>
        </Alert>
      );
    }

    // Filter out any comics with missing IDs
    const validComics = featuredComics.filter((comic) => comic && comic.id);
    if (validComics.length < featuredComics.length) {
      console.warn(
        `Filtered out ${
          featuredComics.length - validComics.length
        } featured comics with missing IDs`
      );
    }

    if (validComics.length === 0) {
      return (
        <div className="text-center py-6">
          <p className="text-muted-foreground">
            No featured comics available at the moment.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {validComics.map((comic) => (
          <ComicCard key={comic.id} comic={comic} />
        ))}
      </div>
    );
  } catch (error) {
    console.error("Error fetching featured comics:", error);
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load featured comics. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }
}

// Latest updates component
async function LatestUpdates() {
  try {
    // This would fetch from your API in production
    const { comics: latestUpdates } = await comicService.getLatestComics(1, 6);

    // Validate comics data
    if (!latestUpdates || !Array.isArray(latestUpdates)) {
      console.error("Invalid latest comics data received:", latestUpdates);
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load latest comics. Please try again later.
          </AlertDescription>
        </Alert>
      );
    }

    // Filter out any comics with missing IDs
    const validComics = latestUpdates.filter((comic) => comic && comic.id);
    if (validComics.length < latestUpdates.length) {
      console.warn(
        `Filtered out ${
          latestUpdates.length - validComics.length
        } latest comics with missing IDs`
      );
    }

    if (validComics.length === 0) {
      return (
        <div className="text-center py-6">
          <p className="text-muted-foreground">
            No latest updates available at the moment.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {validComics.map((comic) => (
          <ComicCard key={comic.id} comic={comic} />
        ))}
      </div>
    );
  } catch (error) {
    console.error("Error fetching latest updates:", error);
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load latest updates. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }
}

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Comics</h2>
          <Link
            href="/comics"
            className="text-green-400 hover:text-green-300 flex items-center"
          >
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <Suspense fallback={<FeaturedComicsSkeleton />}>
          <FeaturedComics />
        </Suspense>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Latest Updates</h2>
          <Link
            href="/latest"
            className="text-green-400 hover:text-green-300 flex items-center"
          >
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <Suspense fallback={<LatestUpdatesSkeleton />}>
          <LatestUpdates />
        </Suspense>
      </section>
    </main>
  );
}
