"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

export function DeploymentStatus() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking")

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/health", { method: "HEAD" })
        setStatus(response.ok ? "online" : "offline")
      } catch {
        setStatus("offline")
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  if (process.env.NODE_ENV !== "development") {
    return null // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge
        variant={status === "online" ? "default" : status === "offline" ? "destructive" : "secondary"}
        className="text-xs"
      >
        API: {status}
      </Badge>
    </div>
  )
}
