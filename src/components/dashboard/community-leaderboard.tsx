
"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { usePortfolioStore } from "@/store/portfolio-store";
import { useUserStore } from "@/store/user-store";
import { cn } from "@/lib/utils";


export default function CommunityLeaderboard() {
  const { portfolioSummary } = usePortfolioStore();
  const { username } = useUserStore();

  const currentUserData = {
    name: username,
    gain: portfolioSummary.totalGainLoss,
    isYou: true,
  };

  // The leaderboard now only contains the current user.
  const leaderboardData = [currentUserData]
    .sort((a, b) => b.gain - a.gain)
    .map((user, index) => ({...user, rank: index + 1}));

  const topInvestors = leaderboardData.slice(0, 3);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Community Leaderboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pt-2 flex-grow">
        {topInvestors.map((investor) => {
          const isPositive = investor.gain >= 0;
          const formattedGain = `${isPositive ? '+' : '-'}$${Math.abs(investor.gain).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

          return (
            <div key={investor.rank} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-md w-5">
                  {investor.rank === 1 ? <Crown className="h-5 w-5 text-yellow-500" /> : investor.rank}
                </span>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{investor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium">{investor.isYou ? "You" : investor.name}</p>
              </div>
              <p className={cn("text-sm font-semibold", isPositive ? "text-green-500" : "text-red-500")}>
                {formattedGain}
              </p>
            </div>
          )
        })}
      </CardContent>
      <CardFooter className="pt-4 px-4">
        <Button asChild className="w-full">
            <Link href="/community">View All</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
