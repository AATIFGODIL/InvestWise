
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
import { Shield, Sun, Moon, Eye, LogOut, ShieldBan, FileUp, ArrowLeft, Droplets } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useThemeStore } from "@/store/theme-store";
import { useAuth } from "@/hooks/use-auth";
import { usePrivacyStore, type LeaderboardVisibility } from "@/store/privacy-store";
import PaymentMethods from "@/components/profile/payment-methods";
import { useRouter } from "next/navigation";

export default function SettingsClient() {
  const router = useRouter();
  const [parentalControl, setParentalControl] = useState(false);
  const { theme, setTheme, isClearMode, setClearMode } = useThemeStore();
  const { leaderboardVisibility, setLeaderboardVisibility, showQuests, setShowQuests } = usePrivacyStore();
  const { user, updateUserTheme, signOut: firebaseSignOut, updatePrivacySettings } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    updateUserTheme({ theme: newTheme });
  };

  const handleClearModeChange = (isClear: boolean) => {
    setClearMode(isClear);
    updateUserTheme({ isClearMode: isClear });
  };


  const handleLeaderboardChange = (visibility: LeaderboardVisibility) => {
    setLeaderboardVisibility(visibility);
    updatePrivacySettings({ leaderboardVisibility: visibility });
  };
  
  const handleQuestsChange = (show: boolean) => {
    setShowQuests(show);
    updatePrivacySettings({ showQuests: show });
  }

  return (
      <main className="container mx-auto p-4 space-y-8 pb-24 relative max-w-4xl">
        <Button variant="ghost" size="icon" className="absolute top-4 left-4" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        
        {/* Payment Methods Section */}
        {user && <PaymentMethods userId={user.uid} />}

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
            {!isClient ? (
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : (
              <div className="space-y-4">
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
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <Label htmlFor="clear-mode" className="flex items-center gap-2 cursor-pointer">
                        <Droplets className="h-4 w-4"/> Clear Mode
                        <span className="text-xs text-muted-foreground">(Frosted Glass UI)</span>
                    </Label>
                    <Switch
                        id="clear-mode"
                        checked={isClearMode}
                        onCheckedChange={handleClearModeChange}
                    />
                </div>
              </div>
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
              <RadioGroup value={leaderboardVisibility} onValueChange={(value) => handleLeaderboardChange(value as LeaderboardVisibility)}>
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
                checked={showQuests} 
                onCheckedChange={handleQuestsChange}
              />
            </div>
          </CardContent>
        </Card>
      </main>
  );
}
