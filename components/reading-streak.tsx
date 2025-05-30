"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { userService } from "@/lib/api";
import { Flame } from "lucide-react";
import type { ReadingHistoryItem } from "@/types";

// Helper function to group history by date with improved error handling
function groupHistoryByDate(history: ReadingHistoryItem[]) {
  return history.reduce((acc, item) => {
    try {
      // Safely parse the date
      const date = new Date(item.readDate);

      // Check if date is valid before using toISOString
      if (isNaN(date.getTime())) {
        console.warn("Invalid date found:", item.readDate);
        return acc;
      }

      // Extract just the date part (without time)
      const dateStr = date.toISOString().split("T")[0];

      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(item);
    } catch (error) {
      console.error("Error processing date:", item.readDate, error);
    }
    return acc;
  }, {} as Record<string, ReadingHistoryItem[]>);
}

export function ReadingStreak() {
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [streak, setStreak] = useState({
    current: 0,
    longest: 0,
    hasReadToday: false,
  });

  // Fetch reading history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const data = await userService.getReadingHistory();
        setHistory(data);
      } catch (err) {
        console.error("Error fetching reading history:", err);
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Calculate streak
  useEffect(() => {
    if (history.length === 0) return;

    try {
      // Group history by date
      const historyByDate = groupHistoryByDate(history);

      // Calculate reading streak
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      // Get today's date without time
      const today = new Date().toISOString().split("T")[0];

      // Check if user read today
      const hasReadToday = historyByDate[today] !== undefined;

      // Sort dates in descending order (newest first)
      const sortedDates = Object.keys(historyByDate).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
      );

      if (sortedDates.length > 0) {
        // If user has read today, start counting from today
        // Otherwise, start from the most recent day they read
        const currentDate = hasReadToday
          ? new Date(today)
          : new Date(sortedDates[0]);

        // Convert to date string format for comparison
        let currentDateStr = currentDate.toISOString().split("T")[0];

        // If user read on the current date, start streak at 1
        if (historyByDate[currentDateStr]) {
          tempStreak = 1;

          // Check previous days
          while (true) {
            // Move to previous day
            currentDate.setDate(currentDate.getDate() - 1);
            currentDateStr = currentDate.toISOString().split("T")[0];

            // If user read on this day, increment streak
            if (historyByDate[currentDateStr]) {
              tempStreak++;
            } else {
              break;
            }
          }
        }

        currentStreak = tempStreak;
        longestStreak = currentStreak;

        // Check for longer streaks in history
        for (let i = 1; i < sortedDates.length; i++) {
          const currentDate = new Date(sortedDates[i]);
          const prevDate = new Date(sortedDates[i - 1]);

          // Check if dates are consecutive
          const diffTime = Math.abs(prevDate.getTime() - currentDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            tempStreak++;
          } else {
            tempStreak = 1;
          }

          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
        }
      }

      setStreak({
        current: currentStreak,
        longest: longestStreak,
        hasReadToday,
      });
    } catch (error) {
      console.error("Error calculating streak:", error);
      // Set default values in case of error
      setStreak({
        current: 0,
        longest: 0,
        hasReadToday: false,
      });
    }
  }, [history]);

  if (isLoading) {
    return <Skeleton className="h-[100px] w-full" />;
  }

  // Don't show anything if no reading history
  if (history.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Flame
              className={`h-6 w-6 mr-2 ${
                streak.hasReadToday
                  ? "text-orange-500"
                  : "text-muted-foreground"
              }`}
            />
            <div>
              <h3 className="font-medium">Reading Streak</h3>
              <p className="text-sm text-muted-foreground">
                {streak.hasReadToday
                  ? "You've read today! Keep it up!"
                  : "Read today to maintain your streak!"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {streak.current}
              </div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold">{streak.longest}</div>
              <div className="text-xs text-muted-foreground">Best</div>
            </div>
          </div>
        </div>

        {/* Streak visualization */}
        <div className="mt-3 flex gap-1">
          {Array.from({ length: 7 }).map((_, i) => {
            const isActive = i < streak.current;
            return (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  isActive ? "bg-green-400" : "bg-muted"
                }`}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
