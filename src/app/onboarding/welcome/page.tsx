
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PartyPopper } from "lucide-react";

export default function OnboardingWelcomePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 5000); // Redirect after 5 seconds

    return () => clearTimeout(timer);
  }, [router]);

  const handleContinue = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-4 w-fit">
            <PartyPopper className="h-10 w-10" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardTitle className="text-3xl">Welcome to InvestWise!</CardTitle>
          <p className="text-muted-foreground">
            You're all set up. Let's start your investment journey together.
          </p>
          <Button onClick={handleContinue} className="w-full">
            Go to Dashboard
          </Button>
          <p className="text-xs text-muted-foreground">
            You will be redirected automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
