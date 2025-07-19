
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { portfolioSummary, chartData } from "@/data/portfolio";

type TimeRange = '1W' | '1M' | '6M' | '1Y';

export default function PortfolioValue() {
  const [timeRange, setTimeRange] = useState<TimeRange>('1W');

  const isTodaysChangePositive = portfolioSummary.todaysChange >= 0;
  const todaysChangePercent = portfolioSummary.totalValue !== 0 ? (portfolioSummary.todaysChange / (portfolioSummary.totalValue - portfolioSummary.todaysChange)) * 100 : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background border border-border rounded-lg shadow-lg">
          <p className="label text-sm text-muted-foreground">{`${label}`}</p>
          <p className="intro font-bold text-primary">{`$${payload[0].value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}</p>
        </div>
      );
    }

    return null;
  };


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
                <div className="flex gap-1">
                    {(Object.keys(chartData) as TimeRange[]).map((range) => (
                        <Button
                            key={range}
                            variant={timeRange === range ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTimeRange(range)}
                        >
                            {range}
                        </Button>
                    ))}
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData[timeRange]}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip
                    content={<CustomTooltip />}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                  name=""
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
    </Card>
  );
}
