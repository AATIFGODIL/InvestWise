
"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ArrowUp, ArrowDown, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePortfolioStore } from "@/store/portfolio-store";
import { useThemeStore } from "@/store/theme-store";

type TimeRange = '1W' | '1M' | '6M' | '1Y';

interface PortfolioValueProps {
    showTitle?: boolean;
}

function PortfolioValue({ showTitle = false }: PortfolioValueProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1W');
  const { portfolioSummary, chartData } = usePortfolioStore();


  const isTodaysChangePositive = portfolioSummary.todaysChange >= 0;
  const todaysChangePercent = portfolioSummary.totalValue !== 0 ? (portfolioSummary.todaysChange / (portfolioSummary.totalValue - portfolioSummary.todaysChange)) * 100 : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    const { isClearMode, theme } = useThemeStore();
    const isLightClear = isClearMode && theme === 'light';

    if (active && payload && payload.length) {
      return (
        <div
          className={cn(
              "p-2 rounded-lg shadow-lg",
              isClearMode
                  ? isLightClear
                      ? "border-0 bg-card/60 text-card-foreground ring-1 ring-white/10"
                      : "border-0 bg-white/10 text-white ring-1 ring-white/60"
                  : "border bg-background"
          )}
          style={{
            backdropFilter: isClearMode ? "blur(16px)" : "none",
          }}
        >
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
            {showTitle && (
                <CardTitle className="flex items-center gap-2 text-lg mb-4">
                    <BarChart className="h-5 w-5 text-primary" />
                    Portfolio
                </CardTitle>
            )}
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
              <RechartsLineChart
                data={chartData[timeRange]}
                margin={{
                  top: 5,
                  right: 30,
                  left: 30,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                <YAxis
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip
                    content={<CustomTooltip />}
                    animationDuration={100}
                    animationEasing="ease-out"
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                  name=""
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
    </Card>
  );
}

export default React.memo(PortfolioValue);
