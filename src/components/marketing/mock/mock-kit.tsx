// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React, { useState } from "react";
import { motion, type MotionValue } from "framer-motion";
import {
  BarChart,
  Bell,
  Bot,
  Home,
  LineChart,
  Minus,
  Repeat,
  Search,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The InvestWise app, rebuilt for the landing page's recordings.
 *
 * Every recipe below is lifted from the component that renders it in the
 * product — `header.tsx`, `bottom-nav.tsx`, `ui/card.tsx`, `ui/button.tsx`,
 * `pro-mode-toggle.tsx` — including the three branches those components take
 * for dark, light and Clear Mode. The mocks can't *be* the real components
 * (those are wired to Firestore, Finnhub and the router), so they are the next
 * best thing: the same classes, the same geometry, at the same pixel sizes,
 * inside a 1280×800 screen that the device frame scales down.
 */

/** `clear` is Clear Mode over dark; `clear-light` is Clear Mode over light. */
export type MockTheme = "dark" | "light" | "clear" | "clear-light";

export const isClearTheme = (theme: MockTheme) => theme === "clear" || theme === "clear-light";
export const isLightTheme = (theme: MockTheme) => theme === "light" || theme === "clear-light";

/** The class recipes the app branches on, keyed by theme. */
export function recipes(theme: MockTheme) {
  const clearDark = theme === "clear";
  const clearLight = theme === "clear-light";
  const light = isLightTheme(theme);
  return {
    /** Token scope: `.dark` from globals.css, or the light palette re-declared. */
    scope: light ? "lp-light" : "dark",
    /** Body text colour: Clear over dark forces white, as the app's surfaces do. */
    text: clearDark ? "text-white" : "text-foreground",
    /** `ui/card.tsx` */
    card: cn(
      "relative overflow-hidden rounded-3xl text-card-foreground shadow-xl ring-1 transition-colors duration-500",
      clearDark && "bg-white/10 ring-white/60 backdrop-blur-[16px]",
      clearLight && "bg-[#C8C8C8]/60 ring-black/10 backdrop-blur-[16px]",
      !clearDark && !clearLight && "bg-card ring-white/60"
    ),
    /** The floating header groups, the rail and the chatbot button. */
    pill: clearDark
      ? "bg-white/10 ring-1 ring-white/60 backdrop-blur-[6px]"
      : clearLight
        ? "bg-card/60 ring-1 ring-black/10 backdrop-blur-[6px]"
        : "bg-card ring-1 ring-black/40",
    /** Spotlight Search and the favourites beside it. */
    chip: clearDark
      ? "bg-white/10 text-slate-100 ring-1 ring-white/60 backdrop-blur-[2px]"
      : clearLight
        ? "bg-card/60 text-foreground ring-1 ring-black/20 backdrop-blur-[2px]"
        : "bg-background text-foreground ring-1 ring-border",
    /** Rail item colour when not selected. */
    navIdle: light ? "text-black" : clearDark ? "text-slate-100" : "text-muted-foreground",
    /** Pro Mode toggle track. */
    track: clearDark || clearLight ? "bg-white/10 ring-1 ring-white/60" : "bg-muted ring-1 ring-border",
  };
}

// ─── Primitives ────────────────────────────────────────────────────────────

/** `ui/button.tsx`, variant × size. */
export function MButton({
  variant = "default",
  size = "default",
  className,
  style,
  children,
}: {
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium",
        variant === "default" && "bg-primary text-primary-foreground",
        variant === "outline" && "border border-input bg-background",
        variant === "secondary" && "bg-secondary text-secondary-foreground",
        size === "default" && "h-10 px-4 py-2",
        size === "sm" && "h-9 px-3",
        size === "lg" && "h-11 px-8",
        size === "icon" && "h-10 w-10",
        className
      )}
      style={style}
    >
      {children}
    </span>
  );
}

/** `CardHeader` + `CardTitle` as the dashboard uses them. */
export function MCardTitle({
  icon: Icon,
  children,
  className,
}: {
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("flex items-center gap-2 text-2xl font-bold leading-none tracking-tight", className)}>
      {Icon && <Icon className="h-5 w-5 text-primary" />}
      {children}
    </h3>
  );
}

