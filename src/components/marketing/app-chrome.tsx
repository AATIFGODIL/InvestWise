// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React from "react";
import { BarChart, Bell, Home, LineChart, Repeat, Search, Target, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { InvestWiseLogo } from "@/components/marketing/investwise-logo";

/**
 * InvestWise's actual desktop shell, rebuilt at demo scale.
 *
 * Measured off the real components rather than approximated, because the whole
 * point of the recordings is that they are the product:
 *
 *  - `bottom-nav.tsx` on desktop is **not** a bottom bar. It's a 80px-wide
 *    vertical rail pinned to the left edge, `rounded-full py-6 px-2`, with a
 *    glider sized to 85% of the rail width and `item height + 12`, sliding in Y.
 *  - `header.tsx` is a transparent `h-16` nav carrying three separate floating
 *    groups — it is not one bar. Left: a `bg-card ring-black/40` pill holding
 *    the indigo logo button. Centre: the Pro Mode toggle and the Spotlight
 *    Search button. Right: a second card pill of `h-12 w-12` icon buttons.
 *  - `pro-mode-toggle.tsx` is an `h-8 w-14` track with a 24px circular indigo
 *    thumb at 4px padding — not a standard switch.
 *
 * Everything is expressed against the same tokens the app uses (`--card`,
 * `--primary`, `--border`, `--radius`), so a demo re-themes correctly when the
 * Clear Mode recording changes the accent or flips to light.
 */

export const CASUAL_NAV = [
  { label: "Explore", icon: Home },
  { label: "Portfolio", icon: BarChart },
  { label: "Trade", icon: Repeat },
  { label: "Goals", icon: Target },
  { label: "Community", icon: Users },
];

export const PRO_NAV = [
  { label: "Explore", icon: Home },
  { label: "Portfolio", icon: BarChart },
  { label: "Trade", icon: Repeat },
  { label: "Research", icon: LineChart },
  { label: "Community", icon: Users },
];

/** Rail geometry, from `bottom-nav.tsx`. */
const RAIL_W = 80;
const RAIL_PAD_Y = 24;
const ITEM_H = 62;
const GLIDER_W = Math.round(RAIL_W * 0.85);

export function AppChrome({
  children,
  navItems = CASUAL_NAV,
  activeNav = 0,
  /** Clear mode: card surfaces become the app's frosted glass. */
  glass = false,
  /** Light mode swaps the ring colours the app uses on its pills. */
  light = false,
  proMode = false,
  /** Rendered in the centre of the header, between the toggle and the actions. */
  headerCentre,
  /**
   * Anything that has to sit above the entire app, not just the content well:
   * modal scrims, the command palette, the chatbot panel, the demo pointer.
   *
   * This slot exists because `children` render inside a box inset by the rail
   * and the header, so a scrim in there dims the middle of the screen and
   * leaves the navigation lit — which is not what the real app does and is
   * exactly the sort of thing that makes a recording read as a mock-up.
   */
  overlay,
  className,
}: {
  children: React.ReactNode;
  navItems?: { label: string; icon: React.ElementType }[];
  activeNav?: number;
  glass?: boolean;
  light?: boolean;
  proMode?: boolean;
  headerCentre?: React.ReactNode;
  overlay?: React.ReactNode;
  className?: string;
}) {
  // The app's own pill recipe, branching exactly where `header.tsx` branches.
  const pill = glass
    ? light
      ? "bg-card/60 shadow-[inset_0_0_0_1px_hsl(0_0%_0%/0.1)]"
      : "lp-frosted"
    : "bg-card shadow-[inset_0_0_0_1px_hsl(0_0%_0%/0.4)]";

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-background", className)}>
      {/* Content well. The app pads for the rail with `pl-[92px]`. */}
      <div className="absolute inset-0 pl-[92px] pt-[72px]">{children}</div>

      {/* ── Desktop side rail ────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 top-0 z-40 flex items-center p-2">
        <nav
          className={cn(
            "relative flex flex-col items-center justify-between gap-4 rounded-full px-2 shadow-2xl shadow-black/20",
            pill
          )}
          style={{ width: RAIL_W, paddingTop: RAIL_PAD_Y, paddingBottom: RAIL_PAD_Y }}
        >
          {/* The glider. Sized and positioned the way `setGliderTo` does it:
              85% of the rail width, centred, item height + 12, moved in Y. */}
          <span
            className="absolute left-0 top-0 rounded-full"
            style={{
              width: GLIDER_W,
              height: ITEM_H + 12,
              transform: `translateX(${(RAIL_W - GLIDER_W) / 2}px) translateY(${
                RAIL_PAD_Y + activeNav * (ITEM_H + 16) - 6
              }px)`,
              background: "hsl(var(--primary))",
              transition: "transform 300ms ease, background-color 300ms ease",
            }}
          />

          {navItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = i === activeNav;
            return (
              <span
                key={item.label}
                className="relative z-10 flex w-full flex-col items-center justify-center gap-1 rounded-full transition-colors duration-300"
                style={{
                  height: ITEM_H,
                  color: isActive
                    ? "hsl(var(--primary-foreground))"
                    : light
                      ? "hsl(0 0% 0%)"
                      : "hsl(var(--muted-foreground))",
                }}
              >
                <Icon className="h-6 w-6" strokeWidth={2} />
                <span className="mt-0.5 text-[10px] font-medium leading-tight">{item.label}</span>
              </span>
            );
          })}
        </nav>
      </div>

      {/* ── Header: three floating groups over a transparent nav ─────────── */}
      <header className="absolute inset-x-0 top-0 z-30 p-2 pl-[92px]">
        <nav className="relative flex h-16 w-full items-center justify-between px-2">
          {/* Left: the logo pill. The app renders its wordmark on an indigo
              `bg-primary` button here; the official mark is that same pill,
              already lit, so it goes in directly. */}
          <div className={cn("flex h-16 shrink-0 items-center rounded-full px-3 shadow-lg", pill)}>
            <InvestWiseLogo className="w-[132px]" sizes="132px" />
          </div>

          {/* Centre: Pro Mode toggle, Spotlight Search, and whatever the demo
              is currently fanning out beside it. */}
          <div className="mx-2 flex h-full flex-1 items-center justify-center">
            <div className="mr-2 flex shrink-0 scale-90 items-center">
              <ProModeToggle on={proMode} glass={glass} />
            </div>
            {headerCentre}
          </div>

          {/* Right: actions pill */}
          <div
            className={cn("flex h-16 shrink-0 items-center gap-1 rounded-full px-1 shadow-lg", pill)}
          >
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full">
              <Bell className="h-5 w-5 text-foreground" />
              <span
                className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full"
                style={{ background: "hsl(var(--primary))" }}
              />
            </span>
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full text-[13px] font-bold text-primary-foreground"
              style={{ background: "hsl(var(--primary) / 0.85)" }}
            >
              AG
            </span>
          </div>
        </nav>
      </header>

      {overlay && <div className="absolute inset-0 z-50">{overlay}</div>}
    </div>
  );
}

