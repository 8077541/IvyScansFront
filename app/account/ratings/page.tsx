"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  StarHalf,
  ExternalLink,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { mockRatings } from "@/lib/mock-data";
import { userService, comicService } from "@/lib/api";
import type { RatedComic } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
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

// Helper function to format dates
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString; // Return original string if parsing fails
  }
}

export default function RatingsPage() {
  const [ratings, setRatings] = useState<RatedComic[]>([]);
  const [selectedRating, setSelectedRating] = useState<RatedComic | null>(null);
  const [editRating, setEditRating] = useState<number>(0);
  const [editComment, setEditComment] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setIsLoading(true);
        // Get user ratings
        const ratingData = await userService.getRatings();

        // Process ratings and fetch comic details for each
        const processedRatings = await Promise.all(
          ratingData.map(async (rating: any) => {
            try {
              // Extract comic ID from the rating
              const comicId = rating.id || rating.comicId;

              if (!comicId) {
                console.error("Missing comic ID in rating:", rating);
                return null;
              }

              // Fetch comic details
              const comicDetails = await comicService.getComicById(comicId);

              // Combine rating data with comic details
              return {
                ...comicDetails,
                id: comicId,
                rating: rating.rating || 0,
                comment: rating.comment || rating.review || "", // Support both comment and review fields
                dateRated:
                  rating.dateRated ||
                  rating.ratedAt ||
                  new Date().toISOString(),
              };
            } catch (err) {
              console.error(
                `Error fetching details for comic ID ${
                  rating.id || rating.comicId
                }:`,
                err
              );
              return null;
            }
          })
        );

        // Filter out any null values from failed fetches
        const validRatings = processedRatings.filter(
          (rating) => rating !== null
        ) as RatedComic[];

        setRatings(validRatings);
        setError(null);
      } catch (err) {
        console.error("Error fetching ratings:", err);
        setError("Failed to load ratings. Using mock data instead.");
        setRatings(mockRatings);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRatings();
  }, []);

  const handleEditRating = (comic: RatedComic) => {
    setSelectedRating(comic);
    setEditRating(comic.rating);
    setEditComment(comic.comment || "");
    setIsDialogOpen(true);
  };

  const handleSaveRating = async () => {
    if (!selectedRating) return;

    try {
      await userService.rateComic(selectedRating.id, editRating, editComment);

      const updatedRatings = ratings.map((rating) =>
        rating.id === selectedRating.id
          ? {
              ...rating,
              rating: editRating,
              comment: editComment,
              dateRated: new Date().toISOString(),
            }
          : rating
      );

      setRatings(updatedRatings);
      setIsDialogOpen(false);

      toast({
        title: "Rating Updated",
        description: "Your rating has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating rating:", error);
      toast({
        title: "Error",
        description: "Failed to update rating. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRating = async (id: string) => {
    try {
      await userService.deleteRating(id);
      setRatings(ratings.filter((rating) => rating.id !== id));
      toast({
        title: "Rating Deleted",
        description: "Your rating has been deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting rating:", error);
      toast({
        title: "Error",
        description: "Failed to delete rating. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Ratings</h1>
          <p className="text-muted-foreground">
            View and manage your comic ratings and comments.
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Ratings</h1>
        <p className="text-muted-foreground">
          View and manage your comic ratings and comments.
        </p>
      </div>
      <Separator />

      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {ratings.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {ratings.map((comic) => (
            <RatingCard
              key={comic.id}
              comic={comic}
              onEdit={handleEditRating}
              onDelete={handleDeleteRating}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No ratings yet</h3>
          <p className="text-muted-foreground mb-4">
            Rate and comment on comics to help other readers find great content.
          </p>
          <Button
            asChild
            className="bg-green-400 hover:bg-green-500 glow-green"
          >
            <Link href="/comics">Browse Comics</Link>
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Rating & Comment</DialogTitle>
            <DialogDescription>
              Update your rating and comment for {selectedRating?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 cursor-pointer ${
                      star <= editRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                    onClick={() => setEditRating(star)}
                  />
                ))}
                <span className="ml-2 text-sm">
                  {editRating.toFixed(1)}/5.0
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Your Comment (Optional)
              </label>
              <Textarea
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                placeholder="Share your thoughts about this comic..."
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-400 hover:bg-green-500"
              onClick={handleSaveRating}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RatingCard({
  comic,
  onEdit,
  onDelete,
}: {
  comic: RatedComic;
  onEdit: (comic: RatedComic) => void;
  onDelete: (id: string) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(comic.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-green-500/10 hover:border-green-500/50">
      <div className="flex flex-col md:flex-row">
        <div className="relative w-full md:w-1/4 aspect-[3/4] md:aspect-auto">
          <Image
            src={comic.cover || "/placeholder.svg"}
            alt={comic.title || "Comic"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        </div>
        <div className="flex flex-col flex-1">
          <CardContent className="p-4 flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
              <h3 className="font-semibold text-lg">
                {comic.title || "Unknown Comic"}
              </h3>
              <div className="flex items-center">
                <RatingStars rating={comic.rating} />
                <span className="ml-2 font-medium">
                  {comic.rating.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {comic.genres && comic.genres.length > 0 ? (
                comic.genres.map((genre, index) => (
                  <Badge
                    key={`${genre}-${index}`}
                    variant="secondary"
                    className="text-xs"
                  >
                    {genre}
                  </Badge>
                ))
              ) : (
                <Badge variant="secondary" className="text-xs">
                  No genres
                </Badge>
              )}
            </div>

            <div className="text-sm text-muted-foreground mb-3">
              <p>Status: {comic.status || "Unknown"}</p>
              <p>Latest: {comic.latestChapter || "Unknown"}</p>
              <p>Rated on: {formatDate(comic.dateRated)}</p>
            </div>

            {comic.comment && (
              <div className="mt-2">
                <h4 className="font-medium text-sm mb-1">Your Comment:</h4>
                <p className="text-sm bg-secondary p-3 rounded-md">
                  {comic.comment}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(comic)}>
                <Edit className="h-4 w-4 mr-1 text-green-400" />
                Edit Rating
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-1" />
                    )}
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Rating</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete your rating for "
                      {comic.title || "this comic"}"? This action cannot be
                      undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 hover:bg-red-600"
                      onClick={handleDelete}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <Button
              asChild
              size="sm"
              className="bg-green-400 hover:bg-green-500"
            >
              <Link href={`/comics/${comic.id}`}>
                <ExternalLink className="h-4 w-4 mr-1" />
                View Comic
              </Link>
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}

function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex">
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className="h-4 w-4 fill-yellow-400 text-yellow-400"
        />
      ))}
      {hasHalfStar && (
        <StarHalf
          key="half"
          className="h-4 w-4 fill-yellow-400 text-yellow-400"
        />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />
      ))}
    </div>
  );
}
