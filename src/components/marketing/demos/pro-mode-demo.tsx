// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React from "react";
import { LayoutGrid, Maximize2, Square } from "lucide-react";
import { DemoCursor } from "@/components/marketing/device-frame";
import { MockShell, ProToggle, TvChart } from "@/components/marketing/mock/mock-kit";
import { MockDashboard } from "@/components/marketing/mock/mock-dashboard";
import { between, ramp, useAnchors, useDemoClock } from "@/components/marketing/demo-clock";

/**
 * Pro Mode — `pro-mode-toggle.tsx` and `research-client.tsx`, recorded.
 *
 * The toggle's thumb rises into a glass bead, slides across and settles; then
 * the app routes to /research. The rail folds away to a 6px accent line down
 * the left edge (hover it and it comes back, with Research where Goals was),
 * and the page is the Pro Research Station: four TradingView charts in a 2×2
 * grid, each carrying RSI, a moving average, MACD and Bollinger Bands. Then it
 * flips back — a toggle has to go both ways.
 */

const CHARTS = [
  { symbol: "AAPL", exchange: "NASDAQ", seed: 3, base: 231 },
  { symbol: "TSLA", exchange: "NASDAQ", seed: 11, base: 246 },
  { symbol: "NVDA", exchange: "NASDAQ", seed: 5, base: 185 },
  { symbol: "BTCUSD", exchange: "BITSTAMP", seed: 17, base: 109000 },
];

// ─── Script ──────────────────────────────────────────────────────────────────
const CURSOR_UP = 500;
const TAP_ON = 1000;
const SLIDE_ON = 1150;
const SETTLE_ON = 1450;
const ROUTE_ON = 1650;
const TO_EDGE = 3300;
const RAIL_OUT = 3700;
const RAIL_IN = 5000;
const CURSOR_BACK = 5600;
const TAP_OFF = 6100;
const SLIDE_OFF = 6250;
const SETTLE_OFF = 6550;
const ROUTE_OFF = 6750;
const LOOP = 9200;

export function ProModeDemo({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const t = useDemoClock(active, LOOP, { staticFrame: 3200, reducedMotion });
  const [rootRef, anchors] = useAnchors(t);

  const onResearch = between(t, ROUTE_ON, ROUTE_OFF);
  const toggleOn = between(t, SLIDE_ON, SLIDE_OFF);
  const lifted = between(t, TAP_ON, SETTLE_ON) || between(t, TAP_OFF, SETTLE_OFF);
  const railPeek = between(t, RAIL_OUT, RAIL_IN);
  const research = t >= ROUTE_OFF ? 1 - ramp(t, ROUTE_OFF, ROUTE_OFF + 350) : ramp(t, ROUTE_ON, ROUTE_ON + 350);

  const toggle = anchors.toggle ?? { x: 540, y: 40 };
  const cursor =
    t >= CURSOR_BACK
      ? toggle
      : t >= RAIL_IN
        ? { x: 640, y: 470 }
        : t >= TO_EDGE
          ? { x: 10, y: 420 }
          : t >= CURSOR_UP
            ? toggle
            : { x: 720, y: 520 };

  return (
    <div ref={rootRef} className="relative h-full w-full">
      <MockShell
        theme="dark"
        proMode={onResearch}
        activeNav={onResearch ? 3 : 0}
        toggleOn={toggleOn}
        toggleLifted={lifted}
        railCollapsed={onResearch && !railPeek}
        overlay={
          <DemoCursor
            x={cursor.x}
            y={cursor.y}
            pressed={between(t, TAP_ON, TAP_ON + 140) || between(t, TAP_OFF, TAP_OFF + 140)}
            tapKey={
              between(t, TAP_ON, TAP_ON + 700) ? "on" : between(t, TAP_OFF, TAP_OFF + 700) ? "off" : undefined
            }
          />
        }
      >
        <div className="relative">
          <div style={{ opacity: 1 - research, transition: "opacity 120ms linear" }}>
            <MockDashboard theme="dark" />
          </div>
          <div
            className="absolute inset-x-0 top-0"
            style={{ opacity: research, transition: "opacity 120ms linear", pointerEvents: "none" }}
          >
            <ResearchStation toggleOn={toggleOn} />
          </div>
        </div>
      </MockShell>
    </div>
  );
}

function ResearchStation({ toggleOn }: { toggleOn: boolean }) {
  return (
    <div className="mx-auto flex min-h-full max-w-[1920px] flex-col space-y-6 p-4 pb-12">
      <div className="flex shrink-0 items-center justify-between">
        <h1 className="ml-20 text-2xl font-bold tracking-tight text-white">Pro Research Station</h1>
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl text-muted-foreground">
            <Square className="h-4 w-4" />
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl text-muted-foreground">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <rect width="8" height="16" x="3" y="4" rx="3" />
              <rect width="8" height="16" x="13" y="4" rx="3" />
            </svg>
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
            <LayoutGrid className="h-4 w-4 rotate-90" />
          </span>
          <span className="ml-2 mr-2">
            <ProToggle on={toggleOn} theme="dark" showLabel={false} />
          </span>
          <span className="ml-2 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 text-white">
            <Maximize2 className="h-4 w-4" />
          </span>
        </div>
      </div>

      <div className="grid min-h-[600px] grid-cols-2 grid-rows-2 gap-4">
        {CHARTS.map((c) => (
          <div
            key={c.symbol}
            className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-card/40 shadow-2xl ring-1 ring-white/60 backdrop-blur-xs"
          >
            <TvChart
              symbol={c.symbol}
              exchange={c.exchange}
              width={616}
              height={292}
              seed={c.seed}
              base={c.base}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