/**
 * The Spotlight Search button — the thing you hover to fan out favourites, and
 * click to open the command menu. `min-w-[170px]` and `h-12` are the app's.
 */
export function SpotlightButton({
  glass = false,
  light = false,
  /** Long-pressing the button puts the header into favourites-editing mode,
   *  which the app signals with its `shimmer-bg` sweep and a label swap. */
  editing = false,
  active = false,
}: {
  glass?: boolean;
  light?: boolean;
  editing?: boolean;
  active?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative z-10 flex h-12 min-w-[170px] items-center justify-center gap-2 rounded-full px-4 shadow-lg transition-colors duration-300",
        glass
          ? light
            ? "bg-card/60 text-foreground shadow-[inset_0_0_0_1px_hsl(0_0%_0%/0.2)]"
            : "lp-frosted text-foreground"
          : "bg-background text-foreground shadow-[inset_0_0_0_1px_hsl(var(--border))]",
        editing && "shimmer-bg"
      )}
      style={
        active
          ? { boxShadow: "inset 0 0 0 1px hsl(var(--primary)), 0 0 26px -4px hsl(var(--primary))" }
          : undefined
      }
    >
      <Search className="h-5 w-5" />
      <span className="text-sm">{editing ? "Editing Mode" : "Spotlight Search"}</span>
    </span>
  );
}

/**
 * The Pro Mode toggle: an `h-8 w-14` track with a 24px circular indigo thumb
 * that seats itself 4px from whichever end is active.
 */
export function ProModeToggle({ on, glass = false }: { on: boolean; glass?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span
        className={cn(
          "relative block h-8 w-14 rounded-full",
          glass ? "lp-frosted" : "bg-muted shadow-[inset_0_0_0_1px_hsl(var(--border))]"
        )}
      >
        <span
          className="absolute top-1/2 h-6 w-6 rounded-full shadow-[0_2px_4px_-1px_rgb(0_0_0/0.1)]"
          style={{
            left: 0,
            background: "hsl(var(--primary))",
            // Critically damped: nothing carried momentum into a toggle, so it
            // settles without overshoot.
            transition: "transform 340ms cubic-bezier(0.32, 0.72, 0, 1)",
            transform: `translateX(${on ? 56 - 24 - 4 : 4}px) translateY(-50%)`,
          }}
        />
      </span>
      <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <Zap
          className={cn("h-3 w-3", on && "fill-current")}
          style={on ? { color: "hsl(var(--primary))" } : undefined}
        />
        Pro Mode
      </span>
    </span>
  );
}
