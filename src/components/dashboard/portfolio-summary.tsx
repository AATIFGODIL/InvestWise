
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { portfolioSummary, chartData } from "@/data/portfolio";


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
          <div className="h-56 mt-4 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData['1W']} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <Tooltip 
                        contentStyle={{
                            background: "hsl(var(--background))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "var(--radius)",
                        }}
                        formatter={(value: number) => [`$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, '']}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2} 
                        dot={false}
                    />
                    <XAxis dataKey="date" hide={true} />
                    <YAxis domain={['dataMin', 'dataMax']} hide={true} />
                </LineChart>
            </ResponsiveContainer>
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
