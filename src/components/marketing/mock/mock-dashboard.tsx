// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React from "react";
import {
  ArrowRight,
  ArrowUp,
  BarChart,
  BrainCircuit,
  Briefcase,
  Clock,
  Crown,
  Laptop,
  PlusCircle,
  Repeat,
  Star,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MButton,
  MCardTitle,
  MProgress,
  PortfolioChart,
  recipes,
  type MockTheme,
} from "@/components/marketing/mock/mock-kit";

/**
 * The Explore page, in `dashboard-client.tsx`'s running order: the title row
 * with the market status, Portfolio (recharts, 450px), My Watchlist, My Top
 * Holdings, then Auto-Invest beside AI Stock Prediction and Goal Progress
 * beside the Community Leaderboard.
 *
 * The numbers are a believable account a few weeks in — a new account's real
 * dashboard reads $0.00, which is accurate and a poor advert.
 */

/** Width of the content column inside the 1280px screen: 1280 − 92 − 2×16. */
const CONTENT_W = 1156;
/** The chart sits inside CardContent's 24px padding. */
const CHART_W = CONTENT_W - 48;

export const DASHBOARD_WATCHLIST = [
  { symbol: "NVDA", price: "184.92", change: "+4.41 (2.44%)", up: true },
  { symbol: "AAPL", price: "231.40", change: "+1.98 (0.86%)", up: true },
  { symbol: "TSLA", price: "246.31", change: "-2.79 (-1.12%)", up: false },
];

const HOLDINGS = [
  { symbol: "NVDA", qty: 22, value: "4,068.24", change: "+97.02 (2.44%)", up: true },
  { symbol: "AAPL", qty: 12, value: "2,776.80", change: "+23.76 (0.86%)", up: true },
  { symbol: "TSLA", qty: 7, value: "1,724.17", change: "-19.53 (-1.12%)", up: false },
];

const LEADERS = [
  { rank: 1, name: "maya.invests", gain: "+$2,418.60" },
  { rank: 2, name: "You", gain: "+$1,195.33" },
  { rank: 3, name: "theo_k", gain: "+$884.12" },
  { rank: 4, name: "priya", gain: "+$512.40" },
];

