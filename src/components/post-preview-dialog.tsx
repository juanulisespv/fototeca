
"use client"

import Image from "next/image";
import { format } from "date-fns";
import { Instagram, Facebook, Linkedin, Twitter, MessageCircle, Link2, Calendar, Tag, PlayCircle, Link as LinkIcon, Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge";
import type { EditorialPost } from "@/lib/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"


type PostPreviewDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    post: EditorialPost;
};

const socialNetworkIcons: Record<string, React.ElementType> = {
    Instagram: Instagram,
    Facebook: Facebook,
    LinkedIn: Linkedin,
    X: Twitter,
    TikTok: MessageCircle,
};

const SocialIcon = ({ network }: { network: string }) => {
    const Icon = socialNetworkIcons[network] || Link2;
    return <Icon className="h-5 w-5" />;
};


export default function PostPreviewDialog({ open, onOpenChange, post }: PostPreviewDialogProps) {
    if (!post) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle className="text-2xl">{post.title}</DialogTitle>
                    <DialogDescription asChild>
                      <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-2"><SocialIcon network={post.socialNetwork} /> {post.socialNetwork}</span>
                          <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {format(new Date(post.publicationDate), "PPP p")}</span>
                          <Badge variant={post.status === 'Published' ? 'default' : 'secondary'}>{post.status}</Badge>
                      </div>
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1">
                    <div className="px-6 pb-6 space-y-6">
                        {post.mediaUrls && post.mediaUrls.length > 0 && (
                            <Carousel className="w-full">
                                <CarouselContent>
                                    {post.mediaUrls.map((url, index) => {
                                        const isVideo = url.includes('.mp4') || url.includes('video');
                                        return (
                                        <CarouselItem key={index}>
                                            <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                                                {isVideo ? (
                                                    <video src={url} controls className="h-full w-full object-cover bg-black" preload="metadata" />
                                                ) : (
                                                    <Image src={url} alt={`Post media ${index + 1}`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                                                )}
                                            </div>
                                        </CarouselItem>
                                    )})}
                                </CarouselContent>
                                {post.mediaUrls.length > 1 && (
                                    <>
                                        <CarouselPrevious className="left-2" />
                                        <CarouselNext className="right-2" />
                                    </>
                                )}
                            </Carousel>
                        )}

                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                            <p>{post.text}</p>
                        </div>
                        
                        <div className="space-y-4">
                            {post.link && (
                                <div className="flex items-center gap-3">
                                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                    <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">
                                        {post.link}
                                    </a>
                                </div>
                            )}

                            {post.campaign && (
                                <div className="flex items-center gap-3">
                                    <Edit className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Campaign: <span className="font-semibold">{post.campaign}</span></span>
                                </div>
                            )}

                            {post.tags && post.tags.length > 0 && (
                                <div className="flex items-start gap-3">
                                    <Tag className="h-4 w-4 text-muted-foreground mt-1" />
                                    <div className="flex flex-wrap gap-2">
                                        {post.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </ScrollArea>
                
            </DialogContent>
        </Dialog>
    )
}
