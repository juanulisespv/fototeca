
"use client"

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { z } from 'zod';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { UploadCloud, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';

const postImportSchema = z.object({
  title: z.string().min(1),
  text: z.string().optional().default(''),
  link: z.string().url().or(z.literal('')).optional().default(''),
  mediaUrls: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean)).optional().default([]),
  socialNetwork: z.enum(['Instagram', 'Facebook', 'LinkedIn', 'X', 'TikTok']),
  campaign: z.string().optional().default(''),
  publicationDate: z.string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" })
    .transform(str => new Date(str).toISOString()),
  tags: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean)).optional().default([]),
  status: z.enum(['Draft', 'Scheduled', 'Published']),
});

type ImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: (summary: { success: number; errors: number }) => void;
};

type ImportError = {
    row: number;
    errors: string[];
}

export default function ImportDialog({ open, onOpenChange, onImportComplete }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<{ success: number; errors: number } | null>(null);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setSummary(null);
      setImportErrors([]);
      setProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/json': ['.json'] },
    multiple: false,
  });
  
  const resetState = () => {
    setFile(null);
    setIsLoading(false);
    setProgress(0);
    setSummary(null);
    setImportErrors([]);
  }

  const handleClose = () => {
    if (isLoading) return;
    onOpenChange(false);
    setTimeout(resetState, 300);
  }

  const processImport = async () => {
    if (!file) return;
    setIsLoading(true);
    setImportErrors([]);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      let records: any[];
      
      try {
        if (file.type === 'application/json') {
          records = JSON.parse(content);
        } else {
          const result = Papa.parse(content, { header: true, skipEmptyLines: true });
          records = result.data;
        }
      } catch (error) {
        toast({ variant: 'destructive', title: 'File Read Error', description: 'Could not parse the file. Please check its format.' });
        setIsLoading(false);
        return;
      }
      
      // 1. First pass: Validate all records
      const errors: ImportError[] = [];
      const validPosts: any[] = [];

      for (let i = 0; i < records.length; i++) {
          const record = records[i];
          const validation = postImportSchema.safeParse(record);
          if (validation.success) {
              validPosts.push(validation.data);
          } else {
              errors.push({
                  row: i + 2, // Account for header row
                  errors: validation.error.issues.map(issue => `${issue.path.join('.')} - ${issue.message}`)
              });
          }
          setProgress(((i + 1) / records.length) * 50); // Validation is 50% of the work
      }

      if (errors.length > 0) {
        setImportErrors(errors);
        setIsLoading(false);
        setProgress(0);
        return;
      }

      // 2. Second pass: Batch write to Firestore
      const batch = writeBatch(db);
      const postsCollection = collection(db, 'editorialPosts');
      
      validPosts.forEach((post, i) => {
          const newPostRef = doc(postsCollection);
          batch.set(newPostGgneratedRef, { ...post, creationDate: new Date().toISOString() });
          setProgress(50 + (((i + 1) / validPosts.length) * 50));
      });

      try {
        await batch.commit();
        setSummary({ success: validPosts.length, errors: 0 });
        onImportComplete({ success: validPosts.length, errors: 0 });
      } catch (error) {
        console.error("Firestore batch write error:", error);
        toast({ variant: 'destructive', title: 'Import Failed', description: 'Could not save posts to the database.' });
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsText(file);
  };

  const renderContent = () => {
    if (summary) {
        return (
            <div className="mt-6 flex flex-col items-center justify-center text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold">Import Complete</h3>
                <p className="text-muted-foreground mt-2">
                    Successfully imported <span className="font-bold text-foreground">{summary.success}</span> posts.
                </p>
            </div>
        )
    }

    if (importErrors.length > 0) {
        return (
            <div className="mt-4">
                <div className="flex items-center gap-2 text-destructive font-semibold">
                    <AlertCircle className="h-5 w-5" />
                    <p>Import Cancelled. {importErrors.length} error(s) found in your file.</p>
                </div>
                <ScrollArea className="h-48 mt-4 rounded-md border p-4 text-sm">
                    {importErrors.map(error => (
                        <div key={error.row} className="mb-2">
                            <p className="font-bold">Row {error.row}:</p>
                            <ul className="list-disc pl-5 text-destructive/80">
                                {error.errors.map((msg, i) => <li key={i}>{msg}</li>)}
                            </ul>
                        </div>
                    ))}
                </ScrollArea>
            </div>
        )
    }

    return (
        <>
        <div {...getRootProps()} className={`mt-4 border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary'}`}>
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            {isDragActive ? "Drop file here..." : "Drag & drop a file, or click to select"}
          </p>
        </div>
        
        {file && (
          <div className="mt-4 flex items-center gap-4 rounded-md border p-3">
            <File className="h-6 w-6 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
            {isLoading && <Progress value={progress} className="w-1/3" />}
          </div>
        )}
      </>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Posts</DialogTitle>
          <DialogDescription>
            Upload a CSV or JSON file to bulk-create editorial posts. The file will be validated before importing.
          </DialogDescription>
        </DialogHeader>

        {renderContent()}
        
        <DialogFooter className='mt-4'>
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                {summary || importErrors.length > 0 ? 'Close' : 'Cancel'}
            </Button>
            {!summary && (
              <Button onClick={importErrors.length > 0 ? () => setImportErrors([]) : processImport} disabled={!file || isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...</> : (importErrors.length > 0 ? 'Try Again' : 'Start Import')}
              </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
