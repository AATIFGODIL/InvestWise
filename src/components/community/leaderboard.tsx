
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
import { type LeaderboardVisibility } from "@/store/privacy-store";
import useUserStore from "@/store/user-store";
import usePortfolioStore from "@/store/portfolio-store";

interface LeaderboardProps {
    visibility: LeaderboardVisibility;
}

const mockInvestors = [
  { rank: 1, name: "CryptoKing", avatar: "", change: 0, gain: 5210.55, isUp: true },
  { rank: 2, name: "StockSurfer", avatar: "", change: 1, gain: 4890.12, isUp: true },
  { rank: 4, name: "ETF_Master", avatar: "", change: 0, gain: 4200.00, isUp: true },
  { rank: 5, name: "FutureFund", avatar: "", change: 2, gain: 3987.43, isUp: true },
  { rank: 6, name: 'InvestorPro', avatar: '', change: 0, gain: 3800.00, isUp: true },
];

export default function Leaderboard({ visibility }: LeaderboardProps) {
    const { username, profilePic } = useUserStore();
    const { portfolioSummary } = usePortfolioStore();

    const currentUserData = {
        name: username,
        avatar: profilePic,
        gain: portfolioSummary.totalGainLoss,
        isYou: true,
        change: 0, // change calculation can be added if historical rank is stored
    };

    const combinedData = [...mockInvestors.map(u => ({...u, isYou: false})), currentUserData]
        .sort((a, b) => b.gain - a.gain)
        .map((user, index) => ({...user, rank: index + 1}));

    const leaderboardData = visibility === 'hidden'
    ? combinedData.filter(investor => !investor.isYou)
    : combinedData;

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
              const displayName = (investor.isYou && visibility === 'anonymous') ? "Anonymous (You)" : (investor.isYou ? investor.name : investor.name);
              const gainFormatted = `${investor.gain >= 0 ? '+' : '-'}$${Math.abs(investor.gain).toFixed(2)}`;
              
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
                    <TableCell className={`text-right font-medium ${investor.gain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {gainFormatted}
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
