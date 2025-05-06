"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { comicService } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function GenresPage() {
  const [genres, setGenres] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genreList = await comicService.getGenres();
        setGenres(genreList);
        setError(null);
      } catch (err) {
        console.error("Error fetching genres:", err);
        setError("Failed to load genres. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenres();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Browse by Genre</h1>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array(15)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {genres.map((genre) => (
            <Link key={genre} href={`/genres/${genre.toLowerCase()}`}>
              <Card className="h-24 hover:border-green-500/50 transition-colors">
                <CardContent className="flex items-center justify-center h-full">
                  <h2 className="text-lg font-medium text-center">{genre}</h2>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
