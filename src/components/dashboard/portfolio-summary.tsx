
"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Info } from "lucide-react";
import {
  Tooltip as ShadTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { portfolioSummary } from "@/data/portfolio";
import TradingViewWidget from "../shared/trading-view-widget";


export default function PortfolioSummary() {
  const { toast } = useToast();

  const handleButtonClick = () => {
    toast({
      title: "Coming Soon!",
      description: "This feature is currently under development.",
    });
  };
  
  const isTodayChangePositive = portfolioSummary.todaysChange >= 0;

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
              <CardTitle>Portfolio</CardTitle>
              <ShadTooltip>
                  <TooltipTrigger asChild>
                    <Link href="/portfolio">
                      <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                      <p>Click to view your detailed portfolio.</p>
                  </TooltipContent>
              </ShadTooltip>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-3xl font-bold tracking-tighter">${portfolioSummary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className={`text-sm font-semibold ${isTodayChangePositive ? 'text-green-500' : 'text-red-500'}`}>
            {isTodayChangePositive ? '+' : ''}${portfolioSummary.todaysChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Today
          </div>
          <div className="h-56 mt-4">
            <TradingViewWidget />
          </div>
          <div className="absolute bottom-4 right-4 bg-yellow-400 p-3 rounded-full shadow-lg">
              <DollarSign className="h-6 w-6 text-yellow-900" />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleButtonClick} className="w-full bg-primary hover:bg-primary/90">Auto-Invest</Button>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
