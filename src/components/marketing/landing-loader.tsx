// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * The landing page's loader.
 *
 * It is only half the effect. The sculpture is *not* in here — it lives in the
 * hero and is simply posed large and centred while this is up, spinning. This
 * component owns the backdrop it spins against, the progress rail, and the
 * timing of the three-beat handover:
 *
 *   spinning → halting → settled
 *
 * When the gates clear the spin brakes to a stop and the glyph hangs there for
 * a beat; then it snaps down into its place in the layout, and that arrival is
 * what triggers the rest of the page — copy, chips, background — to appear.
 * Doing it this way means there is no cross-fade between "loader" and "page":
 * the same object is on screen throughout, and the page assembles around it.
 *
 * Three gates open the sequence, and it starts when the last of them clears:
 *  - the webfont is ready,
 *  - the logo art has decoded,
 *  - a floor of `MIN_MS` has passed, so a warm cache still gets a deliberate
 *    beat rather than a flash of something appearing and vanishing.
 *
 * There is a ceiling too: if a gate never clears — a font request that hangs,
 * an image that 404s — `MAX_MS` lets the page through anyway. A loader that can
 * trap the reader is worse than no loader.
 */

/** Long enough to read as intentional, short enough not to be a toll booth. */
const MIN_MS = 1100;
/** The escape hatch. Nothing may hold the page longer than this. */
const MAX_MS = 4000;
/** The brake, plus the hang at the top of it before the glyph drops. */
const HALT_MS = 900;
/** How long the backdrop takes to clear once the glyph starts moving. */
const CLEAR_MS = 700;

export function LandingLoader({
  onHalt,
  onSettle,
}: {
  /** Gates are clear: stop the spin. */
  onHalt: () => void;
  /** The glyph has come to rest: snap it home and assemble the page. */
  onSettle: () => void;
}) {
  const [clearing, setClearing] = useState(false);
  const [gone, setGone] = useState(false);
  const [progress, setProgress] = useState(0);
  const startedAt = useRef(0);

  // Held in refs so the effect below can stay dependency-free — it must run
  // exactly once, and a parent that re-creates these callbacks would otherwise
  // restart the whole sequence.
  const haltRef = useRef(onHalt);
  const settleRef = useRef(onSettle);
  haltRef.current = onHalt;
  settleRef.current = onSettle;

  useEffect(() => {
    startedAt.current = performance.now();
    let cancelled = false;
    const timers: number[] = [];

    // Nothing may scroll while the page is still assembling: the hero's poses
    // are measured against a viewport at scroll 0.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);

    const release = () => {
      if (cancelled) return;
      cancelled = true;

      setProgress(1);
      haltRef.current();

      timers.push(
        window.setTimeout(() => {
          settleRef.current();
          setClearing(true);
        }, HALT_MS)
      );

      timers.push(
        window.setTimeout(() => {
          document.body.style.overflow = previousOverflow;
          window.scrollTo(0, 0);
          setGone(true);
        }, HALT_MS + CLEAR_MS)
      );
    };

    const gates: Promise<unknown>[] = [
      document.fonts?.ready ?? Promise.resolve(),
      decodeLogo(),
      new Promise((resolve) => timers.push(window.setTimeout(resolve, MIN_MS))),
    ];

    Promise.all(gates.map((g) => Promise.resolve(g).catch(() => undefined))).then(release);
    timers.push(window.setTimeout(release, MAX_MS));

    // The bar is not a real measurement of anything — nothing here reports
    // meaningful progress — so it eases toward 90% and waits, then completes
    // when the gates actually clear. Faking a smooth fill to 100% would be the
    // dishonest version; stalling near the end is what actually happens.
    let frame = 0;
    const tick = () => {
      const t = performance.now() - startedAt.current;
      setProgress((p) => (p >= 1 ? 1 : Math.min(0.9, 1 - Math.exp(-t / 700))));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (gone) return null;

  return (
    // `z-150` puts this over the page but under the sculpture, which the hero
    // lifts to `z-200` until it has settled. That ordering is the whole
    // trick: the glyph is never covered, so it never has to be handed over.
    <div className="pointer-events-none fixed inset-0 z-150 overflow-hidden" aria-hidden>
      <div
        className="lp-grain absolute inset-0 bg-background"
        style={{
          opacity: clearing ? 0 : 1,
          transition: `opacity ${CLEAR_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      >
        <div
          className="absolute left-1/2 top-1/2 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2"
          style={{ background: "radial-gradient(closest-side, hsl(var(--primary) / 0.28), transparent)" }}
        />
      </div>

      {/* Progress. Retires the moment the spin starts braking, so it is not
          still sitting there while the glyph is coming to rest. */}
      <div
        className="absolute left-1/2 top-[calc(50%+190px)] h-[3px] w-[min(180px,40vw)] -translate-x-1/2 overflow-hidden rounded-full bg-foreground/10"
        style={{
          opacity: progress >= 1 ? 0 : 1,
          transition: "opacity 320ms ease-out",
        }}
      >
        <span
          className="block h-full rounded-full"
          style={{
            width: `${progress * 100}%`,
            background: "hsl(var(--primary))",
            boxShadow: "0 0 14px hsl(var(--primary))",
            transition: "width 260ms cubic-bezier(0.32, 0.72, 0, 1)",
          }}
        />
      </div>
    </div>
  );
}

/**
 * Resolves once the logo art has decoded. The hero's own `<Image>` uses the
 * same file, so waiting here means the nav's mark is ready the instant the page
 * assembles rather than popping in a frame later.
 */
function decodeLogo(): Promise<void> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.src = "/Investwise.PNG";
    if (img.decode) {
      img.decode().then(() => resolve()).catch(() => resolve());
    } else {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    }
  });
}
