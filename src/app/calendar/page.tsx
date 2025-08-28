
"use client"

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import CalendarView from '@/components/calendar-view';
import PostFormDialog from '@/components/post-form-dialog';
import { collection, addDoc, onSnapshot, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { EditorialPost, MediaFile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import DayDetailsSidebar from '@/components/day-details-sidebar';
import DeletePostDialog from '@/components/delete-post-dialog';
import PostPreviewDialog from '@/components/post-preview-dialog';
import { isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import ExportButton from '@/components/export-button';

const ImportDialog = dynamic(() => import('@/components/import-dialog'), { ssr: false });


export default function CalendarPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [posts, setPosts] = useState<EditorialPost[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [postToEdit, setPostToEdit] = useState<EditorialPost | null>(null);
  const [postToDelete, setPostToDelete] = useState<EditorialPost | null>(null);
  const [postToPreview, setPostToPreview] = useState<EditorialPost | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const today = new Date();
    setSelectedDate(today);

    const postsQuery = query(collection(db, "editorialPosts"));
    const postsUnsub = onSnapshot(postsQuery, (querySnapshot) => {
      const postsData: EditorialPost[] = [];
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() } as EditorialPost);
      });
      setPosts(postsData);
    });

    const mediaQuery = query(collection(db, "mediaFiles"));
    const mediaUnsub = onSnapshot(mediaQuery, (querySnapshot) => {
      const filesData: MediaFile[] = [];
      querySnapshot.forEach((doc) => {
        filesData.push({ id: doc.id, ...doc.data() } as MediaFile);
      });
      setMediaFiles(filesData);
    });

    return () => {
        postsUnsub();
        mediaUnsub();
    };
  }, []);

  const postsForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    return posts.filter(p => isSameDay(new Date(p.publicationDate), selectedDate));
  }, [posts, selectedDate]);
  
  const handleNewPost = () => {
    setPostToEdit(null);
    setIsFormOpen(true);
  }

  const handleEditPost = (post: EditorialPost) => {
    setPostToEdit(post);
    setIsFormOpen(true);
  }

  const handleDeleteRequest = (post: EditorialPost) => {
    setPostToDelete(post);
  }
  
  const handlePreviewPost = (post: EditorialPost) => {
    setPostToPreview(post);
    setIsPreviewOpen(true);
  }

  const handleDeletePost = async () => {
    if (!postToDelete) return;

    try {
        await deleteDoc(doc(db, "editorialPosts", postToDelete.id));
        toast({
            title: "Post Deleted",
            description: "The post has been successfully deleted.",
        });
    } catch (error) {
        console.error("Error deleting post:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not delete the post. Please try again.",
        });
    } finally {
        setPostToDelete(null);
    }
  }

  const handleSavePost = async (postData: Omit<EditorialPost, 'id' | 'creationDate'>, id?: string) => {
    try {
      if (id) {
        const postRef = doc(db, "editorialPosts", id);
        await updateDoc(postRef, postData);
        toast({
            title: "Post Updated",
            description: "Your post has been successfully updated.",
        });
      } else {
        await addDoc(collection(db, "editorialPosts"), {
            ...postData,
            creationDate: new Date().toISOString(),
        });
        toast({
            title: "Post Created",
            description: "Your new post has been saved successfully.",
        });
      }
      setIsFormOpen(false);
      setPostToEdit(null);
    } catch (error) {
      console.error("Error saving post:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save the post. Please try again.",
      });
    }
  };

  const handleImportComplete = (summary: { success: number, errors: number }) => {
    toast({
        title: "Import Complete",
        description: `${summary.success} posts imported successfully. ${summary.errors} rows failed.`,
    });
    setIsImportOpen(false);
  }

  return (
    <div className="-m-4 md:-m-6">
      {/* Header móvil con título */}
      <div className="flex items-center justify-between mb-4 md:mb-6 p-4 md:p-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:bg-transparent md:border-0 md:backdrop-blur-none">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Editorial Calendar</h1>
        <div className="flex items-center gap-2">
          <ExportButton posts={posts} />
          <Button variant="outline" size="sm" onClick={() => setIsImportOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Import</span>
          </Button>
        </div>
      </div>

      {/* Layout responsive */}
      <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-8rem)]">
        {/* Calendario principal */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <CalendarView 
            onNewPost={handleNewPost}
            posts={posts}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </div>
        
        {/* Sidebar de detalles - responsive */}
        <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l bg-secondary/50 dark:bg-background/50 overflow-y-auto max-h-96 lg:max-h-none">
          <DayDetailsSidebar 
            selectedDate={selectedDate}
            posts={postsForSelectedDay}
            onEditPost={handleEditPost}
            onDeletePost={handleDeleteRequest}
            onPreviewPost={handlePreviewPost}
          />
        </aside>
      </div>

      {/* Dialogs */}
      <PostFormDialog
        key={postToEdit?.id || 'new'}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSavePost}
        selectedDate={selectedDate}
        post={postToEdit}
        mediaFiles={mediaFiles}
      />
      <DeletePostDialog
        open={!!postToDelete}
        onOpenChange={() => setPostToDelete(null)}
        onConfirm={handleDeletePost}
        postTitle={postToDelete?.title}
      />
      <ImportDialog 
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImportComplete={handleImportComplete}
      />
      {postToPreview && (
        <PostPreviewDialog
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          post={postToPreview}
        />
      )}
    </div>
  );
}
