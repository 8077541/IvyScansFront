"use client";

import { useState, useEffect } from "react";
import { ComicCard } from "@/components/comic-card";
import { SortingControls } from "@/components/sorting-controls";
import { FilterControls } from "@/components/filter-controls";
import { Pagination } from "@/components/pagination";
import { comicService } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { Comic } from "@/types";

export default function ComicsPage() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and sort state
  const [sortOption, setSortOption] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [genres, setGenres] = useState<string[]>([]);

  const itemsPerPage = 18;

  // Fetch comics based on filters
  useEffect(() => {
    const fetchComics = async () => {
      setIsLoading(true);
      try {
        const { comics, totalPages } = await comicService.getAllComics({
          page: currentPage,
          limit: itemsPerPage,
          sort: sortOption,
          genres: selectedGenres,
          status: statusFilter !== "all" ? statusFilter : undefined,
        });

        // Validate comics data
        if (!comics || !Array.isArray(comics)) {
          console.error("Invalid comics data received:", comics);
          setError("Received invalid data from the server. Please try again.");
          setComics([]);
          setTotalPages(1);
        } else {
          // Filter out any comics with missing IDs
          const validComics = comics.filter((comic) => comic && comic.id);

          // Additional client-side filtering to ensure genre filtering works correctly
          let filteredComics =
            selectedGenres.length > 0
              ? validComics.filter((comic) =>
                  selectedGenres.every((genre) => comic.genres.includes(genre))
                )
              : validComics;

          // Apply client-side sorting to ensure it works correctly
          filteredComics = [...filteredComics].sort((a, b) => {
            switch (sortOption) {
              case "a-z":
                return a.title.localeCompare(b.title);
              case "z-a":
                return b.title.localeCompare(a.title);
              case "latest":
              default:
                return a.updatedAt.includes("hour")
                  ? -1
                  : b.updatedAt.includes("hour")
                  ? 1
                  : 0;
            }
          });

          if (validComics.length < comics.length) {
            console.warn(
              `Filtered out ${
                comics.length - validComics.length
              } comics with missing IDs`
            );
          }

          setComics(filteredComics);
          setTotalPages(totalPages);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching comics:", err);
        setError("Failed to load comics. Please try again later.");
        setComics([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComics();
  }, [currentPage, sortOption, selectedGenres, statusFilter]);

  // Fetch available genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genreList = await comicService.getGenres();
        if (Array.isArray(genreList)) {
          setGenres(genreList);
        } else {
          console.error("Invalid genres data received:", genreList);
          setGenres([]);
        }
      } catch (err) {
        console.error("Error fetching genres:", err);
        setGenres([]);
      }
    };

    fetchGenres();
  }, []);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Comics</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-64">
          <FilterControls
            selectedGenres={selectedGenres}
            setSelectedGenres={setSelectedGenres}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            allGenres={genres}
          />
        </div>

        <div className="flex-1">
          <SortingControls
            sortOption={sortOption}
            setSortOption={setSortOption}
          />

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-6">
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
          ) : comics.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-6">
              {comics.map((comic) => (
                <ComicCard key={comic.id} comic={comic} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No comics found matching your filters.
              </p>
            </div>
          )}

          {totalPages > 1 && !isLoading && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
