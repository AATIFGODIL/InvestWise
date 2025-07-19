
"use client";

import { useState } from "react";
import { Line, LineChart, Tooltip, ResponsiveContainer, YAxis, CartesianGrid } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { chartData, portfolioSummary } from "@/data/portfolio";

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--primary))",
  },
};

type TimeRange = '1W' | '1M' | '6M' | '1Y';

export default function PortfolioValue() {
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const isTodaysChangePositive = portfolioSummary.todaysChange >= 0;
  const todaysChangePercent = portfolioSummary.totalValue !== 0 ? (portfolioSummary.todaysChange / (portfolioSummary.totalValue - portfolioSummary.todaysChange)) * 100 : 0;


  return (
    <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold">${portfolioSummary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <div className={cn("flex items-center text-sm font-semibold", isTodaysChangePositive ? "text-green-500" : "text-red-500")}>
                        {isTodaysChangePositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                        <span>${portfolioSummary.todaysChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({todaysChangePercent.toFixed(2)}%)</span>
                    </div>
                </div>
                <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
                    {(Object.keys(chartData) as TimeRange[]).map((range) => (
                        <Button
                            key={range}
                            variant={timeRange === range ? "default" : "ghost"}
                            size="sm"
                            className="w-full"
                            onClick={() => setTimeRange(range)}
                        >
                            {range}
                        </Button>
                    ))}
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80 w-full">
            <LineChart
              accessibilityLayer
              data={chartData[timeRange]}
              margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted-foreground/20"/>
              <YAxis domain={['dataMin - 100', 'dataMax + 100']} hide />
              <Tooltip
                cursor={true}
                content={
                  <ChartTooltipContent
                    formatter={(value) => `$${Number(value).toLocaleString()}`}
                    hideIndicator
                  />
                }
              />
              <defs>
                <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Line
                dataKey="value"
                type="monotone"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                fill="url(#fillGradient)"
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
    </Card>
  );
}
