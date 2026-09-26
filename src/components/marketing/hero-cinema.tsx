// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Rotate3d } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeroBackdrop } from "@/components/marketing/hero-backdrop";
import { InvestWiseLogo } from "@/components/marketing/investwise-logo";
import { MarketSculpture, type SculpturePhase } from "@/components/marketing/market-sculpture";
import { TickerLogo } from "@/components/marketing/mock/mock-kit";
import { useQuotes, type Quote } from "@/components/marketing/use-quotes";
import type { StageCapabilities } from "@/components/marketing/use-stage-capabilities";

/**
 * The opening.
 *
 * The glyph is the hero's centrepiece and it is the same object the loader was
 * spinning: while `phase` is anything but `settled` it is posed large and
 * centred over the loader's backdrop; when it settles it glides to its place
 * on the right, and the copy assembles on the left.
 *
 * It lives in that place. You can pick it up — but only to turn it: drag spins
 * and tips it, a flick throws it, and it winds down facing you again. Around it
 * runs a ring of market quotes, orbiting slowly in 3D and passing behind and
 * in front of the mark. The ring is coupled to the glyph: throw the glyph and
 * the market spins with it. That coupling is the whole idea of the page in one
 * gesture — the brand, and the market it sits in, moving as one object.
 */

/** The glyph's render surface, in px — the largest the page ever shows it. */
const GLYPH_BOX = 460;
/** Its resting size, as a fraction of that box. */
const HOME_SCALE = 0.84;
/** Where the stage sits: right of centre, never further than the grid allows. */
const HOME_X = "min(25vw, 330px)";

const LOADER_POSE = "translate(-50%, -50%) translateX(0px) translateY(0px) scale(1)";
const HOME_POSE = `translate(-50%, -50%) translateX(${HOME_X}) translateY(-10px) scale(${HOME_SCALE})`;

/** The ring's symbols. VOO is the odd one out on purpose — the recurring buy. */
const RING = ["NVDA", "AAPL", "TSLA", "MSFT", "VOO", "AMZN", "GOOGL", "META"];

