
"use client";

import { useState } from "react";
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
import { Users, UserCheck, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { LeaderboardVisibility } from "@/store/privacy-store";

export default function OnboardingLeaderboardPage() {
  const router = useRouter();
  const { updatePrivacySettings } = useAuth();
  const { toast } = useToast();
  const [selection, setSelection] = useState<LeaderboardVisibility | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigate = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selection) return;

    setIsLoading(true);
    try {
      await updatePrivacySettings({ leaderboardVisibility: selection });
      router.push("/onboarding/welcome");
    } catch (error) {
      console.error("Failed to save preference:", error);
      toast({
        variant: "destructive",
        title: "Oh no!",
        description: "Could not save your preference. Please try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <CardTitle>Community Leaderboard</CardTitle>
          <CardDescription>
            Choose how you appear in the community. You can change this later in your settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            className={`cursor-pointer ${selection === 'public' ? 'border-primary ring-2 ring-primary' : ''}`}
            onClick={() => setSelection('public')}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center gap-2 h-full">
              <Users className="h-10 w-10 text-primary" />
              <p className="font-semibold">Public</p>
              <p className="text-xs text-muted-foreground">Show my rank and username.</p>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer ${selection === 'anonymous' ? 'border-primary ring-2 ring-primary' : ''}`}
            onClick={() => setSelection('anonymous')}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center gap-2 h-full">
              <UserCheck className="h-10 w-10 text-muted-foreground" />
              <p className="font-semibold">Anonymous</p>
              <p className="text-xs text-muted-foreground">Show my rank, but hide my username.</p>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer ${selection === 'hidden' ? 'border-primary ring-2 ring-primary' : ''}`}
            onClick={() => setSelection('hidden')}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center gap-2 h-full">
              <EyeOff className="h-10 w-10 text-muted-foreground" />
              <p className="font-semibold">Hidden</p>
              <p className="text-xs text-muted-foreground">Don't show me on the leaderboard at all.</p>
            </CardContent>
          </Card>
        </CardContent>
        <CardFooter>
          <Button onClick={handleNavigate} className="w-full" disabled={!selection || isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
