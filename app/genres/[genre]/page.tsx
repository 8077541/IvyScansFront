"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ComicCard } from "@/components/comic-card";
import { SortingControls } from "@/components/sorting-controls";
import { Pagination } from "@/components/pagination";
import { comicService } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import type { Comic } from "@/types";

interface GenrePageProps {
  params: {
    genre: string;
  };
}

export default function GenrePage({ params }: GenrePageProps) {
  const [comics, setComics] = useState<Comic[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);

  const genre = decodeURIComponent(params.genre);
  const formattedGenre = genre.charAt(0).toUpperCase() + genre.slice(1);
  const itemsPerPage = 18;

  useEffect(() => {
    const fetchComics = async () => {
      setIsLoading(true);
      try {
        const { comics, totalPages } = await comicService.getAllComics({
          page: currentPage,
          limit: itemsPerPage,
          sort: sortOption,
          genres: [formattedGenre],
        });

        setComics(comics);
        setTotalPages(totalPages);
        setError(null);
      } catch (err) {
        console.error("Error fetching comics:", err);
        setError("Failed to load comics. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComics();
  }, [currentPage, sortOption, formattedGenre]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/genres"
          className="inline-flex items-center text-muted-foreground hover:text-green-400"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Genres
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">{formattedGenre} Comics</h1>

      <SortingControls sortOption={sortOption} setSortOption={setSortOption} />

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mt-6">
          {Array(itemsPerPage)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-[240px] w-full rounded-md" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      ) : comics.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mt-6">
          {comics.map((comic) => (
            <ComicCard key={comic.id} comic={comic} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No comics found in this genre.
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </main>
  );
}
