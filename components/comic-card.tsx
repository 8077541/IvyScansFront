import type { Comic } from "@/types/types"
import Link from "next/link"
import { OptimizedImage } from "./optimized-image"

interface ComicCardProps {
  comic: Comic
}

export function ComicCard({ comic }: ComicCardProps) {
  return (
    <Link
      href={`/comics/${comic.id}`}
      className="group relative block h-64 overflow-hidden rounded-md shadow-md transition-shadow duration-300 hover:shadow-lg"
    >
      <OptimizedImage
        src={comic.coverImage}
        alt={comic.title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-4 text-white">
        <h3 className="text-lg font-semibold">{comic.title}</h3>
        <p className="text-sm">{comic.issueNumber ? `Issue #${comic.issueNumber}` : "Issue details unavailable"}</p>
      </div>
    </Link>
  )
}
