
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
import useLoadingStore from "@/store/loading-store";
import { useThemeStore } from "@/store/theme-store";
import { cn } from "@/lib/utils";


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
    ]
  },
  { name: "NVIDIA Corp.", symbol: "NVDA", category: "Stock", popularity: 82 },
  { name: "Tesla, Inc.", symbol: "TSLA", category: "Stock", popularity: 78 },
  { name: "Amazon.com, Inc.", symbol: "AMZN", category: "Stock", popularity: 75 },
  { 
    name: "Green Energy Bundle", 
    category: "Bundle", 
    popularity: 65,
    description: "Support a sustainable future by investing in renewable energy and clean technology companies.",
    stocks: [
      { name: "NextEra Energy", symbol: "NEE" },
      { name: "SolarEdge Tech", symbol: "SEDG" },
      { name: "Enphase Energy", symbol: "ENPH" },
    ]
  },
  { name: "Meta Platforms, Inc.", symbol: "META", category: "Stock", popularity: 62 },
];

interface CommunityTrendsProps {
  showViewAllButton?: boolean;
  limit?: number;
}


export default function CommunityTrends({ showViewAllButton = true, limit }: CommunityTrendsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<(typeof trends[number] & {category: 'Bundle'}) | null>(null);
  const { showLoading } = useLoadingStore();
  const { isClearMode, theme } = useThemeStore();
  const isLightClear = isClearMode && theme === 'light';

  const handleTrendClick = (trend: typeof trends[number]) => {
    if (trend.category === 'Bundle') {
      setSelectedBundle(trend as typeof trends[number] & {category: 'Bundle'});
      setIsDialogOpen(true);
    } else if (trend.symbol) {
        handleStockLinkClick(trend.symbol);
    }
  };
  
  const handleStockLinkClick = (symbol: string) => {
    showLoading();
    // Use window.location.href to force a full page reload
    window.location.href = `/trade?symbol=${symbol}`;
  };

  const renderTrendRow = (trend: typeof trends[number]) => {
    return (
      <TableRow 
        key={trend.name} 
        className="group hover:bg-muted/50 cursor-pointer"
        onClick={() => handleTrendClick(trend)}
      >
        <TableCell className="font-medium p-4">
            <div className="flex items-center justify-between w-full h-full">
                <span>{trend.name}</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground invisible group-hover:visible" />
            </div>
        </TableCell>
        <TableCell className="text-right p-4">
            <div className="flex items-center justify-end w-full h-full">
                <Badge variant="outline">{trend.category}</Badge>
            </div>
        </TableCell>
      </TableRow>
    );
  };

  const trendsToDisplay = limit ? trends.slice(0, limit) : trends;

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
                <TableHead className="px-4">Asset</TableHead>
                <TableHead className="text-right px-4">Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trendsToDisplay.map(renderTrendRow)}
            </TableBody>
          </Table>
        </CardContent>
        {showViewAllButton && (
            <div className="p-4 mt-auto">
                <Button asChild variant="outline" className={cn(
                  "w-full ring-1 ring-white/60",
                   isClearMode
                      ? isLightClear
                          ? "bg-card/60 text-foreground"
                          : "bg-white/10 text-white"
                      : ""
                )}>
                    <Link href="/community?tab=trends">
                        View All Trends
                    </Link>
                </Button>
            </div>
        )}
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
                  <button
                    className="flex items-center justify-between p-2 rounded-md hover:bg-accent w-full text-left"
                    onClick={() => handleStockLinkClick(stock.symbol)}
                  >
                    <div>
                      <p className="font-medium">{stock.name}</p>
                      <p className="text-sm text-muted-foreground">{stock.symbol}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DialogClose>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
