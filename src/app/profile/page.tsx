
"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User, updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app, auth, storage } from "@/lib/firebase/config"; // Use existing Firebase config
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, LogIn } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/layout/app-layout";


export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Use photoURL from auth state first for immediate feedback
        if (firebaseUser.photoURL) {
          setProfileUrl(firebaseUser.photoURL);
        }
        
        // Then, try to load from storage for consistency, which might be more up-to-date
        try {
          const url = await getDownloadURL(ref(storage, `profilePictures/${firebaseUser.uid}`));
          setProfileUrl(url);
        } catch (error: any) {
            // If file doesn't exist, that's okay. It means no picture has been uploaded yet.
            if (error.code !== 'storage/object-not-found') {
                console.error("Error loading profile picture:", error);
            }
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.length) return;
    const file = e.target.files[0];

    setUploading(true);
    try {
      const fileRef = ref(storage, `profilePictures/${user.uid}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setProfileUrl(url);

      // Also update the user's auth profile
      await updateProfile(user, { photoURL: url });

    } catch (err) {
      console.error("Upload error:", err);
    }
    setUploading(false);
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
        <Card className="w-full max-w-md">
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
                        <AvatarImage src={profileUrl || ''} alt="Profile Picture" />
                        <AvatarFallback className="text-4xl">{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <p className="font-semibold">{user.displayName || "Investor"}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    
                    <Button asChild variant="outline">
                        <label htmlFor="file-upload" className="cursor-pointer">
                            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4"/>}
                            {uploading ? "Uploading..." : "Upload Picture"}
                        </label>
                    </Button>
                    <input id="file-upload" type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                    </div>
                ) : (
                    <div className="text-center space-y-4 py-8">
                        <p className="text-muted-foreground">Please sign in to manage your profile.</p>
                        <Button asChild>
                            <Link href="/auth/signin">
                                <LogIn className="mr-2 h-4 w-4"/>
                                Go to Sign In
                            </Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
