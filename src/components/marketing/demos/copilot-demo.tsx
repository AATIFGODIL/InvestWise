// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React from "react";
import { ArrowLeft, Bot, BrainCircuit, Clock, Mic, Paperclip, Search, Send, Star, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoCursor } from "@/components/marketing/device-frame";
import { MockShell, TvChart, recipes } from "@/components/marketing/mock/mock-kit";
import { between, ramp, useAnchors, useDemoClock } from "@/components/marketing/demo-clock";

/**
 * The co-pilot — `chatbot.tsx`, opened from the Trade page's "Ask AI" button.
 *
 * That button opens the assistant with "Analyzing stock data..." and sends a
 * query built from the symbol and price on screen, so the answer is about NVDA
 * at $184.92 rather than about investing in general. The assistant is a sheet
 * from the right over a `bg-black/80` scrim; the reply replaces a pulsing
 * placeholder bubble when it lands, and the suggestion chips under the thread
 * are the same context-aware ones the app shows.
 */

const QUERY = "Analyze NVDA based on its current price of $184.92 and recent performance.";

const ANSWER: string[] = [
  "**NVDA at $184.92** is up 2.44% today, extending a strong run on data center demand.",
  "**What's driving it:** orders from cloud companies keep beating expectations.",
  "**What to watch:** after a run like this, the price already assumes a lot of growth, so a small miss can mean a sharp drop.",
  "**If you're new:** consider starting small and adding over time rather than buying all at once.",
];

// ─── Script ──────────────────────────────────────────────────────────────────
const CURSOR_TO_ASK = 500;
const TAP_ASK = 1100;
const SHEET_IN = 1150;
const SENT = 1900;
const THINKING = 2100;
const ANSWERED = 4200;
const LOOP = 11000;

export function CopilotDemo({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const t = useDemoClock(active, LOOP, { staticFrame: 8000, reducedMotion });
  const [rootRef, anchors] = useAnchors(t < SHEET_IN ? t : 0);

  const open = t >= SHEET_IN;
  const cursor =
    t >= SHEET_IN + 600
      ? { x: 1040, y: 690 }
      : t >= CURSOR_TO_ASK
        ? anchors["ask-ai"] ?? { x: 1070, y: 196 }
        : { x: 700, y: 560 };

  return (
    <div ref={rootRef} className="relative h-full w-full">
      <MockShell
        theme="dark"
        activeNav={2}
        overlay={
          <>
            <div
              className="absolute inset-0 bg-black/80"
              style={{ opacity: open ? 1 : 0, transition: "opacity 300ms ease" }}
            />
            <Sheet open={open} t={t} />
            <DemoCursor
              x={cursor.x}
              y={cursor.y}
              pressed={between(t, TAP_ASK, TAP_ASK + 140)}
              tapKey={between(t, TAP_ASK, TAP_ASK + 700) ? "ask" : undefined}
            />
          </>
        }
      >
        <TradePage />
      </MockShell>
    </div>
  );
}

function TradePage() {
  const r = recipes("dark");
  return (
    <main>
      <div className="space-y-6 p-4 pb-24">
        <h1 className="text-2xl font-bold">Trade</h1>
        <div className={r.card}>
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold leading-none tracking-tight">Stock Chart</h3>
                <span className="flex h-8 w-8 items-center justify-center">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary">
                <span
                  data-anchor="ask-ai"
                  className="inline-flex h-8 items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-3 text-sm font-medium"
                >
                  <BrainCircuit className="h-4 w-4 text-primary" />
                  <span className="text-primary">Ask AI</span>
                </span>
                <Clock className="h-4 w-4" />
                <span>Market is open.</span>
              </div>
            </div>
          </div>
          <div className="space-y-4 p-6 pt-0">
            <div className="relative flex h-12 w-full items-center rounded-full bg-card px-4 shadow-lg ring-1 ring-border">
              <Search className="h-5 w-5 text-muted-foreground" />
              <span className="px-3 text-base text-foreground">NVDA</span>
            </div>
            <div className="overflow-hidden rounded-md">
              <TvChart symbol="NVDA" interval="D" width={1108} height={500} seed={5} base={170} studies={false} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Sheet({ open, t }: { open: boolean; t: number }) {
  const sent = t >= SENT;
  const thinking = between(t, THINKING, ANSWERED);
  const answered = t >= ANSWERED;

  return (
    <div
      className="absolute inset-y-0 right-0 flex w-[384px] flex-col gap-4 border-l bg-background p-6 shadow-lg"
      style={{
        transform: `translateX(${open ? 0 : 100}%)`,
        transition: "transform 500ms ease-in-out",
      }}
    >
      <span className="absolute left-0 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary/80 text-primary-foreground">
        <ArrowLeft className="h-5 w-5" />
      </span>
      <span className="absolute right-4 top-4 opacity-70">
        <X className="h-4 w-4" />
      </span>

      <div className="flex flex-col space-y-2 text-left">
        <h2 className="text-lg font-semibold text-foreground">InvestWise AI Assistant</h2>
        <p className="text-sm text-muted-foreground">Analyzing stock data...</p>
      </div>

      <div className="my-4 flex-1 overflow-hidden pr-4">
        <div className="flex flex-col gap-4">
          {sent && (
            <div className="flex items-start justify-end gap-3" style={{ opacity: ramp(t, SENT, SENT + 200) }}>
              <div className="max-w-[80%] rounded-lg bg-primary p-3 text-primary-foreground">
                <p className="whitespace-pre-wrap text-sm">{QUERY}</p>
              </div>
              <Avatar>
                <User className="h-5 w-5" />
              </Avatar>
            </div>
          )}
          {(thinking || answered) && (
            <div className="flex items-start gap-3">
              <Avatar>
                <Bot className="h-5 w-5" />
              </Avatar>
              <div
                className={cn("max-w-[80%] rounded-lg bg-muted p-3", thinking && "animate-pulse")}
                style={{ minWidth: thinking ? 56 : undefined, minHeight: thinking ? 44 : undefined }}
              >
                {answered && (
                  <div className="space-y-2 text-sm" style={{ opacity: ramp(t, ANSWERED, ANSWERED + 250) }}>
                    {ANSWER.map((line) => (
                      <p key={line} className="whitespace-pre-wrap">
                        {line.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                          part.startsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part
                        )}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex gap-2 overflow-hidden p-2">
          <span className="inline-flex h-7 items-center whitespace-nowrap rounded-2xl border border-primary/20 bg-primary/5 px-3 text-xs font-medium">
            Analyze NVDA
          </span>
          <span className="inline-flex h-7 items-center whitespace-nowrap rounded-2xl border border-input bg-muted/50 px-3 text-xs font-medium">
            Explain this page
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center">
            <Paperclip className="h-5 w-5 text-muted-foreground" />
          </span>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center">
            <Mic className="h-5 w-5 text-muted-foreground" />
          </span>
          <span className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">
            Ask a question...
          </span>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground opacity-50">
            <Send className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );
}

function Avatar({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">{children}</span>
  );
}
