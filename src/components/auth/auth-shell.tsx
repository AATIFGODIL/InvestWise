// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Rotate3d } from "lucide-react";
import { MarketSculpture, type SculpturePhase } from "@/components/marketing/market-sculpture";
import { HeroBackdrop } from "@/components/marketing/hero-backdrop";
import { QuoteRing, RING_SYMBOLS } from "@/components/marketing/quote-ring";
import { useQuotes } from "@/components/marketing/use-quotes";

/**
 * The frame for Sign In and Sign Up.
 *
 * One screen, never scrolled, split down the middle. The left half is the
 * sign-in side: the auth pages' own finance-pattern background, the logo and
 * the card. The right half is the market: the landing page's 3D glyph, fixed
 * in place and turned by dragging it, with a ring of live quotes orbiting it
 * over moving price lines. Throw the glyph and the ring spins with it.
 *
 * Phones get the left half only — the form and the logo — and never load the
 * 3D scene.
 *
 * Whatever the viewport, the form column is fitted to the height available:
 * if the logo and card are taller than the screen (a short laptop, a phone in
 * landscape, an error message appearing) the whole column is scaled down to
 * fit rather than pushed off the bottom.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // The screen is a single frame; lock the document so nothing can scroll it.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previous = [html.style.overflow, body.style.overflow, body.style.overscrollBehavior];
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    return () => {
      [html.style.overflow, body.style.overflow, body.style.overscrollBehavior] = previous;
    };
  }, []);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <section className="relative h-full w-full overflow-hidden lg:w-1/2">
        <FinanceBackground />
        <div className="relative z-10 flex h-full w-full items-center justify-center px-4">
          <FitToHeight>{children}</FitToHeight>
        </div>
      </section>
      {isDesktop && <MarketPanel />}
    </div>
  );
}

/** The right half: the glyph, its orbit of quotes, and the moving market behind them. */
function MarketPanel() {
  const phaseRef = useRef<SculpturePhase>("settled");
  const velocityRef = useRef(0);
  const quotes = useQuotes(RING_SYMBOLS);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [grabbed, setGrabbed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const size = "min(440px, 34vw, 58vh)";

  return (
    <section
      className="relative hidden h-full w-1/2 overflow-hidden border-l border-white/10 lg:block"
      aria-label="InvestWise"
    >
      <HeroBackdrop />

      {/* A pool of light for the glyph to stand in. */}
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-[50%]"
        style={{
          width: `calc(${size} * 1.35)`,
          height: `calc(${size} * 0.45)`,
          top: `calc(50% + ${size} * 0.22)`,
          background: "radial-gradient(closest-side, hsl(var(--primary) / 0.35), transparent)",
          filter: "blur(18px)",
          opacity: shown ? 1 : 0,
          transition: "opacity 900ms ease-out 200ms",
        }}
        aria-hidden
      />

      <QuoteRing
        quotes={quotes}
        settled={shown}
        velocityRef={velocityRef}
        reducedMotion={reducedMotion}
        maxRadius={260}
        radiusFraction={0.17}
        style={{ left: "50%", top: "50%" }}
      />

      <div
        className="absolute left-1/2 top-1/2 z-30"
        style={{
          width: size,
          height: size,
          opacity: shown ? 1 : 0,
          transform: `translate(-50%, -50%) scale(${shown ? 1 : 0.92})`,
          transition: "opacity 700ms ease-out, transform 900ms cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        <MarketSculpture
          phaseRef={phaseRef}
          velocityRef={velocityRef}
          onGrab={() => setGrabbed(true)}
          className="h-full w-full cursor-grab"
        />
      </div>

      <div
        className="pointer-events-none absolute left-1/2 z-45 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/6 px-3.5 py-1.5 text-xs font-medium text-foreground/70 ring-1 ring-white/10 backdrop-blur-md"
        style={{
          top: `calc(50% + ${size} * 0.5 + 28px)`,
          opacity: shown && !grabbed ? 1 : 0,
          transition: "opacity 500ms ease-out 900ms",
        }}
        aria-hidden
      >
        <Rotate3d className="h-3.5 w-3.5" />
        Drag to spin
      </div>
    </section>
  );
}

/**
 * Centres its content and scales it down — never up — to fit the height it
 * has. Measured from the content's untransformed size, so the scale never
 * feeds back into its own measurement.
 */
function FitToHeight({ children }: { children: React.ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const fit = () => {
      const available = outer.clientHeight - 24;
      const natural = inner.offsetHeight;
      if (natural > 0) setScale(Math.min(1, available / natural));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={outerRef} className="flex h-full w-full items-center justify-center">
      <div ref={innerRef} className="w-full" style={{ transform: `scale(${scale})`, transformOrigin: "center" }}>
        {children}
      </div>
    </div>
  );
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
}

/** The auth pages' background: finance glyphs on a rotated tile, shimmering. */
function FinanceBackground() {
  return (
    <div className="absolute inset-0">
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="finance-pattern"
            width="140"
            height="140"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <path d="M 20 120 V 90 M 30 120 V 80 M 40 120 V 100" stroke="hsl(var(--primary) / 0.12)" strokeWidth="2" fill="none" className="shimmering-icon" style={{ animationDelay: '0.5s' }} />
            <path d="M 70 20 A 15 15 0 0 1 85 35 L 70 35 Z" stroke="hsl(var(--primary) / 0.12)" strokeWidth="1.5" fill="hsl(var(--primary) / 0.05)" className="shimmering-icon" style={{ animationDelay: '1s' }} />
            <circle cx="70" cy="35" r="15" stroke="hsl(var(--primary) / 0.12)" strokeWidth="1.5" fill="none" className="shimmering-icon" style={{ animationDelay: '1.5s' }} />
            <path d="M 110 80 a 5 5 0 1 1 0 -10 a 5 5 0 0 1 0 10 M 120 100 a 5 5 0 1 1 0 -10 a 5 5 0 0 1 0 10 M 110 98 L 122 82" stroke="hsl(var(--primary) / 0.12)" strokeWidth="1.5" fill="none" className="shimmering-icon" style={{ animationDelay: '2s' }} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="hsl(var(--background))" />
        <rect width="100%" height="100%" fill="url(#finance-pattern)" />
      </svg>
    </div>
  );
}
