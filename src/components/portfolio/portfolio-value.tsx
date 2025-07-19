
"use client";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { portfolioSummary } from "@/data/portfolio";
import TradingViewWidget from "../shared/trading-view-widget";

export default function PortfolioValue() {
  const isTodaysChangePositive = portfolioSummary.todaysChange >= 0;
  const todaysChangePercent = portfolioSummary.totalValue !== 0 ? (portfolioSummary.todaysChange / (portfolioSummary.totalValue - portfolioSummary.todaysChange)) * 100 : 0;

  return (
    <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold">${portfolioSummary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <div className={cn("flex items-center text-sm font-semibold", isTodaysChangePositive ? "text-green-500" : "text-red-500")}>
                        {isTodaysChangePositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" /> }
                        <span>${portfolioSummary.todaysChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({todaysChangePercent.toFixed(2)}%)</span>
                    </div>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <div className="h-[450px] w-full">
            <TradingViewWidget />
          </div>
        </CardContent>
    </Card>
  );
}
