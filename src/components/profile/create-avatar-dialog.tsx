'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, Upload, Image as ImageIcon } from 'lucide-react';
import { handleAvatarCreation } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface CreateAvatarDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAvatarCreated: (avatarDataUri: string) => void;
}

export default function CreateAvatarDialog({
  isOpen,
  onOpenChange,
  onAvatarCreated,
}: CreateAvatarDialogProps) {
  const { toast } = useToast();
  const [tab, setTab] = useState('prompt');
  const [prompt, setPrompt] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [generatedAvatar, setGeneratedAvatar] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };
  
  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedAvatar(null);
    
    let photoDataUri: string | undefined = undefined;
    if (tab === 'photo' && photo) {
        photoDataUri = await fileToDataUri(photo);
    }
    
    const result = await handleAvatarCreation({
        prompt: tab === 'prompt' ? prompt : `A person who looks like the person in the photo`,
        photoDataUri: photoDataUri,
    });

    if (result.success && result.avatar) {
        setGeneratedAvatar(result.avatar.avatarDataUri);
    } else {
        toast({
            variant: 'destructive',
            title: 'Avatar Creation Failed',
            description: result.error || 'An unknown error occurred.',
        })
    }
    setIsGenerating(false);
  };
  
  const handleSetAvatar = () => {
      if (generatedAvatar) {
          onAvatarCreated(generatedAvatar);
      }
  }
  
  const canGenerate = (tab === 'prompt' && prompt.trim()) || (tab === 'photo' && photo);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Your Avatar with AI</DialogTitle>
          <DialogDescription>
            Use a text prompt or a photo to generate a unique Memoji-style avatar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="flex flex-col gap-4">
                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="prompt">From Prompt</TabsTrigger>
                        <TabsTrigger value="photo">From Photo</TabsTrigger>
                    </TabsList>
                    <TabsContent value="prompt" className="mt-4">
                        <Textarea 
                            placeholder="e.g., a person with pink hair and glasses, smiling..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={5}
                        />
                    </TabsContent>
                    <TabsContent value="photo" className="mt-4 space-y-4">
                        <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                           <Upload className="mr-2 h-4 w-4" /> Upload Photo
                        </Button>
                        <Input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        {photoPreview && (
                            <div className="relative aspect-square w-full rounded-md overflow-hidden ring-1 ring-border">
                                <Image src={photoPreview} alt="Photo preview" fill className="object-cover" />
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
                <Button onClick={handleGenerate} disabled={!canGenerate || isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate Avatar
                </Button>
            </div>
            
            <div className="flex flex-col items-center justify-center gap-4 p-4 bg-muted rounded-lg">
                {isGenerating && (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p>Creating your avatar...</p>
                    </div>
                )}
                {!isGenerating && generatedAvatar && (
                    <Image src={generatedAvatar} alt="Generated Avatar" width={256} height={256} className="rounded-full ring-2 ring-primary" />
                )}
                 {!isGenerating && !generatedAvatar && (
                    <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                        <ImageIcon className="h-12 w-12" />
                        <p>Your generated avatar will appear here.</p>
                    </div>
                )}
            </div>
        </div>
        <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSetAvatar} disabled={!generatedAvatar || isGenerating}>Set as Profile Picture</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
