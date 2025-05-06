"use client";

import { useState, useEffect } from "react";
import { Star, StarHalf, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { userService } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/date-utils";

interface RatingControlProps {
  comicId: string;
  comicTitle: string;
}

export function RatingControl({ comicId, comicTitle }: RatingControlProps) {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [userComment, setUserComment] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempRating, setTempRating] = useState<number>(0);
  const [tempComment, setTempComment] = useState<string>("");
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [dateRated, setDateRated] = useState<string>("");
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch user's rating for this comic
  useEffect(() => {
    const fetchUserRating = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        console.log(`[RatingControl] Fetching rating for comic: ${comicId}`);
        const ratings = await userService.getRatings();

        // Log all ratings to help debug
        console.log(`[RatingControl] All user ratings:`, ratings);

        // Use both id and comicId for matching to be more robust
        const userRating = ratings.find(
          (rating) =>
            rating.id === comicId ||
            (rating.comicId && rating.comicId === comicId)
        );

        if (userRating) {
          console.log(
            `[RatingControl] Found rating for comic ${comicId}:`,
            userRating
          );
          setUserRating(userRating.rating);
          setUserComment(userRating.comment || "");
          setDateRated(userRating.dateRated || "");
        } else {
          console.log(`[RatingControl] No rating found for comic ${comicId}`);
        }
      } catch (error) {
        console.error("Error fetching user rating:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRating();
  }, [comicId, isAuthenticated]);

  const handleOpenDialog = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to rate comics",
        variant: "destructive",
      });
      return;
    }

    setTempRating(userRating || 0);
    setTempComment(userComment || "");
    setIsDialogOpen(true);
  };

  const handleSubmitRating = async () => {
    if (!isAuthenticated) return;

    setIsSubmitting(true);

    try {
      if (tempRating === 0) {
        // Delete rating if set to 0
        await userService.deleteRating(comicId);
        setUserRating(null);
        setUserComment("");
        setDateRated("");
        toast({
          title: "Rating Removed",
          description: "Your rating has been removed",
        });
      } else {
        // Add or update rating
        await userService.rateComic(comicId, tempRating, tempComment);
        setUserRating(tempRating);
        setUserComment(tempComment);
        setDateRated(new Date().toISOString());
        toast({
          title: "Rating Saved",
          description: "Your rating has been saved",
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Error",
        description: "Failed to save rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number | null) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rating && star <= Math.floor(rating);
          const halfFilled =
            rating && star === Math.ceil(rating) && rating % 1 !== 0;

          if (filled) {
            return (
              <Star
                key={star}
                className="h-5 w-5 fill-yellow-400 text-yellow-400"
              />
            );
          } else if (halfFilled) {
            return (
              <StarHalf
                key={star}
                className="h-5 w-5 fill-yellow-400 text-yellow-400"
              />
            );
          } else {
            return (
              <Star key={star} className="h-5 w-5 text-muted-foreground" />
            );
          }
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading rating...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {userRating ? (
            <>
              {renderStars(userRating)}
              <span className="font-medium">{userRating.toFixed(1)}</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">Not rated yet</span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleOpenDialog}>
          {userRating ? "Edit Rating" : "Rate This Comic"}
        </Button>
      </div>

      {userRating && (
        <Card className="mt-2 bg-secondary/50 border-secondary">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Your Rating</h4>
              {dateRated && (
                <span className="text-xs text-muted-foreground">
                  Rated on: {formatDate(dateRated)}
                </span>
              )}
            </div>
            {userComment ? (
              <p className="text-sm">{userComment}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No comment provided. Click "Edit Rating" to add a comment.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate {comicTitle}</DialogTitle>
            <DialogDescription>
              Share your rating and comment for this comic
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
                      (
                        hoverRating !== null
                          ? star <= hoverRating
                          : star <= tempRating
                      )
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                    onClick={() => setTempRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                  />
                ))}
                <span className="ml-2 text-sm">
                  {tempRating.toFixed(1)}/5.0
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Your Comment (Optional)
              </label>
              <Textarea
                value={tempComment}
                onChange={(e) => setTempComment(e.target.value)}
                placeholder="Share your thoughts about this comic..."
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-green-400 hover:bg-green-500"
              onClick={handleSubmitRating}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Rating"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
