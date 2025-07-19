
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { type Goal } from "@/data/goals";


interface GoalListProps {
    goals: Goal[];
}

export default function GoalList({ goals }: GoalListProps) {
  return (
    <div className="space-y-4">
        <h2 className="text-xl font-bold">Your Goals</h2>
        {goals.map((goal) => (
            <Card key={goal.id}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-secondary flex items-center justify-center">
                                {goal.icon}
                            </div>
                            <div>
                                <CardTitle className="text-lg">{goal.name}</CardTitle>
                                <CardDescription>Target: ${goal.target.toLocaleString()}</CardDescription>
                            </div>
                        </div>
                        <Button variant="secondary" size="sm">Manage</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Progress value={goal.progress} className="h-2" />
                        <div className="flex justify-between text-sm">
                            <p className="font-medium">${goal.current.toLocaleString()} <span className="text-muted-foreground">({goal.progress}%)</span></p>
                            <p className="text-muted-foreground">Remaining: ${(goal.target - goal.current).toLocaleString()}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
  );
}
