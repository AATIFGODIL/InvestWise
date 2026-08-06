// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React from "react";
import {
  ArrowLeft,
  BrainCircuit,
  Newspaper,
  Repeat,
  Search,
  Star,
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppChrome, SpotlightButton } from "@/components/marketing/app-chrome";
import { DemoCursor } from "@/components/marketing/device-frame";
import { DashboardBackdrop } from "@/components/marketing/demos/dashboard-backdrop";
import { between, ramp, typeAt, useDemoClock } from "@/components/marketing/demo-clock";

/**
 * Spotlight — the ⌘K command menu, recorded.
 *
 * A replay of `command-menu.tsx`, matching its actual geometry: a `max-w-lg`
 * panel centred in the viewport over a `bg-black/80` scrim, the same two-view
 * structure (search → stock detail), the same result list mixing live quotes
 * with app actions, the same star-to-favourite affordance, and the same AI
 * prediction card that resolves a beat after everything else.
 *
 * The one liberty taken is timing. The real menu waits on a 350ms debounce,
 * then Finnhub, then a Genkit call; here those latencies are staged, because a
 * recording that sits on a spinner as long as the network actually does is a
 * recording nobody watches to the end.
 */

const QUERY = "nvda";

// ─── Script ──────────────────────────────────────────────────────────────────
const CURSOR_TO_SEARCH = 420;
const CLICK_SEARCH = 880;
const PANEL_IN = 940;
const TYPE_START = 1420;
const RESULTS_IN = 2560;
const CURSOR_TO_ROW = 3060;
const TAP_ROW = 3720;
const DETAIL_IN = 3860;
const PREDICTION_IN = 5200;
const LOOP = 10400;

const RESULTS = [
  { symbol: "NVDA", name: "NVIDIA Corp", price: "184.92", delta: "4.41 (2.44%)", up: true },
  { symbol: "NVDS", name: "Tradr 2X Short NVDA", price: "12.08", delta: "−0.62 (4.88%)", up: false },
];

const ACTIONS = [
  { label: "Ask InvestWise AI", icon: BrainCircuit },
  { label: "Go to Trade Page", icon: Repeat },
];

/** `max-w-lg` centred inside the 1040px screen. */
const PANEL_W = 512;
const PANEL_X = (1040 - PANEL_W) / 2;

