// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { BrainCircuit, Command, Gauge, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeviceFrame } from "@/components/marketing/device-frame";
import { EditorialTitle } from "@/components/marketing/editorial-title";
import { SpotlightDemo } from "@/components/marketing/demos/spotlight-demo";
import { SpotlightHoverDemo } from "@/components/marketing/demos/spotlight-hover-demo";
import { ProModeDemo } from "@/components/marketing/demos/pro-mode-demo";
import { ClearModeDemo } from "@/components/marketing/demos/clear-mode-demo";
import { CopilotDemo } from "@/components/marketing/demos/copilot-demo";
import type { StageCapabilities } from "@/components/marketing/use-stage-capabilities";

/**
 * The features, staged. One sticky take.
 *
 * The device holds the frame for the whole section — swinging left and right in
 * 3D as each feature takes over — while the copy for that feature swings in on
 * the opposite side, leaning toward the centre so it curves around the device
 * rather than sitting flat beside it.
 *
 * Progress is shown on a rail down the left edge, built to look like the app's
 * own desktop navigation: same 80px pill, same `--primary` glider sliding
 * between items. Scrolling the section is therefore visually identical to
 * moving through the product, which is the point.
 *
 * Scroll budget: the section is 1900vh, so one unit of progress ≈ 19vh. Each
 * feature gets 0.17 (≈325vh): 72vh to fade in, then a ~178vh HOLD where nothing
 * moves at all, then 72vh to leave. The hold is doing the real work — a reader
 * flicking down the page can outrun a fade, but not a dead stop, so every
 * feature stays readable at any scroll speed.
 */

type Feature = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  icon: React.ElementType;
  /** Short label for the progress rail. */
  rail: string;
  /** Which side the copy column sits on. The device takes the other. */
  side: "left" | "right";
  /** [fade-in start, fully in, exit starts, fully gone] as section progress. */
  range: [number, number, number, number];
  demo: React.ComponentType<{ active: boolean; reducedMotion: boolean }>;
  /** Announced in place of the silent recording. */
  label: string;
};

const FEATURES: Feature[] = [
  {
    id: "spotlight",
    eyebrow: "Spotlight Search",
    title: "One box. Everything.",
    body: "Tap Spotlight Search and the whole app becomes a single line of text. Search the market, jump between pages, flip a setting, or pull up a company — its chart, an AI prediction, your holding and the Buy button, without leaving the box you opened.",
    points: ["Live quotes as you type", "Every action, searchable", "Buy without changing page"],
    icon: Command,
    rail: "Search",
    side: "left",
    range: [0.08, 0.118, 0.212, 0.25],
    demo: SpotlightDemo,
    label:
      "A recording of the InvestWise command menu: clicking Spotlight Search, typing N-V-D-A, and opening NVIDIA's detail view with its chart, Buy and Sell buttons and AI prediction.",
  },
  {
    id: "favourites",
    eyebrow: "Hover the header",
    title: "The stuff you actually use.",
    body: "Star anything in Spotlight — a company or a command — and it lives in the header. Hover and your favourites unroll beside the search button. Hold the button for Editing Mode: drag them into order, tap one to switch between an icon and a live-price pill.",
    points: ["Unrolls on hover", "Hold to edit, drag to reorder", "Icons or live-price pills"],
    icon: Star,
    rail: "Favourites",
    side: "right",
    range: [0.25, 0.288, 0.382, 0.42],
    demo: SpotlightHoverDemo,
    label:
      "A recording of the InvestWise header: hovering it unrolls Google, Apple, NVIDIA and Microsoft favourites beside Spotlight Search; a long press enters Editing Mode, Microsoft is dragged to the front, and NVIDIA is tapped into a price pill.",
  },
  {
    id: "pro",
    eyebrow: "Pro Mode",
    title: "Grows up with you.",
    body: "Start guided. When the training wheels get in the way, one switch opens the Pro Research Station: four live TradingView charts carrying RSI, MACD, a moving average and Bollinger Bands. The navigation tucks into a single accent line, and Research takes Goals' place. Flip it back whenever.",
    points: ["Four charts, live indicators", "Research replaces Goals", "Reversible, always"],
    icon: Gauge,
    rail: "Pro Mode",
    side: "left",
    range: [0.42, 0.458, 0.552, 0.59],
    demo: ProModeDemo,
    label:
      "A recording of InvestWise Pro Mode: the header toggle opens the Pro Research Station, a two-by-two grid of TradingView charts with indicators, while the side rail collapses to an accent line; then it switches back.",
  },
  {
    id: "copilot",
    eyebrow: "Co-pilot",
    title: "Knows what you're looking at.",
    body: "Tap Ask AI on any chart and the assistant already knows the page you're on, the stock you're viewing and its price — so the answer is about NVDA right now, not investing in general. Attach a screenshot, or switch to voice and just talk.",
    points: ["Knows the page and the stock", "One tap from any chart", "Voice mode and attachments"],
    icon: BrainCircuit,
    rail: "Co-pilot",
    side: "right",
    range: [0.59, 0.628, 0.722, 0.76],
    demo: CopilotDemo,
    label:
      "A recording of the InvestWise AI assistant: Ask AI is tapped on the Trade page's NVDA chart, the assistant opens, sends an analysis request with NVDA's current price, and replies in plain language.",
  },
  {
    id: "clear",
    eyebrow: "Clear Mode",
    title: "Yours, actually.",
    body: "Settings → Appearance. Turn every surface to liquid glass with Clear, pick any accent from the colour wheel, and move between light and dark without anything breaking. The accent is one value at the top of the app, so charts, the rail and every button follow it.",
    points: ["Clear Mode liquid glass", "Any accent colour", "Light and dark, both first-class"],
    icon: Sparkles,
    rail: "Clear",
    side: "left",
    range: [0.76, 0.798, 0.892, 0.93],
    demo: ClearModeDemo,
    label:
      "A recording of InvestWise Settings, Appearance: Clear Mode turns the surfaces to glass, the hue slider changes the accent from indigo to teal and the page recolours, then the theme flips to light and back to dark.",
  },
];

