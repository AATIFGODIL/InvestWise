
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Laptop, Car, Plane } from "lucide-react";

const goals = [
    { 
        name: "New Laptop", 
        icon: <Laptop className="h-8 w-8 text-primary"/>,
        current: 3200, 
        target: 5000,
        progress: 64 
    },
    { 
        name: "First Car", 
        icon: <Car className="h-8 w-8 text-primary"/>,
        current: 8000, 
        target: 20000,
        progress: 40 
    },
    { 
        name: "Trip to Japan", 
        icon: <Plane className="h-8 w-8 text-primary"/>,
        current: 1500, 
        target: 12000,
        progress: 12.5
    },
];

export default function GoalList() {
  return (
    <div className="space-y-4">
        <h2 className="text-xl font-bold">Your Goals</h2>
        {goals.map((goal) => (
            <Card key={goal.name}>
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
