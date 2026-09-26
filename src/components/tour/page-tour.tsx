// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppleHelloEnglishEffect } from "@/components/ui/apple-hello-effect";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { TOUR_VERSION, useTourStore } from "@/store/tour-store";
import { TOURS, tourIdFor, type TourStep } from "@/components/tour/tours";

/**
 * The page tour.
 *
 * The page is dimmed by one scrim with the spotlight cut out of it, sitting
 * over the real element. Nothing in the page is lifted, re-parented or
 * re-stacked, so the highlighted card is always crisp and exactly where it
 * lives — the old tutorial's z-index lifting was trapped by the page's own
 * stacking contexts and blurred the very thing it was pointing at.
 *
 * Each step is drawn fresh: the previous spotlight and message fade out, the
 * page scrolls the next target into view, and once it has come to rest a new
 * spotlight fades open around it and the message fades in beside it. Nothing
 * slides or stretches between targets. While a step is showing it tracks its
 * target 1:1 if the page moves. Nothing advances on a timer: people read at
 * their own pace. Next, Back, the arrow keys and Escape all work; clicking the dimmed
 * page does nothing, so a stray click can't lose your place.
 *
 * Runs once automatically per page for every account (new users, and existing
 * users the first time they see this version), and on demand from the ? button
 * in the header.
 */

type Rect = { top: number; left: number; width: number; height: number };

/** Breathing room between an element and the spotlight's edge. */
const PAD = 8;
const CARD_W = 344;
const GAP = 14;
const MARGIN = 16;

function findTarget(step: TourStep): HTMLElement | null {
  if (!step.target) return null;
  const nodes = Array.from(document.querySelectorAll<HTMLElement>(step.target));
  return (
    nodes.find((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 4 && r.height > 4;
    }) ?? null
  );
}

/** Scroll the page's own scroller so the target sits in view with room for the card. */
function bringIntoView(el: HTMLElement, smooth: boolean) {
  const main = document.getElementById("main-content");
  if (!main || !main.contains(el)) return; // Header and rail are fixed; nothing to scroll.
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight;
  if (r.top >= 72 && r.bottom <= vh - 200) return;
  const tall = r.height > vh - 300;
  const desiredTop = tall ? 88 : Math.max(88, (vh - r.height - 200) / 2);
  main.scrollBy({ top: r.top - desiredTop, behavior: smooth ? "smooth" : "auto" });
}

export function PageTour() {
  const pathname = usePathname();
  const { user } = useAuth();
  const tourId = tourIdFor(pathname);
  const active = useTourStore((s) => s.active);
  const seen = useTourStore((s) => s.seen);
  const hydratedFor = useTourStore((s) => s.hydratedFor);

  // Automatically, once: only after this user's progress has loaded, so an
  // account that has already seen a tour never gets it again on a new device.
  useEffect(() => {
    if (!tourId || !user || hydratedFor !== user.uid || active) return;
    if ((seen[tourId] ?? 0) >= TOUR_VERSION) return;
    const timer = window.setTimeout(() => useTourStore.getState().start(tourId), 1200);
    return () => window.clearTimeout(timer);
  }, [tourId, user, hydratedFor, seen, active]);

  // Leaving the page puts its tour away without marking it seen.
  useEffect(() => {
    const { active: current, stop } = useTourStore.getState();
    if (current && current !== tourId) stop();
  }, [tourId]);

  if (!active || active !== tourId || !TOURS[active]) return null;
  return <TourOverlay key={active} tourId={active} steps={TOURS[active]} />;
}

