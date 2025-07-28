
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Shield, Sun, Moon, Eye, LogOut, ChevronLeft, ShieldBan, FileUp } from "lucide-react";
import Link from "next/link";
import { LeaderboardVisibility } from "../community/page";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import useThemeStore from "@/store/theme-store";
import { useAuth } from "@/hooks/use-auth";

const VisaIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 38 24" fill="none">
        <path d="M34.665 2.553H3.335C1.823 2.553 0.59 3.786 0.59 5.298v13.404c0 1.512 1.233 2.745 2.745 2.745h31.33c1.512 0 2.745-1.233 2.745-2.745V5.298c0-1.512-1.233-2.745-2.745-2.745z" fill="#fff" stroke="#D1D5DB" strokeWidth="1.18"/>
        <path d="M12.238 18.002c.532 0 .993-.178 1.383-.533l.462-.355-.533-1.85a1.868 1.868 0 00-1.062-.835c-.249-.071-.782-.248-1.244-.248-.355 0-.71.071-1.062.248-.355.178-.64.426-.853.782l-2.09 6.255h2.488l.534-1.778h2.559zm-3.006-2.417c.072-.248.356-.497.854-.497.427 0 .64.178.783.355l.427 1.137h-2.16zM22.253 15.407c-.426-.426-.924-.64-1.503-.64-.995 0-1.777.497-1.777 1.28 0 .568.426.924 1.137 1.208.71.284 1.062.497 1.062.782 0 .426-.427.639-1.208.639-.71 0-1.062-.107-1.573-.355l-.213-.107-.64 1.85c.427.249.995.427 1.706.427.995 0 2.417-.498 2.417-1.85 0-.64-.426-1.063-1.208-1.352-.64-.284-.995-.498-.995-.782 0-.284.356-.569 1.138-.569.497 0 .853.107 1.137.284l.143.107.64-1.706zM24.773 9.4h2.23l-1.574 8.602h-1.947l1.706-5.83-2.935-2.772h2.518l1.706 1.635 1.062-1.635h2.16l-2.346 3.553 1.063 5.049h-2.418l-1.573-5.333zM9.46 9.4l-3.376 6.048-.284-.995A10.63 10.63 0 005.16 11.82c-.853-1.063-1.777-1.706-2.935-2.16L.59 9.4h2.934c.498 0 .925.355 1.063.853L5.19 12.41c.426.107.853.355 1.208.71l.143-.497L9.46 9.4z" fill="#2566AF"/>
    </svg>
);

const MasterCardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 38 24" fill="none">
        <path d="M34.665 2.553H3.335C1.823 2.553 0.59 3.786 0.59 5.298v13.404c0 1.512 1.233 2.745 2.745 2.745h31.33c1.512 0 2.745-1.233 2.745-2.745V5.298c0-1.512-1.233-2.745-2.745-2.745z" fill="#fff" stroke="#D1D5DB" strokeWidth="1.18"/>
        <circle cx="15" cy="12" r="7" fill="#EB001B"/>
        <circle cx="23" cy="12" r="7" fill="#F79E1B"/>
        <path d="M20 12a7 7 0 0 1-5 6.658A7 7 0 0 0 20 12z" fill="#FF5F00"/>
    </svg>
);

export default function SettingsPage() {
  const [leaderboardVisibility, setLeaderboardVisibility] = useState<LeaderboardVisibility>("public");
  const [quests, setQuests] = useState(true);
  const [parentalControl, setParentalControl] = useState(false);
  const { theme, setTheme } = useThemeStore();
  const { updateUserTheme } = useAuth();
  
  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    updateUserTheme(newTheme);
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
                    <h1 className="text-xl font-bold">Settings</h1>
                </Link>
                <Button variant="ghost" size="icon">
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 space-y-8">
        {/* Parental Controls Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="text-primary"/>Parental Control</CardTitle>
            <CardDescription>
              Manage content and feature restrictions for younger users.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <Label htmlFor="parental-control" className="font-medium">Enable Parental Controls</Label>
              <Switch 
                id="parental-control" 
                checked={parentalControl} 
                onCheckedChange={setParentalControl}
              />
            </div>
             {parentalControl && (
                 <div className="p-4 rounded-lg bg-muted/50 space-y-4">
                     <div className="space-y-2">
                         <Label htmlFor="parent-email">Parent's Email</Label>
                         <Input id="parent-email" type="email" placeholder="parent@example.com"/>
                     </div>
                     <div className="space-y-2">
                         <Label htmlFor="parent-id">Parent's ID Verification</Label>
                         <Button asChild variant="outline" className="w-full justify-start text-muted-foreground font-normal">
                            <div>
                                <FileUp className="h-4 w-4 mr-2" />
                                Upload Parent's Government ID
                            </div>
                        </Button>
                        <Input id="parent-id" type="file" className="hidden" accept="application/pdf, image/*" />
                     </div>
                     <Button className="w-full">Save Parental Settings</Button>
                 </div>
             )}
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sun className="text-primary"/>Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel of the app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!theme ? (
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : (
                <RadioGroup value={theme} onValueChange={(v) => handleThemeChange(v as "light" | "dark")} className="space-y-2">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <Label htmlFor="theme-light" className="flex items-center gap-2 cursor-pointer"><Sun className="h-4 w-4"/> Light Mode</Label>
                        <RadioGroupItem value="light" id="theme-light" />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <Label htmlFor="theme-dark" className="flex items-center gap-2 cursor-pointer"><Moon className="h-4 w-4"/> Dark Mode</Label>
                        <RadioGroupItem value="dark" id="theme-dark" />
                    </div>
                </RadioGroup>
            )}
          </CardContent>
        </Card>

        {/* Privacy Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Eye className="text-primary"/>Privacy</CardTitle>
            <CardDescription>
              Control how your information is shared within the community.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <Label className="font-medium flex items-center gap-2">
                Leaderboard Visibility
              </Label>
              <RadioGroup value={leaderboardVisibility} onValueChange={(value) => setLeaderboardVisibility(value as LeaderboardVisibility)}>
                  <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="vis-public" />
                      <Label htmlFor="vis-public">Public (Show rank and username)</Label>
                  </div>
                   <div className="flex items-center space-x-2">
                      <RadioGroupItem value="anonymous" id="vis-anon" />
                      <Label htmlFor="vis-anon">Anonymous (Show rank, hide username)</Label>
                  </div>
                   <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hidden" id="vis-hidden" />
                      <Label htmlFor="vis-hidden">Hidden (Don't show on leaderboard)</Label>
                  </div>
              </RadioGroup>
            </div>
             <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <Label htmlFor="quests-switch" className="font-medium flex items-center gap-2">
                <ShieldBan className="h-4 w-4" />
                Participate in Quests
                </Label>
              <Switch 
                id="quests-switch" 
                checked={quests} 
                onCheckedChange={setQuests}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Options Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CreditCard className="text-primary"/>Payment Options</CardTitle>
            <CardDescription>
              Manage your saved payment methods for investments.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                    <VisaIcon />
                    <div>
                        <p className="font-medium">Visa ending in 1234</p>
                        <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm">Remove</Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                    <MasterCardIcon />
                    <div>
                        <p className="font-medium">Mastercard ending in 5678</p>
                        <p className="text-sm text-muted-foreground">Expires 08/2026</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm">Remove</Button>
            </div>
            <Button className="w-full">Add New Payment Method</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

    
