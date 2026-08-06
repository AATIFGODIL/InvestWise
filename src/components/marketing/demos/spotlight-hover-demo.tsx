// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React from "react";
import { BrainCircuit, Minus, PartyPopper, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppChrome, SpotlightButton } from "@/components/marketing/app-chrome";
import { DemoCursor } from "@/components/marketing/device-frame";
import { DashboardBackdrop } from "@/components/marketing/demos/dashboard-backdrop";
import { between, useDemoClock } from "@/components/marketing/demo-clock";

/**
 * The header hover — favourites, fanned out of the search button.
 *
 * `header.tsx` puts `onMouseEnter` on the whole nav, and on hover a
 * `Reorder.Group` of the user's pinned favourites unrolls to the right of the
 * Spotlight Search button: the container goes `width: 0 → auto` while the items
 * come up `scale: 0.5 → 1` on a 50ms stagger. Long-press the search button and
 * the header drops into editing mode — `shimmer-bg` sweeps across everything,
 * the label swaps to "Editing Mode", and each favourite grows a remove button.
 * Drag one and the rest reflow around it.
 *
 * Three states, then, and the recording walks all three: reveal, reorder, edit.
 *
 * The favourites are absolutely positioned and moved with `translateX` rather
 * than laid out in flow. Reordering DOM nodes inside a flex row jumps — there's
 * nothing for the browser to interpolate — whereas transforms transition, which
 * is what makes the reorder read as a drag instead of a cut.
 */

type Fav =
  | { kind: "stock"; symbol: string; name: string; price: string; delta: number }
  | { kind: "action"; label: string; icon: React.ElementType };

/** `favorite-item.tsx`: pills are 140×48, icon chips are 48×48, `gap-3`. */
const PILL_W = 140;
const ICON_W = 48;
const GAP = 12;

const FAVOURITES: Fav[] = [
  { kind: "stock", symbol: "NVDA", name: "NVDA", price: "184.92", delta: 4.41 },
  { kind: "stock", symbol: "AAPL", name: "AAPL", price: "231.40", delta: 1.98 },
  { kind: "action", label: "Ask AI", icon: BrainCircuit },
  { kind: "action", label: "Make it rain", icon: PartyPopper },
];

const widthOf = (f: Fav) => (f.kind === "stock" ? PILL_W : ICON_W);

// ─── Script ──────────────────────────────────────────────────────────────────
const CURSOR_UP = 620;
/** The nav takes the hover; the group starts unrolling. */
const HOVER_IN = 1080;
/** Cursor settles on the first favourite. */
const GRAB_MOVE = 2500;
const GRAB = 2960;
/** …and drags it past its neighbour. */
const SWAP = 3420;
const DROP = 3900;
/** Back to the search button for the long press. */
const PRESS_MOVE = 4700;
const PRESS = 5160;
const EDIT_IN = 5800;
const EDIT_OUT = 8100;
/** Pointer leaves the header; the group rolls back up. */
const HOVER_OUT = 8600;
const LOOP = 10400;

