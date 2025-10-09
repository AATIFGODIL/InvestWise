
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
import { Switch } from "@/components/ui/switch";
import { Sun, Sparkles, TrendingUp } from "lucide-react";
import ColorPicker from "@/components/settings/color-picker";
import { useThemeStore } from "@/store/theme-store";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const SampleUICard = () => {
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm">Sample Stock</h4>
                    <span className="text-xs font-mono p-1 rounded bg-muted">AAPL</span>
                </div>
                {/* Simplified Chart */}
                <div className="h-16 w-full relative">
                    <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                        <path d="M0,25 C10,15 20,30 30,20 S50,5 60,15 S80,35 90,25 S100,20 100,20" stroke="hsl(var(--primary))" fill="none" strokeWidth="2" />
                    </svg>
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/10 to-transparent" />
                </div>
                 <div className="flex gap-2">
                    <Button size="sm" className="w-full">Buy</Button>
                    <Button size="sm" variant="outline" className="w-full">Sell</Button>
                </div>
            </CardContent>
        </Card>
    )
}

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
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Customize Your Theme</CardTitle>
          <CardDescription>
            Personalize the look and feel of your app. You can change this later in settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {!isClient ? (
                <div className="space-y-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : (
                <>
                    <SampleUICard />
                    <div className="space-y-4 pt-4">
                         <ColorPicker />
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <Label htmlFor="theme-switch" className="font-medium flex items-center gap-2">
                                <Sun className="h-4 w-4" />
                                App Theme
                            </Label>
                            <div className="flex items-center gap-2">
                                <span className={theme === 'light' ? '' : 'text-muted-foreground'}>Light</span>
                                <Switch
                                    id="theme-switch"
                                    checked={theme === "dark"}
                                    onCheckedChange={(checked) => handleThemeChange(checked ? 'dark' : 'light')}
                                />
                                 <span className={theme === 'dark' ? '' : 'text-muted-foreground'}>Dark</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <Label htmlFor="clear-mode-switch" className="font-medium flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                Clear Mode
                            </Label>
                            <Switch
                                id="clear-mode-switch"
                                checked={isClearMode}
                                onCheckedChange={handleClearModeChange}
                            />
                        </div>
                    </div>
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
