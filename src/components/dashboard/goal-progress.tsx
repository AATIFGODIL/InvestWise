
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { initialGoals } from "@/data/goals";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function GoalProgress() {
  if (!initialGoals || initialGoals.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">Goal Progress</CardTitle>
          <Button asChild variant="link" size="sm" className="text-primary">
            <Link href="/goals">Set a Goal</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground pt-2">
            You don&apos;t have any goals yet. Set one to track your progress!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Goal Progress</CardTitle>
        <Button asChild variant="link" size="sm" className="text-primary">
          <Link href="/goals">View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="flex-grow flex items-center pt-2">
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent>
            {initialGoals.map((goal) => (
              <CarouselItem key={goal.id}>
                 <div className="flex items-center gap-4 pt-2">
                    <div className="flex-grow">
                    <p className="text-sm text-muted-foreground">{goal.name}</p>
                    <p className="text-3xl font-bold">${goal.current.toLocaleString()}</p>
                    <p className="text-sm font-semibold text-muted-foreground">{goal.progress}%</p>
                    <Progress value={goal.progress} className="h-2 mt-2" />
                    </div>
                    <div className="p-3 rounded-lg bg-secondary flex items-center justify-center self-start">
                        <div className="relative h-14 w-12 flex items-center justify-center">
                            {goal.icon}
                        </div>
                    </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-4 hidden sm:flex" />
          <CarouselNext className="-right-4 hidden sm:flex" />
        </Carousel>
      </CardContent>
    </Card>
  );
}
