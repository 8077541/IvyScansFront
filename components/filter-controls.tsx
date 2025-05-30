"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp } from "lucide-react"

interface FilterControlsProps {
  selectedGenres: string[]
  setSelectedGenres: (genres: string[]) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  allGenres: string[]
  disabled?: boolean
}

export function FilterControls({
  selectedGenres,
  setSelectedGenres,
  statusFilter,
  setStatusFilter,
  allGenres,
  disabled = false,
}: FilterControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleGenreChange = (genre: string, checked: boolean) => {
    if (disabled) return

    if (checked) {
      setSelectedGenres([...selectedGenres, genre])
    } else {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre))
    }
  }

  const clearFilters = () => {
    if (disabled) return
    setSelectedGenres([])
    setStatusFilter("all")
  }

  const hasActiveFilters = selectedGenres.length > 0 || statusFilter !== "all"

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          Filters
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} disabled={disabled}>
              Clear
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Filter */}
        <div>
          <Label className="text-sm font-medium">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter} disabled={disabled}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="hiatus">On Hiatus</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Genres Filter */}
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Genres</Label>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} disabled={disabled}>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {selectedGenres.length > 0 && (
            <div className="text-xs text-muted-foreground mt-1">{selectedGenres.length} selected</div>
          )}

          <div
            className={`space-y-2 mt-2 transition-all duration-200 ${
              isExpanded ? "max-h-96 overflow-y-auto" : "max-h-32 overflow-hidden"
            }`}
          >
            {allGenres.length === 0 && disabled ? (
              <div className="text-sm text-muted-foreground">Loading genres...</div>
            ) : allGenres.length === 0 ? (
              <div className="text-sm text-muted-foreground">No genres available</div>
            ) : (
              allGenres.map((genre) => (
                <div key={genre} className="flex items-center space-x-2">
                  <Checkbox
                    id={genre}
                    checked={selectedGenres.includes(genre)}
                    onCheckedChange={(checked) => handleGenreChange(genre, checked as boolean)}
                    disabled={disabled}
                  />
                  <Label htmlFor={genre} className={`text-sm cursor-pointer ${disabled ? "opacity-50" : ""}`}>
                    {genre}
                  </Label>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
