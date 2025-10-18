
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
import { Shield, Sun, Eye, ShieldBan, FileUp, ArrowLeft, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useThemeStore } from "@/store/theme-store";
import { useAuth } from "@/hooks/use-auth";
import { usePrivacyStore, type LeaderboardVisibility } from "@/store/privacy-store";
import PaymentMethods from "@/components/profile/payment-methods";
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { cn } from "@/lib/utils";
import { HexColorPicker } from "react-colorful";
import { useDebounce } from "@/hooks/use-debounce";


// --- Helper Functions for Color Management ---

function hexToRgba(hex: string): { r: number, g: number, b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : { r: 0, g: 0, b: 0 };
}

function getLuminance(hex: string): number {
    const { r, g, b } = hexToRgba(hex);
    const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function setForegroundForContrast(hex: string) {
    if (typeof window === 'undefined') return;
    const luminance = getLuminance(hex);
    // Use a higher threshold to allow more bright colors to have white text
    const newForeground = luminance > 0.6 ? '222.2 84% 4.9%' : '210 40% 98%';
    document.documentElement.style.setProperty('--primary-foreground', newForeground);
}


function hexToHslString(hex: string): string {
    const { r, g, b } = hexToRgba(hex);
    const r_norm = r / 255;
    const g_norm = g / 255;
    const b_norm = b / 255;

    const max = Math.max(r_norm, g_norm, b_norm);
    const min = Math.min(r_norm, g_norm, b_norm);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r_norm: h = (g_norm - b_norm) / d + (g_norm < b_norm ? 6 : 0); break;
            case g_norm: h = (b_norm - r_norm) / d + 2; break;
            case b_norm: h = (r_norm - g_norm) / d + 4; break;
        }
        h /= 6;
    }

    const hue = Math.round(h * 360);
    const saturation = Math.round(s * 100);
    const lightness = Math.round(l * 100);
    return `${hue} ${saturation}% ${lightness}%`;
}


// --- ColorPicker Component ---

function ColorPicker() {
    const { primaryColor: storedPrimaryColor, setPrimaryColor } = useThemeStore();
    
    const [color, setColor] = useState(storedPrimaryColor);
    
    const { updateUserTheme } = useAuth();
    const debouncedColor = useDebounce(color, 200);

    // Effect to sync picker if the global store changes from another source
    useEffect(() => {
        setColor(storedPrimaryColor);
    }, [storedPrimaryColor]);

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHex = `#${e.target.value.replace('#', '')}`;
        setColor(newHex);
    };
    
    useEffect(() => {
        setPrimaryColor(debouncedColor);
        
        const hslString = hexToHslString(debouncedColor);
        document.documentElement.style.setProperty('--primary', hslString);

        setForegroundForContrast(debouncedColor);
        
        updateUserTheme({ primaryColor: debouncedColor }); 
    }, [debouncedColor, updateUserTheme, setPrimaryColor]);

    return (
        <div className="flex flex-col items-center gap-4">
            <HexColorPicker color={color} onChange={setColor} className="!w-full" />
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="hex-color">Primary Color (HEX)</Label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">#</span>
                    <Input
                        id="hex-color"
                        value={color.replace('#', '')}
                        onChange={handleHexChange}
                        className={cn("pl-7 font-mono", !/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.test(color) && "border-destructive")}
                    />
                </div>
                 <p className="text-xs text-muted-foreground text-center">Default color is #775DEF</p>
            </div>
        </div>
    )
}

// --- ThemeCard Component ---

interface ThemeCardProps {
  label: string;
  themeType: "light" | "dark";
  isClear?: boolean;
  isSelected: boolean;
  onClick: () => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({ label, themeType, isClear = false, isSelected, onClick }) => {
  return (
    <div className="text-center flex flex-col items-center">
      <button
        onClick={onClick}
        className={cn(
          "h-24 w-24 rounded-lg p-2 transition-all duration-200 flex items-center justify-center",
          isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "ring-1 ring-border"
        )}
      >
        <div
          className={cn(
            "w-full h-full rounded-md flex items-center justify-center",
            themeType === 'light' && !isClear && "bg-white",
            themeType === 'dark' && !isClear && "bg-gray-800",
            isClear && "bg-gray-700/50 backdrop-blur-sm"
          )}
        >
          <TrendingUp className={cn(
            "h-8 w-8",
             (themeType === 'dark' && !isClear) || (isClear && themeType === 'light') ? "text-white" : "",
             themeType === 'light' && !isClear ? "text-gray-800" : "",
             isClear && themeType === 'dark' ? "text-primary" : ""
          )} />
        </div>
      </button>
      <p className="text-sm font-medium mt-2">{label}</p>
      {label === 'Clear' && <p className="text-xs text-muted-foreground">(Liquid Glass)</p>}
    </div>
  );
};

// --- Main Settings Component ---

export default function SettingsClient() {
  const router = useRouter();
  const [parentalControl, setParentalControl] = useState(false);
  const { theme, setTheme, isClearMode, setClearMode, primaryColor } = useThemeStore();
  const { leaderboardVisibility, setLeaderboardVisibility, showQuests, setShowQuests } = usePrivacyStore();
  const { user, updateUserTheme, updatePrivacySettings } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const isLightClear = isClearMode && theme === 'light';

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    updateUserTheme({ theme: newTheme });
  };

  const handleClearModeToggle = () => {
    const newClearMode = !isClearMode;
    setClearMode(newClearMode);
    updateUserTheme({ isClearMode: newClearMode });
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
      <div className="relative">
        <div className="fixed top-4 left-4 z-40">
             <button
                onClick={() => router.back()}
                className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-colors shimmer-bg",
                    isClearMode
                        ? isLightClear
                            ? "bg-card/60 text-foreground ring-1 ring-white/20"
                            : "bg-white/10 text-slate-100 ring-1 ring-white/60"
                        : "bg-background text-foreground ring-1 ring-border"
                )}
                style={{ backdropFilter: isClearMode ? "blur(2px)" : "none" }}
                >
                <ArrowLeft className="h-6 w-6" />
            </button>
        </div>
        
        <main className="container mx-auto p-4 space-y-8 pb-24 max-w-4xl">
            {user && <PaymentMethods userId={user.uid} />}

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

            <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sun className="text-primary"/>Appearance</CardTitle>
                <CardDescription>
                Customize the look and feel of the app.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {!isClient ? (
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                ) : (
                    <>
                    <div className="grid grid-cols-3 gap-4 justify-items-center">
                            <ThemeCard
                                label="Light"
                                themeType="light"
                                isSelected={theme === 'light'}
                                onClick={() => handleThemeChange('light')}
                            />
                            <ThemeCard
                                label="Dark"
                                themeType="dark"
                                isSelected={theme === 'dark'}
                                onClick={() => handleThemeChange('dark')}
                            />
                            <ThemeCard
                                label="Clear"
                                themeType={theme}
                                isClear={true}
                                isSelected={isClearMode}
                                onClick={handleClearModeToggle}
                            />
                        </div>
                        <ColorPicker />
                    </>
                )}
            </CardContent>
            </Card>

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
      </div>
  );
}
