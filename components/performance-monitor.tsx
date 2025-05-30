"use client"

import { useEffect } from "react"

export function PerformanceMonitor() {
  useEffect(() => {
    // Monitor Core Web Vitals
    if (typeof window !== "undefined" && "performance" in window) {
      // Report performance metrics
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "navigation") {
            const navigationEntry = entry as PerformanceNavigationTiming
            console.log("Page Load Time:", navigationEntry.loadEventEnd - navigationEntry.loadEventStart)
          }
        }
      })

      observer.observe({ entryTypes: ["navigation"] })

      // Clean up observer
      return () => observer.disconnect()
    }
  }, [])

  return null
}
