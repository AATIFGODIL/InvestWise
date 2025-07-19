
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
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const chartData = {
    '1W': [
        { date: "2024-06-24", value: 7200 },
        { date: "2024-06-25", value: 7250 },
        { date: "2024-06-26", value: 7150 },
        { date: "2024-06-27", value: 7300 },
        { date: "2024-06-28", value: 7280 },
        { date: "2024-06-29", value: 7350 },
        { date: "2024-06-30", value: 7303.50 },
    ],
    '1M': [
        { date: "2024-06-01", value: 7000 },
        { date: "2024-06-08", value: 7100 },
        { date: "2024-06-15", value: 7050 },
        { date: "2024-06-22", value: 7200 },
        { date: "2024-06-30", value: 7303.50 },
    ],
    '6M': [
        { date: "2024-01-01", value: 6500 },
        { date: "2024-02-01", value: 6800 },
        { date: "2024-03-01", value: 6700 },
        { date: "2024-04-01", value: 7000 },
        { date: "2024-05-01", value: 7100 },
        { date: "2024-06-30", value: 7303.50 },
    ],
    '1Y': [
        { date: "2023-07-01", value: 6000 },
        { date: "2023-10-01", value: 6200 },
        { date: "2024-01-01", value: 6500 },
        { date: "2024-04-01", value: 7000 },
        { date: "2024-06-30", value: 7303.50 },
    ]
};

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--primary))",
  },
};

type TimeRange = '1W' | '1M' | '6M' | '1Y';

export default function PortfolioValue() {
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');

  return (
    <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold">$7,303.50</p>
                    <div className="flex items-center text-sm text-green-500 font-semibold">
                        <ArrowUp className="h-4 w-4" />
                        <span>$93.50 (1.30%)</span>
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
          <ChartContainer config={chartConfig} className="h-80 -ml-4">
            <LineChart
              accessibilityLayer
              data={chartData[timeRange]}
              margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
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
