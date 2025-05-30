import type { MetadataRoute } from "next"
import { comicService } from "@/lib/api"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL from environment or default
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ivyscans.com"

  // Static routes
  const routes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/comics`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/latest`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/genres`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ] as MetadataRoute.Sitemap

  try {
    // Get all comics for dynamic routes
    const { comics } = await comicService.getAllComics({ limit: 100 })

    // Get all genres
    const genres = await comicService.getGenres()

    // Add comic routes
    const comicRoutes = comics.map((comic) => ({
      url: `${baseUrl}/comics/${comic.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))

    // Add genre routes
    const genreRoutes = genres.map((genre) => ({
      url: `${baseUrl}/genres/${genre.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }))

    return [...routes, ...comicRoutes, ...genreRoutes]
  } catch (error) {
    console.error("Error generating sitemap:", error)
    return routes
  }
}
