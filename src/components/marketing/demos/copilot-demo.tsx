// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React from "react";
import { BarChart, Sparkles } from "lucide-react";
import { AppChrome, SpotlightButton } from "@/components/marketing/app-chrome";
import { DemoCursor } from "@/components/marketing/device-frame";
import { DashboardBackdrop } from "@/components/marketing/demos/dashboard-backdrop";
import { between, ramp, typeAt, useDemoClock } from "@/components/marketing/demo-clock";

/**
 * The co-pilot — an assistant that already knows where you are.
 *
 * The interesting part of InvestWise's chatbot isn't that it answers; it's
 * that `chatbot-store` is kept in sync with the router, so the model is handed
 * a description of the page you're looking at before you've typed anything.
 * "Why is this down?" resolves against your open position rather than against
 * nothing. That's what the context chip in this recording is showing, and it's
 * why the question in it is deliberately one that would be unanswerable
 * without it.
 */

const QUESTION = "Why is my NVDA position up so much this week?";

const ANSWER =
  "Your 22 shares are up 8.4% since Monday, and almost all of that came on Wednesday's datacentre guidance raise. Two things worth knowing: NVDA is now 41% of your portfolio, which is a lot of one company, and your cost basis means a 10% pullback still leaves you ahead. You don't have to act — but this is the moment to decide whether that concentration is on purpose.";

// ─── Script ──────────────────────────────────────────────────────────────────
const CURSOR_TO_BUBBLE = 460;
const TAP_BUBBLE = 900;
const PANEL_IN = 960;
const CONTEXT_IN = 1440;
const TYPE_START = 1900;
const SEND = 3560;
const THINKING = 3700;
const STREAM_START = 4460;
const CHIPS_IN = 8200;
const LOOP = 11800;

