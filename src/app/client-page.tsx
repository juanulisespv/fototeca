
"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { collection, onSnapshot, addDoc, doc, updateDoc, arrayUnion, arrayRemove, deleteDoc, writeBatch, getDocs, query, where } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

import Header from "@/components/header"
import MediaGallery from "@/components/media-gallery"
import BatchActions from "@/components/batch-actions"
import UploadDialog from "@/components/upload-dialog"
import type { MediaFile, Tag } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import EditTagDialog from "@/components/edit-tag-dialog"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import PreviewDialog from "@/components/preview-dialog"
import BatchTagDialog from "@/components/batch-tag-dialog"
  
export default function ClientPage() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selection, setSelection] = useState<Set<string>>(new Set())
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set())
  const [fileTypeFilter, setFileTypeFilter] = useState<'all' | 'image' | 'video'>('all')

  const [isUploadOpen, setUploadOpen] = useState(false)
  const [isBatchTagOpen, setBatchTagOpen] = useState(false);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [isEditTagOpen, setEditTagOpen] = useState(false)
  const [tagToEdit, setTagToEdit] = useState<Tag | null>(null)

  const [isPreviewOpen, setPreviewOpen] = useState(false);
  const [previewFileIndex, setPreviewFileIndex] = useState<number | null>(null);

  const [fileToDelete, setFileToDelete] = useState<MediaFile | null>(null);

  const { toast, dismiss } = useToast()

  useEffect(() => {
    const mediaUnsub = onSnapshot(collection(db, "mediaFiles"), (snapshot) => {
        const files: MediaFile[] = [];
        snapshot.forEach((doc) => {
            files.push({ id: doc.id, ...doc.data() } as MediaFile);
        });
        setMediaFiles(files);
    });

    const tagsUnsub = onSnapshot(collection(db, "tags"), (snapshot) => {
        const tagsData: Tag[] = [];
        snapshot.forEach((doc) => {
            tagsData.push({ id: doc.id, ...doc.data() } as Tag);
        });
        setTags(tagsData);
    });

    return () => {
        mediaUnsub();
        tagsUnsub();
    };
  }, []);


  const filteredMedia = useMemo(() => {
    return mediaFiles
      .filter(file => {
        if (fileTypeFilter !== 'all' && file.type !== fileTypeFilter) return false
        if (activeTags.size > 0 && ![...activeTags].every(tagId => file.tags.includes(tagId))) return false
        
        const searchLower = searchTerm.toLowerCase()
        if (searchLower) {
          const fileTags = file.tags.map(tagId => tags.find(t => t.id === tagId)?.label || '').join(' ')
          return (
            file.name.toLowerCase().includes(searchLower) ||
            (file.description || '').toLowerCase().includes(searchLower) ||
            fileTags.toLowerCase().includes(searchLower)
          )
        }
        return true
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [mediaFiles, fileTypeFilter, activeTags, searchTerm, tags])

  const handleSelectAll = useCallback((checked: boolean | 'indeterminate') => {
    if (checked) {
      setSelection(new Set(filteredMedia.map(f => f.id)))
    } else {
      setSelection(new Set())
    }
  }, [filteredMedia])

  const handleTagToggle = (tagId: string) => {
    setActiveTags(prev => {
      const newActive = new Set(prev)
      if (newActive.has(tagId)) {
        newActive.delete(tagId)
      } else {
        newActive.add(tagId)
      }
      return newActive
    })
  }
  
  const handleApplyTags = async (fileIds: string[], newTags: string[]) => {
    const batch = writeBatch(db);
    const tagIdsToApply: string[] = [];

    for (const label of newTags) {
        let tag = tags.find(t => t.label.toLowerCase() === label.toLowerCase());
        if (!tag) {
            const tagRef = doc(collection(db, "tags"));
            tag = { id: tagRef.id, label, color: 'bg-gray-500' };
            batch.set(tagRef, { label: tag.label, color: tag.color });
        }
        tagIdsToApply.push(tag.id);
    }
    
    fileIds.forEach(fileId => {
        const fileRef = doc(db, "mediaFiles", fileId);
        batch.update(fileRef, {
            tags: arrayUnion(...tagIdsToApply)
        });
    });

    await batch.commit();
    setBatchTagOpen(false);
    setSelection(new Set());
};

  const handleAddTagToFile = async (fileId: string, tagLabel: string) => {
    if (!tagLabel.trim()) return;
    
    let tag = tags.find(t => t.label.toLowerCase() === tagLabel.toLowerCase());
    
    if (!tag) {
        const docRef = await addDoc(collection(db, "tags"), { label: tagLabel, color: 'bg-gray-500' });
        tag = { id: docRef.id, label: tagLabel, color: 'bg-gray-500' };
    }

    await updateDoc(doc(db, "mediaFiles", fileId), {
        tags: arrayUnion(tag.id)
    });
  };

  const handleRemoveTagFromFile = async (fileId: string, tagId: string) => {
    await updateDoc(doc(db, "mediaFiles", fileId), {
        tags: arrayRemove(tagId)
    });
  };

  const deleteFileFromStorage = async (file: MediaFile) => {
    // Only delete from storage if it's a Firebase Storage URL
    if (file.url.includes('firebasestorage.googleapis.com')) {
        const storageRef = ref(storage, `media/${file.name}`);
        try {
            await deleteObject(storageRef);
        } catch (error: any) {
            if (error.code !== 'storage/object-not-found') {
                console.error("Error deleting from storage:", error);
                toast({ variant: "destructive", title: "Storage Error", description: `Could not delete ${file.name} from storage.`});
                throw error; // Re-throw to stop the process if storage deletion fails
            }
        }
    }
  }
  
  const handleDeleteSelected = async () => {
    const batch = writeBatch(db);
    const filesToDelete = mediaFiles.filter(file => selection.has(file.id));

    try {
      for (const file of filesToDelete) {
          batch.delete(doc(db, "mediaFiles", file.id));
          await deleteFileFromStorage(file);
      }

      await batch.commit();

      toast({
          title: `${selection.size} files deleted`,
          description: "The selected files have been permanently removed.",
      });
    } catch(e) {
      // Errors are toasted in deleteFileFromStorage
    } finally {
      setSelection(new Set());
      setDeleteConfirmOpen(false);
    }
  }

  const handleDeleteSingleFile = async () => {
    if (!fileToDelete) return;

    try {
        await deleteFileFromStorage(fileToDelete);
        await deleteDoc(doc(db, "mediaFiles", fileToDelete.id));

        toast({
            title: "File deleted",
            description: `"${fileToDelete.name}" has been permanently removed.`,
        });

        setPreviewOpen(false);
    } catch (error) {
        console.error("Failed to delete file:", error);
        toast({ variant: "destructive", title: "Deletion failed", description: "Could not delete the file."});
    } finally {
        setFileToDelete(null);
    }
  }
  
  const handleDownload = async (filesToDownload: MediaFile[]) => {
    if (filesToDownload.length === 0) return;

    for (const file of filesToDownload) {
      try {
        // Fetch the file as a blob
        const response = await fetch(file.url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        
        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary link element and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        
        // Clean up the temporary link and URL
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

      } catch (error) {
        console.error("Download failed for", file.name, error);
        toast({
            variant: "destructive",
            title: "Download failed",
            description: `Could not download ${file.name}. This may be a CORS issue.`,
        });
      }
    }

    if (filesToDownload.length > 0) {
      toast({
        title: "Download started",
        description: `Downloading ${filesToDownload.length} file(s).`,
      });
    }
  }
  
  const handleEditTag = async (updatedTag: Tag) => {
    await updateDoc(doc(db, "tags", updatedTag.id), {
        label: updatedTag.label,
        color: updatedTag.color,
    });
    setEditTagOpen(false);
  }

  const openPreview = (fileId: string) => {
    const index = filteredMedia.findIndex(f => f.id === fileId);
    if (index !== -1) {
      setPreviewFileIndex(index);
      setPreviewOpen(true);
    }
  };

  const handleUpdateThumbnail = async (fileId: string, thumbnailFile: File) => {
    if (!thumbnailFile) return;

    const toastId = `thumbnail-upload-${Date.now()}`;
    const { id } = toast({
        id: toastId,
        title: "Uploading thumbnail...",
        description: "Your new thumbnail is being uploaded. Please wait.",
    });

    const thumbnailRef = ref(storage, `thumbnails/${fileId}-${thumbnailFile.name}`);
    const uploadTask = uploadBytesResumable(thumbnailRef, thumbnailFile);

    return new Promise<void>((resolve, reject) => {
        uploadTask.on('state_changed',
            () => {}, // progress
            (error) => {
                console.error("Thumbnail upload failed:", error);
                toast({
                    variant: "destructive",
                    title: "Upload Failed",
                    description: "The thumbnail could not be uploaded.",
                });
                reject(error);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    await updateDoc(doc(db, "mediaFiles", fileId), {
                        thumbnailUrl: downloadURL
                    });
                    toast({
                        title: "Thumbnail Updated",
                        description: "The new thumbnail has been applied successfully.",
                    });
                    resolve();
                } catch (error) {
                    console.error("Failed to update firestore with new thumbnail:", error);
                    toast({
                        variant: "destructive",
                        title: "Update Failed",
                        description: "Could not save the new thumbnail.",
                    });
                    reject(error);
                } finally {
                    dismiss(id);
                }
            }
        );
    });
  }

  const selectedFiles = useMemo(() => mediaFiles.filter(f => selection.has(f.id)), [mediaFiles, selection]);

  return (
    <div className="flex h-screen w-full flex-col bg-secondary/50 dark:bg-background">
      <Header
        onUploadClick={() => setUploadOpen(true)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-64 shrink-0 flex-col border-r bg-background p-4 md:flex">
          <h2 className="text-lg font-semibold tracking-tight">Filters</h2>
          <Separator className="my-4" />
          <ScrollArea className="flex-1 -mx-4">
          <div className="px-4 space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-semibold">File Type</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="type-all" checked={fileTypeFilter === 'all'} onCheckedChange={() => setFileTypeFilter('all')} />
                  <Label htmlFor="type-all" className="font-normal">All</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="type-images" checked={fileTypeFilter === 'image'} onCheckedChange={() => setFileTypeFilter('image')} />
                  <Label htmlFor="type-images" className="font-normal">Images</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="type-videos" checked={fileTypeFilter === 'video'} onCheckedChange={() => setFileTypeFilter('video')} />
                  <Label htmlFor="type-videos" className="font-normal">Videos</Label>
                </div>
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold">Tags</h3>
              <div className="space-y-1">
                {tags.map(tag => (
                  <div key={tag.id} className="group flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={activeTags.has(tag.id)}
                        onCheckedChange={() => handleTagToggle(tag.id)}
                      />
                      <Label htmlFor={`tag-${tag.id}`} className="font-normal flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", tag.color)} />
                        {tag.label}
                      </Label>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => {setTagToEdit(tag); setEditTagOpen(true);}}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </ScrollArea>
        </aside>
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <Checkbox 
                      id="select-all"
                      checked={filteredMedia.length > 0 && selection.size === filteredMedia.length}
                      onCheckedChange={(checked) => handleSelectAll(checked)}
                  />
                  <Label htmlFor="select-all" className="text-sm font-medium">Select All</Label>
              </div>
              <p className="text-sm text-muted-foreground">{filteredMedia.length} items</p>
            </div>
            <MediaGallery
              files={filteredMedia}
              selection={selection}
              setSelection={setSelection}
              lastSelectedIndex={lastSelectedIndex}
              setLastSelectedIndex={setLastSelectedIndex}
              viewMode={viewMode}
              onPreview={openPreview}
            />
          </div>
        </main>
      </div>

      {selection.size > 0 && (
        <BatchActions
          selectionCount={selection.size}
          onClear={() => setSelection(new Set())}
          onTag={() => setBatchTagOpen(true)}
          onDownload={() => handleDownload(selectedFiles)}
          onDelete={() => setDeleteConfirmOpen(true)}
        />
      )}

      <UploadDialog open={isUploadOpen} onOpenChange={setUploadOpen} onUploadComplete={()=>{}}/>
      <BatchTagDialog 
        open={isBatchTagOpen} 
        onOpenChange={setBatchTagOpen}
        onApplyTags={(tags) => handleApplyTags(Array.from(selection), tags)}
        fileCount={selection.size}
        allTags={tags.map(t => ({value: t.label, label: t.label}))}
      />
      <EditTagDialog tag={tagToEdit} open={isEditTagOpen} onOpenChange={setEditTagOpen} onSave={handleEditTag} />
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {selection.size} file(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Single file delete confirmation */}
      <AlertDialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete "{fileToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSingleFile}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {previewFileIndex !== null && filteredMedia.length > 0 && (
        <PreviewDialog
          open={isPreviewOpen}
          onOpenChange={setPreviewOpen}
          selectedFile={filteredMedia[previewFileIndex]}
          onNext={() => setPreviewFileIndex(i => (i !== null ? (i + 1) % filteredMedia.length : null))}
          onPrevious={() => setPreviewFileIndex(i => (i !== null ? (i - 1 + filteredMedia.length) % filteredMedia.length : null))}
          hasNext={filteredMedia.length > 1}
          hasPrevious={filteredMedia.length > 1}
          allTags={tags}
          onAddTag={handleAddTagToFile}
          onRemoveTag={handleRemoveTagFromFile}
          onDelete={() => setFileToDelete(filteredMedia[previewFileIndex])}
          onDownload={() => handleDownload([filteredMedia[previewFileIndex]])}
          onUpdateThumbnail={handleUpdateThumbnail}
          onEdit={() => { /* TODO: Implement edit for external URL */ }}
        />
      )}
    </div>
  )
}

    

    

    
