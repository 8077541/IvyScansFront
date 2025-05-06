"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface FilterControlsProps {
  selectedGenres: string[]
  setSelectedGenres: (genres: string[]) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  allGenres: string[]
}

export function FilterControls({
  selectedGenres,
  setSelectedGenres,
  statusFilter,
  setStatusFilter,
  allGenres = [],
}: FilterControlsProps) {
  const [isGenresOpen, setIsGenresOpen] = useState(true)

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "ongoing", label: "Ongoing" },
    { value: "completed", label: "Completed" },
    { value: "hiatus", label: "Hiatus" },
  ]

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre))
    } else {
      setSelectedGenres([...selectedGenres, genre])
    }
  }

  const clearGenres = () => {
    setSelectedGenres([])
  }

  return (
    <div className="space-y-6 sticky top-20">
      <div>
        <h3 className="font-medium mb-2">Status</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {statusOptions.find((option) => option.value === statusFilter)?.label || "All"}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            {statusOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={statusFilter === option.value ? "bg-secondary" : ""}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Genres</h3>
          {selectedGenres.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearGenres} className="h-auto py-1 px-2 text-xs">
              Clear
            </Button>
          )}
        </div>

        {selectedGenres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {selectedGenres.map((genre) => (
              <Badge key={genre} variant="secondary" className="cursor-pointer" onClick={() => toggleGenre(genre)}>
                {genre}
                <span className="ml-1">×</span>
              </Badge>
            ))}
          </div>
        )}

        <Collapsible open={isGenresOpen} onOpenChange={setIsGenresOpen} className="space-y-2">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center justify-between w-full">
              {isGenresOpen ? "Hide Genres" : "Show Genres"}
              <ChevronDown className={`h-4 w-4 transition-transform ${isGenresOpen ? "transform rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2">
            {allGenres.map((genre) => (
              <div
                key={genre}
                className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-secondary cursor-pointer"
                onClick={() => toggleGenre(genre)}
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center ${selectedGenres.includes(genre) ? "bg-green-500 border-green-500" : "border-input"}`}
                >
                  {selectedGenres.includes(genre) && <Check className="h-3 w-3 text-white" />}
                </div>
                <span>{genre}</span>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
