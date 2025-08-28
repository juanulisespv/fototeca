"use client"

import type { Dispatch, SetStateAction } from "react"
import { Grid, List, Search, UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type HeaderProps = {
  onUploadClick: () => void
  viewMode: "grid" | "list"
  setViewMode: Dispatch<SetStateAction<"grid" | "list">>
  searchTerm: string
  setSearchTerm: Dispatch<SetStateAction<string>>
}

export default function Header({
  onUploadClick,
  viewMode,
  setViewMode,
  searchTerm,
  setSearchTerm,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <h1 className="hidden text-xl font-bold tracking-tight md:block">MediaFlow</h1>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, description, or tag..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                aria-label="Grid View"
              >
                <Grid className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Grid View</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                aria-label="List View"
              >
                <List className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>List View</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button onClick={onUploadClick} className="ml-4 hidden sm:flex">
          <UploadCloud className="mr-2 h-4 w-4" />
          Upload
        </Button>
        <Button onClick={onUploadClick} size="icon" className="ml-2 sm:hidden">
          <UploadCloud className="h-4 w-4" />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  )
}
