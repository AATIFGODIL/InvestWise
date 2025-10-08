
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
import { Shield, Sun, Eye, ShieldBan, FileUp, ArrowLeft, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useThemeStore } from "@/store/theme-store";
import { useAuth } from "@/hooks/use-auth";
import { usePrivacyStore, type LeaderboardVisibility } from "@/store/privacy-store";
import PaymentMethods from "@/components/profile/payment-methods";
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { cn } from "@/lib/utils";

export default function SettingsClient() {
  const router = useRouter();
  const [parentalControl, setParentalControl] = useState(false);
  const { theme, setTheme, isClearMode, setClearMode } = useThemeStore();
  const { leaderboardVisibility, setLeaderboardVisibility, showQuests, setShowQuests } = usePrivacyStore();
  const { user, updateUserTheme, updatePrivacySettings } = useAuth();
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
                    <Skeleton className="h-20 w-full" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                    {/* Light Theme Box */}
                    <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => handleThemeChange('light')}>
                        <div
                            className={cn(
                                "relative w-24 h-16 rounded-lg border-2 p-2 flex items-center justify-center transition-all",
                                theme === 'light' ? 'border-primary ring-2 ring-primary' : 'border-border'
                            )}
                        >
                            <div className="w-full h-full rounded bg-gray-100 flex items-center justify-center p-2">
                                <svg viewBox="0 0 24 24" className="w-8 h-8 text-black">
                                    <rect x="4" y="6" width="4" height="12" fill="currentColor" />
                                    <rect x="10" y="10" width="4" height="6" fill="currentColor" />
                                    <rect x="16" y="4" width="4" height="16" fill="currentColor" />
                                </svg>
                            </div>
                            {theme === 'light' && <CheckCircle className="absolute -top-2 -right-2 h-5 w-5 text-primary bg-background rounded-full" />}
                        </div>
                        <Label>Light</Label>
                    </div>

                    {/* Dark Theme Box */}
                    <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => handleThemeChange('dark')}>
                        <div
                             className={cn(
                                "relative w-24 h-16 rounded-lg border-2 p-2 flex items-center justify-center transition-all",
                                theme === 'dark' ? 'border-primary ring-2 ring-primary' : 'border-border'
                            )}
                        >
                             <div className="w-full h-full rounded bg-gray-800 flex items-center justify-center p-2">
                                <svg viewBox="0 0 24 24" className="w-8 h-8 text-white">
                                    <rect x="4" y="6" width="4" height="12" fill="currentColor" />
                                    <rect x="10" y="10" width="4" height="6" fill="currentColor" />
                                    <rect x="16" y="4" width="4" height="16" fill="currentColor" />
                                </svg>
                            </div>
                            {theme === 'dark' && <CheckCircle className="absolute -top-2 -right-2 h-5 w-5 text-primary bg-background rounded-full" />}
                        </div>
                        <Label>Dark</Label>
                    </div>
                    
                    {/* Clear Theme Box */}
                    <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => handleClearModeChange(!isClearMode)}>
                        <div
                            className={cn(
                                "relative w-24 h-16 rounded-lg border-2 p-2 flex items-center justify-center transition-all",
                                isClearMode ? 'border-primary ring-2 ring-primary' : 'border-border'
                            )}
                        >
                            <div className="w-full h-full rounded bg-white/10 border border-white/20 flex items-center justify-center p-2" style={{backdropFilter: 'blur(4px)'}}>
                                <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary">
                                    <rect x="4" y="6" width="4" height="12" fill="currentColor" />
                                    <rect x="10" y="10" width="4" height="6" fill="currentColor" />
                                    <rect x="16" y="4" width="4" height="16" fill="currentColor" />
                                </svg>
                            </div>
                            {isClearMode && <CheckCircle className="absolute -top-2 -right-2 h-5 w-5 text-primary bg-background rounded-full" />}
                        </div>
                        <Label>Clear</Label>
                        <span className="text-xs text-muted-foreground">(Liquid Glass)</span>
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
