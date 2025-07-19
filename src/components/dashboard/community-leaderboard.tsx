
"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { rawLeaderboardData } from "@/data/leaderboard";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function CommunityLeaderboard() {
  const topInvestors = rawLeaderboardData.slice(0, 3);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Community Leaderboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-6 pt-2">
        {topInvestors.map((investor) => (
          <div key={investor.rank} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-lg w-5">
                {investor.rank === 1 ? <Crown className="h-5 w-5 text-yellow-500" /> : investor.rank}
              </span>
              <Avatar className="h-8 w-8">
                <AvatarImage src={investor.avatar} alt={investor.name} />
                <AvatarFallback>{investor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium">{investor.name}</p>
            </div>
            <p className="text-sm font-semibold text-green-500">{investor.gain}</p>
          </div>
        ))}
      </CardContent>
      <CardFooter className="pt-4 px-6">
        <Button asChild className="w-full bg-primary hover:bg-primary/90">
            <Link href="/community">View All</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
