// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React from "react";
import { ArrowLeft, Shield, Sun, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoCursor } from "@/components/marketing/device-frame";
import { MockShell, recipes, type MockTheme } from "@/components/marketing/mock/mock-kit";
import { between, ramp, useAnchors, useDemoClock } from "@/components/marketing/demo-clock";

/**
 * Clear Mode — Settings → Appearance, recorded.
 *
 * Settings is one of the app's special-layout routes: no header, no rail, just
 * a back button and a centred column. The Appearance card holds the three
 * theme cards (Light, Dark, and Clear — "Liquid Glass"), the accent colour
 * wheel with its hex field, and the sidebar orientation below the fold.
 * Recorded: Clear turns every surface to glass, the hue slider drags the
 * accent from indigo to teal and the whole page follows, then Light and back.
 */

// ─── Script ──────────────────────────────────────────────────────────────────
const TO_CLEAR = 500;
const TAP_CLEAR = 1000;
const TO_HUE = 1900;
const DRAG = 2400;
const DROP = 3500;
const TO_LIGHT = 4400;
const TAP_LIGHT = 4900;
const TO_DARK = 6800;
const TAP_DARK = 7300;
const LOOP = 9800;

const FROM = { h: 251, s: 82, l: 65 };
const TO = { h: 173, s: 80, l: 40 };

