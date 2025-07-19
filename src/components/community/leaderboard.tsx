
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

const rawLeaderboardData = [
  { rank: 1, name: "CryptoKing", avatar: "https://i.pravatar.cc/150?u=a1", change: 0, gain: "+$5,210.55", isUp: true, isYou: false },
  { rank: 2, name: "StockSurfer", avatar: "https://i.pravatar.cc/150?u=a2", change: 1, gain: "+$4,890.12", isUp: true, isYou: false },
  { rank: 3, name: "You", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d", change: -1, gain: "+$4,501.78", isUp: false, isYou: true },
  { rank: 4, name: "ETF_Master", avatar: "https://i.pravatar.cc/150?u=a4", change: 0, gain: "+$4,200.00", isUp: true, isYou: false },
  { rank: 5, name: "FutureFund", avatar: "https://i.pravatar.cc/150?u=a5", change: 2, gain: "+$3,987.43", isUp: true, isYou: false },
];

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
