"use client"

import { type ReactNode, useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function ClientLayout({ children }: { children: ReactNode }) {
  // Track if component is mounted
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Ensure dark mode is applied
    document.documentElement.classList.add("dark")
  }, [])

  // Render a simplified version during SSR
  if (!mounted) {
    return (
      <div className="relative flex min-h-screen flex-col">
        <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          {/* Simple header placeholder */}
          <div className="container flex h-16 items-center">
            <div className="flex items-center mr-6">
              {/* Logo placeholder */}
              <div className="h-8 w-8 bg-green-500 rounded-full"></div>
              <span className="ml-2 font-bold text-xl">Ivy Scans</span>
            </div>
          </div>
        </div>
        <div className="flex-1">{children}</div>
        {/* Simple footer placeholder */}
        <div className="border-t py-8 bg-background/95">
          <div className="container">
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} Ivy Scans. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}
