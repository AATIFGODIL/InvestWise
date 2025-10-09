
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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import ColorPicker from "@/components/settings/color-picker";
import { useThemeStore } from "@/store/theme-store";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { TrendingUp, Sun, Moon, Sparkles } from "lucide-react";

interface ThemeCardProps {
  label: string;
  themeType: "light" | "dark";
  isClear?: boolean;
  isSelected: boolean;
  onClick: () => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({ label, themeType, isClear = false, isSelected, onClick }) => {
  return (
    <div className="text-center">
      <button
        onClick={onClick}
        className={cn(
          "w-full h-20 rounded-lg p-2 transition-all duration-200",
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
    updateUserTheme({ theme: newTheme });
  };

  const handleClearModeChange = (isClear: boolean) => {
    setClearMode(isClear);
    updateUserTheme({ isClearMode: isClear });
  };
  
  const handleContinue = () => {
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
                    <div className="grid grid-cols-3 gap-4">
                        <ThemeCard
                            label="Light"
                            themeType="light"
                            isSelected={theme === 'light' && !isClearMode}
                            onClick={() => { handleThemeChange('light'); handleClearModeChange(false); }}
                        />
                        <ThemeCard
                            label="Dark"
                            themeType="dark"
                            isSelected={theme === 'dark' && !isClearMode}
                             onClick={() => { handleThemeChange('dark'); handleClearModeChange(false); }}
                        />
                        <ThemeCard
                            label="Clear"
                            themeType={theme}
                            isClear={true}
                            isSelected={isClearMode}
                             onClick={() => handleClearModeChange(true)}
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
