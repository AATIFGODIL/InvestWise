
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePortfolioStore } from "@/store/portfolio-store";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

export default function HoldingsSummary() {
  const { holdings, isLoading } = usePortfolioStore();

  const topHoldings = holdings.slice(0, 3);

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-16 w-full skeleton-shimmer" />
                <Skeleton className="h-16 w-full skeleton-shimmer" />
            </CardContent>
            <CardFooter>
                 <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    )
  }

  if (holdings.length === 0) {
    return null; // Don't render the card if there are no holdings
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            My Top Holdings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topHoldings.map((holding) => {
            const holdingValue = holding.qty * holding.currentPrice;
            const isPositive = holding.todaysChange >= 0;
            return (
                 <div key={holding.symbol} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                        <p className="font-semibold">{holding.symbol}</p>
                        <p className="text-sm text-muted-foreground">{holding.qty} Shares</p>
                    </div>
                    <div className="text-right">
                        <p className="font-mono font-semibold">${holdingValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p className={cn("text-xs", isPositive ? "text-green-500" : "text-red-500")}>
                            {isPositive ? '+' : ''}{holding.todaysChange.toFixed(2)} ({holding.todaysChangePercent.toFixed(2)}%)
                        </p>
                    </div>
                </div>
            )
        })}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href="/portfolio">
            View All Holdings
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