/** `ui/progress.tsx` */
export function MProgress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}>
      <div className="h-full bg-primary transition-all duration-700" style={{ width: `${value}%` }} />
    </div>
  );
}

/**
 * Company logo, from the same logokit endpoint `command-menu.tsx` builds its
 * avatars from, falling back to the ticker's initial exactly as `AvatarFallback`
 * does when the image doesn't load.
 */
export function TickerLogo({ symbol, className }: { symbol: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-semibold text-foreground",
        className
      )}
    >
      {failed ? (
        symbol.charAt(0)
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://img.logokit.com/ticker/${symbol}?token=pk_fr7a1b76952087586937fa`}
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

// ─── Header pieces ─────────────────────────────────────────────────────────

/**
 * `pro-mode-toggle.tsx`: an `h-8 w-14` track and a 24px primary thumb seated
 * 4px from its end. `lifted` is the middle beat of the real animation — the
 * thumb swells to 34px and turns to glass while it slides.
 */
export function ProToggle({
  on,
  lifted = false,
  theme,
  showLabel = true,
}: {
  on: boolean;
  lifted?: boolean;
  theme: MockTheme;
  showLabel?: boolean;
}) {
  const r = recipes(theme);
  const size = lifted ? 34 : 24;
  const left = (on ? 56 - 24 - 4 : 4) - (lifted ? 5 : 0);
  return (
    <span className="flex items-center space-x-2">
      <span data-anchor="toggle" className={cn("relative block h-8 w-14 rounded-full", r.track)}>
        <span
          className="absolute left-0 top-1/2 rounded-full"
          style={{
            width: size,
            height: size,
            transform: `translateX(${left}px) translateY(-50%)`,
            background: lifted
              ? isClearTheme(theme)
                ? "hsla(0, 0%, 100%, 0.15)"
                : "hsl(var(--background))"
              : "hsl(var(--primary))",
            border: lifted ? "1px solid hsla(0, 0%, 100%, 0.6)" : "1px solid transparent",
            boxShadow: lifted
              ? "0 10px 18px -6px rgb(0 0 0 / 0.22), 0 6px 10px -8px rgb(0 0 0 / 0.12)"
              : "0 2px 4px -1px rgb(0 0 0 / 0.1)",
            transition: lifted
              ? "transform 300ms cubic-bezier(0.22, 0.9, 0.35, 1), width 140ms ease-out, height 140ms ease-out, background-color 140ms ease-out"
              : "all 160ms ease-in",
          }}
        />
      </span>
      {showLabel && (
        <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Zap className={cn("h-3 w-3", on && "fill-primary text-primary")} />
          Pro Mode
        </span>
      )}
    </span>
  );
}

/** The Spotlight Search button: `h-12 min-w-[170px]`, and the long-press editing state. */
export function SpotlightButton({
  theme,
  editing = false,
  pressed = false,
}: {
  theme: MockTheme;
  editing?: boolean;
  pressed?: boolean;
}) {
  return (
    <span
      data-anchor="spotlight"
      className={cn(
        "relative z-10 flex h-12 min-w-[170px] items-center justify-center gap-2 rounded-full px-4 shadow-lg transition-transform duration-150",
        recipes(theme).chip,
        editing && "shimmer-bg"
      )}
      style={{ transform: pressed ? "scale(0.96)" : undefined }}
    >
      <Search className="h-5 w-5" />
      <span className="text-sm">{editing ? "Editing Mode" : "Spotlight Search"}</span>
    </span>
  );
}

export type MockFavourite =
  | { id: string; kind: "stock"; symbol: string; price: string; up: boolean; pill: boolean };

/** `favorite-item.tsx`: a 140×48 pill, or a 48×48 icon, on the chip recipe. */
export function FavouriteChip({
  fav,
  theme,
  editing,
  lifted = false,
}: {
  fav: MockFavourite;
  theme: MockTheme;
  editing: boolean;
  lifted?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative flex h-12 items-center justify-center rounded-full",
        recipes(theme).chip,
        editing && "shimmer-bg"
      )}
      style={{
        width: fav.pill ? 140 : 48,
        transform: lifted ? "scale(1.1)" : undefined,
        boxShadow: lifted ? "0 14px 30px -10px rgb(0 0 0 / 0.6)" : undefined,
        transition: "transform 200ms cubic-bezier(0.32, 0.72, 0, 1)",
      }}
    >
      <span
        className="absolute -left-1 -top-1 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 ring-2 ring-white/50 backdrop-blur-sm"
        style={{
          opacity: editing ? 1 : 0,
          transform: `scale(${editing ? 1 : 0.5})`,
          transition: "opacity 200ms ease, transform 200ms ease",
        }}
      >
        <Minus className="h-4 w-4 text-white" />
      </span>
      {fav.pill ? (
        <span className="flex h-full w-full items-center gap-2 px-4">
          <TickerLogo symbol={fav.symbol} className="h-8 w-8" />
          <span className="flex flex-col items-start overflow-hidden text-xs">
            <span className="truncate font-bold">{fav.symbol}</span>
            <span className="flex items-center gap-0.5">
              ${fav.price}
              <span className={fav.up ? "text-green-500" : "text-red-500"}>{fav.up ? "↗" : "↘"}</span>
            </span>
          </span>
        </span>
      ) : (
        <TickerLogo symbol={fav.symbol} className="h-8 w-8" />
      )}
    </span>
  );
}

