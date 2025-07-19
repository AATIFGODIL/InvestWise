
"use client";

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
import { useToast } from "@/hooks/use-toast";

export default function CreateGoal() {
  const { toast } = useToast();

  const handleSetGoal = () => {
    toast({
      title: "Goal Set!",
      description: "Your new goal has been added to your list.",
    });
  };

  return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create a New Goal</CardTitle>
          <CardDescription>
            What new financial milestone do you want to achieve?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal-name">Goal Name</Label>
            <Input id="goal-name" placeholder="e.g., Dream Vacation, Down Payment" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal-amount">Target Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="goal-amount"
                type="number"
                placeholder="10000"
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSetGoal} className="w-full">Set New Goal</Button>
        </CardFooter>
      </Card>
  );
}
