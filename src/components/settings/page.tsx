
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
import { RgbaColor, RgbaColorPicker } from "react-colorful";
import { useDebounce } from "@/hooks/use-debounce";


// --- Helper Functions for Color Management ---

function hexToRgba(hex: string): RgbaColor {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
            a: 1,
        }
        : { r: 0, g: 0, b: 0, a: 1 };
}

function rgbaToHex(rgba: RgbaColor): string {
    const toHex = (c: number) => c.toString(16).padStart(2, '0').toUpperCase();
    return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`;
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
    // Use a lower threshold to allow more bright colors to have dark text
    const newForeground = luminance > 0.4 ? '222.2 84% 4.9%' : '210 40% 98%';
    document.documentElement.style.setProperty('--primary-foreground', newForeground);
}


// --- ColorPicker Component ---

function ColorPicker() {
    const { primaryColor: storedPrimaryColor, setPrimaryColor } = useThemeStore();
    
    const [color, setColor] = useState<RgbaColor>(hexToRgba(storedPrimaryColor));
    const [hexValue, setHexValue] = useState(storedPrimaryColor);
    
    const { updateUserTheme } = useAuth();
    const debouncedColor = useDebounce(color, 200);

    // Effect to sync picker if the global store changes from another source
    useEffect(() => {
        const newRgba = hexToRgba(storedPrimaryColor);
        setColor(newRgba);
        setHexValue(storedPrimaryColor);
    }, [storedPrimaryColor]);

    const handleColorChange = (newColor: RgbaColor) => {
        setColor(newColor);
        setHexValue(rgbaToHex(newColor));
    };

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHex = `#${e.target.value.replace('#', '')}`;
        setHexValue(newHex);
        const newRgba = hexToRgba(newHex);
        if (newRgba.r !== undefined) {
            setColor(newRgba);
        }
    };
    
    useEffect(() => {
        const hexColor = rgbaToHex(debouncedColor);
        
        setPrimaryColor(hexColor);
        
        const h = debouncedColor.r, s = debouncedColor.g, l = debouncedColor.b;
        document.documentElement.style.setProperty('--primary', `${h} ${s}% ${l}%`);

        setForegroundForContrast(hexColor);
        
        updateUserTheme({ primaryColor: hexColor }); 
    }, [debouncedColor, updateUserTheme, setPrimaryColor]);

    return (
        <div className="flex flex-col items-center gap-4">
            <RgbaColorPicker color={color} onChange={handleColorChange} className="!w-full" />
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="hex-color">Primary Color (HEX)</Label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">#</span>
                    <Input
                        id="hex-color"
                        value={hexValue.replace('#', '')}
                        onChange={handleHexChange}
                        className={cn("pl-7 font-mono", hexToRgba(hexValue).r === undefined && "border-destructive")}
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
      <main className="container mx-auto p-4 space-y-8 pb-24 relative max-w-4xl">
        <Button variant="ghost" size="icon" className="absolute top-4 left-4" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        
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
  );
}
