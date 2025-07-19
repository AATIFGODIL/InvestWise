
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { initialGoals } from "@/data/goals.tsx";

export default function GoalProgress() {
  const firstGoal = initialGoals[0];

  if (!firstGoal) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Goal Progress</CardTitle>
                 <Button asChild variant="link" size="sm" className="text-primary">
                    <Link href="/goals">Set a Goal</Link>
                </Button>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground pt-2">You don't have any goals yet. Set one to track your progress!</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Goal Progress</CardTitle>
        <Button asChild variant="link" size="sm" className="text-primary">
            <Link href="/goals">View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="flex items-center gap-4 pt-2">
        <div className="flex-grow">
          <p className="text-sm text-muted-foreground">{firstGoal.name}</p>
          <p className="text-3xl font-bold">${firstGoal.current.toLocaleString()}</p>
          <p className="text-sm font-semibold text-muted-foreground">{firstGoal.progress}%</p>
          <Progress value={firstGoal.progress} className="h-2 mt-2" />
        </div>
        <div className="p-3 rounded-lg bg-secondary flex items-center justify-center self-start">
            <div className="relative h-14 w-12 flex items-center justify-center">
                {firstGoal.icon}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
