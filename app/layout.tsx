import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ClientLayout from "./client-layout"
import { Providers } from "./providers"
import { Toaster } from "@/components/toaster"

export const metadata = {
  title: {
    default: "Ivy Scans - Modern Webcomic Reader",
    template: "%s | Ivy Scans",
  },
  description: "A modern webcomic reader with a clean interface for the best reading experience",
  keywords: ["webcomic", "manga", "comics", "reader", "online comics", "ivy scans"],
  authors: [{ name: "Ivy Scans Team" }],
  creator: "Ivy Scans",
  publisher: "Ivy Scans",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ivyscans.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://ivyscans.com",
    title: "Ivy Scans - Modern Webcomic Reader",
    description: "A modern webcomic reader with a clean interface for the best reading experience",
    siteName: "Ivy Scans",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ivy Scans - Modern Webcomic Reader",
    description: "A modern webcomic reader with a clean interface for the best reading experience",
    creator: "@ivyscans",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" disableTransitionOnChange>
          <Providers>
            <ClientLayout>{children}</ClientLayout>
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
