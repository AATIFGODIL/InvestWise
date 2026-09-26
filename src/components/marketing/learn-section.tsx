// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  BookOpen,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Crown,
  Laptop,
  PartyPopper,
  PlusCircle,
  Repeat,
  Shield,
  ShieldCheck,
  Star,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MButton, MProgress, TickerLogo } from "@/components/marketing/mock/mock-kit";

/**
 * Everything else, as a gallery rather than a grid.
 *
 * One card per feature, each carrying a small replica of the component that
 * ships it — the quests accordion, the congratulations banner, the
 * leaderboard's rows — so the claim and the proof sit together. The row is a
 * physical strip: drag or flick it and it carries momentum, then settles on a
 * card (Embla projects the throw and snaps to the nearest card, the same
 * behaviour as a scroll view). Arrow buttons for anyone not dragging, and the
 * keyboard moves through it too.
 */

type Card = {
  id: string;
  label: string;
  title: string;
  body: string;
  preview: React.ReactNode;
};

const CARDS: Card[] = [
  {
    id: "quests",
    label: "Investment Quests",
    title: "Lessons that level you up.",
    body: "Beginner, Intermediate and Pro tracks, each a set of quests that fill in as you actually do the thing.",
    preview: <QuestsPreview />,
  },
  {
    id: "certificate",
    label: "Certificate",
    title: "Something to show for it.",
    body: "Finish the beginner lessons and download a certificate with your name and the date on it.",
    preview: <CertificatePreview />,
  },
  {
    id: "leaderboard",
    label: "Community Leaderboard",
    title: "Climb, or stay anonymous.",
    body: "Rank against everyone else learning. Show your name, show only your rank, or stay hidden.",
    preview: <LeaderboardPreview />,
  },
  {
    id: "goals",
    label: "Goals",
    title: "Save for something real.",
    body: "Name it, set a target, and your progress sits on the dashboard every time you open the app.",
    preview: <GoalPreview />,
  },
  {
    id: "auto-invest",
    label: "Auto-Invest",
    title: "The habit, on autopilot.",
    body: "Recurring buys on a schedule. When one is due you get a notification and approve it at the live price.",
    preview: <AutoInvestPreview />,
  },
  {
    id: "prediction",
    label: "AI Stock Prediction",
    title: "A forecast that admits doubt.",
    body: "A five-month outlook on any symbol, with the model's confidence attached. A simulation — never advice.",
    preview: <PredictionPreview />,
  },
  {
    id: "bundles",
    label: "Investment Bundles",
    title: "Diversify in one tap.",
    body: "Curated sets like the Tech Starter Pack — every company in it shown right on the card — picked for your experience level.",
    preview: <BundlePreview />,
  },
  {
    id: "parental",
    label: "Parental Controls",
    title: "Built for young investors.",
    body: "Parental controls, a parent's email and ID verification, all in Settings.",
    preview: <ParentalPreview />,
  },
  {
    id: "rain",
    label: "Make it rain",
    title: "And a little joy.",
    body: "Type “Make it rain” into Spotlight. Some wins deserve it.",
    preview: <RainPreview />,
  },
];

