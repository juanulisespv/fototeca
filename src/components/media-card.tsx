
"use client"

import Image from "next/image"
import { PlayCircle, File } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MediaFile } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

type MediaCardProps = {
  file: MediaFile
  isSelected: boolean
  onSelect: (e: React.MouseEvent | React.KeyboardEvent) => void
  onCardClick: (e: React.MouseEvent<HTMLDivElement>) => void
  viewMode: 'grid' | 'list'
  priority?: boolean
}

export default function MediaCard({ file, isSelected, onSelect, onCardClick, viewMode, priority = false }: MediaCardProps) {
  const handleSelectClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation(); // Prevent card click from firing
    onSelect(e);
  }

  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          "flex items-center gap-4 rounded-lg p-2 transition-colors cursor-pointer",
          isSelected ? "bg-primary/10" : "hover:bg-accent"
        )}
        onClick={(e) => onCardClick(e as any)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCardClick(e as any) }}
        role="button"
        tabIndex={0}
        aria-selected={isSelected}
      >
        <div onClick={(e) => handleSelectClick(e)} onKeyDown={(e) => {if (e.key === 'Enter' || e.key === ' ') handleSelectClick(e)}}>
            <Checkbox
              checked={isSelected}
              className="shrink-0"
              aria-label={`Select ${file.name}`}
              tabIndex={-1} // Prevent double tabbing
            />
        </div>
        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md">
          <Image
            src={file.thumbnailUrl}
            alt={file.name}
            fill
            sizes="64px"
            className="object-cover"
            data-ai-hint={file.dataAiHint}
            priority={priority}
          />
          {file.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <PlayCircle className="h-6 w-6 text-white" />
            </div>
          )}
        </div>
        <p className="flex-1 truncate font-medium">{file.name}</p>
        <p className="hidden text-sm text-muted-foreground sm:block">{file.type}</p>
        <p className="hidden text-sm text-muted-foreground lg:block">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
      </div>
    )
  }

  return (
    <Card
      className={cn(
        "group relative h-full w-full cursor-pointer overflow-hidden transition-all",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      onClick={(e) => onCardClick(e as any)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCardClick(e as any) }}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
    >
      <CardContent className="relative aspect-video p-0">
        <Image
          src={file.thumbnailUrl}
          alt={file.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover transition-transform group-hover:scale-105"
          data-ai-hint={file.dataAiHint}
          priority={priority}
        />
        {file.type === "video" ? (
          <PlayCircle className="absolute left-2 top-2 h-5 w-5 text-white drop-shadow-md" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <p className="absolute bottom-2 left-3 right-3 truncate text-sm font-medium text-white">
          {file.name}
        </p>
        <div className="absolute right-2 top-2" onClick={(e) => handleSelectClick(e)} onKeyDown={(e) => {if (e.key === 'Enter' || e.key === ' ') handleSelectClick(e)}}>
          <Checkbox
            checked={isSelected}
            className="h-5 w-5 border-white text-white data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            aria-label={`Select ${file.name}`}
            tabIndex={-1}
          />
        </div>
      </CardContent>
    </Card>
  )
}
