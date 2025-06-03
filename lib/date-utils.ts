/**
 * Formats a date string to a more readable format
 * @param dateString The date string to format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  try {
    // Check if the string is a valid date
    if (!dateString) return "Unknown date"

    const date = new Date(dateString)

    // Check if date is valid
    if (isNaN(date.getTime())) return dateString

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString || "Unknown date" // Return original string if parsing fails
  }
}

/**
 * Formats a date string to include time
 * @param dateString The date string to format
 * @returns Formatted date and time string
 */
export function formatDateTime(dateString: string): string {
  try {
    // Check if the string is a valid date
    if (!dateString) return "Unknown date"

    const date = new Date(dateString)

    // Check if date is valid
    if (isNaN(date.getTime())) return dateString

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    console.error("Error formatting date and time:", error)
    return dateString || "Unknown date" // Return original string if parsing fails
  }
}

/**
 * Formats a relative time string (e.g., "2 hours ago") to a more consistent format
 * @param relativeTimeString The relative time string to format
 * @returns Formatted date string or the original string if it can't be parsed
 */
export function formatRelativeTime(relativeTimeString: string | undefined | null): string {
  try {
    // Handle null, undefined, or empty values
    if (!relativeTimeString || typeof relativeTimeString !== "string") {
      return "Unknown date"
    }

    // If it looks like an ISO date string, format it directly
    if (relativeTimeString.includes("T") || relativeTimeString.includes("-")) {
      try {
        return formatDate(relativeTimeString)
      } catch (e) {
        // If it fails, continue with the rest of the function
      }
    }

    // Try to parse common relative time formats
    if (relativeTimeString.includes("hour")) {
      return "Today"
    } else if (relativeTimeString.includes("day")) {
      const dayMatch = relativeTimeString.match(/(\d+)\s*day/)
      if (dayMatch) {
        const days = Number.parseInt(dayMatch[1])
        if (days === 1) return "Yesterday"
        const date = new Date()
        date.setDate(date.getDate() - days)
        return formatDate(date.toISOString())
      }
    } else if (relativeTimeString.includes("week")) {
      const weekMatch = relativeTimeString.match(/(\d+)\s*week/)
      if (weekMatch) {
        const weeks = Number.parseInt(weekMatch[1])
        const date = new Date()
        date.setDate(date.getDate() - weeks * 7)
        return formatDate(date.toISOString())
      }
    } else if (relativeTimeString.includes("month")) {
      const monthMatch = relativeTimeString.match(/(\d+)\s*month/)
      if (monthMatch) {
        const months = Number.parseInt(monthMatch[1])
        const date = new Date()
        date.setMonth(date.getMonth() - months)
        return formatDate(date.toISOString())
      }
    }

    // If we can't parse it, return the original string
    return relativeTimeString
  } catch (error) {
    console.error("Error formatting relative time:", error)
    return relativeTimeString || "Unknown date"
  }
}

/**
 * Safely formats any date value with fallback
 * @param dateValue The date value to format (can be string, Date, or null/undefined)
 * @returns Formatted date string
 */
export function safeDateFormat(dateValue: any): string {
  try {
    if (!dateValue) return "Unknown date"

    if (dateValue instanceof Date) {
      return formatDate(dateValue.toISOString())
    }

    if (typeof dateValue === "string") {
      return formatDate(dateValue)
    }

    return "Unknown date"
  } catch (error) {
    console.error("Error in safe date format:", error)
    return "Unknown date"
  }
}

/**
 * Safely formats relative time with fallback
 * @param timeValue The time value to format (can be string or null/undefined)
 * @returns Formatted relative time string
 */
export function safeRelativeTimeFormat(timeValue: any): string {
  try {
    if (!timeValue) return "Unknown time"

    if (typeof timeValue === "string") {
      return formatRelativeTime(timeValue)
    }

    if (timeValue instanceof Date) {
      return formatRelativeTime(timeValue.toISOString())
    }

    return "Unknown time"
  } catch (error) {
    console.error("Error in safe relative time format:", error)
    return "Unknown time"
  }
}
