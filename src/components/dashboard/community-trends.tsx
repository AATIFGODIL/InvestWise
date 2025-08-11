import Link from "next/link";
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
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ExternalLink } from "lucide-react";
import { Button } from "../ui/button";

const trends = [
  { name: "S&P 500 ETF", symbol: "SPY", category: "ETF", popularity: 92 },
  { name: "Tech Bundle", symbol: "AAPL", category: "Bundle", popularity: 85 },
  { name: "NVIDIA Corp.", symbol: "NVDA", category: "Stock", popularity: 82 },
  { name: "Apple Inc.", symbol: "AAPL", category: "Stock", popularity: 78 },
  { name: "Microsoft Corp.", symbol: "MSFT", category: "Stock", popularity: 75 },
  { name: "Green Energy", symbol: "NEE", category: "Bundle", popularity: 65 },
  { name: "Amazon.com, Inc.", symbol: "AMZN", category: "Stock", popularity: 62 },
];

export default function CommunityTrends() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Community Trends
        </CardTitle>
        <CardDescription>
          Popular investments among investors aged 18-30. Click an asset to trade.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-grow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead className="text-right">Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trends.map((trend) => (
              <TableRow key={trend.name} className="group hover:bg-muted/50">
                <TableCell className="font-medium p-0">
                  <Link href={`/trade?symbol=${trend.symbol}`} className="flex items-center justify-between p-4 w-full h-full">
                    <span>{trend.name}</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground invisible group-hover:visible" />
                  </Link>
                </TableCell>
                <TableCell className="text-right p-0">
                   <Link href={`/trade?symbol=${trend.symbol}`} className="flex items-center justify-end p-4 w-full h-full">
                    <Badge variant="outline">{trend.category}</Badge>
                   </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <div className="p-4 mt-auto">
        <Button asChild variant="outline" className="w-full">
            <Link href="/community?tab=trends">
                View All Trends
            </Link>
        </Button>
      </div>
    </Card>
  );
}
