// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React from "react";
import {
  ArrowLeft,
  BrainCircuit,
  Building,
  Newspaper,
  Repeat,
  Search,
  Star,
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoCursor } from "@/components/marketing/device-frame";
import { MockShell, TickerLogo } from "@/components/marketing/mock/mock-kit";
import { MockDashboard } from "@/components/marketing/mock/mock-dashboard";
import { between, ramp, typeAt, useAnchors, useDemoClock } from "@/components/marketing/demo-clock";

/**
 * Spotlight — `command-menu.tsx`, recorded.
 *
 * Opening it drops a `bg-black/80` scrim over the whole app — header and rail
 * included — and centres a `max-w-lg` panel. With nothing typed it lists the
 * five default symbols; typing searches Finnhub; picking a result swaps the
 * panel to the detail view: price, the TradingView mini chart, Buy and Sell,
 * Go to Trade Page, the watchlist toggle, your holding, an AI prediction that
 * resolves a beat later, and recent news.
 */

const DEFAULTS = [
  { symbol: "TSLA", name: "Tesla Inc", price: "246.31", change: "-2.79 (-1.12%)", up: false },
  { symbol: "AAPL", name: "Apple Inc", price: "231.40", change: "1.98 (0.86%)", up: true },
  { symbol: "MSFT", name: "Microsoft Corp", price: "516.17", change: "1.75 (0.34%)", up: true },
  { symbol: "GOOGL", name: "Alphabet Inc", price: "247.18", change: "1.77 (0.72%)", up: true },
  { symbol: "NVDA", name: "NVIDIA Corp", price: "184.92", change: "4.41 (2.44%)", up: true },
];
const NVDA = DEFAULTS[4];

const QUERY = "nvda";

// ─── Script ──────────────────────────────────────────────────────────────────
const CURSOR_TO_SEARCH = 400;
const CLICK_SEARCH = 900;
const PANEL_IN = 960;
const TYPE_START = 2100;
const SEARCHING = 2750;
const RESULTS_IN = 3150;
const CURSOR_TO_ROW = 3500;
const TAP_ROW = 4050;
const DETAIL_IN = 4150;
const PREDICTION_IN = 5600;
const DETAIL_SCROLL = 7000;
const LOOP = 11000;

