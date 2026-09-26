// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React, { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { LandingNav } from "@/components/marketing/landing-nav";
import { LandingLoader } from "@/components/marketing/landing-loader";
import { HeroCinema } from "@/components/marketing/hero-cinema";
import { DashboardShowcase } from "@/components/marketing/dashboard-showcase";
import { FeatureCinema } from "@/components/marketing/feature-cinema";
import { LearnSection } from "@/components/marketing/learn-section";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { useStageCapabilities } from "@/components/marketing/use-stage-capabilities";
import type { SculpturePhase } from "@/components/marketing/market-sculpture";

// Imported here rather than in a route layout because two routes render this:
// `/` for signed-out visitors and `/landing` directly. A stylesheet imported
// from the component that needs it can't be dropped by one of them.
import "@/app/landing/landing.css";

/**
 * The InvestWise landing page.
 *
 * Two takes of the same content. On a desktop with a real GPU the page is a
 * sequence of pinned viewports you scroll *through* — the hero holds while the
 * logo collapses into the frame, then the feature section holds for 1900vh
 * while a 3D device swings between five recorded demos. On anything narrower or
 * touch-driven, the identical content is delivered as ordinary stacked
 * sections. Each section owns that decision itself, given `caps`.
 *
 * Two pieces of page-level behaviour live here:
 *
 *  - It runs dark, always. The app's `ThemeProvider` writes `light` or `dark`
 *    onto `documentElement` from the user's saved preference, which is right
 *    for the product and wrong here — the whole page is composed against the
 *    dark palette, and a visitor with light mode saved would otherwise land on
 *    a page that was never designed. `.dark` on this wrapper re-scopes the
 *    token block to the subtree without touching their setting.
 *
 *  - The closing CTA is pinned at z-0 on desktop while the scrolling content
 *    above carries a `mb-[100svh]` spacer, so the page peels back off an ending
 *    that was underneath the whole time.
 */
export function LandingExperience() {
  const caps = useStageCapabilities();

  // The loader's three-beat handover. `phase` re-renders the layout (poses,
  // z-order, what is visible); `phaseRef` is what the sculpture's render loop
  // reads every frame, because that one must not cost a React render.
  const [phase, setPhase] = useState<SculpturePhase>("spinning");
  const phaseRef = useRef<SculpturePhase>("spinning");
  const advance = useCallback((next: SculpturePhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const onHalt = useCallback(() => advance("halting"), [advance]);
  const onSettle = useCallback(() => advance("settled"), [advance]);

  // Only reveal-by-peel once we know the viewport can take it. Rendering the
  // desktop arrangement first and then collapsing it would move the whole page
  // by a screen's height on first paint.
  const peel = caps.checked && caps.canStage;

  return (
    <div
      className="dark relative min-h-screen bg-background text-foreground antialiased"
      style={{ colorScheme: "dark", overscrollBehaviorY: "none" }}
    >
      {/* `body` still carries the app's own background — light, for most users.
          This is the layer that hides it: fixed rather than a tall block, so it
          covers the viewport at every scroll position including the stretch
          where the closing CTA is pinned behind the page. */}
      <div className="fixed inset-0 -z-10 bg-background" aria-hidden />

      <LandingLoader onHalt={onHalt} onSettle={onSettle} />
      {phase === "settled" && <LandingNav />}

      {/* Two things change while the loader is up.
          `z-[200]` lifts this above the loader's `z-[150]`, which is the only
          way the hero's sculpture can render over the splash — `main` is a
          stacking context, so a `z-[200]` descendant of a `z-10` parent is
          still trapped underneath. Nothing else in here is visible yet (every
          section fades in on settle, and the rest is below the fold), so the
          glyph is all that shows.
          And the background is dropped, because an opaque `main` at that depth
          would hide the loader's own backdrop entirely. The fixed layer above
          still covers the app's light `body`. */}
      <main
        className={cn(
          "relative",
          phase === "settled" ? "z-10 bg-background" : "z-[200] bg-transparent",
          peel ? "mb-[100svh]" : "mb-0"
        )}
      >
        <HeroCinema caps={caps} phase={phase} phaseRef={phaseRef} />
        <DashboardShowcase caps={caps} />
        <FeatureCinema caps={caps} />
        <LearnSection />
        {!peel && <ClosingCta />}
      </main>

      {peel && (
        <div className="fixed inset-x-0 bottom-0 z-0 h-[100svh]">
          <ClosingCta />
        </div>
      )}
    </div>
  );
}
