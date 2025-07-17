
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
import { Shield, Users } from "lucide-react";

export default function OnboardingLeaderboardPage() {
  const router = useRouter();
  const [selection, setSelection] = useState<"anonymous" | "public" | null>(null);

  const handleContinue = () => {
    // Here you would typically save the user's preference
    console.log("Leaderboard preference:", selection);
    router.push("/onboarding/welcome");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Community Visibility</CardTitle>
          <CardDescription>
            Would you like your rank to appear on the community leaderboard? Your
            name will always be anonymous.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Card
            className={`cursor-pointer ${selection === 'public' ? 'border-primary ring-2 ring-primary' : ''}`}
            onClick={() => setSelection('public')}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center gap-2">
              <Users className="h-10 w-10 text-primary" />
              <p className="font-semibold">Yes, show my rank</p>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer ${selection === 'anonymous' ? 'border-primary ring-2 ring-primary' : ''}`}
            onClick={() => setSelection('anonymous')}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center gap-2">
              <Shield className="h-10 w-10 text-muted-foreground" />
              <p className="font-semibold">Keep me anonymous</p>
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