/** Where the stage arrives, and where the closing bloom begins. */
const STAGE_IN = 0.012;
const STAGE_SET = 0.07;
const BLOOM_START = FEATURES[FEATURES.length - 1].range[3];

/** How far the device sits off centre while a feature holds the frame (px). */
const DEVICE_SHIFT = 150;
/** The stage is nudged right to account for the rail, so it reads as centred. */
const STAGE_OFFSET = 50;

export function FeatureCinema({ caps }: { caps: StageCapabilities }) {
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Which features are on screen, as a bitmask. Ranges butt up against each
  // other, so two are live during a handover and exactly one the rest of the
  // time — which is the whole reason this is a mask and not an index.
  const [liveMask, setLiveMask] = useState(0);
  const liveMaskRef = useRef(0);
  /** The one currently holding the frame — drives which demo clock is running. */
  const [holdingIndex, setHoldingIndex] = useState(-1);
  const holdingRef = useRef(-1);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    let mask = 0;
    let holding = -1;
    FEATURES.forEach(({ range }, i) => {
      if (p >= range[0] && p < range[3]) mask |= 1 << i;
      if (p >= range[1] - 0.02 && p < range[2]) holding = i;
    });
    if (mask !== liveMaskRef.current) {
      liveMaskRef.current = mask;
      setLiveMask(mask);
    }
    if (holding !== holdingRef.current) {
      holdingRef.current = holding;
      setHoldingIndex(holding);
    }
  });

  // ─── Device transform ──────────────────────────────────────────────────────
  // The swing happens in the gap between one feature leaving and the next
  // arriving, so the device is always still while anything is being read.
  const swingInput = FEATURES.flatMap((f, i) =>
    i === FEATURES.length - 1 ? [f.range[1]] : [f.range[1], f.range[3]]
  );
  const swingX = FEATURES.flatMap((f, i) => {
    const x = STAGE_OFFSET + (f.side === "left" ? DEVICE_SHIFT : -DEVICE_SHIFT);
    return i === FEATURES.length - 1 ? [x] : [x, x];
  });
  const swingRotate = FEATURES.flatMap((f, i) => {
    // Leans toward the copy it belongs to, so the two read as facing each other.
    const r = f.side === "left" ? -9 : 9;
    return i === FEATURES.length - 1 ? [r] : [r, r];
  });

  const deviceX = useTransform(scrollYProgress, swingInput, swingX, { clamp: true });
  const deviceRotateY = useTransform(scrollYProgress, swingInput, swingRotate, { clamp: true });
  // One slow, continuous tip across the whole run, underneath the discrete
  // swings — so the stage is never completely static even mid-hold.
  const deviceRotateX = useTransform(scrollYProgress, [STAGE_SET, 1], [7, -4]);
  const deviceScale = useTransform(
    scrollYProgress,
    [STAGE_IN, STAGE_SET, BLOOM_START, 1],
    [0.84, 1, 1, 1.1]
  );
  const deviceOpacity = useTransform(
    scrollYProgress,
    [STAGE_IN, STAGE_SET, BLOOM_START, 1],
    [0, 1, 1, 0]
  );
  const deviceY = useTransform(scrollYProgress, [STAGE_IN, STAGE_SET], ["16vh", "0vh"]);

  const deviceTransform = useMotionTemplate`perspective(1900px) translateX(${deviceX}px) translateY(${deviceY}) rotateY(${deviceRotateY}deg) rotateX(${deviceRotateX}deg) scale(${deviceScale})`;

  const stageOpacity = useTransform(
    scrollYProgress,
    [STAGE_IN, STAGE_SET, BLOOM_START, 1],
    [0, 1, 1, 0]
  );

  // Once the last feature clears, the whole frame blurs and pushes in,
  // dissolving onto whatever is sitting behind it.
  const bloomBlurPx = useTransform(scrollYProgress, [BLOOM_START, 1], [0, 18], { clamp: true });
  const bloomBlur = useMotionTemplate`blur(${bloomBlurPx}px)`;
  const bloomScale = useTransform(scrollYProgress, [BLOOM_START, 1], [1, 1.12], { clamp: true });

  // Hiding the stage outright once the bloom is over is what keeps the section
  // underneath smooth — an invisible full-screen blur filter still costs a
  // composite on every frame.
  const [stageLive, setStageLive] = useState(false);
  const stageLiveRef = useRef(false);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const live = p > STAGE_IN - 0.01 && p < 1;
    if (live !== stageLiveRef.current) {
      stageLiveRef.current = live;
      setStageLive(live);
    }
  });

  // ─── Compact fallback ──────────────────────────────────────────────────────
  if (caps.checked && !caps.canStage) {
    return <FeatureStack caps={caps} />;
  }

  return (
    <section
      id="features"
      ref={containerRef}
      className="relative z-30 h-[1900vh]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <motion.div
          style={
            stageLive
              ? { filter: bloomBlur, WebkitFilter: bloomBlur, scale: bloomScale }
              : { visibility: "hidden" }
          }
          className="absolute inset-0"
        >
          {/* Backdrop */}
          <motion.div style={{ opacity: stageOpacity }} className="absolute inset-0 z-0" aria-hidden>
            <div
              className="absolute left-1/2 top-1/2 h-[90vh] w-[90vw] -translate-x-1/2 -translate-y-1/2"
              style={{ background: "radial-gradient(closest-side, hsl(var(--primary) / 0.16), transparent)" }}
            />
          </motion.div>

          {/* The device, holding the frame */}
          <motion.div
            style={{ opacity: deviceOpacity }}
            className="absolute inset-0 z-10 flex items-center justify-center"
          >
            <motion.div
              style={{ transform: deviceTransform, willChange: "transform" }}
              className="w-[min(800px,54vw)]"
            >
              <DeviceFrame label={FEATURES[Math.max(holdingIndex, 0)].label}>
                {FEATURES.map((f, i) => {
                  if (!(liveMask & (1 << i))) return null;
                  const Demo = f.demo;
                  return (
                    <DemoLayer key={f.id} feature={f} progress={scrollYProgress}>
                      <Demo active={holdingIndex === i} reducedMotion={caps.prefersReducedMotion} />
                    </DemoLayer>
                  );
                })}
              </DeviceFrame>
            </motion.div>
          </motion.div>

          {/* The copy, swinging in around it */}
          <div className="absolute inset-0 z-20">
            {FEATURES.map((f, i) => (
              <FeaturePanel
                key={f.id}
                feature={f}
                active={holdingIndex === i}
                progress={scrollYProgress}
              />
            ))}
          </div>

          <FeatureRail progress={scrollYProgress} activeIndex={holdingIndex} />
        </motion.div>
      </div>
    </section>
  );
}

