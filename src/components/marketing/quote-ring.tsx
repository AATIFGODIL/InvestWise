// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { TickerLogo } from "@/components/marketing/mock/mock-kit";
import type { Quote } from "@/components/marketing/use-quotes";

/** The ring's symbols. VOO is the odd one out on purpose — the recurring buy. */
export const RING_SYMBOLS = ["NVDA", "AAPL", "TSLA", "MSFT", "VOO", "AMZN", "GOOGL", "META"];

/** One quote, on glass. Self-contained styling, so it works outside the landing page. */
export function QuoteChip({ symbol, quote }: { symbol: string; quote?: Quote }) {
  const up = (quote?.changePercent ?? 0) >= 0;
  return (
    <span className="flex items-center gap-2.5 rounded-2xl bg-white/6 py-2 pl-2 pr-3.5 shadow-[inset_0_0_0_1px_hsl(0_0%_100%/0.12),0_24px_60px_-24px_hsl(var(--primary)/0.35),0_8px_24px_-12px_hsl(0_0%_0%/0.6)] backdrop-blur-[20px] backdrop-saturate-150">
      <TickerLogo symbol={symbol} className="h-8 w-8" />
      <span className="flex flex-col items-start leading-tight">
        <span className="text-[13px] font-bold tracking-tight text-foreground">{symbol}</span>
        <span className="flex items-center gap-1.5 tabular-nums">
          <span className="text-[12px] text-foreground/65">{quote ? `$${quote.price.toFixed(2)}` : "—"}</span>
          {quote && (
            <span className={cn("text-[11.5px] font-semibold", up ? "text-emerald-400" : "text-red-400")}>
              {up ? "+" : "−"}
              {Math.abs(quote.changePercent).toFixed(2)}%
            </span>
          )}
        </span>
      </span>
    </span>
  );
}

/** Idle orbit speed, rad/ms: one lap every ~70s. */
const RING_SPEED = 0.00009;
/** How much of the glyph's spin the ring picks up. */
const RING_COUPLING = 0.6;

/**
 * A ring of quotes orbiting a point, in 3D. Positions are written straight to
 * each chip's `transform` from a rAF loop — eight elements moving every frame
 * is compositor work, and going through React for it would be a render per
 * frame for nothing.
 *
 * Depth is faked the honest way: chips at the back of the ellipse are smaller,
 * dimmer, and sit *behind* the glyph in z-order (z 10 vs the glyph's 30); at
 * the front they are full size and in front of it (z 40). The layer creates no
 * stacking context of its own, so that interleaving works.
 *
 * `velocityRef` couples the orbit to the glyph: throw the glyph and the ring
 * picks up its spin.
 */
export function QuoteRing({
  quotes,
  settled,
  velocityRef,
  reducedMotion,
  symbols = RING_SYMBOLS,
  maxRadius = 300,
  radiusFraction = 0.2,
  className,
  style,
}: {
  quotes: Record<string, Quote>;
  settled: boolean;
  velocityRef: React.MutableRefObject<number>;
  reducedMotion: boolean;
  symbols?: string[];
  /** The ring's horizontal radius: `min(maxRadius, viewport width × radiusFraction)`. */
  maxRadius?: number;
  radiusFraction?: number;
  className?: string;
  /** Where the ring's centre sits (`left` / `top`). */
  style?: React.CSSProperties;
}) {
  const chipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const settledAt = useRef<number | null>(null);

  useEffect(() => {
    if (settled && settledAt.current === null) settledAt.current = performance.now();
  }, [settled]);

  useEffect(() => {
    let frame = 0;
    let previous = performance.now();
    let theta = 0.35;
    let omega = RING_SPEED;
    const n = symbols.length;

    const place = (now: number) => {
      const rx = Math.min(maxRadius, window.innerWidth * radiusFraction);
      const ry = 78;
      // The ring arrives after the glyph has landed, one chip after another.
      const since = settledAt.current === null ? -1 : now - settledAt.current;
      chipRefs.current.forEach((el, i) => {
        if (!el) return;
        const a = theta + (i / n) * Math.PI * 2;
        const depth = Math.cos(a);
        const t = (depth + 1) / 2;
        const arrive = since < 0 ? 0 : Math.min(1, Math.max(0, (since - 500 - i * 70) / 600));
        const x = rx * Math.sin(a);
        const y = ry * depth + 24 + (1 - arrive) * 30;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${(0.7 + 0.3 * t).toFixed(3)})`;
        el.style.opacity = ((0.22 + 0.78 * t) * arrive).toFixed(3);
        el.style.zIndex = depth > 0 ? "40" : "10";
      });
    };

    const loop = (now: number) => {
      const dt = Math.min(now - previous, 64);
      previous = now;
      const target = RING_SPEED + velocityRef.current * RING_COUPLING;
      // Eased, so a throw hands its momentum to the ring rather than jerking it.
      omega += (target - omega) * Math.min(1, dt / 120);
      theta += omega * dt;
      place(now);
      frame = requestAnimationFrame(loop);
    };

    if (reducedMotion) {
      settledAt.current = settledAt.current ?? performance.now() - 10_000;
      place(performance.now() + 10_000);
    } else {
      frame = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion, velocityRef, symbols.length, maxRadius, radiusFraction]);

  return (
    <div className={cn("pointer-events-none absolute", className)} style={style} aria-hidden>
      {symbols.map((symbol, i) => (
        <div
          key={symbol}
          ref={(el) => {
            chipRefs.current[i] = el;
          }}
          className="absolute left-0 top-0 will-change-transform"
          style={{ opacity: 0 }}
        >
          <QuoteChip symbol={symbol} quote={quotes[symbol]} />
        </div>
      ))}
    </div>
  );
}
