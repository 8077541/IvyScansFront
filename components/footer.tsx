import Link from "next/link"
import { Github, Twitter, Instagram } from "lucide-react"
import { Logo } from "@/components/logo"

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Logo />
            <p className="text-sm text-muted-foreground">
              A modern webcomic reader with a clean interface for the best reading experience.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-green-400">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-green-400">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-green-400">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-green-400">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/comics" className="text-muted-foreground hover:text-green-400">
                  Comics
                </Link>
              </li>
              <li>
                <Link href="/latest" className="text-muted-foreground hover:text-green-400">
                  Latest Updates
                </Link>
              </li>
              <li>
                <Link href="/genres" className="text-muted-foreground hover:text-green-400">
                  Genres
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3">Popular Genres</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/genres/action" className="text-muted-foreground hover:text-green-400">
                  Action
                </Link>
              </li>
              <li>
                <Link href="/genres/fantasy" className="text-muted-foreground hover:text-green-400">
                  Fantasy
                </Link>
              </li>
              <li>
                <Link href="/genres/romance" className="text-muted-foreground hover:text-green-400">
                  Romance
                </Link>
              </li>
              <li>
                <Link href="/genres/martial-arts" className="text-muted-foreground hover:text-green-400">
                  Martial Arts
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-green-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-green-400">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/dmca" className="text-muted-foreground hover:text-green-400">
                  DMCA
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-green-400">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Ivy Scans. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
