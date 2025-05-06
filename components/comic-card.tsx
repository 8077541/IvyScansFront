import Link from "next/link";
import Image from "next/image";
import type { Comic } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/date-utils";

interface ComicCardProps {
  comic: Comic;
}

export function ComicCard({ comic }: ComicCardProps) {
  // Ensure we have a valid comic with an ID before rendering a link
  if (!comic || !comic.id) {
    return (
      <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md hover:shadow-green-500/10 hover:border-green-500/50">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src="/placeholder.svg?height=400&width=300&text=Invalid Comic"
            alt="Invalid Comic"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          />
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold line-clamp-2 text-sm h-10">
            Error: Invalid Comic Data
          </h3>
        </CardContent>
        <CardFooter className="p-3 pt-0 text-xs text-muted-foreground">
          <span>Missing ID</span>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Link href={`/comics/${comic.id}`}>
      <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md hover:shadow-green-500/10 hover:border-green-500/50">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={comic.cover || "/placeholder.svg"}
            alt={comic.title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
            <Badge
              variant="secondary"
              className="text-xs bg-green-500/90 text-white hover:bg-green-600"
            >
              {comic.latestChapter}
            </Badge>
          </div>
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold line-clamp-2 text-sm h-10">
            {comic.title}
          </h3>
        </CardContent>
        <CardFooter className="p-3 pt-0 text-xs text-muted-foreground">
          <span>{formatRelativeTime(comic.updatedAt)}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
