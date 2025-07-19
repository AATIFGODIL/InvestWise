
"use client";

import { useState } from "react";
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
import { ChevronLeft, KeyRound, User, Save, Mail } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { toast } = useToast();
  const [username, setUsername] = useState("First-Time Investor");

  const handleSaveChanges = () => {
    toast({
      title: "Success!",
      description: "Your username has been updated.",
    });
  };

  const handlePasswordReset = () => {
    toast({
      title: "Password Reset Email Sent",
      description: "Please check your inbox to reset your password.",
    });
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
                 <Button variant="default" size="sm" onClick={handleSaveChanges}>
                    <Save className="mr-2 h-4 w-4" />
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
                    <Avatar className="h-20 w-20 border-2 border-primary">
                        <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="@user" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <Button variant="outline">Change Photo</Button>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                        id="username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value="investor@example.com" disabled />
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
      </main>
    </div>
  );
}