function hslToHex(h: number, s: number, l: number) {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, "0");
  };
  return `${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

export function ClearModeDemo({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const t = useDemoClock(active, LOOP, { staticFrame: 4200, reducedMotion });
  const [rootRef, anchors] = useAnchors(t < 1000 ? 0 : 1);

  const clear = t >= TAP_CLEAR;
  const light = between(t, TAP_LIGHT, TAP_DARK);
  const theme: MockTheme = clear ? (light ? "clear-light" : "clear") : light ? "light" : "dark";

  const p = ramp(t, DRAG, DROP);
  const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  const hue = { h: FROM.h + (TO.h - FROM.h) * eased, s: FROM.s + (TO.s - FROM.s) * eased, l: FROM.l + (TO.l - FROM.l) * eased };
  const accent = { primary: `${hue.h.toFixed(0)} ${hue.s.toFixed(0)}% ${hue.l.toFixed(0)}%`, foreground: "210 40% 98%" };

  const bar = anchors["hue-bar"] ?? { x: 640, y: 560 };
  const hueX = bar.x - 408 + (hue.h / 360) * 816;
  const cursor =
    t >= TO_DARK
      ? anchors["theme-dark"] ?? { x: 640, y: 250 }
      : t >= TO_LIGHT
        ? anchors["theme-light"] ?? { x: 363, y: 250 }
        : t >= TO_HUE
          ? { x: hueX, y: bar.y }
          : t >= TO_CLEAR
            ? anchors["theme-clear"] ?? { x: 917, y: 250 }
            : { x: 700, y: 620 };

  return (
    <div ref={rootRef} className="relative h-full w-full">
      <MockShell
        theme={theme}
        chrome={false}
        accent={accent}
        className="transition-colors duration-500"
        overlay={
          <DemoCursor
            x={cursor.x}
            y={cursor.y}
            pressed={
              between(t, TAP_CLEAR, TAP_CLEAR + 140) ||
              between(t, DRAG, DROP) ||
              between(t, TAP_LIGHT, TAP_LIGHT + 140) ||
              between(t, TAP_DARK, TAP_DARK + 140)
            }
            tapKey={
              between(t, TAP_CLEAR, TAP_CLEAR + 700)
                ? "clear"
                : between(t, TAP_LIGHT, TAP_LIGHT + 700)
                  ? "light"
                  : between(t, TAP_DARK, TAP_DARK + 700)
                    ? "dark"
                    : undefined
            }
          />
        }
      >
        <Settings theme={theme} hue={hue} />
      </MockShell>
    </div>
  );
}

function Settings({ theme, hue }: { theme: MockTheme; hue: { h: number; s: number; l: number } }) {
  const r = recipes(theme);
  const clear = theme === "clear" || theme === "clear-light";
  const light = theme === "light" || theme === "clear-light";
  const hex = hslToHex(hue.h, hue.s, hue.l);

  return (
    <div className="relative">
      <span
        className={cn(
          "shimmer-bg absolute left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-full shadow-lg",
          r.chip
        )}
      >
        <ArrowLeft className="h-6 w-6" />
      </span>

      <main className="mx-auto max-w-4xl space-y-8 p-4 pb-24" style={{ marginTop: -150 }}>
        <div className={r.card}>
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight">
              <Shield className="text-primary" />
              Parental Control
            </h3>
            <p className="text-sm text-muted-foreground">Manage settings for younger users.</p>
          </div>
          <div className="flex items-center justify-between p-6 pt-0">
            <span className="text-sm font-medium">Enable Parental Controls</span>
            <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-input">
              <span className="ml-0.5 block h-5 w-5 rounded-full bg-background shadow-lg" />
            </span>
          </div>
        </div>

        <div className={r.card}>
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight">
              <Sun className="text-primary" />
              Appearance
            </h3>
            <p className="text-sm text-muted-foreground">Customize the look and feel of the app.</p>
          </div>
          <div className="space-y-8 p-6 pt-0">
            <div className="grid grid-cols-3 justify-items-center gap-4">
              <ThemeCard label="Light" kind="light" selected={light} anchor="theme-light" />
              <ThemeCard label="Dark" kind="dark" selected={!light} anchor="theme-dark" />
              <ThemeCard label="Clear" kind="clear" light={light} selected={clear} anchor="theme-clear" />
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="w-full">
                <div
                  className="relative h-[200px] w-full rounded-t-lg"
                  style={{
                    background: `linear-gradient(to top, #000, rgba(0,0,0,0)), linear-gradient(to right, #fff, hsl(${hue.h} 100% 50%))`,
                  }}
                >
                  <span
                    className="absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                    style={{ left: "70%", top: `${100 - hue.l * 1.1}%`, background: `#${hex}` }}
                  />
                </div>
                <div
                  data-anchor="hue-bar"
                  className="relative h-6 w-full rounded-b-lg"
                  style={{
                    background:
                      "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
                  }}
                >
                  <span
                    className="absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                    style={{ left: `${(hue.h / 360) * 100}%`, background: `hsl(${hue.h} 100% 50%)` }}
                  />
                </div>
              </div>
              <div className="grid w-full items-center gap-1.5">
                <span className="text-sm font-medium">Primary Color (HEX)</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground">#</span>
                  <span className="flex h-10 w-full items-center rounded-md border border-input bg-background pl-7 font-mono text-sm">
                    {hex}
                  </span>
                </div>
                <p className="text-center text-xs text-muted-foreground">Default color is #775DEF</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ThemeCard({
  label,
  kind,
  light = false,
  selected,
  anchor,
}: {
  label: string;
  kind: "light" | "dark" | "clear";
  light?: boolean;
  selected: boolean;
  anchor: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span
        data-anchor={anchor}
        className={cn(
          "flex h-24 w-24 items-center justify-center rounded-lg p-2 transition-all duration-200",
          selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "ring-1 ring-border"
        )}
      >
        <span
          className={cn(
            "flex h-full w-full items-center justify-center rounded-md",
            kind === "light" && "bg-white",
            kind === "dark" && "bg-gray-800",
            kind === "clear" && "bg-gray-700/50 backdrop-blur-xs"
          )}
        >
          <TrendingUp
            className={cn(
              "h-8 w-8",
              kind === "dark" && "text-white",
              kind === "light" && "text-gray-800",
              kind === "clear" && (light ? "text-white" : "text-primary")
            )}
          />
        </span>
      </span>
      <p className="mt-2 text-sm font-medium">{label}</p>
      {kind === "clear" && <p className="text-xs text-muted-foreground">(Liquid Glass)</p>}
    </div>
  );
}
