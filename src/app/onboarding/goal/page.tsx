
"use client";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";

export default function OnboardingGoalPage() {
  const router = useRouter();

  const handleContinue = () => {
    router.push("/onboarding/welcome");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set Your First Goal</CardTitle>
          <CardDescription>
            Having a goal can make investing more meaningful. What are you
            saving for?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal-name">Goal Name</Label>
            <Input id="goal-name" placeholder="e.g., New Laptop, Vacation" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal-amount">Target Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="goal-amount"
                type="number"
                placeholder="5000"
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={handleContinue}>Skip for now</Button>
          <Button onClick={handleContinue}>Set Goal</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