export function CopilotDemo({
  active,
  reducedMotion,
}: {
  active: boolean;
  reducedMotion: boolean;
}) {
  const t = useDemoClock(active, LOOP, { staticFrame: 9000, reducedMotion });

  const open = t >= TAP_BUBBLE;
  const panelIn = ramp(t, PANEL_IN, PANEL_IN + 360);
  const draft = typeAt(QUESTION, t, TYPE_START, 46);
  const sent = t >= SEND;
  const thinking = between(t, THINKING, STREAM_START);
  const streamed = typeAt(ANSWER, t, STREAM_START, 11);

  return (
    <AppChrome activeNav={1} headerCentre={<SpotlightButton />}>
      <DashboardBackdrop />

      {/* Launcher. Stays put while the panel is open — the panel grows out of
          it, so the two have to remain visibly the same object. */}
      <div
        className="absolute bottom-6 right-7 z-30 flex h-[52px] w-[52px] items-center justify-center rounded-full transition-all duration-500"
        style={{
          background: "hsl(var(--primary))",
          boxShadow: "0 12px 34px -8px hsl(var(--primary) / 0.9)",
          transform: `scale(${open ? 0.86 : 1})`,
          opacity: open ? 0.5 : 1,
        }}
      >
        <Sparkles className="h-5 w-5 text-primary-foreground" />
      </div>

      {/* The panel, anchored to the launcher it came from. Enter and exit share
          that origin, so it always reads as unfolding from the button rather
          than arriving from nowhere. */}
      <div
        className="absolute bottom-[92px] right-7 z-30 flex w-[400px] flex-col overflow-hidden rounded-[calc(var(--radius)*1.2)] bg-card shadow-[inset_0_0_0_1px_hsl(var(--border)),0_30px_70px_-24px_hsl(0_0%_0%/0.85)]"
        style={{
          height: 396,
          transformOrigin: "bottom right",
          opacity: panelIn,
          transform: `scale(${0.9 + panelIn * 0.1})`,
          filter: `blur(${(1 - panelIn) * 8}px)`,
          pointerEvents: "none",
        }}
      >
        {/* Header + the context the model is actually given */}
        <div className="shrink-0 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{ background: "hsl(var(--primary) / 0.2)" }}
            >
              <Sparkles className="h-3.5 w-3.5" style={{ color: "hsl(var(--primary))" }} />
            </span>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-foreground">InvestWise AI</p>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Online
            </span>
          </div>

          <div
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-all duration-500"
            style={{
              background: "hsl(var(--primary) / 0.14)",
              boxShadow: "inset 0 0 0 1px hsl(var(--primary) / 0.3)",
              opacity: ramp(t, CONTEXT_IN, CONTEXT_IN + 340),
              transform: `translateY(${(1 - ramp(t, CONTEXT_IN, CONTEXT_IN + 340)) * 5}px)`,
            }}
          >
            <BarChart className="h-3 w-3" style={{ color: "hsl(var(--primary))" }} />
            <span className="text-[10px] font-semibold text-foreground/80">
              Context: Portfolio · 4 holdings
            </span>
          </div>
        </div>

        {/* Transcript */}
        <div className="flex-1 space-y-3 overflow-hidden px-4 py-3.5">
          {sent && (
            <div className="flex justify-end">
              <p
                className="max-w-[80%] rounded-[calc(var(--radius))] rounded-br-sm px-3 py-2 text-[12px] font-medium leading-relaxed text-primary-foreground"
                style={{
                  background: "hsl(var(--primary))",
                  opacity: ramp(t, SEND, SEND + 220),
                  transform: `translateY(${(1 - ramp(t, SEND, SEND + 220)) * 8}px)`,
                }}
              >
                {QUESTION}
              </p>
            </div>
          )}

          {thinking && (
            <div className="flex gap-1.5 pl-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: "hsl(var(--foreground) / 0.45)",
                    // Staggered pulse, derived from the clock so it stays in
                    // step with everything else in the script.
                    opacity: 0.3 + 0.7 * Math.abs(Math.sin((t / 260) - i * 0.7)),
                  }}
                />
              ))}
            </div>
          )}

          {t >= STREAM_START && (
            <div className="max-w-[92%] rounded-[calc(var(--radius))] rounded-bl-sm bg-muted px-3 py-2.5">
              <p className="text-[12px] leading-relaxed text-foreground/85">
                {streamed}
                {streamed.length < ANSWER.length && <span className="lp-caret" />}
              </p>
            </div>
          )}

          {t >= CHIPS_IN && (
            <div
              className="flex flex-wrap gap-1.5 pt-0.5"
              style={{ opacity: ramp(t, CHIPS_IN, CHIPS_IN + 320) }}
            >
              {["Rebalance it", "Explain concentration risk", "Set an alert"].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full px-2.5 py-1 text-[10px] font-semibold text-foreground/75"
                  style={{ boxShadow: "inset 0 0 0 1px hsl(var(--border))" }}
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="shrink-0 border-t border-border px-3 py-2.5">
          <div className="flex items-center gap-2 rounded-full bg-muted px-3.5 py-2">
            <span className="flex-1 text-[12px] text-foreground/85">
              {sent ? (
                <span className="text-foreground/35">
                  Ask anything…
                  <span className="lp-caret" />
                </span>
              ) : draft ? (
                <>
                  {draft}
                  <span className="lp-caret" />
                </>
              ) : (
                <span className="text-foreground/35">
                  Ask anything…
                  <span className="lp-caret" />
                </span>
              )}
            </span>
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full transition-opacity duration-300"
              style={{
                background: "hsl(var(--primary))",
                opacity: draft && !sent ? 1 : 0.3,
              }}
            >
              <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden>
                <path
                  d="M8 13V3M8 3L4 7M8 3l4 4"
                  fill="none"
                  stroke="hsl(var(--primary-foreground))"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <DemoCursor
        x={t >= CURSOR_TO_BUBBLE ? 978 : 700}
        y={t >= CURSOR_TO_BUBBLE ? 596 : 420}
        pressed={between(t, TAP_BUBBLE, TAP_BUBBLE + 140)}
        tapKey={between(t, TAP_BUBBLE, TAP_BUBBLE + 700) ? "bubble" : undefined}
      />
    </AppChrome>
  );
}
