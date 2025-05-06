import type React from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import ClientLayout from "./client-layout";
import { Providers } from "./providers";
import { Toaster } from "@/components/toaster";

export const metadata = {
  title: "Ivy Scans",
  description: "A modern webcomic reader with a clean interface",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <Providers>
            <ClientLayout>{children}</ClientLayout>
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
