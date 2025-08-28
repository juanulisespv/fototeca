
"use client"

import Papa from 'papaparse';
import { Button } from './ui/button';
import type { EditorialPost } from '@/lib/types';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ExportButtonProps = {
  posts: EditorialPost[];
};

export default function ExportButton({ posts }: ExportButtonProps) {
  const { toast } = useToast();

  const handleExportCSV = () => {
    if (posts.length === 0) {
      toast({
        variant: "destructive",
        title: "No Posts",
        description: "There are no posts in the current view to export.",
      });
      return;
    }

    const dataToExport = posts.map(post => ({
      title: post.title,
      text: post.text,
      publicationDate: post.publicationDate,
      socialNetwork: post.socialNetwork,
      status: post.status,
      link: post.link,
      campaign: post.campaign,
      tags: post.tags.join(','),
      mediaUrls: post.mediaUrls.join(','),
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `editorial_calendar_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
        title: "Export Complete",
        description: `${posts.length} posts have been exported to CSV.`,
    })
  };

  return (
    <Button variant="outline" onClick={handleExportCSV}>
        <Download className="mr-2 h-4 w-4" />
        Export
    </Button>
  );
}
