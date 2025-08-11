
"use client";

import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { type Bundle } from "@/data/bundles";

const trends = [
  { name: "S&P 500 ETF", symbol: "SPY", category: "ETF", popularity: 92 },
  { 
    name: "Tech Bundle", 
    category: "Bundle", 
    popularity: 85,
    description: "Invest in leading tech companies with this diversified bundle. Ideal for growth-oriented beginners.",
    stocks: [
      { name: "Apple Inc.", symbol: "AAPL" },
      { name: "Microsoft Corp.", symbol: "MSFT" },
      { name: "Alphabet Inc.", symbol: "GOOGL" },
      { name: "Amazon.com, Inc.", symbol: "AMZN" },
      { name: "NVIDIA Corp.", symbol: "NVDA" },
      { name: "Tesla, Inc.", symbol: "TSLA" },
    ]
  },
  { name: "NVIDIA Corp.", symbol: "NVDA", category: "Stock", popularity: 82 },
  { name: "Apple Inc.", symbol: "AAPL", category: "Stock", popularity: 78 },
  { name: "Microsoft Corp.", symbol: "MSFT", category: "Stock", popularity: 75 },
  { 
    name: "Green Energy", 
    category: "Bundle", 
    popularity: 65,
    description: "Support a sustainable future by investing in renewable energy and clean technology companies.",
    stocks: [
      { name: "NextEra Energy", symbol: "NEE" },
      { name: "SolarEdge Tech", symbol: "SEDG" },
      { name: "Enphase Energy", symbol: "ENPH" },
    ]
  },
  { name: "Amazon.com, Inc.", symbol: "AMZN", category: "Stock", popularity: 62 },
];

export default function CommunityTrends() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<(typeof trends[number] & {category: 'Bundle'}) | null>(null);

  const handleTrendClick = (trend: typeof trends[number]) => {
    if (trend.category === 'Bundle') {
      setSelectedBundle(trend as typeof trends[number] & {category: 'Bundle'});
      setIsDialogOpen(true);
    }
  };

  const renderTrendRow = (trend: typeof trends[number]) => {
    if (trend.category === "Bundle") {
      return (
        <TableRow key={trend.name} className="group hover:bg-muted/50 cursor-pointer" onClick={() => handleTrendClick(trend)}>
          <TableCell className="font-medium">
            <div className="flex items-center justify-between w-full h-full">
              <span>{trend.name}</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground invisible group-hover:visible" />
            </div>
          </TableCell>
          <TableCell className="text-right">
            <div className="flex items-center justify-end w-full h-full">
              <Badge variant="outline">{trend.category}</Badge>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return (
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
    );
  };

  return (
    <>
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
              {trends.map(renderTrendRow)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedBundle?.name}</DialogTitle>
            <DialogDescription>
              {selectedBundle?.description}
            </DialogDescription>
          </DialogHeader>
          <div>
            <h4 className="font-semibold mb-2">Constituent Stocks</h4>
            <div className="space-y-2">
              {selectedBundle?.stocks.map((stock) => (
                <DialogClose asChild key={stock.symbol}>
                  <Link
                    href={`/trade?symbol=${stock.symbol}`}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-accent"
                    onClick={() => {
                      setSelectedBundle(null);
                      setIsDialogOpen(false);
                    }}
                  >
                    <div>
                      <p className="font-medium">{stock.name}</p>
                      <p className="text-sm text-muted-foreground">{stock.symbol}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </DialogClose>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
