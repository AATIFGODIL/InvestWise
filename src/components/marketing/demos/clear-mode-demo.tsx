// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React from "react";
import { Check, Moon, Sparkles, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppChrome, SpotlightButton } from "@/components/marketing/app-chrome";
import { DemoCursor } from "@/components/marketing/device-frame";
import { DashboardBackdrop } from "@/components/marketing/demos/dashboard-backdrop";
import { between, ramp, useDemoClock } from "@/components/marketing/demo-clock";

/**
 * Clear Mode — the interface made of glass, in whatever colour you like.
 *
 * Three of InvestWise's theming controls, in the order you'd actually reach
 * for them: turn every surface to frosted glass (`isClearMode`), pick the
 * accent (`setPrimaryColor` rewrites `--primary` on the document element), and
 * flip light/dark. The recolour genuinely propagates here for the same reason
 * it does in the app — one custom property at the top of the tree, and every
 * card, chart stroke, glider and glow underneath resolves through it.
 *
 * The glass is the app's real recipe, not an approximation: `.lp-frosted`
 * carries `backdrop-filter: url(#frosted)`, the fractal-noise displacement map
 * defined once in the root layout and referenced by the command menu.
 */

/** The app ships a full colour picker; a demo needs a shortlist. */
const SWATCHES = [
  { name: "Indigo", hsl: "251 82% 65%" },
  { name: "Teal", hsl: "172 72% 47%" },
  { name: "Amber", hsl: "38 92% 55%" },
  { name: "Rose", hsl: "342 82% 62%" },
];

// ─── Script ──────────────────────────────────────────────────────────────────
const CURSOR_TO_GLASS = 620;
const TAP_GLASS = 1120;
const GLASS_IN = 1180;
const CURSOR_TO_TEAL = 2360;
const TAP_TEAL = 2820;
const CURSOR_TO_AMBER = 3560;
const TAP_AMBER = 4020;
const CURSOR_TO_LIGHT = 4900;
const TAP_LIGHT = 5340;
const CURSOR_TO_DARK = 8000;
const TAP_DARK = 8420;
const LOOP = 10600;

/** Where each control sits in the settings sheet, for the pointer to aim at. */
const HIT = {
  glass: { x: 964, y: 156 },
  teal: { x: 838, y: 244 },
  amber: { x: 874, y: 244 },
  light: { x: 830, y: 330 },
  dark: { x: 930, y: 330 },
};

