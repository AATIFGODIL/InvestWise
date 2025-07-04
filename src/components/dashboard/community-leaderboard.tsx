"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart2, UserRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const leaderboard = [
    { rank: 5, name: 'Anon.', icon: <UserRound className="h-5 w-5 text-muted-foreground" /> },
    { rank: 4, name: '', icon: <TrendingUp className="h-5 w-5 text-primary" /> },
    { rank: 6, name: '', icon: <BarChart2 className="h-5 w-5 text-primary" /> },
];

export default function CommunityLeaderboard() {
  const { toast } = useToast();

  const handleButtonClick = () => {
    toast({
      title: "Coming Soon!",
      description: "This feature is currently under development.",
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Community Leaderboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-6 pt-2">
        {leaderboard.map((entry) => (
          <div key={entry.rank} className="flex items-center justify-between">
            <p className="font-semibold text-lg">Rank #{entry.rank}</p>
            <div className="flex items-center gap-2">
                {entry.name && <p className="text-sm text-muted-foreground">{entry.name}</p>}
                {entry.icon}
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="pt-4 px-6">
        <Button onClick={handleButtonClick} className="w-full bg-primary hover:bg-primary/90">View All</Button>
      </CardFooter>
    </Card>
  );
}
