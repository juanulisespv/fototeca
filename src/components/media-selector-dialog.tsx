
"use client"

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox";
import type { MediaFile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PlayCircle } from "lucide-react";

type MediaSelectorDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mediaFiles: MediaFile[];
    selectedUrls: string[];
    onSelect: (selectedFiles: MediaFile[]) => void;
};

export default function MediaSelectorDialog({ open, onOpenChange, mediaFiles, selectedUrls, onSelect }: MediaSelectorDialogProps) {
    const [selection, setSelection] = useState<Set<string>>(new Set(selectedUrls));

    const handleToggle = (file: MediaFile) => {
        setSelection(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(file.url)) {
                newSelection.delete(file.url);
            } else {
                newSelection.add(file.url);
            }
            return newSelection;
        });
    }

    const handleConfirm = () => {
        const selectedFiles = mediaFiles.filter(file => selection.has(file.url));
        onSelect(selectedFiles);
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Select Media</DialogTitle>
                    <DialogDescription>
                        Choose photos or videos from your library to add to the post.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 -mx-6">
                    <div className="px-6 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {mediaFiles.map(file => (
                             <div 
                                key={file.id} 
                                className="relative group cursor-pointer"
                                onClick={() => handleToggle(file)}
                            >
                                <div className={cn(
                                    "absolute inset-0 rounded-md ring-offset-background transition-all ring-2 ring-transparent",
                                    selection.has(file.url) && "ring-primary ring-offset-2"
                                )}/>
                                <Checkbox
                                    checked={selection.has(file.url)}
                                    className="absolute top-2 right-2 z-10 h-5 w-5 border-white text-white data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                    aria-label={`Select ${file.name}`}
                                />
                                <div className="relative aspect-square w-full overflow-hidden rounded-md">
                                    <Image 
                                        src={file.thumbnailUrl}
                                        alt={file.name}
                                        fill
                                        sizes="(max-width: 768px) 33vw, 20vw"
                                        className="object-cover"
                                    />
                                    {file.type === 'video' && (
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                            <PlayCircle className="h-8 w-8 text-white/80" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs font-medium truncate mt-1">{file.name}</p>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleConfirm}>
                        Confirm ({selection.size} selected)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
