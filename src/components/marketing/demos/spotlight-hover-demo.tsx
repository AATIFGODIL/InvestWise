// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React from "react";
import { DemoCursor } from "@/components/marketing/device-frame";
import { FavouriteChip, MockShell, type MockFavourite } from "@/components/marketing/mock/mock-kit";
import { MockDashboard } from "@/components/marketing/mock/mock-dashboard";
import { between, useAnchors, useDemoClock } from "@/components/marketing/demo-clock";

/**
 * The header's favourites — `header.tsx` and `favorite-item.tsx`, recorded.
 *
 * Hovering the header unrolls the favourites to the right of Spotlight Search
 * (the Pro Mode toggle and the search button slide left to make room, because
 * the whole group stays centred). Holding the search button for 500ms toggles
 * Editing Mode: the shimmer sweeps, the label swaps, each favourite grows a
 * remove button, and they can be dragged into a new order — or tapped, which
 * flips a favourite between a 48px icon and a 140px pill with a live price.
 */

const START: MockFavourite[] = [
  { id: "googl", kind: "stock", symbol: "GOOGL", price: "247.18", up: true, pill: false },
  { id: "aapl", kind: "stock", symbol: "AAPL", price: "231.40", up: true, pill: false },
  { id: "nvda", kind: "stock", symbol: "NVDA", price: "184.92", up: true, pill: false },
  { id: "msft", kind: "stock", symbol: "MSFT", price: "516.17", up: true, pill: true },
];

const GAP = 12;

// ─── Script ──────────────────────────────────────────────────────────────────
const CURSOR_UP = 400;
const HOVER_IN = 800;
const TO_SEARCH = 1900;
const PRESS = 2300;
const EDIT_ON = 2800;
const TO_MSFT = 3300;
const GRAB = 3750;
const REORDER = 4150;
const DROP = 4600;
const TO_NVDA = 5200;
const TAP_NVDA = 5650;
const TO_SEARCH_2 = 6500;
const PRESS_2 = 6900;
const EDIT_OFF = 7400;
const LEAVE = 8200;
const HOVER_OUT = 8500;
const LOOP = 9800;

export function SpotlightHoverDemo({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const t = useDemoClock(active, LOOP, { staticFrame: 5000, reducedMotion });
  const [rootRef, anchors] = useAnchors(t);

  const open = between(t, HOVER_IN, HOVER_OUT);
  const editing = between(t, EDIT_ON, EDIT_OFF);
  const dragging = between(t, GRAB, DROP);

  const favs = START.map((f) => (f.id === "nvda" && t >= TAP_NVDA ? { ...f, pill: true } : f));
  const order = t >= REORDER ? ["msft", "googl", "aapl", "nvda"] : ["googl", "aapl", "nvda", "msft"];

  const lefts: Record<string, number> = {};
  let x = GAP;
  order.forEach((id) => {
    lefts[id] = x;
    x += (favs.find((f) => f.id === id)!.pill ? 140 : 48) + GAP;
  });
  const groupW = x - GAP;

  const at = (name: string, fallback: { x: number; y: number }) => anchors[name] ?? fallback;
  const cursor =
    t >= LEAVE
      ? { x: 720, y: 520 }
      : t >= TO_SEARCH_2
        ? at("spotlight", { x: 560, y: 40 })
        : t >= TO_NVDA
          ? at("fav-nvda", { x: 900, y: 40 })
          : t >= TO_MSFT
            ? at("fav-msft", { x: 900, y: 40 })
            : t >= TO_SEARCH
              ? at("spotlight", { x: 560, y: 40 })
              : t >= CURSOR_UP
                ? { x: 800, y: 44 }
                : { x: 720, y: 520 };

  const favourites = (
    <div
      className="relative h-12 shrink-0 overflow-visible"
      style={{
        width: open ? groupW : 0,
        opacity: open ? 1 : 0,
        transition: `width 220ms ease ${open ? 100 : 0}ms, opacity 200ms ease ${open ? 100 : 0}ms`,
      }}
    >
      {favs.map((fav) => {
        const i = order.indexOf(fav.id);
        return (
          <div
            key={fav.id}
            data-anchor={`fav-${fav.id}`}
            className="absolute top-0"
            style={{
              left: lefts[fav.id],
              width: fav.pill ? 140 : 48,
              height: 48,
              zIndex: dragging && fav.id === "msft" ? 50 : 10,
              opacity: open ? 1 : 0,
              transform: `scale(${open ? 1 : 0.5})`,
              transition: `left 320ms cubic-bezier(0.32, 0.72, 0, 1), width 200ms ease, opacity 200ms ease ${
                open ? 100 + i * 50 : 0
              }ms, transform 200ms ease ${open ? 100 + i * 50 : 0}ms`,
            }}
          >
            <FavouriteChip fav={fav} theme="dark" editing={editing} lifted={dragging && fav.id === "msft"} />
          </div>
        );
      })}
    </div>
  );

  return (
    <div ref={rootRef} className="relative h-full w-full">
      <MockShell
        theme="dark"
        editing={editing}
        spotlightPressed={between(t, PRESS, EDIT_ON) || between(t, PRESS_2, EDIT_OFF)}
        favourites={favourites}
        overlay={
          <DemoCursor
            x={cursor.x}
            y={cursor.y}
            pressed={between(t, PRESS, EDIT_ON) || dragging || between(t, TAP_NVDA, TAP_NVDA + 140) || between(t, PRESS_2, EDIT_OFF)}
            tapKey={
              between(t, PRESS, PRESS + 700)
                ? "press"
                : between(t, TAP_NVDA, TAP_NVDA + 700)
                  ? "nvda"
                  : between(t, PRESS_2, PRESS_2 + 700)
                    ? "press-2"
                    : undefined
            }
          />
        }
      >
        <MockDashboard theme="dark" />
      </MockShell>
    </div>
  );
}
