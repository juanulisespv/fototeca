"use client"

import { useState, type Dispatch, type SetStateAction } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Sparkles, Loader2, Wand2 } from "lucide-react"
// TODO: Implement actual AI tagging functionality
// import { suggestTags } from "@/ai/flows/suggest-tags"
// import type { SuggestTagsOutput } from "@/ai/flows/suggest-tags"
import type { MediaFile } from "@/lib/types"

// Placeholder types and functions until AI is implemented
export type SuggestTagsOutput = {
  tags: string[];
};

const suggestTags = async (params: { prompt: string; mediaFileNames: string[] }): Promise<{ suggestedTags: Record<string, string[]> }> => {
  // Placeholder implementation - returns sample tags for each file
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  
  const result: Record<string, string[]> = {};
  params.mediaFileNames.forEach(fileName => {
    result[fileName] = ['nature', 'photography', 'digital', 'collection'];
  });
  
  return { suggestedTags: result };
};

const FormSchema = z.object({
  prompt: z.string().min(10, {
    message: "Prompt must be at least 10 characters.",
  }),
})

type AITaggerProps = {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  files: MediaFile[]
  onApplyTags: (fileId: string, tags: string[]) => void
}

export default function AITagger({ open, setOpen, files, onApplyTags }: AITaggerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedTags, setSuggestedTags] = useState<Record<string, string[]> | null>(null)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { prompt: "" },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true)
    setSuggestedTags(null)
    try {
      const result = await suggestTags({
        prompt: data.prompt,
        mediaFileNames: files.map((f) => f.name),
      })
      setSuggestedTags(result.suggestedTags)
    } catch (error) {
      console.error("AI tag suggestion failed:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get AI tag suggestions. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyAll = () => {
    if (!suggestedTags) return;
    files.forEach(file => {
      const tags = suggestedTags[file.name];
      if (tags) {
        onApplyTags(file.id, tags);
      }
    });
    toast({ title: "Success", description: "All suggested tags have been applied." });
    setOpen(false);
  }
  
  const resetState = () => {
    setOpen(false)
    setTimeout(() => {
        form.reset()
        setSuggestedTags(null)
        setIsLoading(false)
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={resetState}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Suggest Tags with AI
          </DialogTitle>
          <DialogDescription>
            Describe the tags you want, and AI will suggest them for your selected files. For example: "tags for a summer beach vacation" or "product categories for e-commerce".
          </DialogDescription>
        </DialogHeader>

        {!suggestedTags ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Prompt</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., tags related to nature and wildlife" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetState}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Generate Suggestions
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div>
            <h3 className="mb-4 font-semibold">AI Suggestions</h3>
            <ScrollArea className="h-64">
              <div className="space-y-4 pr-4">
                {files.map((file) => (
                  <div key={file.id}>
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {suggestedTags[file.name]?.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      )) ?? <p className="text-sm text-muted-foreground">No tags suggested.</p>}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setSuggestedTags(null)}>Back</Button>
                <Button onClick={handleApplyAll}>Apply All Tags</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
