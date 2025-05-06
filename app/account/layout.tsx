"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { User, Bookmark, Star, LogOut, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

interface AccountLayoutProps {
  children: ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // If not authenticated and not loading, redirect to login
    if (mounted && !isAuthenticated && !isLoading) {
      console.log("[Account Layout] Not authenticated, redirecting to login");
      const currentPath = window.location.pathname;
      window.location.href = `/auth?callbackUrl=${encodeURIComponent(
        currentPath
      )}`;
    }
  }, [isAuthenticated, isLoading, mounted]);

  // Show loading state while checking authentication
  if (isLoading || !mounted) {
    return (
      <div className="container py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-64 shrink-0">
            <Skeleton className="h-8 w-40 mb-4" />
            <div className="space-y-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </aside>
          <Separator
            orientation="vertical"
            className="hidden md:block h-auto"
          />
          <main className="flex-1">
            <Skeleton className="h-96 w-full" />
          </main>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  // Render the actual layout if authenticated
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-64 shrink-0">
          <h2 className="text-xl font-bold mb-4">My Account</h2>
          <nav className="space-y-1">
            <Link href="/account">
              <Button variant="ghost" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </Link>
            <Link href="/account/bookmarks">
              <Button variant="ghost" className="w-full justify-start">
                <Bookmark className="mr-2 h-4 w-4" />
                Bookmarks
              </Button>
            </Link>
            <Link href="/account/history">
              <Button variant="ghost" className="w-full justify-start">
                <History className="mr-2 h-4 w-4" />
                Reading History
              </Button>
            </Link>
            <Link href="/account/ratings">
              <Button variant="ghost" className="w-full justify-start">
                <Star className="mr-2 h-4 w-4" />
                Ratings
              </Button>
            </Link>
            <Separator className="my-2" />
            <Link href="/auth/signout">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </Link>
          </nav>
        </aside>
        <Separator orientation="vertical" className="hidden md:block h-auto" />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
