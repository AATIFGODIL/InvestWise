// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * The band between the feature cinema and the rest of the page.
 *
 * Two tapes running against each other. Opposed directions matter: two rows
 * travelling the same way read as one big object sliding past, which is a much
 * heavier piece of motion than intended. Against each other they cancel out
 * and the band sits still as a whole while its contents move.
 *
 * The loop is a duplicated track translated by exactly -50%, so it seams
 * perfectly and never leaves the compositor.
 */

const TAPE_A = [
  { symbol: "NVDA", delta: "+2.44", up: true },
  { symbol: "AAPL", delta: "+0.86", up: true },
  { symbol: "TSLA", delta: "−1.12", up: false },
  { symbol: "MSFT", delta: "+0.34", up: true },
  { symbol: "AMZN", delta: "+1.61", up: true },
  { symbol: "META", delta: "−0.41", up: false },
  { symbol: "GOOGL", delta: "+0.72", up: true },
  { symbol: "AMD", delta: "+1.07", up: true },
];

const TAPE_B = [
  { symbol: "SPY", delta: "+0.42", up: true },
  { symbol: "QQQ", delta: "+0.68", up: true },
  { symbol: "COST", delta: "−0.23", up: false },
  { symbol: "V", delta: "+0.51", up: true },
  { symbol: "NFLX", delta: "+1.94", up: true },
  { symbol: "DIS", delta: "−0.77", up: false },
  { symbol: "JPM", delta: "+0.29", up: true },
  { symbol: "KO", delta: "+0.11", up: true },
];

/**
 * Claims only, no invented metrics.
 *
 * The obvious thing to put here is a user count and a symbol count, and both
 * would be made up — there is no analytics number to quote and the Finnhub
 * coverage isn't ours to state. Each of these is instead something the code
 * can be checked against: paper trading (README), live quotes (Finnhub), and
 * the Pro Mode toggle (`pro-mode-store.ts`).
 */
const STATS = [
  { value: "$0", label: "of your own money at risk" },
  { value: "Live", label: "market quotes, not delayed samples" },
  { value: "2", label: "modes — guided, then pro" },
];

export function ProofBand() {
  return (
    <section className="relative z-20 overflow-hidden border-y border-white/[0.07] bg-background py-16">
      <div className="space-y-3">
        <Tape rows={TAPE_A} duration={52} />
        <Tape rows={TAPE_B} duration={64} direction="right" />
      </div>

      <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 px-6 text-center sm:grid-cols-3">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <p
              className="lp-display lp-tnum text-[clamp(2rem,4vw,2.9rem)]"
              style={{ color: "hsl(var(--primary))" }}
            >
              {stat.value}
            </p>
            <p className="lp-body mt-1.5 text-[13px]">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Tape({
  rows,
  duration,
  direction = "left",
}: {
  rows: typeof TAPE_A;
  duration: number;
  direction?: "left" | "right";
}) {
  return (
    <div
      className="relative flex overflow-hidden"
      // Faded at both edges so the tape has no visible start or end. A mask
      // rather than gradient overlays, so it works over any backdrop.
      style={{
        WebkitMaskImage:
          "linear-gradient(to right, transparent, #000 9%, #000 91%, transparent)",
        maskImage: "linear-gradient(to right, transparent, #000 9%, #000 91%, transparent)",
      }}
      aria-hidden
    >
      <div
        className="lp-marquee-track"
        data-direction={direction}
        style={{ "--lp-marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        {/* Duplicated so the -50% translate lands on an identical frame. */}
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0">
            {rows.map((row) => (
              <span
                key={`${copy}-${row.symbol}`}
                className="lp-glass mx-1.5 flex shrink-0 items-center gap-3 rounded-full px-5 py-2.5"
              >
                <span className="text-[13px] font-bold tracking-tight text-foreground">
                  {row.symbol}
                </span>
                <span
                  className={cn(
                    "lp-tnum text-[12px] font-semibold",
                    row.up ? "text-emerald-400" : "text-red-400"
                  )}
                >
                  {row.delta}%
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
