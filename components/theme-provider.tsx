"use client";

import { useEffect } from "react";
import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Force dark mode
  useEffect(() => {
    // Apply dark mode class to html element
    document.documentElement.classList.add("dark");

    // Set the theme in localStorage to ensure persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", "dark");
    }
  }, []);

  return (
    <NextThemesProvider {...props} defaultTheme="dark" forcedTheme="dark">
      {children}
    </NextThemesProvider>
  );
}
