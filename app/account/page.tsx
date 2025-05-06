"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockUser } from "@/lib/mock-data";
import { Clock, BookOpen, BookMarked, History, Star } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { userService } from "@/lib/api";
import { formatDate, formatRelativeTime } from "@/lib/date-utils";
import { ReadingStreak } from "@/components/reading-streak";
import type { ReadingHistoryItem } from "@/types";

export default function AccountPage() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [user, setUser] = useState(authUser || mockUser);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recentHistory, setRecentHistory] = useState<ReadingHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      setUsername(authUser.username);
      setEmail(authUser.email);
    } else if (!authLoading) {
      // If auth is done loading and we don't have a user, use mock data
      setUser(mockUser);
      setUsername(mockUser.username);
      setEmail(mockUser.email);
    }
  }, [authUser, authLoading]);

  // Fetch recent reading history
  useEffect(() => {
    const fetchRecentHistory = async () => {
      setHistoryLoading(true);
      try {
        const history = await userService.getReadingHistory();
        // Get the 5 most recent items
        setRecentHistory(history.slice(0, 5));
      } catch (error) {
        console.error("Error fetching reading history:", error);
      } finally {
        setHistoryLoading(false);
      }
    };

    if (authUser || !authLoading) {
      fetchRecentHistory();
    }
  }, [authUser, authLoading]);

  const handleSaveChanges = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setUser({
        ...user,
        username,
        email,
      });
      setIsSaving(false);
    }, 1000);
  };

  if (authLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and profile information.
          </p>
        </div>
        <Separator />
        <div className="grid gap-6">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and profile information.
        </p>
      </div>
      <Separator />

      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your profile details and public information.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <Avatar className="w-20 h-20 border">
                <AvatarImage
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.username}
                />
                <AvatarFallback className="text-lg">
                  {user.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button className="bg-green-400 hover:bg-green-500 mb-2 glow-green">
                  Change Avatar
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPG, GIF or PNG. Max size of 2MB.
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Member Since</Label>
                <Input value={formatDate(user.joinDate)} disabled />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="bg-green-400 hover:bg-green-500 glow-green"
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="flex items-center">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Reading Streak Card */}
        <ReadingStreak />

        <Card>
          <CardHeader>
            <CardTitle>Reading Statistics</CardTitle>
            <CardDescription>
              Your reading activity and progress.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-secondary p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-green-400">
                  {user.readingStats.totalRead}
                </p>
                <p className="text-sm text-muted-foreground">Comics Read</p>
              </div>
              <div className="bg-secondary p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-green-400">
                  {user.readingStats.currentlyReading}
                </p>
                <p className="text-sm text-muted-foreground">
                  Currently Reading
                </p>
              </div>
              <div className="bg-secondary p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-green-400">
                  {user.readingStats.completedSeries}
                </p>
                <p className="text-sm text-muted-foreground">
                  Completed Series
                </p>
              </div>
              <div className="bg-secondary p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-green-400">
                  {user.readingStats.totalChaptersRead}
                </p>
                <p className="text-sm text-muted-foreground">Chapters Read</p>
              </div>
            </div>
          </CardContent>
          {/* No footer needed */}
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Reading Activity</CardTitle>
              <CardDescription>Your recently read chapters.</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/account/history">
                <History className="h-4 w-4 mr-2" />
                View All
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="space-y-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Skeleton className="h-12 w-12 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-8 w-32" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : recentHistory.length > 0 ? (
              <div className="space-y-4">
                {recentHistory.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="rounded-md overflow-hidden w-12 h-12 flex-shrink-0 bg-muted">
                      <img
                        src={item.comicCover || "/placeholder.svg"}
                        alt={item.comicTitle}
                        className="w-full h-full object-cover"
                        width={48}
                        height={48}
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{item.comicTitle}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatRelativeTime(item.readDate)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Chapter {item.chapterNumber}
                        {item.chapterTitle && `: ${item.chapterTitle}`}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          asChild
                        >
                          <Link href={`/comics/${item.comicId}`}>
                            <BookOpen className="h-3 w-3 mr-1" />
                            Comic Page
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-green-400 hover:bg-green-500"
                          asChild
                        >
                          <Link
                            href={`/comics/${item.comicId}/chapters/${
                              item.chapterNumber + 1
                            }`}
                          >
                            Continue Reading
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No reading history yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start reading comics to track your progress.
                </p>
                <Button asChild className="bg-green-400 hover:bg-green-500">
                  <Link href="/comics">Browse Comics</Link>
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-6">
            <div className="flex items-center justify-between w-full">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/account/bookmarks">
                    <BookMarked className="h-4 w-4 mr-2" />
                    Bookmarks
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/account/history">
                    <History className="h-4 w-4 mr-2" />
                    Reading History
                  </Link>
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Ratings</CardTitle>
              <CardDescription>Your recently rated comics.</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/account/ratings">
                <Star className="h-4 w-4 mr-2" />
                View All
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Skeleton className="h-12 w-12 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    View your ratings
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Rate comics to help other readers find great content.
                  </p>
                  <Button asChild className="bg-green-400 hover:bg-green-500">
                    <Link href="/account/ratings">View Ratings</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
