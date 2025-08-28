
"use client"

import { useEffect, useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ImagePlus, Link, Trash2, X } from "lucide-react"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "./ui/scroll-area"
import type { EditorialPost, MediaFile } from "@/lib/types"
import MediaSelectorDialog from "./media-selector-dialog"

const postFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  text: z.string().optional(),
  link: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  mediaUrls: z.array(z.string()).optional(),
  socialNetwork: z.enum(['Instagram', 'Facebook', 'LinkedIn', 'X', 'TikTok']),
  campaign: z.string().optional(),
  publicationDate: z.date({
    required_error: "A publication date is required.",
  }),
  status: z.enum(['Draft', 'Scheduled', 'Published']),
  tags: z.string().optional(), // Simple string for now, can be parsed into an array
})

type PostFormValues = z.infer<typeof postFormSchema>

type PostFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: Omit<any, 'id' | 'creationDate'>, id?: string) => void
  selectedDate?: Date | null
  post?: EditorialPost | null;
  mediaFiles: MediaFile[];
}

export default function PostFormDialog({ open, onOpenChange, onSave, selectedDate, post, mediaFiles }: PostFormDialogProps) {
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: "",
      text: "",
      link: "",
      mediaUrls: [],
      campaign: "",
      status: "Draft",
      tags: ""
    },
  })

  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        text: post.text,
        link: post.link,
        mediaUrls: post.mediaUrls || [],
        socialNetwork: post.socialNetwork,
        campaign: post.campaign,
        publicationDate: new Date(post.publicationDate),
        status: post.status,
        tags: post.tags?.join(', ') || '',
      });
    } else if (selectedDate) {
        form.reset({
            ...form.getValues(),
            publicationDate: selectedDate,
            mediaUrls: [],
        });
    }
  }, [post, selectedDate, form, open])

  function onSubmit(data: PostFormValues) {
    const postData = {
        ...data,
        publicationDate: data.publicationDate.toISOString(),
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        translations: post?.translations || {},
    };
    onSave(postData, post?.id)
  }

  const handleMediaSelect = (selectedFiles: MediaFile[]) => {
    const currentUrls = form.getValues('mediaUrls') || [];
    const newUrls = selectedFiles.map(f => f.url);
    const combined = Array.from(new Set([...currentUrls, ...newUrls]));
    form.setValue('mediaUrls', combined, { shouldDirty: true });
    setIsMediaSelectorOpen(false);
  }

  const handleRemoveMedia = (urlToRemove: string) => {
    const currentUrls = form.getValues('mediaUrls') || [];
    form.setValue('mediaUrls', currentUrls.filter(url => url !== urlToRemove), { shouldDirty: true });
  }

  const watchedMediaUrls = form.watch('mediaUrls') || [];

  const selectedMedia = useMemo(() => {
    const foundInLibrary = mediaFiles.filter(mf => watchedMediaUrls.includes(mf.url));
    const notFoundUrls = watchedMediaUrls.filter(url => !mediaFiles.some(mf => mf.url === url));
    
    const externalMediaAsFiles: MediaFile[] = notFoundUrls.map(url => ({
        id: url, // Use URL as a temporary unique key
        url: url,
        thumbnailUrl: url,
        name: 'External Media',
        type: url.includes('.mp4') || url.includes('.mov') ? 'video' : 'image',
        size: 0,
        createdAt: new Date().toISOString(),
        tags: [],
    }));

    return [...foundInLibrary, ...externalMediaAsFiles];
  }, [watchedMediaUrls, mediaFiles]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{post ? 'Edit Post' : 'Create New Post'}</DialogTitle>
            <DialogDescription>
              Fill in the details for your editorial post. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <ScrollArea className="h-[60vh] p-4">
                <div className="space-y-8">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Our new product launch" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel>Media</FormLabel>
                    <div className="mt-2 flex items-center gap-4">
                         <Button type="button" variant="outline" onClick={() => setIsMediaSelectorOpen(true)}>
                            <ImagePlus className="mr-2 h-4 w-4" />
                            Select from Library
                        </Button>
                    </div>
                    {selectedMedia.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-4">
                            {selectedMedia.map(file => (
                                <div key={file.id} className="relative group">
                                    <Image src={file.thumbnailUrl} alt={file.name} width={150} height={150} className="rounded-md object-cover aspect-square" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveMedia(file.url)}
                                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Text</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us a little bit about this post"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="socialNetwork"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Social Network</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a social network" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Instagram">Instagram</SelectItem>
                              <SelectItem value="Facebook">Facebook</SelectItem>
                              <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                              <SelectItem value="X">X (formerly Twitter)</SelectItem>
                              <SelectItem value="TikTok">TikTok</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Draft">Draft</SelectItem>
                              <SelectItem value="Scheduled">Scheduled</SelectItem>
                              <SelectItem value="Published">Published</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="publicationDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Publication Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0,0,0,0)) 
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link (URL)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/promo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="campaign"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Summer Sale 2024" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., sale, promo, new" {...field} />
                        </FormControl>
                        <FormDescription>
                          Separate tags with a comma.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </ScrollArea>
              <DialogFooter className="pt-6">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit">Save Post</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <MediaSelectorDialog
        open={isMediaSelectorOpen}
        onOpenChange={setIsMediaSelectorOpen}
        mediaFiles={mediaFiles}
        onSelect={handleMediaSelect}
        selectedUrls={form.getValues('mediaUrls') || []}
      />
    </>
  )
}
