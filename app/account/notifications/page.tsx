"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/contexts/notification-context";
import { formatDateTime } from "@/lib/date-utils";

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotifications();

  // Refresh notifications when page loads
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark notification as read when clicked
  const handleNotificationClick = async (id: string) => {
    await markAsRead(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest activity.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            className="bg-green-400 hover:bg-green-500"
          >
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>
      <Separator />

      {loading ? (
        <div className="space-y-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No notifications yet</h3>
          <p className="text-muted-foreground mb-4">
            You'll receive notifications about new chapters, updates, and more.
          </p>
          <Button
            asChild
            className="bg-green-400 hover:bg-green-500 glow-green"
          >
            <Link href="/comics">Browse Comics</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-colors ${
                !notification.read ? "border-green-500/50 bg-green-500/5" : ""
              }`}
              onClick={() => handleNotificationClick(notification.id)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`font-medium ${
                          !notification.read ? "text-green-500" : ""
                        }`}
                      >
                        {notification.type === "NEW_CHAPTER"
                          ? "New Chapter Available"
                          : "System Message"}
                      </h3>
                      {!notification.read && (
                        <Badge className="bg-green-500 text-white">New</Badge>
                      )}
                    </div>
                    <p className="text-sm mb-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(notification.createdAt)}
                    </p>
                  </div>
                  <div>
                    {notification.type === "NEW_CHAPTER" &&
                      notification.data && (
                        <Button
                          asChild
                          size="sm"
                          className="bg-green-400 hover:bg-green-500"
                        >
                          <Link
                            href={`/comics/${notification.data.comicId}/chapters/${notification.data.chapterNumber}`}
                          >
                            Read Now
                          </Link>
                        </Button>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
