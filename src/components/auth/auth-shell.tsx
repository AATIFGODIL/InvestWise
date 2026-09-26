// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Rotate3d } from "lucide-react";
import { MarketSculpture, type SculpturePhase } from "@/components/marketing/market-sculpture";

/**
 * The frame for Sign In and Sign Up.
 *
 * One screen, never scrolled: the logo and form sit on the left, and on a
 * desktop the landing page's 3D glyph stands on the right — the same object,
 * in its fixed place, turned by dragging it. Phones get the form and the logo
 * only.
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
    <div className="relative h-[100dvh] w-full overflow-hidden">
      <FinanceBackground />
      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl items-center px-4 lg:px-12">
        <div className="flex h-full w-full items-center justify-center lg:w-[44%]">
          <FitToHeight>{children}</FitToHeight>
        </div>
        {isDesktop && <GlyphStage />}
      </div>
    </div>
  );
}

/** The spinnable glyph, in its place on the right. */
function GlyphStage() {
  const phaseRef = useRef<SculpturePhase>("settled");
  const [grabbed, setGrabbed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const size = "min(520px, 44vw, 72vh)";

  return (
    <div className="relative flex h-full flex-1 items-center justify-center">
      {/* A pool of light for it to stand in. */}
      <div
        className="pointer-events-none absolute rounded-[50%]"
        style={{
          width: `calc(${size} * 1.2)`,
          height: `calc(${size} * 0.42)`,
          top: `calc(50% + ${size} * 0.24)`,
          background: "radial-gradient(closest-side, hsl(var(--primary) / 0.32), transparent)",
          filter: "blur(18px)",
          opacity: shown ? 1 : 0,
          transition: "opacity 900ms ease-out 200ms",
        }}
        aria-hidden
      />
      <div
        style={{
          width: size,
          height: size,
          opacity: shown ? 1 : 0,
          transform: shown ? "scale(1)" : "scale(0.92)",
          transition: "opacity 700ms ease-out, transform 900ms cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        <MarketSculpture
          phaseRef={phaseRef}
          onGrab={() => setGrabbed(true)}
          className="h-full w-full cursor-grab"
        />
      </div>
      <div
        className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-foreground/70 ring-1 ring-white/10 backdrop-blur-md"
        style={{
          top: `calc(50% + ${size} * 0.5 + 8px)`,
          opacity: shown && !grabbed ? 1 : 0,
          transition: "opacity 500ms ease-out 700ms",
        }}
        aria-hidden
      >
        <Rotate3d className="h-3.5 w-3.5" />
        Drag to spin
      </div>
    </div>
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