// ─── The shell ─────────────────────────────────────────────────────────────

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

/** Rail geometry from `bottom-nav.tsx`: `py-6`, `gap-4`, items `py-5`. */
const RAIL_W = 80;
const RAIL_PAD = 24;
const ITEM_H = 82;
const ITEM_GAP = 16;
const GLIDER_W = Math.round(RAIL_W * 0.85);

/**
 * The desktop app around a page: `layout-content.tsx`'s three floating header
 * groups, the side rail with the chatbot button stacked on top of it, and the
 * `main-content` well padded `pl-[92px] pt-20`.
 *
 * `headerCollapsed` is the app's scroll behaviour: past 60px the header folds
 * away to a 6px accent line and the well's top padding drops to `pt-4`.
 * `railCollapsed` is Pro Mode's: the rail tucks away to an accent line down the
 * left edge until it is hovered.
 */
export function MockShell({
  theme = "dark",
  activeNav = 0,
  proMode = false,
  toggleOn,
  toggleLifted = false,
  headerCollapsed = false,
  railCollapsed = false,
  chrome = true,
  editing = false,
  spotlightPressed = false,
  favourites,
  contentY = 0,
  accent,
  overlay,
  children,
  className,
}: {
  theme?: MockTheme;
  activeNav?: number;
  proMode?: boolean;
  toggleOn?: boolean;
  toggleLifted?: boolean;
  headerCollapsed?: boolean;
  railCollapsed?: boolean;
  /** False for the special-layout routes (settings, profile) that have no chrome. */
  chrome?: boolean;
  editing?: boolean;
  spotlightPressed?: boolean;
  /** Rendered after the Spotlight button — the unrolled favourites. */
  favourites?: React.ReactNode;
  /** The well's scroll position, as a (negative) translate. */
  contentY?: MotionValue<number> | number;
  /** Overrides `--primary` / `--primary-foreground`, as `setPrimaryColor` does. */
  accent?: { primary: string; foreground: string };
  /** Above everything: scrims, the command menu, sheets, the demo pointer. */
  overlay?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const r = recipes(theme);
  const nav = proMode ? PRO_NAV : CASUAL_NAV;
  return (
    <div
      className={cn(r.scope, "relative h-full w-full overflow-hidden bg-background font-body", r.text, className)}
      style={
        accent
          ? ({ "--primary": accent.primary, "--primary-foreground": accent.foreground } as React.CSSProperties)
          : undefined
      }
    >
      {/* Main content well */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          style={{ y: contentY }}
          className={cn(
            "transition-[padding] duration-500 ease-in-out",
            chrome && !railCollapsed && "pl-[92px]",
            chrome ? (headerCollapsed ? "pt-4" : "pt-20") : ""
          )}
        >
          {children}
        </motion.div>
      </div>

      {chrome && (
        <>
          {/* Accent line + header */}
          <div className="absolute inset-x-0 top-0 z-30">
            <div
              className="w-full bg-primary transition-all duration-500 ease-in-out"
              style={{ height: headerCollapsed ? 6 : 0, opacity: headerCollapsed ? 1 : 0 }}
            />
            <header
              className="absolute inset-x-0 top-0 p-2"
              style={{
                opacity: headerCollapsed ? 0 : 1,
                transform: `translateY(${headerCollapsed ? -20 : 0}px)`,
                transition: "opacity 300ms ease-out, transform 300ms ease-out",
              }}
            >
              <nav className="relative flex h-16 w-full items-center justify-between rounded-full p-1 px-2">
                <div className={cn("flex h-16 shrink-0 items-center rounded-full px-3 shadow-lg", r.pill)}>
                  <span className="flex h-[52px] shrink-0 items-center rounded-full bg-primary px-4 shadow-md">
                    <span className="text-lg font-bold text-primary-foreground">InvestWise</span>
                  </span>
                </div>

                <div className="mx-2 flex h-full flex-1 items-center justify-center">
                  <div className="mr-2 flex shrink-0 scale-90 items-center">
                    <ProToggle on={toggleOn ?? proMode} lifted={toggleLifted} theme={theme} />
                  </div>
                  <SpotlightButton theme={theme} editing={editing} pressed={spotlightPressed} />
                  {favourites}
                </div>

                <div className={cn("flex h-16 shrink-0 items-center gap-1 rounded-full px-1 shadow-lg", r.pill)}>
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-full">
                    <Bell className={cn("h-5 w-5", theme === "clear" && "text-white")} />
                    <span className="box-content absolute right-3 top-3 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />
                  </span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/50 bg-muted text-sm font-medium">
                    A
                  </span>
                </div>
              </nav>
            </header>
          </div>

          {/* Side rail, with the chatbot button stacked above it */}
          <div className="absolute inset-y-0 left-4 z-40 flex items-center">
            <div className="relative flex flex-col items-center justify-center gap-4">
              <div
                className="absolute -left-4 inset-y-0 z-50 w-[6px] rounded-r bg-primary transition-opacity duration-300"
                style={{
                  opacity: railCollapsed ? 1 : 0,
                  boxShadow:
                    theme === "light" ? "2px 0 8px rgba(0,0,0,0.4)" : "2px 0 12px hsl(var(--primary) / 0.5)",
                }}
              />
              <div
                className="flex flex-col items-center gap-3 transition-all duration-300"
                style={{
                  opacity: railCollapsed ? 0 : 1,
                  transform: `translateX(${railCollapsed ? -32 : 0}px)`,
                }}
              >
                <div className="z-50 flex w-[80px] justify-center">
                  <span
                    data-anchor="chatbot"
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full shadow-2xl shadow-black/20",
                      r.pill
                    )}
                  >
                    <Bot className="h-7 w-7 text-primary" />
                  </span>
                </div>
                <nav
                  className={cn(
                    "relative flex flex-col items-center justify-between gap-4 rounded-full px-2 shadow-2xl shadow-black/20",
                    r.pill
                  )}
                  style={{ width: RAIL_W, paddingTop: RAIL_PAD, paddingBottom: RAIL_PAD }}
                >
                  <span
                    className="absolute left-0 top-0 rounded-full bg-primary"
                    style={{
                      width: GLIDER_W,
                      height: ITEM_H + 12,
                      transform: `translateX(${(RAIL_W - GLIDER_W) / 2}px) translateY(${
                        RAIL_PAD + activeNav * (ITEM_H + ITEM_GAP) - 6
                      }px)`,
                      transition: "transform 500ms cubic-bezier(0.22, 0.9, 0.35, 1)",
                    }}
                  />
                  {nav.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <span
                        key={item.label}
                        data-anchor={`nav-${i}`}
                        className="relative z-10 flex w-full flex-col items-center justify-center gap-1 rounded-full px-1.5"
                        style={{ height: ITEM_H }}
                      >
                        <span
                          className={cn(
                            "flex flex-col items-center transition-colors duration-300",
                            i === activeNav ? "text-primary-foreground" : r.navIdle
                          )}
                        >
                          <Icon className="h-6 w-6" />
                          <span className="mt-0.5 text-[10px] font-medium leading-tight">{item.label}</span>
                        </span>
                      </span>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </>
      )}

      {overlay && <div className="pointer-events-none absolute inset-0 z-50">{overlay}</div>}
    </div>
  );
}

// ─── Charts ────────────────────────────────────────────────────────────────

/**
 * Recharts' `LineChart` as `portfolio-value.tsx` configures it: dashed
 * `CartesianGrid`, default axes, a 2px primary line with the default white
 * dots, and the component's own margins (top 5, right 30, left 20, bottom 5).
 */
export function PortfolioChart({
  width,
  height = 450,
  points,
  labels,
  yTicks,
}: {
  width: number;
  height?: number;
  points: number[];
  labels: string[];
  yTicks: number[];
}) {
  const left = 20 + 60;
  const right = width - 30;
  const top = 5;
  const bottom = height - 5 - 30;
  const [lo, hi] = [yTicks[0], yTicks[yTicks.length - 1]];
  const x = (i: number) => left + (i / (points.length - 1)) * (right - left);
  const y = (v: number) => bottom - ((v - lo) / (hi - lo)) * (bottom - top);
  const d = points.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const grid = "#ccc";
  const axis = "#666";

  return (
    <svg width={width} height={height} className="block" aria-hidden>
      {yTicks.map((t) => (
        <line key={t} x1={left} x2={right} y1={y(t)} y2={y(t)} stroke={grid} strokeDasharray="3 3" />
      ))}
      {points.map((_, i) => (
        <line key={i} x1={x(i)} x2={x(i)} y1={top} y2={bottom} stroke={grid} strokeDasharray="3 3" />
      ))}
      <line x1={left} x2={left} y1={top} y2={bottom} stroke={axis} />
      <line x1={left} x2={right} y1={bottom} y2={bottom} stroke={axis} />
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={left - 6} x2={left} y1={y(t)} y2={y(t)} stroke={axis} />
          <text x={left - 9} y={y(t)} dy="0.355em" textAnchor="end" fontSize="12" fill={axis}>
            ${t.toLocaleString()}
          </text>
        </g>
      ))}
      {labels.map((l, i) => (
        <g key={l}>
          <line x1={x(i)} x2={x(i)} y1={bottom} y2={bottom + 6} stroke={axis} />
          <text x={x(i)} y={bottom + 20} textAnchor="middle" fontSize="12" fill={axis}>
            {l}
          </text>
        </g>
      ))}
      <path d={d} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
      {points.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="3" fill="#fff" stroke="hsl(var(--primary))" strokeWidth="1" />
      ))}
    </svg>
  );
}