/**
 * The progress rail: the app's own desktop navigation, repurposed.
 *
 * `bottom-nav.tsx` renders an 80px `rounded-full` pill down the left edge with
 * a `--primary` glider that slides between items in Y. This is that component's
 * shape and behaviour, driven by scroll instead of by the router — so moving
 * through the section looks exactly like moving through the app, and the reader
 * has already learned the navigation by the time they open it.
 */
function FeatureRail({
  progress,
  activeIndex,
}: {
  progress: MotionValue<number>;
  activeIndex: number;
}) {
  const opacity = useTransform(
    progress,
    [STAGE_IN, STAGE_SET, BLOOM_START, BLOOM_START + 0.03],
    [0, 1, 1, 0]
  );
  const x = useTransform(progress, [STAGE_IN, STAGE_SET], [-40, 0]);

  // `bottom-nav.tsx`'s desktop rail, at its real size: 80px wide, `py-6`,
  // `gap-4` between items that are `py-5` around a 24px icon and a 10px label
  // (82px each), and a glider 85% of the rail's width and 12px taller than an
  // item — a tall pill, not a circle.
  const RAIL_W = 80;
  const PAD = 24;
  const ITEM_H = 82;
  const GAP = 16;
  const GLIDER_W = Math.round(RAIL_W * 0.85);
  const index = Math.max(activeIndex, 0);

  return (
    <motion.div
      style={{ opacity, x }}
      className="absolute bottom-0 left-4 top-0 z-30 flex items-center p-2"
      aria-hidden
    >
      <div
        className="relative flex flex-col items-center gap-4 rounded-full bg-card px-2 shadow-2xl shadow-black/20 ring-1 ring-white/10"
        style={{ width: RAIL_W, paddingTop: PAD, paddingBottom: PAD }}
      >
        <span
          className="absolute left-0 top-0 rounded-full bg-primary"
          style={{
            width: GLIDER_W,
            height: ITEM_H + 12,
            transform: `translateX(${(RAIL_W - GLIDER_W) / 2}px) translateY(${PAD + index * (ITEM_H + GAP) - 6}px)`,
            transition: "transform 500ms cubic-bezier(0.22, 0.9, 0.35, 1)",
            opacity: activeIndex < 0 ? 0 : 1,
          }}
        />

        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          const isActive = i === activeIndex;
          return (
            <span
              key={f.id}
              className="relative z-10 flex w-full flex-col items-center justify-center gap-1 rounded-full px-1.5"
              style={{ height: ITEM_H }}
            >
              <span
                className={cn(
                  "flex flex-col items-center transition-colors duration-300",
                  isActive ? "text-primary-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="mt-0.5 text-[10px] font-medium leading-tight">{f.rail}</span>
              </span>
            </span>
          );
        })}
      </div>
    </motion.div>
  );
}