export function SpotlightDemo({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const t = useDemoClock(active, LOOP, { staticFrame: 6800, reducedMotion });
  const [rootRef, anchors] = useAnchors(t);

  const open = t >= PANEL_IN;
  const typed = typeAt(QUERY, t, TYPE_START, 140);
  const detail = t >= DETAIL_IN;
  const loadingDefaults = between(t, PANEL_IN, PANEL_IN + 450);
  const searching = between(t, SEARCHING, RESULTS_IN);
  const list = typed.length === QUERY.length && t >= RESULTS_IN ? [NVDA] : typed ? [] : DEFAULTS;

  const target = (name: string, fallback: { x: number; y: number }) => anchors[name] ?? fallback;
  const cursor = detail
    ? { x: 900, y: 560 }
    : t >= CURSOR_TO_ROW
      ? target("row-NVDA", { x: 500, y: 380 })
      : t >= CURSOR_TO_SEARCH
        ? target("spotlight", { x: 740, y: 40 })
        : { x: 760, y: 520 };

  return (
    <div ref={rootRef} className="relative h-full w-full">
      <MockShell
        theme="dark"
        spotlightPressed={between(t, CLICK_SEARCH, CLICK_SEARCH + 140)}
        overlay={
          <>
            <div
              className="absolute inset-0 bg-black/80 transition-opacity duration-200"
              style={{ opacity: open ? 1 : 0 }}
            />
            <div className="absolute inset-0 flex items-center justify-center p-4 pb-24 pt-24">
              <div
                className="w-full max-w-lg overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-2xl"
                style={{
                  opacity: open ? 1 : 0,
                  transform: `scale(${open ? 1 : 0.97})`,
                  transition: "opacity 180ms ease-out, transform 220ms cubic-bezier(0.32, 0.72, 0, 1)",
                }}
              >
                <div className="flex items-center border-b border-border px-3">
                  {detail ? (
                    <span className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl">
                      <ArrowLeft className="h-4 w-4" />
                    </span>
                  ) : (
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  )}
                  <span className={cn("flex h-11 w-full items-center py-3 text-sm", detail && "opacity-50")}>
                    {detail ? (
                      <span className="text-muted-foreground">NVIDIA Corp (NVDA)</span>
                    ) : typed ? (
                      <>
                        {typed}
                        <span className="lp-caret" />
                      </>
                    ) : (
                      <span className="text-muted-foreground">
                        {open && <span className="lp-caret mr-px" />}
                        Search stocks or commands...
                      </span>
                    )}
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl">
                    <X className="h-4 w-4" />
                  </span>
                </div>

                {!detail && (
                  <div className="max-h-[300px] overflow-hidden">
                    {(loadingDefaults || searching) && (
                      <div className="p-4 text-center text-sm text-muted-foreground">Loading stocks...</div>
                    )}
                    {!loadingDefaults && !searching && list.length > 0 && (
                      <div className="p-1">
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Stocks</div>
                        {list.map((stock) => (
                          <div
                            key={stock.symbol}
                            data-anchor={`row-${stock.symbol}`}
                            className={cn(
                              "relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm",
                              stock.symbol === "NVDA" && t >= CURSOR_TO_ROW + 400 && "bg-accent text-accent-foreground"
                            )}
                          >
                            <div className="flex w-full items-center justify-between">
                              <div className="flex items-center gap-3">
                                <TickerLogo symbol={stock.symbol} className="h-8 w-8 bg-background" />
                                <div>
                                  <p>{stock.name}</p>
                                  <p className="text-xs text-muted-foreground">{stock.symbol}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-mono">${stock.price}</p>
                                <p className={cn("text-xs", stock.up ? "text-green-500" : "text-red-500")}>
                                  {stock.change}
                                </p>
                              </div>
                            </div>
                            <span className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center">
                              <Star className="h-4 w-4 text-muted-foreground" />
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {detail && (
                  <div
                    className="max-h-[510px] overflow-hidden p-2 text-sm"
                    style={{ opacity: ramp(t, DETAIL_IN, DETAIL_IN + 200) }}
                  >
                    <div
                      className="space-y-4"
                      style={{
                        transform: `translateY(${-ramp(t, DETAIL_SCROLL, DETAIL_SCROLL + 900) * 240}px)`,
                        transition: "transform 120ms linear",
                      }}
                    >
                      <div className="flex items-start gap-4 rounded-lg p-2">
                        <TickerLogo symbol="NVDA" className="h-14 w-14 border-2 border-primary/20 text-2xl" />
                        <div>
                          <h3 className="text-lg font-bold">NVIDIA Corp</h3>
                          <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold">$184.92</p>
                            <p className="flex items-center font-semibold text-green-500">
                              <TrendingUp className="mr-1 h-4 w-4" /> 4.41 (2.44%)
                            </p>
                          </div>
                        </div>
                      </div>

                      <MiniChart />

                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <span className="inline-flex h-9 items-center justify-center rounded-2xl bg-green-500 text-sm font-medium text-white">
                            Buy
                          </span>
                          <span className="inline-flex h-9 items-center justify-center rounded-2xl bg-red-500 text-sm font-medium text-white">
                            Sell
                          </span>
                        </div>
                        <span className="flex h-9 w-full items-center justify-center rounded-2xl border border-input bg-background text-sm font-medium">
                          <Repeat className="mr-2 h-4 w-4" /> Go to Trade Page
                        </span>
                        <span className="flex h-9 w-full items-center justify-center rounded-2xl border border-input bg-background text-sm font-medium">
                          <Star className="mr-2 h-4 w-4 fill-yellow-400 text-yellow-400" /> Remove from Watchlist
                        </span>
                      </div>

                      <div>
                        <h4 className="mb-2 flex items-center gap-2 font-semibold text-muted-foreground">
                          <Building className="h-4 w-4" /> Your Holdings
                        </h4>
                        <div className="rounded-lg bg-muted/50 p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">22 Shares</span>
                            <span className="font-medium">Value: $4068.24</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-2 flex items-center gap-2 font-semibold text-muted-foreground">
                          <BrainCircuit className="h-4 w-4" /> AI Prediction
                        </h4>
                        <div className="relative min-h-[60px] rounded-lg bg-muted/50 p-3 text-xs">
                          {t < PREDICTION_IN ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
                              <span>Generating prediction...</span>
                            </div>
                          ) : (
                            <div style={{ opacity: ramp(t, PREDICTION_IN, PREDICTION_IN + 250) }}>
                              <div className="mb-1 flex items-center justify-between">
                                <span className="inline-flex items-center rounded-full bg-yellow-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                                  Medium Confidence
                                </span>
                              </div>
                              <p className="whitespace-pre-wrap">
                                Datacenter demand supports the uptrend, but after this run the valuation leaves little
                                room for a miss. Over five months, expect volatility with a modest upward bias.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-2 flex items-center gap-2 font-semibold text-muted-foreground">
                          <Newspaper className="h-4 w-4" /> Recent News
                        </h4>
                        <div className="space-y-2">
                          {[
                            "Nvidia raises data center outlook as cloud orders accelerate",
                            "Chip stocks climb as AI spending forecasts rise again",
                          ].map((headline, i) => (
                            <div key={headline} className="flex gap-2 rounded-md p-2">
                              <span
                                className="h-12 w-16 shrink-0 rounded"
                                style={{
                                  background: `linear-gradient(135deg, hsl(${150 + i * 60} 60% 30%), hsl(${220 + i * 40} 50% 18%))`,
                                }}
                              />
                              <div>
                                <p className="line-clamp-2 font-medium leading-tight">{headline}</p>
                                <p className="text-xs text-muted-foreground">
                                  {i ? "Reuters" : "Bloomberg"} • 9/{25 - i}/2026
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DemoCursor
              x={cursor.x}
              y={cursor.y}
              pressed={between(t, CLICK_SEARCH, CLICK_SEARCH + 140) || between(t, TAP_ROW, TAP_ROW + 140)}
              tapKey={
                between(t, CLICK_SEARCH, CLICK_SEARCH + 700)
                  ? "search"
                  : between(t, TAP_ROW, TAP_ROW + 700)
                    ? "row"
                    : undefined
              }
            />
          </>
        }
      >
        <MockDashboard theme="dark" />
      </MockShell>
    </div>
  );
}

/** The TradingView mini symbol overview widget, in its dark theme. */
function MiniChart() {
  const line =
    "M0,118 L30,112 L60,121 L90,98 L120,104 L150,86 L180,92 L210,70 L240,78 L270,58 L300,63 L330,44 L360,51 L390,36 L420,40 L450,24 L480,30 L496,22";
  return (
    <div className="relative h-40 w-full overflow-hidden rounded-md bg-[#131722]">
      <div className="absolute left-3 top-2 z-10">
        <p className="text-[11px] text-[#B2B5BE]">NVIDIA Corporation</p>
        <p className="text-[15px] font-semibold text-[#D1D4DC]">
          184.92 <span className="text-[11px] text-[#089981]">+2.44%</span>
        </p>
      </div>
      <svg viewBox="0 0 496 160" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="lp-mini-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2962FF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#2962FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${line} L496,160 L0,160 Z`} fill="url(#lp-mini-fill)" />
        <path d={line} fill="none" stroke="#2962FF" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="absolute bottom-1 left-0 right-0 flex justify-around text-[9px] text-[#787B86]">
        {["1D", "1M", "3M", "1Y", "5Y", "All"].map((r) => (
          <span key={r}>{r}</span>
        ))}
      </div>
    </div>
  );
}
