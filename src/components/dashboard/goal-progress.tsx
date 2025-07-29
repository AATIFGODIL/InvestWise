
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import useGoalStore from "@/store/goal-store";
import { Target } from "lucide-react";

export default function GoalProgress() {
  const { goals } = useGoalStore();

  if (goals.length === 0) {
    return (
      <Card className="h-full flex flex-col justify-between">
        <CardHeader>
          <CardTitle className="text-base font-medium">Set a Financial Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            <Target className="h-8 w-8 mx-auto mb-2 text-primary/30" />
            <p className="text-sm">
              Setting goals helps you stay motivated.
            </p>
          </div>
        </CardContent>
        <CardFooter>
            <Button asChild className="w-full">
              <Link href="/goals">Create a Goal</Link>
            </Button>
        </CardFooter>
      </Card>
    );
  }
  
  const goal = goals[0];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Goal Progress</CardTitle>
        <Button asChild variant="link" size="sm" className="text-primary px-0">
          <Link href="/goals">View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="flex-grow flex items-center pt-2">
        <div className="w-full">
            <div className="flex items-center gap-2 pt-2">
                <div className="flex-grow">
                  <p className="text-sm text-muted-foreground">{goal.name}</p>
                  <p className="text-xl font-bold">${goal.current.toLocaleString()}</p>
                  <p className="text-xs font-semibold text-muted-foreground">{goal.progress}% to target</p>
                  <Progress value={goal.progress} className="h-2 mt-2" />
                </div>
                <div className="p-2 rounded-lg bg-secondary flex items-center justify-center self-start">
                    <div className="relative h-8 w-6 flex items-center justify-center">
                        {goal.icon}
                    </div>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
