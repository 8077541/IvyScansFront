"use client";

import { Calendar } from "@/components/ui/calendar";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Trophy, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { userService } from "@/lib/api";
import type { ReadingHistoryItem } from "@/types";

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

// Mock goals - in a real app, these would be stored in the database
const mockGoals = {
  daily: {
    target: 3,
    type: "daily",
    current: 0,
    enabled: true,
  },
  weekly: {
    target: 15,
    type: "weekly",
    current: 0,
    enabled: true,
  },
  monthly: {
    target: 50,
    type: "monthly",
    current: 0,
    enabled: false,
  },
};

export function ReadingGoals() {
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [goals, setGoals] = useState(mockGoals);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");
  const [newTarget, setNewTarget] = useState(0);
  const [newEnabled, setNewEnabled] = useState(true);

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

  // Calculate current progress for goals
  useEffect(() => {
    if (history.length === 0) return;

    const historyByDate = groupHistoryByDate(history);
    const today = new Date();

    // Calculate daily goal progress
    const todayStr = today.toISOString().split("T")[0];
    const chaptersReadToday = historyByDate[todayStr]?.length || 0;

    // Calculate weekly goal progress
    let chaptersReadThisWeek = 0;
    // Get start of week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get chapters read this week
    for (const [date, items] of Object.entries(historyByDate)) {
      const itemDate = new Date(date);
      if (itemDate >= startOfWeek) {
        chaptersReadThisWeek += items.length;
      }
    }

    // Calculate monthly goal progress
    let chaptersReadThisMonth = 0;
    // Get start of month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get chapters read this month
    for (const [date, items] of Object.entries(historyByDate)) {
      const itemDate = new Date(date);
      if (itemDate >= startOfMonth) {
        chaptersReadThisMonth += items.length;
      }
    }

    // Update goals with current progress
    setGoals((prev) => ({
      ...prev,
      daily: {
        ...prev.daily,
        current: chaptersReadToday,
      },
      weekly: {
        ...prev.weekly,
        current: chaptersReadThisWeek,
      },
      monthly: {
        ...prev.monthly,
        current: chaptersReadThisMonth,
      },
    }));
  }, [history]);

  const handleEditGoal = (type: "daily" | "weekly" | "monthly") => {
    setEditingGoal(type);
    setNewTarget(goals[type].target);
    setNewEnabled(goals[type].enabled);
    setIsDialogOpen(true);
  };

  const handleSaveGoal = () => {
    setGoals((prev) => ({
      ...prev,
      [editingGoal]: {
        ...prev[editingGoal],
        target: newTarget,
        enabled: newEnabled,
      },
    }));
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return <Skeleton className="h-[200px] w-full" />;
  }

  // Don't show anything if no reading history
  if (history.length === 0) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-green-400" />
            Reading Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Daily Goal */}
          {goals.daily.enabled && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Trophy
                    className={`h-4 w-4 mr-2 ${
                      goals.daily.current >= goals.daily.target
                        ? "text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                  <h3 className="text-sm font-medium">Daily Goal</h3>
                </div>
                <div className="text-sm">
                  <span
                    className={
                      goals.daily.current >= goals.daily.target
                        ? "text-green-400 font-medium"
                        : ""
                    }
                  >
                    {goals.daily.current}
                  </span>{" "}
                  / {goals.daily.target} chapters
                </div>
              </div>
              <Progress
                value={(goals.daily.current / goals.daily.target) * 100}
                className="h-2"
                indicatorClassName={
                  goals.daily.current >= goals.daily.target
                    ? "bg-green-400"
                    : ""
                }
              />
              <p className="text-xs text-muted-foreground">
                {goals.daily.current >= goals.daily.target
                  ? "Goal completed! Great job!"
                  : `${
                      goals.daily.target - goals.daily.current
                    } more chapters to reach your daily goal`}
              </p>
            </div>
          )}

          {/* Weekly Goal */}
          {goals.weekly.enabled && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <TrendingUp
                    className={`h-4 w-4 mr-2 ${
                      goals.weekly.current >= goals.weekly.target
                        ? "text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                  <h3 className="text-sm font-medium">Weekly Goal</h3>
                </div>
                <div className="text-sm">
                  <span
                    className={
                      goals.weekly.current >= goals.weekly.target
                        ? "text-green-400 font-medium"
                        : ""
                    }
                  >
                    {goals.weekly.current}
                  </span>{" "}
                  / {goals.weekly.target} chapters
                </div>
              </div>
              <Progress
                value={(goals.weekly.current / goals.weekly.target) * 100}
                className="h-2"
                indicatorClassName={
                  goals.weekly.current >= goals.weekly.target
                    ? "bg-green-400"
                    : ""
                }
              />
              <p className="text-xs text-muted-foreground">
                {goals.weekly.current >= goals.weekly.target
                  ? "Weekly goal achieved!"
                  : `${
                      goals.weekly.target - goals.weekly.current
                    } more chapters this week`}
              </p>
            </div>
          )}

          {/* Monthly Goal */}
          {goals.monthly.enabled && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Calendar
                    className={`h-4 w-4 mr-2 ${
                      goals.monthly.current >= goals.monthly.target
                        ? "text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                  <h3 className="text-sm font-medium">Monthly Goal</h3>
                </div>
                <div className="text-sm">
                  <span
                    className={
                      goals.monthly.current >= goals.monthly.target
                        ? "text-green-400 font-medium"
                        : ""
                    }
                  >
                    {goals.monthly.current}
                  </span>{" "}
                  / {goals.monthly.target} chapters
                </div>
              </div>
              <Progress
                value={(goals.monthly.current / goals.monthly.target) * 100}
                className="h-2"
                indicatorClassName={
                  goals.monthly.current >= goals.monthly.target
                    ? "bg-green-400"
                    : ""
                }
              />
              <p className="text-xs text-muted-foreground">
                {goals.monthly.current >= goals.monthly.target
                  ? "Monthly goal achieved!"
                  : `${
                      goals.monthly.target - goals.monthly.current
                    } more chapters this month`}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditGoal("daily")}
          >
            Edit Daily Goal
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditGoal("weekly")}
          >
            Edit Weekly Goal
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditGoal("monthly")}
          >
            Edit Monthly Goal
          </Button>
        </CardFooter>
      </Card>

      {/* Edit Goal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit {editingGoal.charAt(0).toUpperCase() + editingGoal.slice(1)}{" "}
              Reading Goal
            </DialogTitle>
            <DialogDescription>
              Set your target number of chapters to read {editingGoal}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="target">Target Chapters</Label>
              <Input
                id="target"
                type="number"
                min="1"
                value={newTarget}
                onChange={(e) =>
                  setNewTarget(Number.parseInt(e.target.value) || 1)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Goal Status</Label>
              <RadioGroup
                value={newEnabled ? "enabled" : "disabled"}
                onValueChange={(v) => setNewEnabled(v === "enabled")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="enabled" id="enabled" />
                  <Label htmlFor="enabled">Enabled</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="disabled" id="disabled" />
                  <Label htmlFor="disabled">Disabled</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveGoal}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
