"use client";

import { type ReactNode, useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render a simplified version during SSR
  if (!mounted) {
    return (
      <div className="relative flex min-h-screen flex-col">
        <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="container flex h-16 items-center">
            <div className="flex items-center mr-6">
              <div className="h-8 w-8 bg-green-500 rounded-full"></div>
              <span className="ml-2 font-bold text-xl">Ivy Scans</span>
            </div>
          </div>
        </div>
        <main className="flex-1">{children}</main>
        <div className="border-t">
          <div className="py-6"></div>
        </div>
      </div>
    );
  }

  // Client-side rendered version
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center">
          <Header />
        </div>
      </div>
      <main className="flex-1">{children}</main>
      <div className="border-t">
        <Footer />
      </div>
    </div>
  );
}
