"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/auth-context";
import { API_BASE_URL, USE_MOCK_API } from "@/lib/config";

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  data?: any;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// Mock notifications for development
const mockNotifications: Notification[] = [
  {
    id: "1",
    userId: "user-1",
    type: "NEW_CHAPTER",
    message: "New chapter released for The Dragon King's Daughter",
    read: false,
    data: { comicId: "1", chapterNumber: 46 },
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    userId: "user-1",
    type: "NEW_CHAPTER",
    message: "New chapter released for Tower of God",
    read: false,
    data: { comicId: "8", chapterNumber: 551 },
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: "3",
    userId: "user-1",
    type: "SYSTEM",
    message: "Welcome to Ivy Scans! Start exploring comics now.",
    read: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  const fetchNotifications = async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK_API) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        setNotifications(mockNotifications);
      } else {
        const response = await fetch(`${API_BASE_URL}/user/notifications`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const data = await response.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
      // Fall back to mock data in case of error
      if (USE_MOCK_API) {
        setNotifications(mockNotifications);
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    if (!isAuthenticated) return;

    try {
      if (USE_MOCK_API) {
        // Update local state for mock data
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? { ...notification, read: true }
              : notification
          )
        );
      } else {
        const response = await fetch(
          `${API_BASE_URL}/user/notifications/${id}/read`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to mark notification as read");
        }

        // Update local state after successful API call
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
      // If using mock data, still update the UI
      if (USE_MOCK_API) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    }
  };

  const markAllAsRead = async () => {
    if (!isAuthenticated) return;

    try {
      if (USE_MOCK_API) {
        // Update local state for mock data
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, read: true }))
        );
      } else {
        const response = await fetch(
          `${API_BASE_URL}/user/notifications/read-all`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to mark all notifications as read");
        }

        // Update local state after successful API call
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, read: true }))
        );
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      // If using mock data, still update the UI
      if (USE_MOCK_API) {
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, read: true }))
        );
      }
    }
  };

  // Fetch notifications on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Set up polling for new notifications (every 5 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
