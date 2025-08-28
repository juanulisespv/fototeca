
"use client"

import React, { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
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
import { Progress } from "@/components/ui/progress"
import { UploadCloud, File as FileIcon, X, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { collection, addDoc } from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"


type UploadDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadComplete: (file: any) => void
}

type UploadableFile = {
    file: File;
    progress: number;
    error?: string;
}

export default function UploadDialog({ open, onOpenChange, onUploadComplete }: UploadDialogProps) {
  const [files, setFiles] = useState<UploadableFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newUploads = acceptedFiles.map(file => ({ file, progress: 0 }));
    setFiles((prevFiles) => [...prevFiles, ...newUploads]);
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
      "video/mp4": [],
      "video/quicktime": [],
      "video/x-msvideo": [],
    },
  })

  const removeFile = (fileName: string) => {
    setFiles(files.filter(f => f.file.name !== fileName));
  }
  
  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);

    const uploadPromises = files.map(uploadableFile => {
        return new Promise<void>((resolve, reject) => {
            const storageRef = ref(storage, `media/${uploadableFile.file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, uploadableFile.file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setFiles(current => current.map(f => f.file.name === uploadableFile.file.name ? { ...f, progress } : f));
                },
                (error) => {
                    setFiles(current => current.map(f => f.file.name === uploadableFile.file.name ? { ...f, error: error.message } : f));
                    console.error("Upload failed:", error);
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    const isVideo = uploadableFile.file.type.startsWith('video/');
                    
                    const fileData = {
                        name: uploadableFile.file.name,
                        url: downloadURL,
                        thumbnailUrl: isVideo ? "https://picsum.photos/400/300" : downloadURL,
                        type: isVideo ? 'video' : 'image',
                        size: uploadableFile.file.size,
                        createdAt: new Date().toISOString(),
                        tags: [],
                        dataAiHint: isVideo ? "video reel" : undefined,
                    }

                    await addDoc(collection(db, "mediaFiles"), fileData);
                    onUploadComplete(fileData);
                    resolve();
                }
            );
        });
    });

    try {
        await Promise.all(uploadPromises);
        toast({
            title: "Uploads complete",
            description: `Successfully uploaded ${files.length} file(s).`
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Upload failed",
            description: "Some files could not be uploaded. Please try again."
        });
    } finally {
        setIsUploading(false);
        setFiles([]);
        onOpenChange(false);
    }
  }

  const closeDialog = () => {
      if (isUploading) return;
      onOpenChange(false);
      // Give dialog time to close before clearing files
      setTimeout(() => setFiles([]), 300);
  }

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
          <DialogDescription>
            Drag and drop files here or click to select files. Images and videos are supported.
          </DialogDescription>
        </DialogHeader>
        
        {!isUploading && (
            <div {...getRootProps()} className={`mt-4 border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary'}`}>
                <input {...getInputProps()} />
                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                    {isDragActive ? "Drop the files here..." : "Drag 'n' drop some files here, or click to select files"}
                </p>
            </div>
        )}

        {files.length > 0 && (
          <ScrollArea className="mt-4 h-[200px] w-full pr-4">
            <div className="space-y-4">
              {files.map((f, i) => (
                <div key={`${f.file.name}-${i}`} className="flex items-center gap-4">
                  <FileIcon className="h-6 w-6 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">{f.file.name}</p>
                    <Progress value={f.progress} className={`h-2 mt-1 ${f.error ? 'bg-destructive' : ''}`} />
                    {f.error && <p className="text-xs text-destructive mt-1">{f.error}</p>}
                  </div>
                  {!isUploading && (
                    <Button variant="ghost" size="icon" onClick={() => removeFile(f.file.name)}>
                        <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isUploading}>Cancel</Button>
            <Button onClick={handleUpload} disabled={files.length === 0 || isUploading}>
                {isUploading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                    </>
                ) : `Upload ${files.length} ${files.length === 1 ? 'file' : 'files'}`}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
