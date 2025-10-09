
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
import { Sun } from "lucide-react";
import ColorPicker from "@/components/settings/color-picker";
import { useThemeStore } from "@/store/theme-store";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

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
        <CardContent className="space-y-6">
            {!isClient ? (
                <div className="space-y-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : (
                <>
                    <ColorPicker />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                            <Label htmlFor="theme-switch" className="font-medium flex items-center gap-2">
                                <Sun className="h-4 w-4" />
                                Theme
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
                        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                            <Label htmlFor="clear-mode-switch" className="font-medium">
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
