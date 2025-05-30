import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/account/", "/auth/"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || "https://ivyscans.com"}/sitemap.xml`,
  }
}
