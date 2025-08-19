
"use client";

import { useEffect, useState } from "react";
import { User, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, storage } from "@/lib/firebase/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, LogIn, ChevronLeft } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/layout/app-layout";
import PaymentMethods from "@/components/profile/payment-methods";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import useLoadingStore from "@/store/loading-store";
import useUserStore from "@/store/user-store";

function ProfileClient() {
  const { user, hydrating } = useAuth();
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const { showLoading } = useLoadingStore();
  const { photoURL, setPhotoURL, username } = useUserStore();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.length) return;
    const file = e.target.files[0];

    setUploading(true);
    try {
      const fileRef = ref(storage, `profilePictures/${user.uid}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      
      // Update Firebase Auth profile
      await updateProfile(user, { photoURL: url });

      // Update the global user store for instant UI feedback
      setPhotoURL(url);

    } catch (err) {
      console.error("Upload error:", err);
    }
    setUploading(false);
  };

  const handleBackClick = () => {
    showLoading();
    router.back();
  };

  if (hydrating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-muted/40 min-h-screen">
       <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={handleBackClick}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Profile</h1>
                </div>
            </div>
        </div>
      </header>
       <main className="container mx-auto p-4 space-y-8">
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
                  <AvatarImage src={photoURL || ''} alt="Profile Picture" />
                  <AvatarFallback className="text-4xl">{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <p className="font-semibold">{username || "Investor"}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Button asChild variant="outline">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    {uploading ? "Uploading..." : "Change Picture"}
                  </label>
                </Button>
                <input id="file-upload" type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
              </div>
            ) : (
              <div className="text-center space-y-4 py-8">
                <p className="text-muted-foreground">Please sign in to manage your profile.</p>
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

        {user && <PaymentMethods userId={user.uid} />}
      </main>
    </div>
  );
}

export default function ProfilePage() {
    return (
        <AppLayout>
            <ProfileClient />
        </AppLayout>
    )
}
