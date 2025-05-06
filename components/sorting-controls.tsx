"use client"

import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface SortingControlsProps {
  sortOption: string
  setSortOption: (option: string) => void
}

export function SortingControls({ sortOption, setSortOption }: SortingControlsProps) {
  const sortOptions = [
    { value: "latest", label: "Latest Updates" },
    { value: "a-z", label: "A-Z" },
    { value: "z-a", label: "Z-A" },
  ]

  const currentSortLabel = sortOptions.find((option) => option.value === sortOption)?.label || "Sort By"

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-medium">Results</h2>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <span>Sort: {currentSortLabel}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setSortOption(option.value)}
              className={sortOption === option.value ? "bg-secondary" : ""}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
