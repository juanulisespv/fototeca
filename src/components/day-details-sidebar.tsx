
"use client"

import type { EditorialPost } from '@/lib/types';
import { format } from 'date-fns';
import { Calendar, Instagram, Facebook, Linkedin, Twitter, MessageCircle, Link2, MoreVertical, Trash2, Pencil, PlayCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { cn } from '@/lib/utils';


type DayDetailsSidebarProps = {
    selectedDate: Date | null;
    posts: EditorialPost[];
    onEditPost: (post: EditorialPost) => void;
    onDeletePost: (post: EditorialPost) => void;
    onPreviewPost: (post: EditorialPost) => void;
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


export default function DayDetailsSidebar({ selectedDate, posts, onEditPost, onDeletePost, onPreviewPost }: DayDetailsSidebarProps) {
    if (!selectedDate) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-3 md:p-4">
                <Calendar className="h-12 md:h-16 w-12 md:w-16 mb-3 md:mb-4" />
                <h3 className="text-base md:text-lg font-semibold">Select a day</h3>
                <p className="text-xs md:text-sm">Click on any day in the calendar to see the scheduled posts.</p>
            </div>
        )
    }
    
    const sortedPosts = posts.sort((a,b) => new Date(a.publicationDate).getTime() - new Date(b.publicationDate).getTime());

    return (
        <div className="p-3 md:p-4 lg:p-6">
            <h2 className="text-lg md:text-xl font-bold tracking-tight mb-1">{format(selectedDate, "MMMM d")}</h2>
            <p className="text-sm text-muted-foreground mb-4 md:mb-6">{format(selectedDate, "EEEE")}</p>

            {sortedPosts.length > 0 ? (
                <div className="space-y-3 md:space-y-4">
                    {sortedPosts.map((post) => (
                        <Card key={post.id} className="bg-card relative group overflow-hidden">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 z-10">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onPreviewPost(post)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Preview
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onEditPost(post)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDeletePost(post)} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {post.mediaUrls && post.mediaUrls.length > 0 && (
                                <Carousel className="w-full">
                                <CarouselContent>
                                    {post.mediaUrls.map((url, index) => {
                                        const isVideo = url.includes('.mp4') || url.includes('video') || url.startsWith('data:video');
                                        return (
                                        <CarouselItem key={index}>
                                            <div className="relative aspect-video w-full">
                                                {isVideo ? (
                                                    <>
                                                        <video src={url} className="h-full w-full object-cover" preload="metadata" />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                        <PlayCircle className="h-10 w-10 text-white/80" />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <Image src={url} alt={`Post media ${index + 1}`} fill sizes="320px" className="object-cover" />
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
                            
                            <CardHeader>
                                <CardTitle className="flex items-start gap-4 text-lg pr-8">
                                    <SocialIcon network={post.socialNetwork} />
                                    <div>
                                        {post.title}
                                        <p className="text-sm font-normal text-muted-foreground">{format(new Date(post.publicationDate), "p")}</p>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm whitespace-pre-wrap">{post.text}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-16">
                    <p>No posts scheduled for this day.</p>
                </div>
            )}
        </div>
    )
}
