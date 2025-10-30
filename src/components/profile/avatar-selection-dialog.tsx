'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import avatars from '@/data/avatars.json';

interface AvatarSelectionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAvatarSelect: (avatarUrl: string) => void;
}

export default function AvatarSelectionDialog({
  isOpen,
  onOpenChange,
  onAvatarSelect,
}: AvatarSelectionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose Your Avatar</DialogTitle>
          <DialogDescription>
            Select a pre-made avatar for your profile.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={avatars.categories[0].id} className="flex-grow flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
            {avatars.categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {avatars.categories.map((category) => (
            <TabsContent
              key={category.id}
              value={category.id}
              className="flex-grow mt-4 overflow-hidden"
            >
              <ScrollArea className="h-full pr-3">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {category.images.map((image) => (
                    <button
                      key={image.url}
                      onClick={() => onAvatarSelect(image.url)}
                      className="group flex flex-col items-center gap-2"
                    >
                      <Avatar className="h-24 w-24 ring-2 ring-transparent group-hover:ring-primary transition-all">
                        <AvatarImage src={image.url} data-ai-hint={image.hint} />
                        <AvatarFallback>{category.name[0]}</AvatarFallback>
                      </Avatar>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
