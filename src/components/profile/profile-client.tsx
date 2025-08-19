
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, KeyRound, User, Save, Mail, Repeat, BarChart, Briefcase, ChevronRight, Loader2, Upload } from "lucide-react";
import Link from "next/link";
import useUserStore from "@/store/user-store";
import { useAuth } from "@/hooks/use-auth";
import PaymentMethods from "@/components/profile/payment-methods";
import { useRouter } from "next/navigation";
import useLoadingStore from "@/store/loading-store";
import { storage } from "@/lib/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";


interface ProfileClientProps {
    initialUserData: {
        username: string;
        email: string;
        uid: string;
        photoURL: string;
    }
}

export default function ProfileClient({ initialUserData }: ProfileClientProps) {
  const { toast } = useToast();
  const { user, updateUserProfile, sendPasswordReset } = useAuth();
  const { username: globalUsername, photoURL: globalPhotoURL, setUsername: setGlobalUsername, setPhotoURL: setGlobalPhotoURL } = useUserStore();
  const router = useRouter();
  const { showLoading } = useLoadingStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [localUsername, setLocalUsername] = useState(initialUserData.username);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialUserData.username) {
      setGlobalUsername(initialUserData.username);
    }
    if (initialUserData.photoURL) {
      setGlobalPhotoURL(initialUserData.photoURL);
    }
  }, [initialUserData, setGlobalUsername, setGlobalPhotoURL]);

  useEffect(() => {
    setLocalUsername(globalUsername);
  }, [globalUsername]);

  const handleBackClick = () => {
    showLoading();
    router.back();
  };
  
  const handleSaveChanges = async () => {
    if (!user) {
        toast({ variant: "destructive", title: "Error", description: "You must be logged in to save changes." });
        return;
    }
    
    if (localUsername === globalUsername) {
        toast({ title: "No Changes", description: "You haven't made any changes to your username." });
        return;
    }

    setIsSaving(true);
    try {
        await updateUserProfile({
            username: localUsername,
        });
        
        setGlobalUsername(localUsername);

        toast({
            title: "Success!",
            description: "Your profile has been updated.",
        });
    } catch (error: any) {
        console.error("Error updating profile:", error);
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to update profile." });
    } finally {
        setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "No email address found for this account.",
      });
      return;
    }
    try {
      await sendPasswordReset();
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your inbox to reset your password.",
      });
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send password reset email.",
      });
    }
  };

  const handleAvatarClick = () => {
      fileInputRef.current?.click();
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !user) return;

      setIsUploading(true);
      try {
          const storageRef = ref(storage, `avatars/${user.uid}/${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);

          await updateUserProfile({ photoURL: downloadURL });
          setGlobalPhotoURL(downloadURL);

          toast({ title: "Avatar Updated", description: "Your new profile picture has been saved." });
      } catch (error) {
          console.error("Error uploading avatar:", error);
          toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload your new avatar." });
      } finally {
          setIsUploading(false);
      }
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
                 <Button variant="default" size="sm" onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Changes
                </Button>
            </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-8">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><User className="text-primary"/>Edit Profile</CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Avatar className="h-20 w-20 border-2 border-primary cursor-pointer" onClick={handleAvatarClick}>
                            <AvatarImage src={globalPhotoURL || ''} alt={localUsername || ''} />
                            <AvatarFallback>{localUsername?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer" onClick={handleAvatarClick}>
                           {isUploading ? <Loader2 className="h-6 w-6 animate-spin text-white"/> : <Upload className="h-6 w-6 text-white"/>}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
                    </div>
                    <div>
                        <p className="font-semibold text-lg">{localUsername}</p>
                        <p className="text-muted-foreground">{initialUserData.email}</p>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                        id="username" 
                        value={localUsername || ''}
                        onChange={(e) => setLocalUsername(e.target.value)}
                        disabled={isSaving}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={initialUserData.email || ""} disabled />
                </div>
            </CardContent>
        </Card>
        
        {user && <PaymentMethods userId={user.uid} />}

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><KeyRound className="text-primary"/>Security</CardTitle>
                <CardDescription>Manage your account security settings.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                        <p className="font-medium">Password Reset</p>
                        <p className="text-sm text-muted-foreground">An email with instructions will be sent to your registered email address.</p>
                    </div>
                    <Button onClick={handlePasswordReset}>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Reset Email
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">Quick Actions</CardTitle>
                <CardDescription>Navigate to other parts of the app.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                 <Button asChild variant="default" className="w-full justify-between">
                    <Link href="/trade">
                         <div className="flex items-center gap-2">
                            <Repeat />
                            <span>Trade a stock</span>
                        </div>
                        <ChevronRight />
                    </Link>
                </Button>
                <Button asChild variant="default" className="w-full justify-between">
                    <Link href="/goals">
                       <div className="flex items-center gap-2">
                            <BarChart />
                            <span>Check your goals</span>
                        </div>
                        <ChevronRight />
                    </Link>
                </Button>
                 <Button asChild variant="default" className="w-full justify-between">
                    <Link href="/portfolio">
                         <div className="flex items-center gap-2">
                            <Briefcase />
                            <span>Go to portfolio</span>
                        </div>
                        <ChevronRight />
                    </Link>
                </Button>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
