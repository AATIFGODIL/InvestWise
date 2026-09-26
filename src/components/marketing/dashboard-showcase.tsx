// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React, { useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { Moon, Sparkles, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeviceFrame } from "@/components/marketing/device-frame";
import { MockShell, type MockTheme } from "@/components/marketing/mock/mock-kit";
import { MockDashboard } from "@/components/marketing/mock/mock-dashboard";
import type { StageCapabilities } from "@/components/marketing/use-stage-capabilities";

/**
 * The dashboard, shown properly.
 *
 * The old hero raised the device out of the floor and pushed it past the
 * camera inside one scroll window, so it was never fully on screen at once.
 * This gives it a section of its own, sized so the whole screen always fits in
 * the viewport, and a long pinned hold:
 *
 * ─ entering     the device tips up from a rake to flat as the section arrives
 * ─ 0.00–0.22    HOLD at the top of the page: the whole first screen, still
 * ─ 0.22–0.78    the page inside scrolls, exactly as the app does — including
 *                the header folding away to its accent line past 60px
 * ─ 0.78–1.00    HOLD at the bottom, then the section scrolls off normally
 *
 * Under it, the appearance switch: Light, Dark and Clear, as in
 * Settings → Appearance. Changing it cross-fades the whole screen
 * rather than recolouring it in place — Apple's rule for theme changes is to
 * ease the brightness, never to cut it.
 */

const THEMES: { id: MockTheme; label: string; icon: React.ElementType }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "clear", label: "Clear", icon: Sparkles },
];

/** How far the inner page scrolls during the hold, in screen px. */
const INNER_SCROLL = 1180;

export function DashboardShowcase({ caps }: { caps: StageCapabilities }) {
  const ref = useRef<HTMLElement>(null);
  const [theme, setTheme] = useState<MockTheme>("dark");
  const compact = caps.checked && !caps.canStage;

  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const { scrollYProgress: pin } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const tilt = useTransform(enter, [0.25, 1], [26, 0], { clamp: true });
  const lift = useTransform(enter, [0.25, 1], [0.9, 1], { clamp: true });
  const deviceTransform = useMotionTemplate`perspective(1800px) rotateX(${tilt}deg) scale(${lift})`;
  const contentY = useTransform(pin, [0.22, 0.78], [0, -INNER_SCROLL], { clamp: true });

  // The header collapse is a state change in the app (it swaps classes), so it
  // is one here too — committed only when it actually flips.
  const [collapsed, setCollapsed] = useState(false);
  useMotionValueEvent(contentY, "change", (y) => {
    const next = -y > 60;
    setCollapsed((c) => (c === next ? c : next));
  });

  const screen = (
    <DeviceFrame label={`The InvestWise dashboard in ${theme} mode: portfolio chart, watchlist, top holdings, auto-invest and AI prediction.`}>
      {THEMES.map(({ id }) => (
        <div
          key={id}
          className="absolute inset-0"
          style={{
            opacity: theme === id ? 1 : 0,
            transition: caps.prefersReducedMotion ? "none" : "opacity 520ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          aria-hidden={theme !== id}
        >
          <MockShell theme={id} contentY={compact ? 0 : contentY} headerCollapsed={!compact && collapsed}>
            <MockDashboard theme={id} />
          </MockShell>
        </div>
      ))}
    </DeviceFrame>
  );

  const heading = (
    <div className="text-center">
      <p className="lp-eyebrow mb-3 text-foreground/50">The dashboard</p>
      <h2 className="lp-headline text-[clamp(1.9rem,3.4vw,3rem)] text-foreground">
        Everything you own, at a glance.
      </h2>
    </div>
  );

  if (compact) {
    return (
      <section id="dashboard" className="relative px-5 py-20">
        {heading}
        <div className="mx-auto mt-10 max-w-xl">{screen}</div>
        <div className="mt-6 flex justify-center">
          <AppearanceSwitch value={theme} onChange={setTheme} />
        </div>
      </section>
    );
  }

  return (
    <section id="dashboard" ref={ref} className="relative z-20 h-[300vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-5 overflow-hidden px-6 pt-20">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[80vh] w-[80vw] -translate-x-1/2 -translate-y-1/2"
          style={{ background: "radial-gradient(closest-side, hsl(var(--primary) / 0.14), transparent)" }}
          aria-hidden
        />
        {heading}
        <motion.div
          style={{
            transform: deviceTransform,
            transformOrigin: "50% 0%",
            willChange: "transform",
            // Width is derived from the height it may use, so the whole
            // screen — top to bottom — always fits in the viewport.
            width: "min(1180px, 90vw, calc((100svh - 290px) * 1.6))",
          }}
          className="relative"
        >
          {screen}
        </motion.div>
        <AppearanceSwitch value={theme} onChange={setTheme} />
      </div>
    </section>
  );
}

/**
 * A segmented control in the macOS mould: a glass track, a thumb that slides
 * between segments on a critically damped spring, and feedback on press rather
 * than on release. It is a radio group, so arrow keys move the selection.
 */
function AppearanceSwitch({
  value,
  onChange,
}: {
  value: MockTheme;
  onChange: (theme: MockTheme) => void;
}) {
  const move = (dir: 1 | -1) => {
    const i = THEMES.findIndex((t) => t.id === value);
    onChange(THEMES[(i + dir + THEMES.length) % THEMES.length].id);
  };

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div
        role="radiogroup"
        aria-label="Dashboard appearance"
        className="lp-glass relative flex rounded-full p-1"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            move(1);
          }
          if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault();
            move(-1);
          }
        }}
      >
        {THEMES.map(({ id, label, icon: Icon }) => {
          const selected = value === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onPointerDown={() => onChange(id)}
              onClick={() => onChange(id)}
              className={cn(
                "lp-focus lp-seg relative flex h-10 min-w-[104px] items-center justify-center gap-2 rounded-full px-5 text-[13px] font-semibold transition-colors duration-200",
                selected ? "text-primary-foreground" : "text-foreground/60 hover:text-foreground"
              )}
            >
              {selected && (
                <motion.span
                  layoutId="lp-appearance-thumb"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "hsl(var(--primary))",
                    boxShadow: "0 8px 22px -8px hsl(var(--primary)), inset 0 1px 0 hsl(0 0% 100% / 0.25)",
                  }}
                  transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                />
              )}
              <Icon className="relative h-4 w-4" />
              <span className="relative">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
