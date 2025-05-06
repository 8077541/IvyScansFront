"use client";

import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { userService } from "@/lib/api";
import { formatDate } from "@/lib/date-utils";
import {
  BarChart,
  BookOpen,
  Calendar,
  Clock,
  TrendingUp,
  Award,
} from "lucide-react";
import type { ReadingHistoryItem } from "@/types";
import { ReadingGoals } from "@/components/reading-goals";

// Helper function to group history by date
function groupHistoryByDate(history: ReadingHistoryItem[]) {
  return history.reduce((acc, item) => {
    // Extract just the date part (without time)
    const date = new Date(item.readDate).toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as Record<string, ReadingHistoryItem[]>);
}

// Helper function to get day name
function getDayName(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export default function StatsPage() {
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalChaptersRead: 0,
    uniqueComics: 0,
    averageChaptersPerDay: 0,
    mostReadDay: { day: "", count: 0 },
    currentStreak: 0,
    longestStreak: 0,
    readingByDayOfWeek: [0, 0, 0, 0, 0, 0, 0], // Sun, Mon, Tue, Wed, Thu, Fri, Sat
    lastSevenDays: [0, 0, 0, 0, 0, 0, 0], // Last 7 days
  });

  // Fetch reading history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const data = await userService.getReadingHistory();
        setHistory(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching reading history:", err);
        setError("Failed to load reading history.");
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Calculate statistics
  useEffect(() => {
    if (history.length === 0) return;

    // Group history by date
    const historyByDate = groupHistoryByDate(history);
    const dates = Object.keys(historyByDate).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    // Get unique comics
    const uniqueComics = new Set(history.map((item) => item.comicId)).size;

    // Calculate total chapters read
    const totalChaptersRead = history.length;

    // Calculate average chapters per day
    const daysWithReading = Object.keys(historyByDate).length;
    const averageChaptersPerDay =
      daysWithReading > 0
        ? Number.parseFloat((totalChaptersRead / daysWithReading).toFixed(1))
        : 0;

    // Find most active day
    let mostReadDay = { day: "", count: 0 };
    for (const [date, items] of Object.entries(historyByDate)) {
      if (items.length > mostReadDay.count) {
        mostReadDay = { day: date, count: items.length };
      }
    }

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

    // Calculate reading by day of week
    const readingByDayOfWeek = [0, 0, 0, 0, 0, 0, 0]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat

    for (const date of Object.keys(historyByDate)) {
      const dayOfWeek = new Date(date).getDay(); // 0 = Sunday, 6 = Saturday
      readingByDayOfWeek[dayOfWeek] += historyByDate[date].length;
    }

    // Calculate last seven days
    const lastSevenDays = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      if (historyByDate[dateStr]) {
        lastSevenDays[i] = historyByDate[dateStr].length;
      }
    }

    setStats({
      totalChaptersRead,
      uniqueComics,
      averageChaptersPerDay,
      mostReadDay,
      currentStreak,
      longestStreak,
      readingByDayOfWeek,
      lastSevenDays,
    });
  }, [history]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Reading Statistics
          </h1>
          <p className="text-muted-foreground">
            Track your reading habits and progress.
          </p>
        </div>
        <Separator />
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-[150px] w-full" />
            <Skeleton className="h-[150px] w-full" />
            <Skeleton className="h-[150px] w-full" />
          </div>
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Reading Statistics
        </h1>
        <p className="text-muted-foreground">
          Track your reading habits and progress.
        </p>
      </div>
      <Separator />

      {error ? (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12">
          <BarChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No reading history yet</h3>
          <p className="text-muted-foreground">
            Start reading comics to see your statistics.
          </p>
        </div>
      ) : (
        <>
          <ReadingGoals />
          <div className="h-6"></div>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Reading Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg">
                      <BookOpen className="h-5 w-5 mr-2 text-green-400" />
                      Total Chapters Read
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-400">
                      {stats.totalChaptersRead}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Across {stats.uniqueComics} different comics
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg">
                      <Award className="h-5 w-5 mr-2 text-green-400" />
                      Reading Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-400">
                      {stats.currentStreak} days
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Longest streak: {stats.longestStreak} days
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                      Daily Average
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-400">
                      {stats.averageChaptersPerDay}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Chapters per reading day
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-green-400" />
                    Last 7 Days
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-end justify-between gap-2">
                    {stats.lastSevenDays.map((count, index) => {
                      const date = new Date();
                      date.setDate(date.getDate() - (6 - index));
                      const dayName = date.toLocaleDateString("en-US", {
                        weekday: "short",
                      });
                      const dateStr = date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });

                      // Calculate height percentage (max 90%)
                      const maxCount = Math.max(...stats.lastSevenDays);
                      const height = maxCount > 0 ? (count / maxCount) * 90 : 0;

                      return (
                        <div
                          key={index}
                          className="flex flex-col items-center flex-1"
                        >
                          <div className="w-full flex justify-center mb-2">
                            <div
                              className={`w-full max-w-[50px] bg-green-400 rounded-t-md ${
                                count > 0
                                  ? "min-h-[20px]"
                                  : "min-h-[4px] bg-muted"
                              }`}
                              style={{ height: `${height}%` }}
                            ></div>
                          </div>
                          <div className="text-xs font-medium">{dayName}</div>
                          <div className="text-xs text-muted-foreground">
                            {dateStr}
                          </div>
                          <div className="text-xs font-medium mt-1">
                            {count}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-green-400" />
                    Most Active Reading
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium mb-3">
                        Most Active Day
                      </h3>
                      {stats.mostReadDay.day ? (
                        <div className="bg-secondary p-4 rounded-lg">
                          <p className="text-lg font-bold">
                            {formatDate(stats.mostReadDay.day)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {stats.mostReadDay.count} chapters read
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No data available
                        </p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-3">
                        Reading by Day of Week
                      </h3>
                      <div className="space-y-2">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                          (day, index) => {
                            const count = stats.readingByDayOfWeek[index];
                            const maxCount = Math.max(
                              ...stats.readingByDayOfWeek
                            );
                            const width =
                              maxCount > 0 ? (count / maxCount) * 100 : 0;

                            return (
                              <div key={day} className="flex items-center">
                                <div className="w-10 text-xs">{day}</div>
                                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-green-400 rounded-full"
                                    style={{ width: `${width}%` }}
                                  ></div>
                                </div>
                                <div className="w-8 text-xs text-right">
                                  {count}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Reading Activity Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1">
                    {/* Calendar header - days of week */}
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <div
                          key={day}
                          className="text-xs text-center font-medium"
                        >
                          {day}
                        </div>
                      )
                    )}

                    {/* Generate calendar cells for the last 12 weeks */}
                    {(() => {
                      const cells = [];
                      const today = new Date();
                      const historyByDate = groupHistoryByDate(history);

                      // Start from 84 days ago (12 weeks)
                      for (let i = 83; i >= 0; i--) {
                        const date = new Date(today);
                        date.setDate(date.getDate() - i);
                        const dateStr = date.toISOString().split("T")[0];

                        // Calculate day of week to position correctly
                        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

                        // Get reading count for this day
                        const count = historyByDate[dateStr]?.length || 0;

                        // Determine color based on count
                        let bgColor = "bg-muted";
                        if (count > 0) {
                          if (count >= 10) bgColor = "bg-green-500";
                          else if (count >= 5) bgColor = "bg-green-400";
                          else if (count >= 3) bgColor = "bg-green-300/80";
                          else bgColor = "bg-green-200/60";
                        }

                        cells.push(
                          <div
                            key={dateStr}
                            className={`aspect-square rounded-sm ${bgColor} text-xs flex items-center justify-center`}
                            title={`${formatDate(dateStr)}: ${count} chapters`}
                          >
                            {count > 0 && (
                              <span className="text-[10px] font-medium text-white/90">
                                {count}
                              </span>
                            )}
                          </div>
                        );
                      }
                      return cells;
                    })()}
                  </div>

                  <div className="flex justify-end mt-4 gap-2 items-center">
                    <div className="text-xs text-muted-foreground">Less</div>
                    <div className="w-3 h-3 rounded-sm bg-muted"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-200/60"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-300/80"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-400"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                    <div className="text-xs text-muted-foreground">More</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reading Pace</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Monthly Reading
                      </h3>
                      <div className="h-[200px] flex items-end justify-between gap-2">
                        {(() => {
                          const monthlyData = [];
                          const now = new Date();
                          const historyByDate = groupHistoryByDate(history);

                          // Get data for the last 6 months
                          for (let i = 5; i >= 0; i--) {
                            const month = new Date(
                              now.getFullYear(),
                              now.getMonth() - i,
                              1
                            );
                            const monthName = month.toLocaleDateString(
                              "en-US",
                              { month: "short" }
                            );
                            const year = month.getFullYear();

                            // Count chapters read in this month
                            let count = 0;
                            for (const [date, items] of Object.entries(
                              historyByDate
                            )) {
                              const itemDate = new Date(date);
                              if (
                                itemDate.getMonth() === month.getMonth() &&
                                itemDate.getFullYear() === month.getFullYear()
                              ) {
                                count += items.length;
                              }
                            }

                            monthlyData.push({ month: monthName, year, count });
                          }

                          // Calculate max for scaling
                          const maxCount = Math.max(
                            ...monthlyData.map((d) => d.count)
                          );

                          return monthlyData.map((data, index) => {
                            const height =
                              maxCount > 0 ? (data.count / maxCount) * 90 : 0;

                            return (
                              <div
                                key={index}
                                className="flex flex-col items-center flex-1"
                              >
                                <div className="w-full flex justify-center mb-2">
                                  <div
                                    className={`w-full max-w-[60px] bg-green-400 rounded-t-md ${
                                      data.count > 0
                                        ? "min-h-[20px]"
                                        : "min-h-[4px] bg-muted"
                                    }`}
                                    style={{ height: `${height}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs font-medium">
                                  {data.month}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {data.year}
                                </div>
                                <div className="text-xs font-medium mt-1">
                                  {data.count}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Reading Consistency
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        You read on{" "}
                        {Object.keys(groupHistoryByDate(history)).length} days
                        in the last 3 months.
                      </p>

                      <div className="flex items-center gap-4">
                        <div className="w-16 text-right text-sm">
                          Current Streak
                        </div>
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-400 rounded-full"
                            style={{
                              width: `${
                                (stats.currentStreak /
                                  Math.max(stats.longestStreak, 7)) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <div className="w-16 text-sm">
                          {stats.currentStreak} days
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-2">
                        <div className="w-16 text-right text-sm">
                          Longest Streak
                        </div>
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-400 rounded-full"
                            style={{ width: "100%" }}
                          ></div>
                        </div>
                        <div className="w-16 text-sm">
                          {stats.longestStreak} days
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