export function SpotlightDemo({
  active,
  reducedMotion,
}: {
  active: boolean;
  reducedMotion: boolean;
}) {
  const t = useDemoClock(active, LOOP, { staticFrame: 6000, reducedMotion });

  const typed = typeAt(QUERY, t, TYPE_START, 152);
  const panelIn = ramp(t, PANEL_IN, PANEL_IN + 300);
  const showResults = t >= RESULTS_IN;
  const detail = t >= DETAIL_IN;
  const showPrediction = t >= PREDICTION_IN;

  const cursor = detail
    ? { x: 690, y: 470 }
    : t >= CURSOR_TO_ROW
      ? { x: PANEL_X + 60, y: 268 }
      : t >= CURSOR_TO_SEARCH
        ? { x: 470, y: 46 }
        : { x: 640, y: 470 };

  return (
    <AppChrome
      headerCentre={<SpotlightButton active={between(t, CLICK_SEARCH, PANEL_IN + 400)} />}
      overlay={
        <>
        {/* Scrim. A modal task, so the page is dimmed and pushed back rather
            than hidden — you can still see where you were. */}
        <div
          className="absolute inset-0 z-40 bg-black/80 transition-opacity duration-[420ms]"
          style={{ opacity: t >= PANEL_IN ? 1 : 0 }}
        />

        {/* The panel. It materialises rather than fades: blur and scale move
            together, so it reads as a pane of glass arriving. */}
        <div
          className="absolute z-50 overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-2xl shadow-black/40"
          style={{
            left: PANEL_X,
            top: 96,
            width: PANEL_W,
            opacity: panelIn,
            transform: `scale(${0.95 + panelIn * 0.05})`,
            filter: `blur(${(1 - panelIn) * 9}px)`,
            boxShadow: "inset 0 0 0 1px hsl(var(--border)), 0 30px 70px -20px hsl(0 0% 0% / 0.8)",
          }}
        >
          {/* Input row */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-3">
            {detail ? (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
                <ArrowLeft className="h-4 w-4" />
              </span>
            ) : (
              <Search className="mr-1 h-4 w-4 shrink-0 opacity-50" />
            )}
            <span className="flex-1 text-[14px]">
              {detail ? (
                <span className="text-muted-foreground">NVIDIA Corp (NVDA)</span>
              ) : typed ? (
                <>
                  <span className="uppercase">{typed}</span>
                  <span className="lp-caret" />
                </>
              ) : (
                <span className="text-muted-foreground">
                  Search stocks or commands…
                  <span className="lp-caret" />
                </span>
              )}
            </span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
              <X className="h-4 w-4 opacity-60" />
            </span>
          </div>

          {/* ── Search view ── */}
          {!detail && (
            <div className="min-h-[300px] p-1">
              {!showResults && typed && (
                <p className="p-4 text-center text-sm text-muted-foreground">Loading stocks…</p>
              )}

              {showResults && (
                <>
                  <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Stocks</p>
                  {RESULTS.map((r, i) => {
                    const appear = ramp(t, RESULTS_IN + i * 70, RESULTS_IN + i * 70 + 220);
                    return (
                      <div
                        key={r.symbol}
                        className={cn(
                          "flex items-center gap-2 rounded-sm px-2 py-2",
                          i === 0 && t >= CURSOR_TO_ROW && "bg-accent/15"
                        )}
                        style={{ opacity: appear, transform: `translateY(${(1 - appear) * 6}px)` }}
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-[12px] font-bold"
                          style={{ boxShadow: "inset 0 0 0 1px hsl(var(--border))" }}
                        >
                          {r.symbol.charAt(0)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px]">{r.name}</p>
                          <p className="text-xs text-muted-foreground">{r.symbol}</p>
                        </div>
                        <div className="text-right">
                          <p className="lp-tnum text-[14px] font-mono">${r.price}</p>
                          <p
                            className={cn(
                              "lp-tnum text-xs",
                              r.up ? "text-green-500" : "text-red-500"
                            )}
                          >
                            {r.delta}
                          </p>
                        </div>
                        <span className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center">
                          <Star
                            className={cn(
                              "h-4 w-4",
                              i === 0
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            )}
                          />
                        </span>
                      </div>
                    );
                  })}

                  <div className="my-1 h-px bg-border" />
                  <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">App Actions</p>
                  {ACTIONS.map((a, i) => {
                    const Icon = a.icon;
                    return (
                      <div
                        key={a.label}
                        className="flex items-center rounded-sm px-2 py-2"
                        style={{
                          opacity: ramp(t, RESULTS_IN + 180 + i * 70, RESULTS_IN + 400 + i * 70),
                        }}
                      >
                        <Icon className="mr-2 h-4 w-4 shrink-0" />
                        <span className="flex-1 text-[14px]">{a.label}</span>
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center">
                          <Star className="h-4 w-4 text-muted-foreground" />
                        </span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* ── Stock detail view ── */}
          {detail && (
            <div
              className="min-h-[300px] space-y-4 p-3 text-sm"
              style={{
                opacity: ramp(t, DETAIL_IN, DETAIL_IN + 260),
                transform: `translateX(${(1 - ramp(t, DETAIL_IN, DETAIL_IN + 260)) * 14}px)`,
              }}
            >
              <div className="flex items-start gap-4 p-1">
                <span
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted text-2xl font-bold"
                  style={{ boxShadow: "inset 0 0 0 2px hsl(var(--primary) / 0.2)" }}
                >
                  N
                </span>
                <div>
                  <h3 className="text-lg font-bold">NVIDIA Corp</h3>
                  <div className="flex items-baseline gap-2">
                    <p className="lp-tnum text-2xl font-bold">$184.92</p>
                    <p className="lp-tnum flex items-center font-semibold text-green-500">
                      <TrendingUp className="mr-1 h-4 w-4" />
                      4.41 (2.44%)
                    </p>
                  </div>
                </div>
              </div>

              {/* The slot the real menu fills with a TradingView mini chart. */}
              <div className="h-40 w-full overflow-hidden rounded-md bg-muted/40">
                <svg viewBox="0 0 486 160" className="h-full w-full" preserveAspectRatio="none" aria-hidden>
                  <defs>
                    <linearGradient id="lp-detail-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,128 L35,118 L70,136 L105,100 L140,110 L175,76 L210,90 L245,62 L280,72 L315,42 L350,52 L385,29 L420,38 L455,19 L486,26 L486,160 L0,160 Z"
                    fill="url(#lp-detail-fill)"
                  />
                  <path
                    d="M0,128 L35,118 L70,136 L105,100 L140,110 L175,76 L210,90 L245,62 L280,72 L315,42 L350,52 L385,29 L420,38 L455,19 L486,26"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <span className="rounded-md bg-green-500 py-2 text-center text-[13px] font-medium text-white">
                  Buy
                </span>
                <span className="rounded-md bg-red-500 py-2 text-center text-[13px] font-medium text-white">
                  Sell
                </span>
              </div>

              {/* AI prediction — resolves a beat after the rest, as it does live */}
              <div>
                <h4 className="mb-2 flex items-center gap-2 font-semibold text-muted-foreground">
                  <BrainCircuit className="h-4 w-4" />
                  AI Prediction
                </h4>
                <div className="min-h-[60px] rounded-lg bg-muted/50 p-3 text-xs">
                  {showPrediction ? (
                    <div style={{ opacity: ramp(t, PREDICTION_IN, PREDICTION_IN + 300) }}>
                      <span className="inline-block rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-medium text-white">
                        High Confidence
                      </span>
                      <p className="mt-1.5 leading-relaxed">
                        Momentum is strong on datacentre demand, though the run-up has stretched
                        valuation. Consider sizing in gradually rather than all at once.
                      </p>
                    </div>
                  ) : (
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <span
                        className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/25"
                        style={{ borderTopColor: "hsl(var(--primary))" }}
                      />
                      Generating prediction…
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="mb-2 flex items-center gap-2 font-semibold text-muted-foreground">
                  <Newspaper className="h-4 w-4" />
                  Recent News
                </h4>
                <p className="rounded-md p-2 text-xs leading-tight">
                  Nvidia lifts datacentre outlook as hyperscaler orders accelerate
                  <span className="mt-0.5 block text-muted-foreground">Reuters · today</span>
                </p>
              </div>
            </div>
          )}
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
      <DashboardBackdrop />
    </AppChrome>
  );
}
