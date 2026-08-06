// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  AppChrome,
  CASUAL_NAV,
  PRO_NAV,
  SpotlightButton,
} from "@/components/marketing/app-chrome";
import { DemoCursor } from "@/components/marketing/device-frame";
import { DashboardBackdrop } from "@/components/marketing/demos/dashboard-backdrop";
import { between, ramp, useDemoClock } from "@/components/marketing/demo-clock";

/**
 * Pro Mode — the same account, a denser instrument.
 *
 * `pro-mode-store.ts` is a single persisted boolean, and flipping it changes
 * what the app is willing to show you: `bottom-nav.tsx` swaps Goals for
 * Research, the header collapses to its accent line, and the layout trades
 * guidance for density. This records that flip, and then flips it back —
 * the point of a toggle is that it goes both ways, and a recording that only
 * ever travels in one direction quietly implies a door with no handle on the
 * far side.
 */

// ─── Script ──────────────────────────────────────────────────────────────────
const CURSOR_UP = 640;
const TAP_ON = 1180;
const MORPH_IN = 1320;
const MORPH_DONE = 2380;
const CURSOR_BACK = 6500;
const TAP_OFF = 7000;
const MORPH_OUT = 7140;
const LOOP = 9600;

const TAPE = [
  { symbol: "NVDA", price: "184.92", delta: "+2.44", up: true },
  { symbol: "AMD", price: "142.18", delta: "+1.07", up: true },
  { symbol: "TSLA", price: "246.31", delta: "−1.12", up: false },
  { symbol: "AAPL", price: "231.40", delta: "+0.86", up: true },
  { symbol: "MSFT", price: "418.77", delta: "+0.34", up: true },
  { symbol: "META", price: "596.02", delta: "−0.41", up: false },
];

const BOOK = [
  { px: "184.94", size: "1,204", side: "ask" },
  { px: "184.93", size: "3,880", side: "ask" },
  { px: "184.92", size: "2,455", side: "bid" },
  { px: "184.91", size: "6,102", side: "bid" },
  { px: "184.90", size: "4,318", side: "bid" },
];

/** Deterministic candle series — same shape on every loop. */
const CANDLES = Array.from({ length: 22 }, (_, i) => {
  const base = 34 + Math.sin(i * 0.72) * 12 + Math.sin(i * 0.31) * 7;
  const height = 8 + Math.abs(Math.sin(i * 1.31)) * 15;
  return { y: base, h: height, up: Math.sin(i * 1.31) > 0 };
});

