
"use client";

import { useState, type ChangeEvent, useEffect } from "react";
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
import { ChevronLeft, KeyRound, User, Save, Mail, Upload, Repeat, BarChart, Briefcase, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import useUserStore from "@/store/user-store";
import { useAuth } from "@/hooks/use-auth";

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, loading: authLoading, updateUserProfile, sendPasswordReset } = useAuth();
  const { username, profilePic } = useUserStore();
  
  const [localUsername, setLocalUsername] = useState(username);
  const [localProfilePic, setLocalProfilePic] = useState<string | null>(profilePic);
  const [newProfilePicFile, setNewProfilePicFile] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalUsername(username);
  }, [username]);

  useEffect(() => {
    setLocalProfilePic(profilePic);
  }, [profilePic]);


  const handleSaveChanges = async () => {
    if (!user) {
        toast({ variant: "destructive", title: "Error", description: "You must be logged in to save changes." });
        return;
    }
    setIsSaving(true);
    try {
        await updateUserProfile({
            username: localUsername,
            photoDataUrl: newProfilePicFile, 
        });
        
        toast({
            title: "Success!",
            description: "Your profile has been updated.",
        });
        setNewProfilePicFile(null); // Clear the pending file change
    } catch (error) {
        console.error("Error updating profile:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to update profile." });
    } finally {
        setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
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

  const handleProfilePicChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Set the preview image immediately
        setLocalProfilePic(result); 
        // Store the file data to be uploaded
        setNewProfilePicFile(result); 
        toast({
          title: "Photo Ready",
          description: "Click 'Save Changes' to apply your new profile picture.",
        });
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <div className="bg-muted/40 min-h-screen">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Profile</h1>
                </Link>
                 <Button variant="default" size="sm" onClick={handleSaveChanges} disabled={isSaving || authLoading}>
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
                    <Label htmlFor="profile-pic-upload" className="cursor-pointer group relative">
                        <Avatar className="h-20 w-20 border-2 border-primary">
                            <AvatarImage src={localProfilePic ?? undefined} alt="@user" />
                            <AvatarFallback>{localUsername?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="h-8 w-8 text-white" />
                        </div>
                    </Label>
                    <Input id="profile-pic-upload" type="file" className="hidden" accept="image/*" onChange={handleProfilePicChange} />
                    <Label htmlFor="profile-pic-upload" className="cursor-pointer">
                      <Button asChild variant="outline">
                        <span>Change Photo</span>
                      </Button>
                    </Label>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                        id="username" 
                        value={localUsername || ''}
                        onChange={(e) => setLocalUsername(e.target.value)}
                        disabled={authLoading || isSaving}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user?.email || ""} disabled />
                </div>
            </CardContent>
        </Card>
        
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
