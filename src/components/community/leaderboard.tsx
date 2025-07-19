
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
import { Crown, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "../ui/badge";
import { type LeaderboardVisibility } from "@/app/community/page";
import { rawLeaderboardData } from "@/data/leaderboard";

interface LeaderboardProps {
    visibility: LeaderboardVisibility;
}

export default function Leaderboard({ visibility }: LeaderboardProps) {
    const leaderboardData = visibility === 'hidden'
    ? rawLeaderboardData.filter(investor => !investor.isYou)
    : rawLeaderboardData;
    
  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Leaderboard</CardTitle>
        <CardDescription>
          See how you stack up against other investors in the community.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              const displayName = (investor.isYou && visibility === 'anonymous') ? "Anonymous" : investor.name;
              
              return (
                <TableRow key={investor.rank} className={investor.isYou ? "bg-accent" : ""}>
                    <TableCell className="font-bold text-lg">
                    <div className="flex items-center gap-2">
                        {investor.rank === 1 ? <Crown className="h-5 w-5 text-yellow-500" /> : <span>{investor.rank}</span>}
                        {investor.change > 0 && <ArrowUp className="h-4 w-4 text-green-500" />}
                        {investor.change < 0 && <ArrowDown className="h-4 w-4 text-red-500" />}
                    </div>
                    </TableCell>
                    <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar>
                        <AvatarImage src={investor.avatar} alt={displayName} />
                        <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{displayName}</span>
                        {investor.isYou && <Badge>You</Badge>}
                    </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-500">
                    {investor.gain}
                    </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
