'use client';

import { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';
import { storage, db } from '@/lib/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Loader2,
  Upload,
  LogIn,
  Repeat,
  Users,
  Briefcase,
  Settings,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useUserStore } from '@/store/user-store';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/theme-store';
import CreateAvatarDialog from './create-avatar-dialog';

export default function ProfileClient() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const { photoURL, setPhotoURL, username } = useUserStore();

  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  const { isClearMode, theme } = useThemeStore();
  const isLightClear = isClearMode && theme === 'light';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const handleAvatarSelect = (avatarUrl: string) => {
    setPreviewUrl(avatarUrl);
    setNewImageFile(null); // Clear any uploaded file if an avatar is selected
    setIsAvatarDialogOpen(false);
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    if (!newImageFile && !previewUrl) {
      toast({
        variant: 'destructive',
        title: 'No Image Selected',
        description: 'Please upload a new picture or select an avatar.',
      });
      return;
    }

    setUploading(true);
    let finalUrl = '';

    try {
        const fileRef = ref(storage, `profilePictures/${user.uid}`);

        if (newImageFile) {
            await uploadBytes(fileRef, newImageFile);
            finalUrl = await getDownloadURL(fileRef);
        } 
        else if (previewUrl && previewUrl.startsWith('data:image')) {
            await uploadString(fileRef, previewUrl, 'data_url');
            finalUrl = await getDownloadURL(fileRef);
        }

        if (!finalUrl) {
            throw new Error("Could not determine the final image URL.");
        }

        await updateProfile(user, { photoURL: finalUrl });
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { photoURL: finalUrl });
        
        setPhotoURL(finalUrl);

        toast({ title: 'Success!', description: 'Your profile has been updated.' });
        setNewImageFile(null);
        setPreviewUrl(null);

    } catch (err) {
      console.error('Upload error:', err);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update your profile picture.',
      });
    }
    setUploading(false);
  };
  
  const hasChanges = !!previewUrl;

  return (
    <div className="relative">
      <div className="fixed top-4 left-4 z-40">
        <button
          onClick={() => router.back()}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-colors shimmer-bg',
            isClearMode
              ? isLightClear
                ? 'bg-card/60 text-foreground ring-1 ring-white/20'
                : 'bg-white/10 text-slate-100 ring-1 ring-white/60'
              : 'bg-background text-foreground ring-1 ring-border'
          )}
          style={{ backdropFilter: isClearMode ? 'blur(2px)' : 'none' }}
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>
      <main className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              Manage your profile picture and view your account details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="w-32 h-32 border-4 border-primary/20">
                  <AvatarImage
                    src={previewUrl || photoURL || ''}
                    alt="Profile Picture"
                  />
                  <AvatarFallback className="text-4xl">
                    {username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold">{username || 'Investor'}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                
                <div className="flex flex-wrap gap-2 justify-center">
                    <Button asChild variant="outline">
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Photo
                        </label>
                    </Button>
                    <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />

                     <Button variant="outline" onClick={() => setIsAvatarDialogOpen(true)}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Create with AI
                    </Button>
                </div>

                {hasChanges && (
                  <Button onClick={handleSaveChanges} disabled={uploading}>
                    {uploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Save Changes
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center space-y-4 py-8">
                <p className="text-muted-foreground">
                  Please sign in to manage your profile.
                </p>
                <Button asChild>
                  <Link href="/auth/signin">
                    <LogIn className="mr-2 h-4 w-4" />
                    Go to Sign In
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {user && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Button asChild variant="outline">
                <Link href="/trade">
                  <Repeat className="mr-2 h-4 w-4" />
                  Trade
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/community">
                  <Users className="mr-2 h-4 w-4" />
                  Community
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/portfolio">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Portfolio
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

       <CreateAvatarDialog 
        isOpen={isAvatarDialogOpen}
        onOpenChange={setIsAvatarDialogOpen}
        onAvatarCreated={handleAvatarSelect}
      />
    </div>
  );
}
