import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ClientLayout from "./client-layout"
import { Providers } from "./providers"
import { Toaster } from "@/components/toaster"
import { GoogleAnalytics } from "@/components/google-analytics"
import { PerformanceMonitor } from "@/components/performance-monitor"
import { Suspense } from "react"

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
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ivy Scans - Modern Webcomic Reader",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ivy Scans - Modern Webcomic Reader",
    description: "A modern webcomic reader with a clean interface for the best reading experience",
    images: ["/og-image.jpg"],
    creator: "@ivyscans",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  verification: {
    google: "your-google-verification-code", // Add your Google Search Console verification code
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
            <Suspense fallback={null}>
              <ClientLayout>{children}</ClientLayout>
            </Suspense>
            <Toaster />
            <GoogleAnalytics />
            <PerformanceMonitor />
          </Providers>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
