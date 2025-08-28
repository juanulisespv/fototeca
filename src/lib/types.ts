

export interface Tag {
  id: string;
  label: string;
  color: string;
}

export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl: string;
  size: number; // in bytes
  createdAt: string; // ISO string
  tags: string[]; // array of tag IDs
  description?: string;
  location?: string;
  associatedProduct?: string;
  dataAiHint?: string;
}

export interface EditorialPost {
    id: string;
    title: string;
    text: string;
    link: string;
    mediaUrls: string[];
    socialNetwork: 'Instagram' | 'Facebook' | 'LinkedIn' | 'X' | 'TikTok';
    campaign: string;
    publicationDate: string; // ISO string
    creationDate: string; // ISO string
    tags: string[];
    translations: Record<string, { title: string; text: string }>;
    status: 'Draft' | 'Scheduled' | 'Published';
}