export function ProModeDemo({
  active,
  reducedMotion,
}: {
  active: boolean;
  reducedMotion: boolean;
}) {
  const t = useDemoClock(active, LOOP, { staticFrame: 4200, reducedMotion });

  // One value drives everything: 0 = guided, 1 = pro. Ramping in and back out
  // means the morph is genuinely reversible rather than two separate states
  // cross-faded, which is what makes the layout appear to *rearrange*.
  const pro = t >= MORPH_OUT ? 1 - ramp(t, MORPH_OUT, MORPH_OUT + 900) : ramp(t, MORPH_IN, MORPH_DONE);
  const isPro = pro > 0.5;

  // The toggle lives in the header, left of the Spotlight button — the pointer
  // only ever goes there and back.
  const cursor = t >= CURSOR_UP ? { x: 466, y: 46 } : { x: 660, y: 470 };

  return (
    <AppChrome
      navItems={isPro ? PRO_NAV : CASUAL_NAV}
      activeNav={isPro ? 3 : 0}
      proMode={isPro}
      headerCentre={<SpotlightButton />}
    >
      {/* Guided layout — fades back and blurs out rather than simply vanishing,
          so the two layouts read as the same surface changing depth. */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 1 - pro,
          transform: `scale(${1 - pro * 0.05})`,
          filter: `blur(${pro * 9}px)`,
          pointerEvents: "none",
        }}
      >
        <DashboardBackdrop />
      </div>

      {/* Pro layout — arrives from slightly behind and settles forward */}
      <div
        className="absolute inset-0 px-7 pb-5 pt-1"
        style={{
          opacity: pro,
          transform: `scale(${0.96 + pro * 0.04})`,
          filter: `blur(${(1 - pro) * 9}px)`,
          pointerEvents: "none",
        }}
      >
        {/* Ticker tape */}
        <div className="mb-4 flex gap-2 overflow-hidden">
          {TAPE.map((row, i) => (
            <div
              key={row.symbol}
              className="flex-1 rounded-[calc(var(--radius)/1.6)] bg-card px-3 py-2 shadow-[inset_0_0_0_1px_hsl(var(--border))]"
              style={{
                opacity: ramp(t, MORPH_IN + i * 55, MORPH_IN + i * 55 + 300),
                transform: `translateY(${(1 - ramp(t, MORPH_IN + i * 55, MORPH_IN + i * 55 + 300)) * 12}px)`,
              }}
            >
              <p className="text-[10px] font-semibold tracking-wide text-foreground/50">
                {row.symbol}
              </p>
              <p className="lp-tnum text-[15px] font-bold leading-tight text-foreground">
                {row.price}
              </p>
              <p
                className={cn(
                  "lp-tnum text-[10px] font-semibold",
                  row.up ? "text-emerald-400" : "text-red-400"
                )}
              >
                {row.delta}%
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_268px] gap-4">
          {/* Chart panel */}
          <div
            className="rounded-[var(--radius)] bg-card p-4 shadow-[inset_0_0_0_1px_hsl(var(--border))]"
            style={{ opacity: ramp(t, MORPH_IN + 220, MORPH_IN + 620) }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-baseline gap-2.5">
                <span className="text-[15px] font-bold text-foreground">NVDA</span>
                <span className="lp-tnum text-[13px] font-semibold text-emerald-400">
                  184.92 +2.44%
                </span>
              </div>
              <div className="flex gap-1">
                {["1D", "1W", "1M", "1Y"].map((r, i) => (
                  <span
                    key={r}
                    className={cn(
                      "rounded px-2 py-0.5 text-[10px] font-semibold",
                      i === 2 ? "text-primary-foreground" : "text-foreground/45"
                    )}
                    style={i === 2 ? { background: "hsl(var(--primary))" } : undefined}
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <svg viewBox="0 0 560 150" className="h-[150px] w-full" aria-hidden>
              {[30, 60, 90, 120].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="560"
                  y2={y}
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
              ))}
              {CANDLES.map((c, i) => {
                const x = 12 + i * 25;
                const colour = c.up ? "rgb(52 211 153)" : "rgb(248 113 113)";
                return (
                  <g key={i} style={{ opacity: ramp(t, MORPH_IN + 320 + i * 22, MORPH_IN + 560 + i * 22) }}>
                    <line
                      x1={x + 5}
                      y1={c.y - 6}
                      x2={x + 5}
                      y2={c.y + c.h + 6}
                      stroke={colour}
                      strokeWidth="1.5"
                    />
                    <rect x={x} y={c.y} width="10" height={c.h} rx="1.5" fill={colour} />
                  </g>
                );
              })}
            </svg>

            {/* Volume histogram */}
            <svg viewBox="0 0 560 40" className="mt-1 h-[40px] w-full" aria-hidden>
              {CANDLES.map((c, i) => (
                <rect
                  key={i}
                  x={12 + i * 25}
                  y={40 - (10 + Math.abs(Math.sin(i * 0.9)) * 26)}
                  width="10"
                  height={10 + Math.abs(Math.sin(i * 0.9)) * 26}
                  rx="1.5"
                  fill="hsl(var(--primary) / 0.4)"
                  style={{ opacity: ramp(t, MORPH_IN + 420 + i * 22, MORPH_IN + 660 + i * 22) }}
                />
              ))}
            </svg>
          </div>

          {/* Order book */}
          <div
            className="rounded-[var(--radius)] bg-card p-4 shadow-[inset_0_0_0_1px_hsl(var(--border))]"
            style={{
              opacity: ramp(t, MORPH_IN + 360, MORPH_IN + 760),
              transform: `translateX(${(1 - ramp(t, MORPH_IN + 360, MORPH_IN + 760)) * 18}px)`,
            }}
          >
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/45">
              Order book
            </p>
            <div className="space-y-1.5">
              {BOOK.map((row) => (
                <div key={row.px} className="relative flex items-center justify-between text-[11px]">
                  <span
                    className="absolute inset-y-0 right-0 rounded-sm"
                    style={{
                      width: `${parseInt(row.size.replace(",", ""), 10) / 78}%`,
                      background:
                        row.side === "ask" ? "rgb(248 113 113 / 0.14)" : "rgb(52 211 153 / 0.14)",
                    }}
                  />
                  <span
                    className={cn(
                      "lp-tnum relative font-semibold",
                      row.side === "ask" ? "text-red-400" : "text-emerald-400"
                    )}
                  >
                    {row.px}
                  </span>
                  <span className="lp-tnum relative text-foreground/55">{row.size}</span>
                </div>
              ))}
            </div>

            <div className="my-3 h-px bg-border" />

            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/45">
              Signals
            </p>
            {[
              { label: "RSI (14)", value: "62.4", tone: "text-foreground" },
              { label: "MACD", value: "Bullish", tone: "text-emerald-400" },
              { label: "Beta", value: "1.74", tone: "text-foreground" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between py-1 text-[11px]">
                <span className="text-foreground/55">{s.label}</span>
                <span className={cn("lp-tnum font-semibold", s.tone)}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DemoCursor
        x={cursor.x}
        y={cursor.y}
        pressed={between(t, TAP_ON, TAP_ON + 140) || between(t, TAP_OFF, TAP_OFF + 140)}
        tapKey={
          between(t, TAP_ON, TAP_ON + 700)
            ? "on"
            : between(t, TAP_OFF, TAP_OFF + 700)
              ? "off"
              : undefined
        }
      />
    </AppChrome>
  );
}