/**
 * One demo's layer inside the device. Its own opacity comes straight off scroll
 * so the handover between two features happens at exactly the pace the reader
 * is scrolling, rather than on a fixed-duration timer they can outrun.
 */
function DemoLayer({
  feature,
  progress,
  children,
}: {
  feature: Feature;
  progress: MotionValue<number>;
  children: React.ReactNode;
}) {
  const [fadeIn, fullIn, exitStart, exitEnd] = feature.range;
  const opacity = useTransform(progress, [fadeIn, fullIn, exitStart, exitEnd], [0, 1, 1, 0]);

  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      {children}
    </motion.div>
  );
}

/**
 * A feature set beside the device rather than over it: the whole column leans
 * into the centre in 3D, so it curves around the frame instead of covering it.
 */
function FeaturePanel({
  feature,
  active,
  progress,
}: {
  feature: Feature;
  active: boolean;
  progress: MotionValue<number>;
}) {
  const [fadeIn, fullIn, exitStart, exitEnd] = feature.range;
  const drift = feature.side === "left" ? -70 : 70;
  const Icon = feature.icon;

  const opacity = useTransform(progress, [fadeIn, fullIn, exitStart, exitEnd], [0, 1, 1, 0]);
  const x = useTransform(progress, [fadeIn, fullIn, exitStart, exitEnd], [drift, 0, 0, drift * 2.2]);

  return (
    <motion.div
      style={{ opacity }}
      className={cn("lp-panel absolute inset-0", active ? "is-active" : "pointer-events-none")}
    >
      <motion.div
        // `y` has to live here rather than as a Tailwind `-translate-y-1/2`:
        // framer writes the whole `transform` from its motion values, so a
        // utility translate alongside `x` gets overwritten and the column drops
        // half its own height below centre.
        style={{ x, y: "-50%", perspective: "1200px" }}
        className={cn(
          "absolute top-1/2 w-[min(330px,23vw)]",
          // Left panels clear the rail; right panels sit off the right edge.
          feature.side === "left" ? "left-[128px]" : "right-[max(40px,3.5vw)]"
        )}
      >
        <div
          style={{
            transform: `rotateY(${feature.side === "left" ? 15 : -15}deg)`,
            transformOrigin: feature.side === "left" ? "right center" : "left center",
            transformStyle: "preserve-3d",
          }}
        >
          <div className="lp-fade flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-[calc(var(--radius)/1.4)]"
              style={{
                background: "hsl(var(--primary) / 0.16)",
                boxShadow: "inset 0 0 0 1px hsl(var(--primary) / 0.35)",
              }}
            >
              <Icon className="h-[17px] w-[17px]" style={{ color: "hsl(var(--primary))" }} />
            </span>
            <span className="lp-eyebrow text-foreground/55">{feature.eyebrow}</span>
          </div>

          <EditorialTitle
            text={feature.title}
            active={active}
            as="h3"
            className="lp-headline mt-4 text-[clamp(1.5rem,2.3vw,2.15rem)] text-foreground"
          />

          <p className="lp-fade lp-body-glass mt-4 text-[14px]" data-stagger="1">
            {feature.body}
          </p>

          <ul className="mt-5 space-y-2">
            {feature.points.map((point, i) => (
              <li
                key={point}
                className="lp-fade flex items-center gap-2.5 text-[12.5px] font-medium text-foreground/65"
                data-stagger={Math.min(i + 1, 3)}
              >
                <span
                  className="h-1 w-1 shrink-0 rounded-full"
                  style={{ background: "hsl(var(--primary))" }}
                />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * The compact take: the same features, stacked and scrolled normally.
 *
 * Each demo plays when its card is actually on screen — an IntersectionObserver
 * rather than the scroll-progress mask, because there is no pinned section here
 * to measure progress against, and five recordings running off-screen on a
 * phone is exactly the sort of thing that drains a battery for no reason.
 */
function FeatureStack({ caps }: { caps: StageCapabilities }) {
  return (
    <section id="features" className="relative px-5 py-24">
      <div className="mx-auto max-w-xl">
        <p className="lp-eyebrow mb-3 text-foreground/50">What it does</p>
        <h2 className="lp-headline text-[clamp(1.9rem,8vw,2.6rem)] text-foreground">
          Five things, done properly.
        </h2>

        <div className="mt-14 space-y-20">
          {FEATURES.map((feature) => (
            <StackedFeature key={feature.id} feature={feature} caps={caps} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StackedFeature({ feature, caps }: { feature: Feature; caps: StageCapabilities }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const Demo = feature.demo;
  const Icon = feature.icon;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.35,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn("lp-panel", visible && "is-active")}>
      <div className="lp-fade flex items-center gap-3">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-[calc(var(--radius)/1.4)]"
          style={{
            background: "hsl(var(--primary) / 0.16)",
            boxShadow: "inset 0 0 0 1px hsl(var(--primary) / 0.35)",
          }}
        >
          <Icon className="h-[17px] w-[17px]" style={{ color: "hsl(var(--primary))" }} />
        </span>
        <span className="lp-eyebrow text-foreground/55">{feature.eyebrow}</span>
      </div>

      <EditorialTitle
        text={feature.title}
        active={visible}
        as="h3"
        className="lp-headline mt-4 text-[clamp(1.5rem,6.5vw,2rem)] text-foreground"
      />

      <p className="lp-fade lp-body mt-3.5 text-[15px]" data-stagger="1">
        {feature.body}
      </p>

      <div className="lp-fade mt-7" data-stagger="2">
        <DeviceFrame label={feature.label}>
          <Demo active={visible} reducedMotion={caps.prefersReducedMotion} />
        </DeviceFrame>
      </div>

      <ul className="mt-6 space-y-2">
        {feature.points.map((point) => (
          <li
            key={point}
            className="lp-fade flex items-center gap-2.5 text-[13.5px] font-medium text-foreground/65"
            data-stagger="3"
          >
            <span
              className="h-1 w-1 shrink-0 rounded-full"
              style={{ background: "hsl(var(--primary))" }}
            />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