export function ClearModeDemo({
  active,
  reducedMotion,
}: {
  active: boolean;
  reducedMotion: boolean;
}) {
  const t = useDemoClock(active, LOOP, { staticFrame: 6600, reducedMotion });

  const glass = t >= TAP_GLASS;
  const glassRamp = ramp(t, GLASS_IN, GLASS_IN + 700);
  const light = between(t, TAP_LIGHT, TAP_DARK);

  const accentIndex = t >= TAP_AMBER ? 2 : t >= TAP_TEAL ? 1 : 0;
  const accent = SWATCHES[accentIndex].hsl;

  const cursor =
    t >= CURSOR_TO_DARK
      ? HIT.dark
      : t >= CURSOR_TO_LIGHT
        ? HIT.light
        : t >= CURSOR_TO_AMBER
          ? HIT.amber
          : t >= CURSOR_TO_TEAL
            ? HIT.teal
            : t >= CURSOR_TO_GLASS
              ? HIT.glass
              : { x: 660, y: 540 };

  const tapKey = [
    { at: TAP_GLASS, key: "glass" },
    { at: TAP_TEAL, key: "teal" },
    { at: TAP_AMBER, key: "amber" },
    { at: TAP_LIGHT, key: "light" },
    { at: TAP_DARK, key: "dark" },
  ].find(({ at }) => between(t, at, at + 700))?.key;

  const pressed = [TAP_GLASS, TAP_TEAL, TAP_AMBER, TAP_LIGHT, TAP_DARK].some((at) =>
    between(t, at, at + 140)
  );

  return (
    <div
      className={cn("h-full w-full transition-colors duration-700", light && "lp-light")}
      // The accent is set here and nowhere else — exactly one declaration, the
      // way `theme-store.ts` writes it onto `documentElement`.
      style={{ "--primary": accent } as React.CSSProperties}
    >
      <AppChrome
        activeNav={0}
        glass={glass}
        light={light}
        headerCentre={<SpotlightButton glass={glass} light={light} />}
      >
        {/* Both dashboards are mounted and cross-faded, so the glass appears to
            form over the existing surface instead of the layout being rebuilt. */}
        <div className="absolute inset-0" style={{ opacity: 1 - glassRamp }}>
          <DashboardBackdrop light={light} />
        </div>
        <div className="absolute inset-0" style={{ opacity: glassRamp }}>
          <DashboardBackdrop glass light={light} />
        </div>

        {/* Settings sheet. Materialises with blur + scale rather than a plain
            fade, because it is a pane of glass arriving, not a label. */}
        <div
          className={cn(
            "absolute right-7 top-4 z-30 w-[248px] rounded-[var(--radius)] p-4",
            glass
              ? "lp-frosted"
              : "bg-card shadow-[inset_0_0_0_1px_hsl(var(--border)),0_24px_50px_-16px_hsl(0_0%_0%/0.6)]"
          )}
        >
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/50">
            Appearance
          </p>

          {/* Clear mode toggle */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[12px] font-medium text-foreground/85">
              <Sparkles className="h-3.5 w-3.5" style={{ color: "hsl(var(--primary))" }} />
              Clear Mode
            </span>
            <span
              className="relative flex h-[20px] w-[36px] items-center rounded-full transition-colors duration-[380ms]"
              style={{
                background: glass ? "hsl(var(--primary))" : "hsl(var(--foreground) / 0.2)",
                boxShadow: glass ? "0 0 18px -2px hsl(var(--primary) / 0.8)" : "none",
              }}
            >
              <span
                className="absolute h-[15px] w-[15px] rounded-full bg-white"
                style={{
                  transition: "transform 380ms cubic-bezier(0.32, 0.72, 0, 1)",
                  transform: `translateX(${glass ? 18 : 3}px)`,
                }}
              />
            </span>
          </div>

          <div className="my-3.5 h-px bg-foreground/10" />

          {/* Accent picker */}
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/50">
            Accent
          </p>
          <div className="flex gap-2">
            {SWATCHES.map((s, i) => (
              <span
                key={s.name}
                className="flex h-[26px] w-[26px] items-center justify-center rounded-full transition-transform duration-300"
                style={{
                  background: `hsl(${s.hsl})`,
                  transform: i === accentIndex ? "scale(1.14)" : "scale(1)",
                  boxShadow:
                    i === accentIndex
                      ? `0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(${s.hsl}), 0 0 18px -2px hsl(${s.hsl})`
                      : "none",
                }}
              >
                {i === accentIndex && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
              </span>
            ))}
          </div>

          <div className="my-3.5 h-px bg-foreground/10" />

          {/* Light / dark */}
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/50">
            Theme
          </p>
          <div className="flex gap-2">
            {[
              { label: "Light", icon: Sun, on: light },
              { label: "Dark", icon: Moon, on: !light },
            ].map((opt) => {
              const Icon = opt.icon;
              return (
                <span
                  key={opt.label}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-[calc(var(--radius)/1.6)] py-1.5 text-[11px] font-semibold transition-colors duration-500"
                  style={{
                    background: opt.on ? "hsl(var(--primary))" : "hsl(var(--foreground) / 0.07)",
                    color: opt.on ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground) / 0.6)",
                  }}
                >
                  <Icon className="h-3 w-3" />
                  {opt.label}
                </span>
              );
            })}
          </div>
        </div>

        <DemoCursor x={cursor.x} y={cursor.y} pressed={pressed} tapKey={tapKey} />
      </AppChrome>
    </div>
  );
}