export function LearnSection() {
  const [viewportRef, embla] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps", skipSnaps: true });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const update = useCallback(() => {
    if (!embla) return;
    setCanPrev(embla.canScrollPrev());
    setCanNext(embla.canScrollNext());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    update();
    embla.on("select", update).on("reInit", update).on("scroll", update);
    return () => {
      embla.off("select", update).off("reInit", update).off("scroll", update);
    };
  }, [embla, update]);

  return (
    <section id="more" className="relative z-20 overflow-hidden bg-background py-28">
      <div className="mx-auto max-w-[1240px] px-6">
        <p className="lp-eyebrow mb-4 text-foreground/50">And the rest</p>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="lp-headline max-w-[18ch] text-[clamp(2rem,4.4vw,3.4rem)] text-foreground">
            From your first quest to your certificate.
          </h2>
          <div className="flex gap-2.5">
            <ArrowButton label="Previous" disabled={!canPrev} onPress={() => embla?.scrollPrev()}>
              <ChevronLeft className="h-5 w-5" />
            </ArrowButton>
            <ArrowButton label="Next" disabled={!canNext} onPress={() => embla?.scrollNext()}>
              <ChevronRight className="h-5 w-5" />
            </ArrowButton>
          </div>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="mt-8 cursor-grab overflow-hidden active:cursor-grabbing"
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="More InvestWise features"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") embla?.scrollNext();
          if (e.key === "ArrowLeft") embla?.scrollPrev();
        }}
      >
        {/* Vertical padding inside the viewport, so the cards' edges and
            shadows aren't cut off by the strip's own clipping. */}
        <div className="flex touch-pan-y gap-5 py-5 pl-[max(24px,calc((100vw-1240px)/2+24px))] pr-6">
          {CARDS.map((card) => (
            <article
              key={card.id}
              className="dark relative flex h-[520px] w-[min(360px,82vw)] shrink-0 select-none flex-col overflow-hidden rounded-[32px] bg-white/[0.035] text-foreground ring-1 ring-white/10"
            >
              <div className="p-7 pb-0">
                <p className="text-[13px] font-semibold text-primary">{card.label}</p>
                <h3 className="mt-2 text-[24px] font-bold leading-[1.1] tracking-[-0.02em]">{card.title}</h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-foreground/60">{card.body}</p>
              </div>
              <div className="relative mt-auto px-5 pb-5">{card.preview}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArrowButton({
  label,
  disabled,
  onPress,
  children,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onPress}
      className="lp-cta lp-focus flex h-11 w-11 items-center justify-center rounded-full bg-foreground/10 text-foreground transition-opacity duration-200 hover:bg-foreground/15 disabled:opacity-30"
    >
      {children}
    </button>
  );
}

// ─── Previews: each a small replica of the component that ships the feature ──

/** The app's Card, as it reads at this size. */
function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-3xl bg-background p-4 shadow-xl ring-1 ring-white/60", className)}>{children}</div>
  );
}

function QuestsPreview() {
  return (
    <Panel>
      <p className="text-[15px] font-bold">Investment Quests</p>
      <div className="mt-3 border-b border-border pb-3">
        <p className="flex items-center gap-2 text-[13px] font-semibold">
          <BookOpen className="h-4 w-4 text-primary" /> Beginner Lessons
        </p>
        {[
          ["Complete your profile", 100],
          ["Make your first goal", 100],
          ["Make your first trade", 60],
        ].map(([title, value]) => (
          <div key={title} className="mt-2.5">
            <p className="mb-1 text-[11px] font-medium">{title}</p>
            <MProgress value={value as number} className="h-2" />
          </div>
        ))}
      </div>
      <p className="flex items-center gap-2 border-b border-border py-2.5 text-[13px] font-semibold">
        <Trophy className="h-4 w-4 text-yellow-500" /> Intermediate Lessons
      </p>
      <p className="flex items-center gap-2 pt-2.5 text-[13px] font-semibold">
        <ShieldCheck className="h-4 w-4 text-green-600" /> Pro Lessons
      </p>
    </Panel>
  );
}

function CertificatePreview() {
  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-3xl bg-primary p-4 text-primary-foreground shadow-lg">
        <span className="absolute right-16 top-2 h-2.5 w-2.5 animate-pulse rounded-full bg-yellow-300/70" />
        <span className="absolute bottom-3 left-24 h-2 w-2 animate-pulse rounded-full bg-pink-300/70" />
        <div className="flex items-center gap-3">
          <Trophy className="h-9 w-9 shrink-0" />
          <div className="flex-grow">
            <p className="text-[15px] font-bold">Congratulations!</p>
            <p className="text-[11.5px] opacity-90">You&apos;ve completed all 3 beginner lessons.</p>
          </div>
        </div>
        <span className="mt-3 flex h-9 items-center justify-center rounded-lg bg-white/15 text-[13px] font-medium">
          View Certificate
        </span>
      </div>
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-4 text-center">
        <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-foreground/50">Certificate of completion</p>
        <p className="mt-1.5 font-serif text-[18px] italic">Alex Morgan</p>
        <p className="mt-1 text-[10px] text-foreground/50">InvestWise · September 26, 2026</p>
      </div>
    </div>
  );
}

