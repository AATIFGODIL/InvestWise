// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useMotionTemplate, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardBackdrop } from "@/components/marketing/demos/dashboard-backdrop";
import { DeviceFrame } from "@/components/marketing/device-frame";
import { HeroBackdrop } from "@/components/marketing/hero-backdrop";
import { InvestWiseLogo } from "@/components/marketing/investwise-logo";
import { MarketSculpture, type SculpturePhase } from "@/components/marketing/market-sculpture";
import type { StageCapabilities } from "@/components/marketing/use-stage-capabilities";

/**
 * The opening.
 *
 * The sculpture is the hero's anchor, and it is the same object the loader was
 * spinning: while `phase` is anything but `settled` it is posed large and
 * centred over the loader's backdrop; when it settles it drops to the foot of
 * the frame, and everything else — copy, chips, background — arrives with it.
 * There is no cross-fade between loader and page, because there is only ever
 * one glyph on screen. Down there it is also the one thing on the page you can
 * pick up: drag it and it follows, spins with the throw, and swings home.
 *
 * Once settled, the scroll does one job with a hold on either side:
 *
 * ─ 0.00–0.30  the lockup, HOLDING. Nothing moves for the first ~70vh.
 * ─ 0.30–0.68  the device rises out of the floor in 3D and flattens toward you
 *              while the lockup and the glyph lift away above it
 * ─ 0.68–1.00  the device holds, then pushes past the camera into the features
 *
 * The holds matter more than the move: at speed you can outrun a fade, but not
 * a dead stop, so both states stay legible however fast the page is scrolled.
 */

/** The lockup sits still until here. */
const HOLD = 0.3;
/** The device starts rising; the lockup starts leaving. */
const RISE = 0.3;
/** Touchdown: raked and low → flat and full size. */
const LANDED = 0.68;

/**
 * The glyph's render surface, in px. Deliberately the *largest* the page ever
 * shows it: both poses below only ever scale down from here, so the canvas is
 * oversampled at rest rather than interpolated up during the loader — which is
 * what made the splash look soft.
 */
const GLYPH_BOX = 460;
/** Its resting size, as a fraction of that box. */
const HOME_SCALE = 0.78;
/** Centre of the resting glyph, measured up from the foot of the viewport. */
const HOME_LIFT = 160;
/** How much of the frame's height the copy is centred within, above it. */
const LOCKUP_BAND_VH = 62;

/**
 * The two poses, as one transform each. Both are absolute rather than deltas,
 * so nothing has to be kept in sync — the box is laid out at the top of the
 * frame and each pose says where in the viewport it actually goes.
 */
const HOME_POSE = `translateY(calc(100vh - ${HOME_LIFT + GLYPH_BOX / 2}px)) scale(${HOME_SCALE})`;
const LOADER_POSE = `translateY(calc(50vh - ${GLYPH_BOX / 2}px)) scale(1)`;

