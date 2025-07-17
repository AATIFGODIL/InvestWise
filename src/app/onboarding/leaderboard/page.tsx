
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
import { Shield, Users, EyeOff } from "lucide-react";

export default function OnboardingLeaderboardPage() {
  const router = useRouter();
  const [selection, setSelection] = useState<"public" | "private" | null>(null);

  const handleContinue = () => {
    // Here you would typically save the user's preference
    console.log("Leaderboard preference:", selection);
    router.push("/onboarding/welcome");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle>Community Leaderboard</CardTitle>
          <CardDescription>
            Choose how you appear in the community. You can change this later in your settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            className={`cursor-pointer ${selection === 'public' ? 'border-primary ring-2 ring-primary' : ''}`}
            onClick={() => setSelection('public')}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center gap-2">
              <Users className="h-10 w-10 text-primary" />
              <p className="font-semibold">Show my rank (anonymously)</p>
              <p className="text-xs text-muted-foreground">Your performance will be visible, but your identity will be hidden.</p>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer ${selection === 'private' ? 'border-primary ring-2 ring-primary' : ''}`}
            onClick={() => setSelection('private')}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center gap-2">
              <EyeOff className="h-10 w-10 text-muted-foreground" />
              <p className="font-semibold">Opt out of leaderboard</p>
              <p className="text-xs text-muted-foreground">You will not appear on the leaderboard in any form.</p>
            </CardContent>
          </Card>
        </CardContent>
        <CardFooter>
          <Button onClick={handleContinue} className="w-full" disabled={!selection}>
            Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
