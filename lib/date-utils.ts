/**
 * Formats a date string to a more readable format
 * @param dateString The date string to format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  try {
    // Check if the string is a valid date
    if (!dateString) return "Unknown date";

    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString; // Return original string if parsing fails
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
    if (!dateString) return "Unknown date";

    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting date and time:", error);
    return dateString; // Return original string if parsing fails
  }
}

/**
 * Formats a relative time string (e.g., "2 hours ago") to a more consistent format
 * @param relativeTimeString The relative time string to format
 * @returns Formatted date string or the original string if it can't be parsed
 */
export function formatRelativeTime(relativeTimeString: string): string {
  try {
    // If it looks like an ISO date string, format it directly
    if (
      relativeTimeString &&
      (relativeTimeString.includes("T") || relativeTimeString.includes("-"))
    ) {
      try {
        return formatDate(relativeTimeString);
      } catch (e) {
        // If it fails, continue with the rest of the function
      }
    }

    // Try to parse common relative time formats
    if (relativeTimeString.includes("hour")) {
      return "Today";
    } else if (relativeTimeString.includes("day")) {
      const days = Number.parseInt(relativeTimeString.split(" ")[0]);
      if (days === 1) return "Yesterday";
      const date = new Date();
      date.setDate(date.getDate() - days);
      return formatDate(date.toISOString());
    } else if (relativeTimeString.includes("week")) {
      const weeks = Number.parseInt(relativeTimeString.split(" ")[0]);
      const date = new Date();
      date.setDate(date.getDate() - weeks * 7);
      return formatDate(date.toISOString());
    } else if (relativeTimeString.includes("month")) {
      const months = Number.parseInt(relativeTimeString.split(" ")[0]);
      const date = new Date();
      date.setMonth(date.getMonth() - months);
      return formatDate(date.toISOString());
    }

    // If we can't parse it, return the original string
    return relativeTimeString;
  } catch (error) {
    console.error("Error formatting relative time:", error);
    return relativeTimeString;
  }
}