export function HeroCinema({
  caps,
  phase,
  phaseRef,
}: {
  caps: StageCapabilities;
  phase: SculpturePhase;
  phaseRef: React.MutableRefObject<SculpturePhase>;
}) {
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const settled = phase === "settled";

  // The lockup holds, then lifts and clears as the device takes the frame.
  const lockupOpacity = useTransform(scrollYProgress, [0, HOLD, RISE + 0.16], [1, 1, 0]);
  const lockupY = useTransform(scrollYProgress, [HOLD, RISE + 0.2], ["0vh", "-18vh"]);

  // The device rises out of the floor: steeply raked and low, flattening and
  // lifting as it comes. The intermediate frames point at where it's going, so
  // the final state is predictable long before it arrives.
  const deviceY = useTransform(scrollYProgress, [RISE, LANDED, 1], ["62vh", "6vh", "-4vh"]);
  const deviceRotate = useTransform(scrollYProgress, [RISE, LANDED], [40, 6]);
  const deviceScale = useTransform(scrollYProgress, [RISE, LANDED, 1], [0.84, 1, 1.1]);
  const deviceOpacity = useTransform(scrollYProgress, [RISE, RISE + 0.08, 0.92, 1], [0, 1, 1, 0]);
  const deviceBlurPx = useTransform(scrollYProgress, [LANDED, 1], [0, 12]);
  const deviceBlur = useMotionTemplate`blur(${deviceBlurPx}px)`;
  const transform = useMotionTemplate`perspective(1600px) translateY(${deviceY}) rotateX(${deviceRotate}deg) scale(${deviceScale})`;

  // The glyph leaves with the lockup rather than with the device, so the two
  // are never on screen competing for the same attention. It sinks rather than
  // lifts: it is sitting on the floor of the frame, and the device rises
  // through exactly that spot a moment later.
  const glyphOpacity = useTransform(scrollYProgress, [0, HOLD, RISE + 0.1], [1, 1, 0]);
  const glyphScrollY = useTransform(scrollYProgress, [HOLD, RISE + 0.2], ["0vh", "16vh"]);

  const sculptureProgress = useRef(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    sculptureProgress.current = p;
  });

  // Not gated on `caps.checked`. The sculpture is the *first* thing the loader
  // puts on screen, and waiting a render for the media queries to resolve is
  // exactly what made it appear a beat late, out of nothing. `canStage` is only
  // ever false on a narrow or touch viewport, which takes the compact branch
  // below and never renders this at all — so the optimistic first paint is only
  // ever wrong for the one frame before `checked` flips.
  const showSculpture = !caps.prefersReducedMotion && (!caps.checked || caps.canStage);

  // ─── Compact fallback ──────────────────────────────────────────────────────
  // Pinned choreography is wrong on a phone, so the same content is delivered
  // as an ordinary stacked hero. Gated on `checked` so the desktop take is
  // never rendered and then snatched away once the media query resolves.
  if (caps.checked && !caps.canStage) {
    return (
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center px-5 pb-16 pt-24 text-center">
        <HeroBackdrop />
        <Lockup />
        <div className="relative z-10 mt-12 w-full max-w-md">
          <DeviceFrame label="The InvestWise dashboard: portfolio value, performance chart, watchlist and holdings.">
            <DashboardBackdrop />
          </DeviceFrame>
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="relative h-[230vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* The background arrives with the settle, not before — the loader's
            own backdrop is what is on screen until then. */}
        <div
          style={{
            opacity: settled ? 1 : 0,
            transition: "opacity 700ms ease-out 120ms",
          }}
        >
          <HeroBackdrop />
        </div>

        {/* The glyph. Lifted above the loader's backdrop until it settles, then
            dropped back into the page's own stacking order — but above the
            copy, because once it is down there it is the thing you can grab and
            a layer swallowing the pointer over it would be a dead handle.

            The horizontal centring is `x: "-50%"` rather than the class
            `-translate-x-1/2`: Framer writes `transform` inline, which wins
            over the utility outright, and the glyph sat half its own width to
            the right of centre for exactly that reason. */}
        {showSculpture && (
          <motion.div
            style={{ opacity: glyphOpacity, x: "-50%", y: glyphScrollY }}
            className={cn(
              "pointer-events-none absolute left-1/2 top-0",
              settled ? "z-[30]" : "z-[200]"
            )}
          >
            <div
              style={{
                width: GLYPH_BOX,
                height: GLYPH_BOX,
                transform: settled ? HOME_POSE : LOADER_POSE,
                // The drop: quick, and with the tiniest overshoot, because this
                // one *did* carry momentum — it is an object being set down.
                transition: "transform 900ms cubic-bezier(0.34, 1.3, 0.36, 1)",
              }}
            >
              <MarketSculpture
                phaseRef={phaseRef}
                progressRef={sculptureProgress}
                turns={0.55}
                dragScale={1 / HOME_SCALE}
                className={cn(
                  "h-full w-full",
                  settled && "pointer-events-auto cursor-grab"
                )}
              />
            </div>
          </motion.div>
        )}

        {/* Everything else assembles once the glyph has landed.

            This layer stays full-bleed and untransformed apart from Framer's
            own scroll transform, because the chips inside it are positioned in
            `vw`/`vh` against it. Nesting them under the lockup's reveal — which
            carries a `translateY` — silently made that box their containing
            block, and every chip picked up the lockup's left edge as its
            origin. Hence the two separate children. */}
        <motion.div
          style={{ opacity: lockupOpacity, y: lockupY }}
          className="pointer-events-none absolute inset-0 z-20"
        >
          <MarketChips settled={settled} />

          {/* The copy is centred in the band *above* the glyph rather than in
              the whole frame, so the two aren't fighting for the middle. */}
          <div
            className="flex flex-col items-center justify-center px-6 text-center"
            style={{ height: `${LOCKUP_BAND_VH}vh` }}
          >
            <div
              className="pointer-events-auto flex flex-col items-center"
              style={{
                opacity: settled ? 1 : 0,
                transform: settled ? "translateY(0)" : "translateY(18px)",
                transition:
                  "opacity 620ms ease-out 260ms, transform 620ms cubic-bezier(0.32, 0.72, 0, 1) 260ms",
              }}
            >
              <Lockup />
            </div>
          </div>
        </motion.div>

        {/* The device, rising */}
        <motion.div
          style={{ opacity: deviceOpacity, filter: deviceBlur, willChange: "transform, opacity" }}
          className="absolute inset-x-0 bottom-0 z-10 flex justify-center"
        >
          <motion.div
            style={{ transform, transformOrigin: "50% 100%" }}
            className="w-[min(1060px,84vw)] pb-[6vh]"
          >
            <DeviceFrame label="The InvestWise dashboard: portfolio value, performance chart, watchlist and holdings.">
              <DashboardBackdrop />
            </DeviceFrame>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Live positions, tilted, sitting in the hero's margins.
 *
 * Two jobs. It fills the dead space either side of a centred lockup — which is
 * what made the first pass feel like a template — and it puts the product's
 * actual subject matter on the first screen: real tickers, real deltas, one of
 * them red. The tilts are deliberate and none of them match, because four chips
 * at the same angle read as a grid rather than as clutter on a desk.
 *
 * Positioned in `vw`/`vh` off the edges so they scale with the frame, and
 * hidden below `xl` — on a narrower window this space is the lockup's. The
 * bands they sit in are chosen around the other two things in the frame: clear
 * of the copy in the middle, and clear of the glyph on the floor.
 */
const CHIPS = [
  { symbol: "NVDA", price: "184.92", delta: "+2.44%", up: true, note: null, x: "4vw", y: "13vh", tilt: -7, drift: "a" },
  { symbol: "TSLA", price: "246.31", delta: "−1.12%", up: false, note: null, x: "7vw", y: "58vh", tilt: 5, drift: "b" },
  { symbol: "AAPL", price: "231.40", delta: "+0.86%", up: true, note: null, x: "79vw", y: "11vh", tilt: 6, drift: "b" },
  // The odd one out on purpose: a chip that shows a *habit* rather than a
  // quote, because the recurring buy is the thing the product actually wants
  // you to leave with.
  { symbol: "VOO", price: "50.00", delta: "every Monday", up: true, note: "Auto-invest", x: "77vw", y: "56vh", tilt: -5, drift: "a" },
] as const;

/**
 * `settled` fades these in with the rest of the page. It has to be opacity
 * alone — a transform here would make this box the containing block for the
 * absolutely-positioned chips inside it, which is the bug this layer exists to
 * avoid.
 */
function MarketChips({ settled }: { settled: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 hidden xl:block"
      style={{
        opacity: settled ? 1 : 0,
        transition: "opacity 700ms ease-out 320ms",
      }}
      aria-hidden
    >
      {CHIPS.map((chip) => (
        <div
          key={chip.symbol}
          className={cn(
            "lp-glass absolute flex items-center gap-3 rounded-2xl px-4 py-3",
            chip.drift === "a" ? "lp-chip-a" : "lp-chip-b"
          )}
          style={
            {
              left: chip.x,
              top: chip.y,
              "--lp-tilt": `${chip.tilt}deg`,
            } as React.CSSProperties
          }
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-bold text-foreground"
            style={{ background: "hsl(var(--primary) / 0.18)" }}
          >
            {chip.symbol.charAt(0)}
          </span>
          <span className="flex flex-col items-start gap-0.5 leading-tight">
            {chip.note && (
              <span className="lp-eyebrow text-[8px] text-foreground/40">{chip.note}</span>
            )}
            <span className="text-[14px] font-bold tracking-tight text-foreground">
              {chip.symbol}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="lp-tnum text-[12px] text-foreground/60">${chip.price}</span>
              <span
                className={cn(
                  "lp-tnum text-[12px] font-semibold",
                  chip.note ? "text-foreground/45" : chip.up ? "text-emerald-400" : "text-red-400"
                )}
              >
                {chip.delta}
              </span>
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * The hero lockup. One component, used by both takes, so the pinned version and
 * the compact version can never drift apart on a copy edit.
 *
 * The logo leads. This used to be deliberately absent — the sculpture sat
 * directly above the headline, and a flat copy of the same glyph an inch under
 * a 3D one read as a mistake. With the sculpture moved to the foot of the frame
 * they are far enough apart to be two things rather than one thing twice, and
 * the first screen is better for naming the product on it.
 */
function Lockup() {
  return (
    <div className="relative z-10 flex flex-col items-center">
      <InvestWiseLogo className="mb-7 w-[clamp(200px,20vw,280px)]" sizes="280px" priority />

      <h1 className="lp-display text-[clamp(2.5rem,5.6vw,4.5rem)] text-foreground">
        Learn without{" "}
        <span style={{ color: "hsl(var(--primary))" }}>the losses.</span>
      </h1>

      {/* No figure here on purpose. The app has no fixed starting balance —
          funds are added in simulated $100 deposits (`portfolio-client.tsx`) —
          so any number in this line would be invented. "Paper trading" is the
          README's own word for it. */}
      <p className="lp-body mt-6 text-[clamp(1rem,1.5vw,1.15rem)]">
        Paper trading. Real market prices.
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
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
          href="#features"
          className="lp-cta lp-focus lp-glass rounded-full px-7 py-3.5 text-[15px] font-semibold text-foreground"
        >
          See features
        </a>
      </div>
    </div>
  );
}
