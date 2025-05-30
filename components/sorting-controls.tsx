"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface SortingControlsProps {
  sortOption: string
  setSortOption: (option: string) => void
  disabled?: boolean
}

export function SortingControls({ sortOption, setSortOption, disabled = false }: SortingControlsProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Label htmlFor="sort-select" className="text-sm font-medium whitespace-nowrap">
        Sort by:
      </Label>
      <Select value={sortOption} onValueChange={setSortOption} disabled={disabled}>
        <SelectTrigger id="sort-select" className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="latest">Latest Updates</SelectItem>
          <SelectItem value="a-z">Title A-Z</SelectItem>
          <SelectItem value="z-a">Title Z-A</SelectItem>
          <SelectItem value="rating">Highest Rated</SelectItem>
          <SelectItem value="popular">Most Popular</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
