// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React from "react";
import { Clock, Repeat, Star, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The dashboard the feature demos are staged over.
 *
 * Follows `dashboard-client.tsx`'s actual running order — market-status chip,
 * Portfolio Value, then Watchlist beside Holdings Summary, then Auto-Invest
 * beside the AI Prediction — rather than inventing a layout. It is not the real
 * route (that one is wired to Firestore, the portfolio store and live Finnhub
 * quotes, none of which belong on a marketing page), but it is the same screen,
 * built from the same tokens, so it reads as the product the instant a demo
 * puts something on top of it.
 */

const WATCHLIST = [
  { symbol: "NVDA", name: "NVIDIA Corp", price: "184.92", delta: "+2.44%", up: true },
  { symbol: "AMD", name: "Adv. Micro Devices", price: "142.18", delta: "+1.07%", up: true },
  { symbol: "TSLA", name: "Tesla Inc", price: "246.31", delta: "−1.12%", up: false },
];

const HOLDINGS = [
  { symbol: "NVDA", qty: "22 sh", value: "4,068.24", pct: 41, up: true },
  { symbol: "AAPL", qty: "12 sh", value: "2,776.80", pct: 28, up: true },
  { symbol: "TSLA", qty: "7 sh", value: "1,724.17", pct: 17, up: false },
  { symbol: "MSFT", qty: "3 sh", value: "1,256.31", pct: 14, up: true },
];

/** A steady climb with a believable amount of noise in it. */
const SPARK =
  "M0,112 L44,104 L88,109 L132,92 L176,97 L220,79 L264,85 L308,66 L352,72 L396,55 L440,61 L484,43 L528,49 L572,32 L616,37 L660,21 L704,26 L748,12";

export function DashboardBackdrop({
  glass = false,
  light = false,
  className,
}: {
  /** Clear mode: cards become the app's frosted glass instead of `--card`. */
  glass?: boolean;
  light?: boolean;
  className?: string;
}) {
  const card = glass
    ? light
      ? "bg-card/60 shadow-[inset_0_0_0_1px_hsl(0_0%_0%/0.1)]"
      : "lp-frosted"
    : "bg-card shadow-[inset_0_0_0_1px_hsl(var(--border))]";

  return (
    <div className={cn("h-full w-full px-7 pb-5 pt-1", className)}>
      {/* Market status chip */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium text-muted-foreground",
            card
          )}
        >
          <Clock className="h-3 w-3" />
          Market open · closes 4:00 PM ET
        </span>
      </div>

      {/* Portfolio Value */}
      <div className={cn("rounded-[var(--radius)] p-5", card)}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[12px] font-medium text-muted-foreground">Portfolio Value</p>
            <div className="mt-1 flex items-baseline gap-2.5">
              <span className="lp-tnum text-[32px] font-bold leading-none tracking-tight text-foreground">
                $10,195.33
              </span>
              <span className="lp-tnum flex items-center gap-1 text-[14px] font-semibold text-emerald-500">
                <TrendingUp className="h-3.5 w-3.5" />
                +$412.18 (4.21%)
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            {["1D", "1W", "1M", "1Y", "All"].map((r, i) => (
              <span
                key={r}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium",
                  i === 2 ? "text-primary-foreground" : "text-muted-foreground"
                )}
                style={i === 2 ? { background: "hsl(var(--primary))" } : undefined}
              >
                {r}
              </span>
            ))}
          </div>
        </div>

        <svg viewBox="0 0 748 124" className="mt-3 h-[124px] w-full" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="lp-spark-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.32" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${SPARK} L748,124 L0,124 Z`} fill="url(#lp-spark-fill)" />
          <path
            d={SPARK}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      {/* Watchlist + Holdings Summary */}
      <div className="mt-3.5 grid grid-cols-2 gap-3.5">
        <div className={cn("rounded-[var(--radius)] p-4", card)}>
          <p className="mb-2.5 flex items-center gap-1.5 text-[12px] font-semibold text-foreground">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            Watchlist
          </p>
          <div className="space-y-2">
            {WATCHLIST.map((s) => (
              <div key={s.symbol} className="flex items-center gap-2.5">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-foreground"
                  style={{ background: "hsl(var(--primary) / 0.16)" }}
                >
                  {s.symbol.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-foreground">{s.symbol}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{s.name}</p>
                </div>
                <div className="text-right">
                  <p className="lp-tnum text-[12px] font-semibold text-foreground">${s.price}</p>
                  <p
                    className={cn(
                      "lp-tnum flex items-center justify-end gap-0.5 text-[10px] font-medium",
                      s.up ? "text-emerald-500" : "text-red-500"
                    )}
                  >
                    {s.up ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                    {s.delta}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={cn("rounded-[var(--radius)] p-4", card)}>
          <p className="mb-2.5 text-[12px] font-semibold text-foreground">Holdings</p>
          <div className="space-y-2">
            {HOLDINGS.map((h) => (
              <div key={h.symbol} className="flex items-center gap-2.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[12px] font-semibold text-foreground">{h.symbol}</span>
                    <span className="lp-tnum text-[11px] text-muted-foreground">{h.qty}</span>
                  </div>
                  {/* Allocation bar — the app shows weight, not just value */}
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${h.pct}%`, background: "hsl(var(--primary))" }}
                    />
                  </div>
                </div>
                <span className="lp-tnum w-[62px] text-right text-[12px] font-semibold text-foreground">
                  ${h.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auto-Invest strip */}
      <div className={cn("mt-3.5 flex items-center gap-3 rounded-[var(--radius)] px-4 py-3", card)}>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ background: "hsl(var(--primary) / 0.16)" }}
        >
          <Repeat className="h-4 w-4" style={{ color: "hsl(var(--primary))" }} />
        </span>
        <div className="flex-1">
          <p className="text-[12px] font-semibold text-foreground">Auto-Invest</p>
          <p className="text-[10.5px] text-muted-foreground">
            $50 into VOO every Monday · next run in 3 days
          </p>
        </div>
        <span
          className="rounded-full px-3 py-1.5 text-[11px] font-semibold text-primary-foreground"
          style={{ background: "hsl(var(--primary))" }}
        >
          Manage
        </span>
      </div>
    </div>
  );
}