export function MockDashboard({ theme }: { theme: MockTheme }) {
  const r = recipes(theme);
  const muted = "bg-muted/50";

  return (
    <main>
      <div className="space-y-6 p-4 pb-40">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Explore</h1>
          <div className="flex items-center gap-2 text-sm text-primary">
            <Clock className="h-4 w-4" />
            <span>Market is open.</span>
          </div>
        </div>

        {/* Portfolio */}
        <div className={r.card}>
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-2xl font-bold leading-none tracking-tight">
              <BarChart className="h-6 w-6 text-primary" />
              Portfolio
            </h3>
            <div className="flex flex-row items-center justify-between gap-4">
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold">$10,195.33</p>
                <div className="flex items-center text-sm font-semibold text-green-500">
                  <ArrowUp className="h-4 w-4" />
                  <span>$146.43 (1.46%)</span>
                </div>
              </div>
              <div className="flex gap-1">
                {["1W", "1M", "6M", "1Y"].map((range, i) => (
                  <MButton key={range} size="sm" variant={i === 0 ? "default" : "outline"}>
                    {range}
                  </MButton>
                ))}
              </div>
            </div>
          </div>
          <div className="p-6 pt-0">
            <PortfolioChart
              width={CHART_W}
              points={[9812.4, 9905.18, 9874.02, 10048.9, 10195.33]}
              labels={["Sep 21", "Sep 22", "Sep 23", "Sep 24", "Sep 25"]}
              yTicks={[9800, 9900, 10000, 10100, 10200]}
            />
          </div>
        </div>

        {/* Watchlist + holdings */}
        <div>
          <div className={r.card}>
            <div className="flex flex-col space-y-1.5 p-6">
              <MCardTitle icon={Star}>My Watchlist</MCardTitle>
              <p className="text-sm text-muted-foreground">Track the performance of stocks you are interested in.</p>
            </div>
            <div className="space-y-2 p-6 pt-0">
              {DASHBOARD_WATCHLIST.map((item) => (
                <div key={item.symbol} className="rounded-lg border border-transparent p-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-bold">{item.symbol}</div>
                    <div className="text-right font-mono">${item.price}</div>
                    <div className={cn("text-right", item.up ? "text-green-500" : "text-red-500")}>{item.change}</div>
                    <div className="flex justify-center gap-2">
                      <MButton size="sm">Trade</MButton>
                      <MButton size="icon" variant="ghost">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </MButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={cn(r.card, "mt-6")}>
            <div className="flex flex-col space-y-1.5 p-6">
              <MCardTitle icon={Briefcase}>My Top Holdings</MCardTitle>
            </div>
            <div className="space-y-3 p-6 pt-0">
              {HOLDINGS.map((h) => (
                <div key={h.symbol} className={cn("flex items-center justify-between rounded-lg p-3", muted)}>
                  <div>
                    <p className="font-semibold">{h.symbol}</p>
                    <p className="text-sm text-muted-foreground">{h.qty} Shares</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold">${h.value}</p>
                    <p className={cn("text-xs", h.up ? "text-green-500" : "text-red-500")}>{h.change}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center p-6 pt-0">
              <MButton variant="outline" className="w-full">
                View All Holdings
                <ArrowRight className="ml-2 h-4 w-4" />
              </MButton>
            </div>
          </div>
        </div>

        {/* Auto-Invest + AI prediction */}
        <div className="grid grid-cols-2 gap-6">
          <div className={r.card}>
            <div className="flex flex-col space-y-1.5 p-6">
              <MCardTitle icon={Repeat}>Auto-Invest</MCardTitle>
              <p className="text-sm text-muted-foreground">
                Set up recurring investments to grow your portfolio automatically.
              </p>
            </div>
            <div className="space-y-4 p-6 pt-0">
              {[
                { symbol: "VOO", plan: "$50 / weekly", next: "9/28/2026" },
                { symbol: "AAPL", plan: "$25 / monthly", next: "10/1/2026" },
              ].map((plan) => (
                <div key={plan.symbol} className={cn("flex items-center justify-between rounded-lg p-3", muted)}>
                  <div>
                    <p className="font-semibold">{plan.symbol}</p>
                    <p className="text-sm text-muted-foreground">{plan.plan}</p>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                      Next: {plan.next}
                    </span>
                    <span className="mt-1 text-sm font-medium text-primary">Manage</span>
                  </div>
                </div>
              ))}
              <MButton className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Set Up New Auto-Invest
              </MButton>
            </div>
          </div>

          <div className={r.card}>
            <div className="flex flex-col space-y-1.5 p-6">
              <MCardTitle icon={BrainCircuit}>AI Stock Prediction</MCardTitle>
              <p className="text-sm text-muted-foreground">
                Enter a stock symbol to get an AI-powered prediction for the next 5 months. This is a simulation and
                not financial advice.
              </p>
            </div>
            <div className="space-y-4 p-6 pt-0">
              <div className="flex flex-row gap-2">
                <div className="flex-grow space-y-2">
                  <p className="text-sm font-medium">Stock Symbol</p>
                  <div className="flex h-10 w-full items-center rounded-2xl border border-input bg-background px-3 text-sm">
                    NVDA
                  </div>
                </div>
                <div className="self-end">
                  <MButton className="ring-1 ring-white/60">
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    Get Prediction
                  </MButton>
                </div>
              </div>
              <div className={cn(r.card, "bg-muted/50 p-4")}>
                <div className="flex items-start justify-between">
                  <h4 className="text-lg font-semibold">Prediction for NVDA</h4>
                  <span className="inline-flex items-center rounded-full bg-yellow-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                    Medium Confidence
                  </span>
                </div>
                <p className="mt-2 text-sm">
                  Datacentre demand supports the trend, but the valuation leaves little room for a miss. Expect a
                  volatile five months with a modest upward bias.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Goal progress + leaderboard */}
        <div className="grid grid-cols-2 gap-6">
          <div className={cn(r.card, "flex h-full flex-col")}>
            <div className="flex flex-row items-center justify-between p-6 pb-2">
              <MCardTitle>Goal Progress</MCardTitle>
              <span className="text-sm font-medium text-primary">View All</span>
            </div>
            <div className="flex flex-grow items-center p-6 pt-2">
              <div className="flex w-full items-center gap-2 pt-2">
                <div className="flex-grow">
                  <p className="text-sm text-muted-foreground">New Laptop</p>
                  <p className="text-2xl font-bold">$1,240</p>
                  <p className="text-xs font-semibold text-muted-foreground">62% to target</p>
                  <MProgress value={62} className="mt-2 h-2" />
                </div>
                <div className="flex items-center justify-center self-start rounded-lg bg-secondary p-2">
                  <Laptop className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
          </div>

          <div className={cn(r.card, "flex h-full flex-col")}>
            <div className="p-6 pb-2">
              <MCardTitle>Community Leaderboard</MCardTitle>
            </div>
            <div className="flex-grow space-y-3 px-4 pt-2">
              {LEADERS.map((leader) => (
                <div key={leader.rank} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-5 font-semibold">
                      {leader.rank === 1 ? <Crown className="h-5 w-5 text-yellow-500" /> : leader.rank}
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm">
                      {leader.name.charAt(0).toUpperCase()}
                    </span>
                    <p className="text-sm font-medium">{leader.name}</p>
                  </div>
                  <p className="text-sm font-semibold text-green-500">{leader.gain}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center px-4 pb-6 pt-4">
              <MButton className="w-full">View All</MButton>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