export function HeroCinema({
  caps,
  phase,
  phaseRef,
}: {
  caps: StageCapabilities;
  phase: SculpturePhase;
  phaseRef: React.MutableRefObject<SculpturePhase>;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const settled = phase === "settled";
  const quotes = useQuotes(RING);
  const [grabbed, setGrabbed] = useState(false);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], ["0vh", "-14vh"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const sculptureProgress = useRef(0);
  const velocityRef = useRef(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    sculptureProgress.current = p;
  });

  // Not gated on `caps.checked`: the sculpture is the first thing the loader
  // puts on screen, and waiting a render for the media queries is what made it
  // appear a beat late. `canStage` is only false on a narrow or touch viewport,
  // which takes the compact branch below and never renders this at all.
  const showSculpture = !caps.prefersReducedMotion && (!caps.checked || caps.canStage);

  // ─── Compact ───────────────────────────────────────────────────────────────
  if (caps.checked && !caps.canStage) {
    return (
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center px-5 pb-16 pt-24 text-center">
        <HeroBackdrop />
        <Copy settled align="center" />
        <div className="relative z-10 mt-12 flex w-full max-w-md flex-wrap justify-center gap-2">
          {RING.slice(0, 6).map((symbol) => (
            <QuoteChip key={symbol} symbol={symbol} quote={quotes[symbol]} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative h-screen min-h-[680px] overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ opacity: settled ? 1 : 0, transition: "opacity 1200ms ease-out 120ms" }}
      >
        <HeroBackdrop />
      </div>

      {/* A pool of light under the stage, so the glyph reads as placed. */}
      <div
        className="pointer-events-none absolute top-1/2 h-[220px] w-[620px] rounded-[50%]"
        style={{
          left: `calc(50% + ${HOME_X})`,
          transform: "translate(-50%, 60%)",
          background: "radial-gradient(closest-side, hsl(var(--primary) / 0.35), transparent)",
          filter: "blur(18px)",
          opacity: settled ? 1 : 0,
          transition: "opacity 900ms ease-out 200ms",
        }}
        aria-hidden
      />

      {/* The copy */}
      <motion.div
        style={{ y: copyY, opacity: copyOpacity }}
        className="pointer-events-none absolute inset-0 z-20 mx-auto flex max-w-[1320px] items-center px-[max(40px,5vw)]"
      >
        <div className="pointer-events-auto w-[min(560px,44vw)]">
          <Copy settled={settled} align="left" />
        </div>
      </motion.div>

      {/* The ring of quotes. Its chips interleave with the glyph's z-order
          (behind it at the back of the orbit, in front at the front), so this
          layer deliberately creates no stacking context of its own. */}
      <QuoteRing
        quotes={quotes}
        settled={settled}
        velocityRef={velocityRef}
        reducedMotion={caps.prefersReducedMotion}
      />

      {showSculpture ? (
        <div
          className={cn("absolute left-1/2 top-1/2", settled ? "z-[30]" : "z-[200]")}
          style={{
            width: GLYPH_BOX,
            height: GLYPH_BOX,
            transform: settled ? HOME_POSE : LOADER_POSE,
            // The glide home: quick, with the tiniest overshoot — it is an
            // object being set down.
            transition: "transform 1000ms cubic-bezier(0.34, 1.2, 0.36, 1)",
          }}
        >
          <MarketSculpture
            phaseRef={phaseRef}
            progressRef={sculptureProgress}
            velocityRef={velocityRef}
            onGrab={() => setGrabbed(true)}
            turns={0.35}
            className={cn("h-full w-full", settled && "cursor-grab")}
          />
        </div>
      ) : (
        caps.checked && (
          <div
            className="absolute left-1/2 top-1/2 z-[30] w-[320px]"
            style={{ transform: `translate(-50%, -50%) translateX(${HOME_X})` }}
          >
            <InvestWiseLogo sizes="320px" />
          </div>
        )
      )}

      {/* The affordance, retired the first time it's used. */}
      {showSculpture && (
        <div
          className="pointer-events-none absolute top-1/2 z-[45] flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-medium text-foreground/70 lp-glass"
          style={{
            left: `calc(50% + ${HOME_X})`,
            transform: "translate(-50%, 210px)",
            opacity: settled && !grabbed ? 1 : 0,
            transition: "opacity 500ms ease-out 900ms",
          }}
          aria-hidden
        >
          <Rotate3d className="h-3.5 w-3.5" />
          Drag to spin
        </div>
      )}
    </section>
  );
}

/**
 * The lockup. One component, used by both takes, so the staged and compact
 * versions never drift apart on a copy edit.
 */
function Copy({ settled, align }: { settled: boolean; align: "left" | "center" }) {
  const rise = (delay: number): React.CSSProperties => ({
    opacity: settled ? 1 : 0,
    transform: settled ? "translateY(0)" : "translateY(22px)",
    filter: settled ? "blur(0)" : "blur(8px)",
    transition: `opacity 700ms ease-out ${delay}ms, transform 800ms cubic-bezier(0.32, 0.72, 0, 1) ${delay}ms, filter 700ms ease-out ${delay}ms`,
  });

  return (
    <div className={cn("relative z-10 flex flex-col", align === "center" ? "items-center" : "items-start")}>
      <div style={rise(200)} className="mb-8">
        <InvestWiseLogo className="w-[clamp(180px,16vw,236px)]" sizes="236px" priority />
      </div>

      <h1 className="lp-display text-[clamp(3rem,6.2vw,5.6rem)] text-foreground">
        <span className="block" style={rise(300)}>
          Learn without
        </span>
        <span className="lp-gradient-text block pb-2" style={rise(400)}>
          the losses.
        </span>
      </h1>

      <p
        className={cn(
          "mt-5 text-[clamp(1.15rem,1.7vw,1.5rem)] font-semibold tracking-[-0.01em] text-foreground/80",
          align === "center" && "text-center"
        )}
        style={rise(520)}
      >
        Paper trading platform for the youth.
      </p>

      <div className="mt-9 flex flex-wrap items-center gap-3" style={rise(640)}>
        <Link
          href="/auth/signup"
          className="lp-cta lp-focus group flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold text-primary-foreground"
          style={{
            background: "hsl(var(--primary))",
            boxShadow: "0 16px 44px -14px hsl(var(--primary)), inset 0 1px 0 0 hsl(0 0% 100% / 0.24)",
          }}
        >
          Get started
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
        <a
          href="#dashboard"
          className="lp-cta lp-focus lp-glass rounded-full px-7 py-3.5 text-[15px] font-semibold text-foreground"
        >
          See the app
        </a>
      </div>
    </div>
  );
}

/** One quote, on glass. */
function QuoteChip({ symbol, quote }: { symbol: string; quote?: Quote }) {
  const up = (quote?.changePercent ?? 0) >= 0;
  return (
    <span className="lp-glass flex items-center gap-2.5 rounded-2xl py-2 pl-2 pr-3.5">
      <TickerLogo symbol={symbol} className="h-8 w-8" />
      <span className="flex flex-col items-start leading-tight">
        <span className="text-[13px] font-bold tracking-tight text-foreground">{symbol}</span>
        <span className="flex items-center gap-1.5">
          <span className="lp-tnum text-[12px] text-foreground/65">
            {quote ? `$${quote.price.toFixed(2)}` : "—"}
          </span>
          {quote && (
            <span className={cn("lp-tnum text-[11.5px] font-semibold", up ? "text-emerald-400" : "text-red-400")}>
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
 * The orbit. Positions are written straight to each chip's `transform` from a
 * rAF loop — eight elements moving every frame is compositor work, and going
 * through React for it would be a render per frame for nothing.
 *
 * Depth is faked the honest way: chips at the back of the ellipse are smaller,
 * dimmer, and sit *behind* the glyph in z-order; at the front they are full
 * size and in front of it.
 */
function QuoteRing({
  quotes,
  settled,
  velocityRef,
  reducedMotion,
}: {
  quotes: Record<string, Quote>;
  settled: boolean;
  velocityRef: React.MutableRefObject<number>;
  reducedMotion: boolean;
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
    const n = RING.length;

    const place = (now: number) => {
      const rx = Math.min(300, window.innerWidth * 0.2);
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
  }, [reducedMotion, velocityRef]);

  return (
    <div
      className="pointer-events-none absolute top-1/2 hidden lg:block"
      style={{ left: `calc(50% + ${HOME_X})` }}
      aria-hidden
    >
      {RING.map((symbol, i) => (
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
