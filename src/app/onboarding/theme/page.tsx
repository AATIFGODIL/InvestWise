
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useThemeStore } from "@/store/theme-store";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Sparkles, TrendingUp } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { useDebounce } from "@/hooks/use-debounce";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// --- Helper Functions for Color Management ---

function hexToRgba(hex: string): { r: number, g: number, b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : { r: 0, g: 0, b: 0 }; // Return black on failure
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


// --- ColorPicker Component ---

function ColorPicker() {
    const { primaryColor: storedPrimaryColor, setPrimaryColor } = useThemeStore();
    
    // Initialize state from the store's value
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
        // Update the global theme store
        setPrimaryColor(debouncedColor);
        
        // Update CSS variables for immediate visual feedback
        const hslString = hexToHslString(debouncedColor);
        document.documentElement.style.setProperty('--primary', hslString);

        // Update foreground for contrast
        setForegroundForContrast(debouncedColor);
        
        // Persist to Firestore via the auth hook
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
    <div className="flex flex-col items-center text-center">
        <button
            onClick={onClick}
            className={cn(
            "h-24 w-24 rounded-lg p-2 transition-all duration-200 flex items-center justify-center",
            isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "ring-1 ring-border"
            )}
        >
            <div
            className={cn(
                "flex h-full w-full items-center justify-center rounded-md",
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
        <p className="mt-2 text-sm font-medium">{label}</p>
        {label === 'Clear' && <p className="text-xs text-muted-foreground">(Liquid Glass)</p>}
    </div>
  );
};


// --- Main Page Component ---

export default function OnboardingThemePage() {
  const router = useRouter();
  const { theme, setTheme, isClearMode, setClearMode } = useThemeStore();
  const { updateUserTheme } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
  };

  const handleClearModeToggle = () => {
    setClearMode(!isClearMode);
  };
  
  const handleContinue = () => {
    updateUserTheme({ theme, isClearMode });
    router.push("/onboarding/goal");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/>Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of the app. You can change this later in settings.
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
        <CardFooter>
          <Button onClick={handleContinue} className="w-full">
            Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
