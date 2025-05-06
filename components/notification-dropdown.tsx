"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/contexts/notification-context";
import { formatDateTime } from "@/lib/date-utils";

export function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  // Refresh notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Mark notification as read when clicked
  const handleNotificationClick = async (id: string) => {
    await markAsRead(id);
  };

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-green-400 animate-pulse">
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4">
          <p className="font-medium">Notifications</p>
          {unreadCount > 0 && (
            <Badge
              variant="outline"
              className="bg-green-500/10 text-green-500 border-green-500/50"
            >
              {unreadCount} New
            </Badge>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
            </div>
          ) : error ? (
            <div className="p-4 text-center text-sm text-red-500">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer ${
                  !notification.read ? "bg-green-500/5" : ""
                }`}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="w-full">
                  <div className="flex justify-between items-start mb-1">
                    <p
                      className={`text-sm font-medium ${
                        !notification.read ? "text-green-500" : ""
                      }`}
                    >
                      {notification.type === "NEW_CHAPTER"
                        ? "New Chapter"
                        : "System Message"}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm">{notification.message}</p>
                  {notification.type === "NEW_CHAPTER" && notification.data && (
                    <Link
                      href={`/comics/${notification.data.comicId}/chapters/${notification.data.chapterNumber}`}
                      className="text-xs text-green-400 hover:underline mt-1 block"
                    >
                      Read now
                    </Link>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="p-2 flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark all as read
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/account/notifications">View All</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
