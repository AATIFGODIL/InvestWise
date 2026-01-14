// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Loader2 } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { UserData } from "@/types/user";

export type LeaderboardUser = {
  rank: number;
  uid: string;
  name: string;
  photoURL: string;
  gain: number;
};

export default function CommunityLeaderboard() {
  const { user } = useAuth();
  const [topInvestors, setTopInvestors] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopInvestors = async () => {
      setIsLoading(true);
      try {
        const usersRef = collection(db, "users");
        const q = query(
          usersRef,
          where("leaderboardVisibility", "in", ["public", "anonymous"]),
          orderBy("portfolio.summary.totalGainLoss", "desc"),
          limit(3)
        );
        const querySnapshot = await getDocs(q);

        const usersData = querySnapshot.docs.map((doc, index) => {
          const data = doc.data() as UserData;
          const isAnonymous = data.leaderboardVisibility === 'anonymous';
          return {
            rank: index + 1,
            uid: doc.id,
            name: isAnonymous ? 'Anonymous Investor' : data.username || 'Investor',
            photoURL: data.photoURL || '',
            gain: data.portfolio?.summary?.totalGainLoss || 0,
          };
        });

        setTopInvestors(usersData);
      } catch (err) {
        console.error("Failed to fetch top investors:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopInvestors();
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold">Community Leaderboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pt-2 flex-grow">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          topInvestors.map((investor) => {
            const isPositive = investor.gain >= 0;
            const formattedGain = `${isPositive ? '+' : '-'}$${Math.abs(investor.gain).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            const isYou = investor.uid === user?.uid;

            return (
              <div key={investor.rank} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-md w-5">
                    {investor.rank === 1 ? <Crown className="h-5 w-5 text-yellow-500" /> : investor.rank}
                  </span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={investor.photoURL} alt={investor.name} />
                    <AvatarFallback>{investor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium">{isYou ? "You" : investor.name}</p>
                </div>
                <p className={cn("text-sm font-semibold", isPositive ? "text-green-500" : "text-red-500")}>
                  {formattedGain}
                </p>
              </div>
            )
          })
        )}
      </CardContent>
      <CardFooter className="pt-4 px-4">
        <Button asChild className="w-full">
          <Link href="/community">View All</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
