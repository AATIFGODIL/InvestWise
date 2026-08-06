// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React from "react";

/**
 * The hero's ambient field.
 *
 * Deliberately just lighting: two slow indigo blooms, the grid floor, grain to
 * stop the gradients banding on an 8-bit panel, and a floor ramp for the device
 * to rise out of. The subject of the hero is the sculpture and the lockup, and
 * the background's only job is to give them somewhere to sit.
 *
 * (An earlier version drew a full price chart back here — candles, a price
 * ladder, an annotated drawdown. It was too much: it competed with the
 * sculpture for the same space and pushed the copy around to avoid it.)
 */
export function HeroBackdrop() {
  return (
    <div className="lp-grain pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="lp-grid absolute inset-0" />

      <div
        className="lp-aurora lp-drift-a left-[6%] top-[-4%] h-[56vh] w-[56vh]"
        style={{ background: "hsl(var(--primary) / 0.4)" }}
      />
      <div
        className="lp-aurora lp-drift-b right-[2%] top-[18%] h-[48vh] w-[48vh]"
        style={{ background: "hsl(272 84% 62% / 0.26)" }}
      />

      {/* Floor gradient, so the device has something to rise out of. */}
      <div
        className="absolute inset-x-0 bottom-0 h-[38vh]"
        style={{
          background:
            "linear-gradient(to top, hsl(var(--background)) 12%, hsl(var(--background) / 0) 100%)",
        }}
      />
    </div>
  );
}
