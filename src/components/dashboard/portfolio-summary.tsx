
"use client";

import { Line, LineChart, Tooltip, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
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
import { chartData, portfolioSummary } from "@/data/portfolio";


const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--primary))",
  },
};

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
          <ChartContainer config={chartConfig} className="h-40 mt-4 -ml-4 aspect-auto">
            <LineChart
              accessibilityLayer
              data={chartData['1M']}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-value)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-value)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Tooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) =>
                      `$${Number(value).toLocaleString()}`
                    }
                    hideLabel
                    hideIndicator
                  />
                }
              />
              <Line
                dataKey="value"
                type="monotone"
                stroke="var(--color-value)"
                strokeWidth={3}
                dot={false}
                fill="url(#fillGradient)"
              />
            </LineChart>
          </ChartContainer>
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
