
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown, Loader2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { getLeaderboardData, type LeaderboardUser } from "@/app/actions";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      const result = await getLeaderboardData();
      if (result.success && result.data) {
        setLeaderboardData(result.data);
      } else {
        setError(result.error || "Could not load leaderboard.");
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
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                  <TableRow key={investor.rank} className={cn(isYou ? "bg-primary/10" : "")}>
                      <TableCell className={cn("font-bold text-lg", isYou ? "rounded-l-lg" : "")}>
                        <div className="flex items-center gap-2">
                          {investor.rank === 1 ? <Crown className="h-5 w-5 text-yellow-500" /> : <span>{investor.rank}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
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