/** Deterministic pseudo-random, so a chart is the same shape every render. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * The TradingView Advanced Chart widget, dark theme, as `research-client.tsx`
 * embeds it: candles with the four `PRO_STUDIES` — moving average and
 * Bollinger Bands on the price pane, RSI and MACD in panes of their own.
 */
export function TvChart({
  symbol,
  exchange = "NASDAQ",
  interval = "1",
  width,
  height,
  seed = 7,
  base = 180,
  studies = true,
}: {
  symbol: string;
  exchange?: string;
  interval?: string;
  width: number;
  height: number;
  seed?: number;
  base?: number;
  studies?: boolean;
}) {
  const rand = seeded(seed);
  const scaleW = 54;
  const timeH = 22;
  const plotW = width - scaleW;
  const count = Math.max(24, Math.floor(plotW / 9));
  const candles: { o: number; c: number; h: number; l: number }[] = [];
  let price = base;
  for (let i = 0; i < count; i++) {
    const drift = Math.sin(i / 9 + seed) * 0.35 + 0.06;
    const o = price;
    const c = o + (rand() - 0.5 + drift * 0.3) * base * 0.012;
    const h = Math.max(o, c) + rand() * base * 0.005;
    const l = Math.min(o, c) - rand() * base * 0.005;
    candles.push({ o, c, h, l });
    price = c;
  }

  const priceH = studies ? (height - timeH) * 0.58 : height - timeH;
  const paneH = studies ? (height - timeH - priceH) / 2 : 0;
  const lows = candles.map((k) => k.l);
  const highs = candles.map((k) => k.h);
  const lo = Math.min(...lows) - base * 0.004;
  const hi = Math.max(...highs) + base * 0.004;
  const py = (v: number) => 8 + (1 - (v - lo) / (hi - lo)) * (priceH - 16);
  const step = plotW / count;
  const cx = (i: number) => i * step + step / 2;

  const closes = candles.map((k) => k.c);
  const ma = closes.map((_, i) => {
    const from = Math.max(0, i - 9);
    const slice = closes.slice(from, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
  const sd = closes.map((_, i) => {
    const from = Math.max(0, i - 9);
    const slice = closes.slice(from, i + 1);
    const m = ma[i];
    return Math.sqrt(slice.reduce((a, b) => a + (b - m) ** 2, 0) / slice.length);
  });
  const path = (vals: number[], f: (v: number) => number) =>
    vals.map((v, i) => `${i ? "L" : "M"}${cx(i).toFixed(1)},${f(v).toFixed(1)}`).join(" ");
  const upper = ma.map((m, i) => m + sd[i] * 2);
  const lower = ma.map((m, i) => m - sd[i] * 2);
  const band =
    path(upper, py) +
    " " +
    lower
      .map((v, i) => [cx(i), py(v)] as const)
      .reverse()
      .map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ") +
    " Z";

  const rsi = closes.map((_, i) => 50 + Math.sin(i / 4 + seed) * 18 + (rand() - 0.5) * 8);
  const macd = closes.map((_, i) => Math.sin(i / 7 + seed) * 0.8);
  const signal = macd.map((_, i) => Math.sin((i - 3) / 7 + seed) * 0.7);

  const last = candles[candles.length - 1];
  const up = last.c >= candles[0].o;
  const green = "#089981";
  const red = "#F23645";
  const gridC = "#2A2E39";
  const text = "#B2B5BE";

  const rsiTop = priceH;
  const macdTop = priceH + paneH;
  const ry = (v: number) => rsiTop + 6 + (1 - v / 100) * (paneH - 12);
  const my = (v: number) => macdTop + paneH / 2 - v * (paneH / 2 - 8);

  return (
    <div className="relative overflow-hidden bg-[#131722] font-sans" style={{ width, height }}>
      <svg width={width} height={height} className="absolute inset-0" aria-hidden>
        {[0.2, 0.4, 0.6, 0.8].map((f) => (
          <line key={f} x1={0} x2={plotW} y1={priceH * f} y2={priceH * f} stroke={gridC} />
        ))}
        {[0.2, 0.4, 0.6, 0.8].map((f) => (
          <line key={f} x1={plotW * f} x2={plotW * f} y1={0} y2={height - timeH} stroke={gridC} />
        ))}
        {studies && (
          <>
            <path d={band} fill="rgba(33,150,243,0.07)" />
            <path d={path(upper, py)} fill="none" stroke="#2962FF" strokeWidth="1" />
            <path d={path(lower, py)} fill="none" stroke="#2962FF" strokeWidth="1" />
            <path d={path(ma, py)} fill="none" stroke="#FF6D00" strokeWidth="1.2" />
          </>
        )}
        {candles.map((k, i) => {
          const colour = k.c >= k.o ? green : red;
          const w = Math.max(2, step * 0.62);
          return (
            <g key={i}>
              <line x1={cx(i)} x2={cx(i)} y1={py(k.h)} y2={py(k.l)} stroke={colour} />
              <rect
                x={cx(i) - w / 2}
                y={py(Math.max(k.o, k.c))}
                width={w}
                height={Math.max(1, Math.abs(py(k.o) - py(k.c)))}
                fill={colour}
              />
            </g>
          );
        })}
        <line x1={0} x2={plotW} y1={py(last.c)} y2={py(last.c)} stroke={up ? green : red} strokeDasharray="2 2" />

        {studies && (
          <>
            <line x1={0} x2={width} y1={rsiTop} y2={rsiTop} stroke="#363A45" />
            <rect x={0} y={ry(70)} width={plotW} height={ry(30) - ry(70)} fill="rgba(126,87,194,0.08)" />
            <line x1={0} x2={plotW} y1={ry(70)} y2={ry(70)} stroke="#787B86" strokeDasharray="3 3" />
            <line x1={0} x2={plotW} y1={ry(30)} y2={ry(30)} stroke="#787B86" strokeDasharray="3 3" />
            <path d={path(rsi, ry)} fill="none" stroke="#7E57C2" strokeWidth="1.2" />

            <line x1={0} x2={width} y1={macdTop} y2={macdTop} stroke="#363A45" />
            {macd.map((v, i) => {
              const h = v - signal[i];
              return (
                <rect
                  key={i}
                  x={cx(i) - step * 0.3}
                  y={Math.min(my(0), my(h))}
                  width={step * 0.6}
                  height={Math.abs(my(h) - my(0))}
                  fill={h >= 0 ? "rgba(38,166,154,0.55)" : "rgba(239,83,80,0.55)"}
                />
              );
            })}
            <path d={path(macd, my)} fill="none" stroke="#2962FF" strokeWidth="1.2" />
            <path d={path(signal, my)} fill="none" stroke="#FF6D00" strokeWidth="1.2" />
          </>
        )}
        <line x1={plotW} x2={plotW} y1={0} y2={height} stroke="#363A45" />
        <line x1={0} x2={width} y1={height - timeH} y2={height - timeH} stroke="#363A45" />
      </svg>

      {/* Price scale + last price tag */}
      <div className="absolute right-0 top-0 flex h-full flex-col" style={{ width: scaleW }}>
        {[0.2, 0.4, 0.6, 0.8].map((f) => (
          <span
            key={f}
            className="absolute right-1.5 text-[10px] tabular-nums"
            style={{ top: priceH * f - 6, color: text }}
          >
            {(hi - (hi - lo) * f).toFixed(2)}
          </span>
        ))}
        <span
          className="absolute right-0 rounded-sm px-1 text-[10px] font-medium tabular-nums text-white"
          style={{ top: py(last.c) - 7, background: up ? green : red }}
        >
          {last.c.toFixed(2)}
        </span>
      </div>

      {/* Legend */}
      <div className="absolute left-2 top-1.5 flex items-center gap-1.5 text-[11px]" style={{ color: text }}>
        <span className="font-semibold text-[#D1D4DC]">
          {symbol} · {interval} · {exchange}
        </span>
        <span>
          O<span style={{ color: up ? green : red }}>{last.o.toFixed(2)}</span> H
          <span style={{ color: up ? green : red }}>{last.h.toFixed(2)}</span> C
          <span style={{ color: up ? green : red }}>{last.c.toFixed(2)}</span>
        </span>
      </div>
      {studies && (
        <>
          <span className="absolute left-2 text-[10px]" style={{ top: 22, color: text }}>
            BB 20 2 · MA 9
          </span>
          <span className="absolute left-2 text-[10px]" style={{ top: rsiTop + 4, color: text }}>
            RSI 14 <span className="text-[#7E57C2]">{rsi[rsi.length - 1].toFixed(2)}</span>
          </span>
          <span className="absolute left-2 text-[10px]" style={{ top: macdTop + 4, color: text }}>
            MACD 12 26 close 9
          </span>
        </>
      )}
      <div
        className="absolute bottom-0 left-0 flex items-center justify-around text-[10px]"
        style={{ width: plotW, height: timeH, color: text }}
      >
        {["10:00", "11:00", "12:00", "13:00", "14:00"].map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  );
}
