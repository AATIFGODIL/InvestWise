
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown } from "lucide-react";
import { Badge } from "../ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
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

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const usersRef = collection(db, "users");
        const q = query(
          usersRef,
          where("leaderboardVisibility", "in", ["public", "anonymous"]),
          orderBy("portfolio.summary.totalGainLoss", "desc"),
          limit(10)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setLeaderboardData([]);
        } else {
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
          setLeaderboardData(usersData);
        }
      } catch (err: any) {
        console.error(err);
        setError("Could not load leaderboard data. Please check your connection and try again.");
      }
      setIsLoading(false);
    };

    fetchLeaderboard();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Leaderboard</CardTitle>
        <CardDescription>
          See how you stack up against other investors in the community.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full skeleton-shimmer" />
            ))}
          </div>
        ) : error ? (
           <p className="text-destructive text-center">{error}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Rank</TableHead>
                <TableHead>Investor</TableHead>
                <TableHead className="text-right">Total Gain</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((investor) => {
                const isYou = investor.uid === user?.uid;
                const gainFormatted = `${investor.gain >= 0 ? '+' : '-'}$${Math.abs(investor.gain).toFixed(2)}`;
                
                return (
                  <TableRow key={investor.rank} className={cn(isYou && "bg-primary/10")}>
                      <TableCell className={cn("font-bold text-lg", isYou ? "rounded-l-lg" : "")}>
                        <div className="flex items-center gap-2">
                          {investor.rank === 1 ? <Crown className="h-5 w-5 text-yellow-500" /> : <span>{investor.rank}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={investor.photoURL} alt={investor.name} />
                            <AvatarFallback>{investor.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{investor.name}</span>
                          {isYou && <Badge>You</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className={cn("text-right font-medium", isYou ? "rounded-r-lg" : "", investor.gain >= 0 ? 'text-green-500' : 'text-red-500')}>
                          {gainFormatted}
                      </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