function TourOverlay({ tourId, steps: allSteps }: { tourId: string; steps: TourStep[] }) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  // Decide up front which steps apply here (no holdings yet, mobile layout, a
  // hidden quest card), so "3 of 7" means what it says.
  const [steps] = useState(() => {
    if (typeof document === "undefined") return allSteps;
    const main = document.getElementById("main-content");
    const atTop = !main || main.scrollTop <= 60;
    return allSteps.filter((step) => {
      if (!step.target) return true;
      if (findTarget(step)) return true;
      // Header controls are unmounted while the header is folded away; they
      // come back when the tour scrolls to the top. Only keep them on desktop.
      return Boolean(step.scrollTop) && !atTop && window.innerWidth >= 768;
    });
  });

  /** The step we're heading to. */
  const [index, setIndex] = useState(0);
  /** The step actually on screen — null while one fades out and the next is found. */
  const [shown, setShown] = useState<number | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [cardH, setCardH] = useState(190);
  const targetRef = useRef<HTMLElement | null>(null);
  const directionRef = useRef<1 | -1>(1);
  const nextRef = useRef<HTMLButtonElement>(null);

  const step = steps[index];
  const maskId = `tour-mask-${tourId}`;
  const fade = reduceMotion ? 0 : 0.22;

  const finish = useCallback(() => useTourStore.getState().finish(tourId), [tourId]);
  const go = useCallback(
    (dir: 1 | -1) => {
      directionRef.current = dir;
      const next = index + dir;
      if (next >= steps.length) finish();
      else if (next >= 0) setIndex(next);
    },
    [index, steps.length, finish]
  );

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (steps.length === 0) finish();
  }, [steps.length, finish]);

  // Each step: let the previous one fade away, find this step's target (it may
  // still be mounting), bring it into view, wait for the scroll to come to rest,
  // and only then reveal a fresh spotlight and message in place. Nothing slides
  // or resizes between targets, so there's nothing to go wrong mid-flight.
  useEffect(() => {
    if (!step) return;
    let cancelled = false;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(() => !cancelled && fn(), ms));

    setShown(null);
    targetRef.current = null;

    // Scrolling waits for the outgoing step to finish fading, so nothing ever
    // slides underneath a spotlight that's still on screen.
    const main = document.getElementById("main-content");
    if (step.scrollTop && main && main.scrollTop > 0) {
      later(() => main.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }), fade * 1000);
    }

    if (!step.target) {
      later(() => {
        setRect(null);
        setShown(index);
      }, fade * 1000);
      return () => {
        cancelled = true;
        timers.forEach(window.clearTimeout);
      };
    }

    let tries = 0;
    const measure = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return { top: r.top, left: r.left, width: r.width, height: r.height };
    };

    const waitForRest = (el: HTMLElement, last: Rect, stableFor: number, waited: number) => {
      const now = measure(el);
      const still = Math.abs(now.top - last.top) < 0.5 && Math.abs(now.left - last.left) < 0.5;
      const settled = still ? stableFor + 1 : 0;
      if (settled >= 2 || waited > 900) {
        setRect(now);
        setShown(index);
        return;
      }
      later(() => waitForRest(el, now, settled, waited + 60), 60);
    };

    const attempt = () => {
      const el = findTarget(step);
      if (el) {
        targetRef.current = el;
        later(() => {
          bringIntoView(el, !reduceMotion);
          waitForRest(el, measure(el), 0, 0);
        }, fade * 1000);
        return;
      }
      if (++tries < 25) {
        later(attempt, 60);
        return;
      }
      const next = index + directionRef.current;
      if (next >= steps.length) finish();
      else if (next < 0) setIndex(index + 1);
      else setIndex(next);
    };
    attempt();

    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
    };
  }, [step, index, steps.length, finish, reduceMotion, fade]);

  // Once a step is showing, its spotlight and message are pinned to the target
  // 1:1 — if the page scrolls or the card grows, they follow exactly.
  useEffect(() => {
    if (shown === null) return;
    let frame = 0;
    const tick = () => {
      const el = targetRef.current;
      if (el) {
        const r = el.getBoundingClientRect();
        setRect((prev) =>
          prev &&
          Math.abs(prev.top - r.top) < 0.5 &&
          Math.abs(prev.left - r.left) < 0.5 &&
          Math.abs(prev.width - r.width) < 0.5 &&
          Math.abs(prev.height - r.height) < 0.5
            ? prev
            : { top: r.top, left: r.left, width: r.width, height: r.height }
        );
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [shown]);

  // The card's height, for choosing which side of the target it goes on.
  const cardRef = useCallback((node: HTMLDivElement | null) => {
    if (node) setCardH(node.offsetHeight);
  }, []);

  // Keyboard, and focus on the primary action so Enter moves on.
  useEffect(() => {
    if (shown !== null) nextRef.current?.focus({ preventScroll: true });
  }, [shown]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, finish]);

  if (!mounted || !step) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const current = shown !== null ? steps[shown] : null;
  const cardW = current?.welcome ? Math.min(420, vw - MARGIN * 2) : Math.min(CARD_W, vw - MARGIN * 2);
  const hole =
    current?.target && rect
      ? { top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 }
      : null;
  const radius = hole ? Math.min(current?.radius ?? 32, hole.height / 2) : 0;
  const ease = [0.32, 0.72, 0, 1] as const;

  return createPortal(
    <div className="fixed inset-0 z-[190]" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      {/* Holds the page still under the scrim; a click here does nothing. */}
      <div className="absolute inset-0" />

      {/* The scrim never moves or flickers; each step's spotlight is a hole cut
          into it that fades open, and fades shut when the step leaves. */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={vw} height={vh}>
            <rect x="0" y="0" width={vw} height={vh} fill="white" />
            <AnimatePresence>
              {hole && shown !== null && (
                <motion.rect
                  key={`hole-${shown}`}
                  x={hole.left}
                  y={hole.top}
                  width={hole.width}
                  height={hole.height}
                  rx={radius}
                  fill="black"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: fade * 1.2, ease }}
                />
              )}
            </AnimatePresence>
          </mask>
        </defs>
        <rect x="0" y="0" width={vw} height={vh} fill="rgb(0 0 0 / 0.62)" mask={`url(#${maskId})`} />
      </svg>

      {/* The spotlight's rim. */}
      <AnimatePresence>
        {hole && shown !== null && (
          <motion.div
            key={`ring-${shown}`}
            className="pointer-events-none absolute"
            style={{
              top: hole.top,
              left: hole.left,
              width: hole.width,
              height: hole.height,
              borderRadius: radius,
              boxShadow: "0 0 0 2px hsl(var(--primary) / 0.9), 0 0 32px 4px hsl(var(--primary) / 0.35)",
            }}
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.015 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: fade * 1.3, ease }}
          />
        )}
      </AnimatePresence>

      {/* The message. */}
      <AnimatePresence>
        {current && shown !== null && (
          <motion.div
            key={`card-${shown}`}
            ref={cardRef}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: fade * 0.8 } }}
            transition={{ duration: fade * 1.3, ease }}
            className={cn(
              "absolute rounded-3xl bg-background/90 p-5 text-foreground shadow-2xl ring-1 ring-white/15 backdrop-blur-xl",
              current.welcome && "p-7 text-center"
            )}
            style={{ width: cardW, ...placeCard(hole, cardW, cardH, vw, vh) }}
          >
            {current.welcome ? (
              <>
                <div className="flex justify-center text-primary">
                  <AppleHelloEnglishEffect speed={1.1} />
                </div>
                <h3 id="tour-title" className="mt-3 text-xl font-bold tracking-tight">
                  {current.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{current.body}</p>
                <div className="mt-6 flex items-center justify-center gap-2">
                  <Button variant="ghost" size="sm" onClick={finish} className="text-muted-foreground hover:bg-muted hover:text-foreground">
                    Not now
                  </Button>
                  <Button ref={nextRef} size="sm" onClick={() => go(1)}>
                    Show me around
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium tabular-nums text-muted-foreground">
                    {shown + 1} of {steps.length}
                  </span>
                  <button
                    type="button"
                    onClick={finish}
                    aria-label="Close tour"
                    className="-mr-1.5 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <h3 id="tour-title" className="mt-1.5 text-[17px] font-semibold tracking-tight">
                  {current.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{current.body}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1" aria-hidden>
                    {steps.map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300",
                          i === shown ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {shown > 0 && (
                      <Button variant="outline" size="sm" onClick={() => go(-1)}>
                        Back
                      </Button>
                    )}
                    <Button ref={nextRef} size="sm" onClick={() => go(1)}>
                      {shown === steps.length - 1 ? "Done" : "Next"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}

/**
 * Where the message goes: below the target if it fits, then above, then
 * beside, then over its lower edge. Anchored by the edge nearest the target
 * (`top` below, `bottom` above), so the card's own height never shifts it.
 */
function placeCard(hole: Rect | null, w: number, h: number, vw: number, vh: number): React.CSSProperties {
  const clampX = (x: number) => Math.min(Math.max(x, MARGIN), vw - w - MARGIN);
  const clampY = (y: number) => Math.min(Math.max(y, MARGIN), vh - h - MARGIN);
  if (!hole) return { top: Math.max(MARGIN, (vh - h) / 2), left: (vw - w) / 2 };

  const bottom = hole.top + hole.height;
  const right = hole.left + hole.width;
  const centredX = clampX(hole.left + hole.width / 2 - w / 2);
  const centredY = clampY(hole.top + hole.height / 2 - h / 2);

  if (vh - bottom >= h + GAP + MARGIN) return { top: bottom + GAP, left: centredX };
  if (hole.top >= h + GAP + MARGIN) return { bottom: vh - hole.top + GAP, left: centredX };
  if (vw - right >= w + GAP + MARGIN) return { top: centredY, left: right + GAP };
  if (hole.left >= w + GAP + MARGIN) return { top: centredY, left: hole.left - GAP - w };
  return { bottom: MARGIN + 8, left: centredX };
}