function LeaderboardPreview() {
  return (
    <Panel>
      <p className="text-[15px] font-bold">Community Leaderboard</p>
      <div className="mt-3 space-y-2.5">
        {[
          { rank: 1, name: "maya.invests", gain: "+$2,418.60" },
          { rank: 2, name: "You", gain: "+$1,195.33" },
          { rank: 3, name: "Anonymous", gain: "+$884.12" },
          { rank: 4, name: "theo_k", gain: "+$512.40" },
        ].map((row) => (
          <div
            key={row.rank}
            className={cn("flex items-center justify-between rounded-xl px-1.5 py-1", row.name === "You" && "bg-primary/15")}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-4 text-[13px] font-semibold">
                {row.rank === 1 ? <Crown className="h-4 w-4 text-yellow-500" /> : row.rank}
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[11px]">
                {row.name.charAt(0).toUpperCase()}
              </span>
              <span className="text-[12.5px] font-medium">{row.name}</span>
            </div>
            <span className="text-[12.5px] font-semibold text-green-500">{row.gain}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function GoalPreview() {
  return (
    <Panel>
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-bold">Goal Progress</p>
        <span className="text-[12px] font-medium text-primary">View All</span>
      </div>
      <div className="mt-4 flex items-start gap-3">
        <div className="flex-grow">
          <p className="text-[12px] text-muted-foreground">New Laptop</p>
          <p className="text-[22px] font-bold">$1,240</p>
          <p className="text-[11px] font-semibold text-muted-foreground">62% to target</p>
          <MProgress value={62} className="mt-2 h-2" />
        </div>
        <span className="rounded-lg bg-secondary p-2">
          <Laptop className="h-5 w-5 text-primary" />
        </span>
      </div>
      <div className="mt-4 border-t border-border pt-3">
        <p className="text-[11px] font-medium text-muted-foreground">Goal Name</p>
        <p className="mt-1 rounded-2xl border border-input px-3 py-2 text-[12px] text-muted-foreground">
          e.g., Dream Vacation, Down Payment
        </p>
      </div>
    </Panel>
  );
}

function AutoInvestPreview() {
  return (
    <Panel>
      <p className="flex items-center gap-2 text-[15px] font-bold">
        <Repeat className="h-4 w-4 text-primary" /> Auto-Invest
      </p>
      <div className="mt-3 space-y-2">
        {[
          ["VOO", "$50 / weekly", "9/28/2026"],
          ["AAPL", "$25 / monthly", "10/1/2026"],
        ].map(([symbol, plan, next]) => (
          <div key={symbol} className="flex items-center justify-between rounded-lg bg-muted/50 p-2.5">
            <div className="flex items-center gap-2.5">
              <TickerLogo symbol={symbol} className="h-7 w-7" />
              <div>
                <p className="text-[12.5px] font-semibold">{symbol}</p>
                <p className="text-[11px] text-muted-foreground">{plan}</p>
              </div>
            </div>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold">Next: {next}</span>
          </div>
        ))}
      </div>
      <MButton className="mt-3 h-9 w-full text-[12.5px]">
        <PlusCircle className="mr-2 h-4 w-4" /> Set Up New Auto-Invest
      </MButton>
    </Panel>
  );
}

function PredictionPreview() {
  return (
    <Panel>
      <p className="flex items-center gap-2 text-[15px] font-bold">
        <BrainCircuit className="h-4 w-4 text-primary" /> AI Stock Prediction
      </p>
      <div className="mt-3 rounded-2xl bg-muted/50 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] font-semibold">Prediction for NVDA</p>
          <span className="shrink-0 rounded-full bg-yellow-500 px-2 py-0.5 text-[10px] font-semibold text-white">
            Medium Confidence
          </span>
        </div>
        <p className="mt-2 text-[11.5px] leading-relaxed text-foreground/80">
          Demand supports the trend, but the valuation leaves little room for a miss. Expect volatility with a
          modest upward bias.
        </p>
      </div>
      <p className="mt-2.5 text-[10.5px] text-muted-foreground">This is a simulation and not financial advice.</p>
    </Panel>
  );
}

function BundlePreview() {
  return (
    <Panel className="p-0">
      <div
        className="relative h-32 overflow-hidden rounded-t-3xl p-4 text-white"
        style={{
          background:
            "radial-gradient(120% 100% at 0% 0%, hsl(252 85% 62% / 0.55), transparent 60%), linear-gradient(140deg, hsl(252 65% 24%), hsl(284 55% 9%))",
        }}
      >
        <Cpu aria-hidden strokeWidth={1.1} className="absolute -bottom-6 -right-4 h-28 w-28 -rotate-12 text-white/[0.14]" />
        <div className="relative flex items-center justify-between">
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold">Growth</span>
          <span className="text-[10px] text-white/70">3 stocks</span>
        </div>
        <p className="absolute bottom-3 left-4 right-10 text-[22px] font-extrabold leading-[1.02] tracking-[-0.035em]">
          Tech Starter Pack
        </p>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex -space-x-2">
            {["AAPL", "MSFT", "GOOGL"].map((s) => (
              <TickerLogo key={s} symbol={s} className="h-8 w-8 ring-2 ring-background" />
            ))}
          </div>
          <span className="text-[11px] font-semibold tracking-wide text-muted-foreground">AAPL · MSFT · GOOGL</span>
        </div>
        <MButton size="sm" variant="outline" className="mt-3 h-8 w-full text-[12px] ring-1 ring-white/60">
          Learn More
        </MButton>
      </div>
    </Panel>
  );
}

function ParentalPreview() {
  return (
    <Panel>
      <p className="flex items-center gap-2 text-[15px] font-semibold">
        <Shield className="h-4 w-4 text-primary" /> Parental Control
      </p>
      <div className="mt-3.5 flex items-center justify-between">
        <span className="text-[12.5px] font-medium">Enable Parental Controls</span>
        <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
          <span className="ml-[22px] block h-5 w-5 rounded-full bg-background shadow-lg" />
        </span>
      </div>
      <p className="mt-3 text-[11px] font-medium text-muted-foreground">Parent&apos;s Email</p>
      <p className="mt-1 rounded-2xl border border-input px-3 py-2 text-[12px]">parent@email.com</p>
      <p className="mt-2.5 text-[11px] font-medium text-muted-foreground">Parent&apos;s ID Verification</p>
      <p className="mt-1 flex items-center gap-1.5 text-[12px] text-green-500">
        <ShieldCheck className="h-3.5 w-3.5" /> Verified
      </p>
    </Panel>
  );
}

function RainPreview() {
  return (
    <div className="relative h-[250px] overflow-hidden rounded-3xl bg-background ring-1 ring-white/60">
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="lp-bill absolute top-0 text-[22px]"
          style={{
            left: `${(i * 37) % 92}%`,
            animationDelay: `${(i * 0.37) % 3}s`,
            animationDuration: `${2.6 + (i % 4) * 0.5}s`,
          }}
          aria-hidden
        >
          💸
        </span>
      ))}
      <div className="absolute inset-x-4 bottom-4 overflow-hidden rounded-xl border bg-popover">
        <p className="px-3 py-2 text-[10px] font-medium text-muted-foreground">App Actions</p>
        <p className="flex items-center justify-between bg-accent px-3 py-2 text-[12.5px] text-accent-foreground">
          <span className="flex items-center gap-2">
            <PartyPopper className="h-4 w-4" /> Make it rain
          </span>
          <Star className="h-4 w-4" />
        </p>
      </div>
    </div>
  );
}