export function SpotlightHoverDemo({
  active,
  reducedMotion,
}: {
  active: boolean;
  reducedMotion: boolean;
}) {
  const t = useDemoClock(active, LOOP, { staticFrame: 2200, reducedMotion });

  const open = between(t, HOVER_IN, HOVER_OUT);
  const editing = between(t, EDIT_IN, EDIT_OUT);
  const dragging = between(t, GRAB, DROP);
  const swapped = t >= SWAP;

  // The two stock pills trade places. Everything after them stays put, which
  // is exactly what the real `Reorder.Group` does — only the items between the
  // grab point and the drop point move.
  const order = swapped ? [1, 0, 2, 3] : [0, 1, 2, 3];

  // Resting x for each favourite, from its position in the current order.
  const restX: number[] = [];
  let cursorX = 0;
  order.forEach((favIndex) => {
    restX[favIndex] = cursorX;
    cursorX += widthOf(FAVOURITES[favIndex]) + GAP;
  });
  const groupWidth = cursorX - GAP;

  // Where the pointer is. It only ever visits three places, so the positions
  // are named rather than interpolated.
  const cursor = (() => {
    if (t >= PRESS_MOVE) return { x: 470, y: 46 };
    if (t >= GRAB_MOVE) return { x: swapped ? 700 : 560, y: 46 };
    if (t >= CURSOR_UP) return { x: 470, y: 46 };
    return { x: 620, y: 460 };
  })();

  return (
    <AppChrome
      headerCentre={
        <div className="relative z-10 flex items-center">
          <SpotlightButton editing={editing} active={between(t, PRESS, EDIT_IN)} />

          {/* The group. `width` carries the unroll, exactly as the app's
              `containerVariants` does — the items themselves only fade and
              scale, so they appear to be pushed out by the container rather
              than flying in from somewhere off-screen. */}
          <div
            className="relative h-12 overflow-hidden"
            style={{
              width: open ? groupWidth + GAP : 0,
              marginLeft: 0,
              paddingLeft: open ? GAP : 0,
              opacity: open ? 1 : 0,
              transition: "width 260ms ease, opacity 200ms ease, padding-left 260ms ease",
            }}
          >
            {FAVOURITES.map((fav, i) => {
              const isDragged = dragging && i === 0;
              // Stagger on the way in only; on the way out they leave together.
              const delay = open ? 100 + order.indexOf(i) * 50 : 0;
              return (
                <div
                  key={fav.kind === "stock" ? fav.symbol : fav.label}
                  className="absolute top-0"
                  style={{
                    left: 0,
                    width: widthOf(fav),
                    height: 48,
                    zIndex: isDragged ? 50 : 10,
                    transform: `translateX(${restX[i]}px) scale(${
                      !open ? 0.5 : isDragged ? 1.1 : 1
                    })`,
                    opacity: open ? 1 : 0,
                    transition: `transform 320ms cubic-bezier(0.32, 0.72, 0, 1) ${delay}ms, opacity 200ms ease ${delay}ms`,
                  }}
                >
                  <FavouriteChip fav={fav} editing={editing} dragging={isDragged} />
                </div>
              );
            })}
          </div>
        </div>
      }
    >
      <DashboardBackdrop />

      <DemoCursor
        x={cursor.x}
        y={cursor.y}
        pressed={dragging || between(t, PRESS, EDIT_IN)}
        tapKey={between(t, PRESS, PRESS + 700) ? "press" : undefined}
      />
    </AppChrome>
  );
}

/**
 * One favourite. Stocks render as a 140px pill carrying a live quote; actions
 * render as a 48px icon chip. Both sit on `bg-background` inside a `--border`
 * ring, which is what makes them read as raised off the transparent header.
 */
function FavouriteChip({
  fav,
  editing,
  dragging,
}: {
  fav: Fav;
  editing: boolean;
  dragging: boolean;
}) {
  return (
    <span
      className={cn(
        "relative flex h-12 w-full items-center justify-center rounded-full bg-background text-foreground shadow-[inset_0_0_0_1px_hsl(var(--border))]",
        editing && "shimmer-bg",
        dragging && "shadow-[inset_0_0_0_1px_hsl(var(--primary)),0_10px_28px_-6px_hsl(var(--primary)/0.8)]"
      )}
    >
      {/* Remove button, which only exists in editing mode. */}
      <span
        className="absolute -left-1 -top-1 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 shadow-[0_0_0_2px_hsl(0_0%_100%/0.5)] backdrop-blur-sm"
        style={{
          opacity: editing ? 1 : 0,
          transform: `scale(${editing ? 1 : 0.5})`,
          transition: "opacity 200ms ease, transform 200ms ease",
        }}
      >
        <Minus className="h-3.5 w-3.5 text-white" strokeWidth={3} />
      </span>

      {fav.kind === "stock" ? (
        <span className="flex w-full items-center gap-2 px-4">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
            style={{ background: "hsl(var(--primary) / 0.18)" }}
          >
            {fav.symbol.charAt(0)}
          </span>
          <span className="flex min-w-0 flex-col items-start text-xs leading-tight">
            <span className="truncate font-bold">{fav.name}</span>
            <span className="lp-tnum flex items-center gap-0.5">
              ${fav.price}
              {fav.delta >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
            </span>
          </span>
        </span>
      ) : (
        <fav.icon className="h-6 w-6" />
      )}
    </span>
  );
}
