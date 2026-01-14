// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React, { useState, useEffect } from "react";
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
import { usePathname } from "next/navigation";
import { Skeleton } from "../ui/skeleton";

type TimeRange = '1W' | '1M' | '6M' | '1Y';

interface PortfolioValueProps {
  showTitle?: boolean;
}

function PortfolioValue({ showTitle: showTitleProp = false }: PortfolioValueProps) {
  const pathname = usePathname();
  const [timeRange, setTimeRange] = useState<TimeRange>('1W');
  const { portfolioSummary, chartData, isLoading, fetchChartData, chartRangeStatus } = usePortfolioStore();
  const [showGlow, setShowGlow] = useState(false);

  useEffect(() => {
    // Check for the glow effect flag on component mount
    if (sessionStorage.getItem('showGlowEffect') === 'true') {
      setShowGlow(true);

      // Turn off the glow after a few seconds
      const timer = setTimeout(() => {
        setShowGlow(false);
      }, 4000); // 4 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  const showTitle = showTitleProp || pathname === '/explore';

  const isTodaysChangePositive = portfolioSummary.todaysChange >= 0;
  const todaysChangePercent = portfolioSummary.totalValue !== 0 ? (portfolioSummary.todaysChange / (portfolioSummary.totalValue - portfolioSummary.todaysChange)) * 100 : 0;

  // Fetch data when timeRange changes
  React.useEffect(() => {
    fetchChartData(timeRange);
  }, [timeRange, fetchChartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    const { isClearMode, theme } = useThemeStore();
    // ... (tooltip code same)
    if (active && payload && payload.length) {
      return (
        <div
        // ...
        >
          <p className="label text-sm text-muted-foreground">{`${label}`}</p>
          <p className="intro font-bold text-primary">{`$${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>
        </div>
      );
    }
    return null;
  };

  // Main loading (initial load)
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          {showTitle && (
            <CardTitle className="flex items-center gap-2 text-2xl font-bold mb-4">
              <BarChart className="h-6 w-6 text-primary" />
              Portfolio
            </CardTitle>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex gap-1">
              <Skeleton className="h-9 w-12" />
              <Skeleton className="h-9 w-12" />
              <Skeleton className="h-9 w-12" />
              <Skeleton className="h-9 w-12" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[450px] w-full skeleton-shimmer" />
        </CardContent>
      </Card>
    )
  }


  return (
    <Card className={cn(
      showGlow && "login-glow"
    )}>
      <CardHeader>
        {showTitle && (
          <CardTitle className="flex items-center gap-2 text-2xl font-bold mb-4">
            <BarChart className="h-6 w-6 text-primary" />
            Portfolio
          </CardTitle>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">${portfolioSummary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <div className={cn("flex items-center text-sm font-semibold", isTodaysChangePositive ? "text-green-500" : "text-red-500")}>
              {isTodaysChangePositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
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
                disabled={chartRangeStatus && chartRangeStatus[range] === 'loading'}
              >
                {chartRangeStatus && chartRangeStatus[range] === 'loading' ? '...' : range}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[450px] w-full">
          {chartRangeStatus && (chartRangeStatus[timeRange] === 'loading' || chartRangeStatus[timeRange] === 'idle') ? (
            <div className="h-full w-full flex items-center justify-center">
              <Skeleton className="h-full w-full skeleton-shimmer" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart
                data={chartData[timeRange]}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
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
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default React.memo(PortfolioValue);
