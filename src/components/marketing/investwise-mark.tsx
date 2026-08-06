// InvestWise - A modern stock trading and investment education platform for young investors

import React from "react";

/**
 * The InvestWise mark, as SVG.
 *
 * `shared/app-logo-icon.tsx` builds the same shape out of skewed divs, which is
 * fine at one size inside the app but goes soft the moment the landing page
 * scales it to fill a viewport. Same geometry — the two Vs of the W with the
 * ascender between them — expressed as paths so it stays crisp at any size and
 * can inherit the accent colour instead of hard-coding #775DEF.
 */
export function InvestWiseMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden>
      {/* The rising stroke — the "I", and the chart line the brand is built on */}
      <path
        d="M16 5.5 L16 15"
        stroke="hsl(var(--primary))"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      {/* Left V */}
      <path
        d="M5.5 12.5 L10.2 26 L16 15"
        stroke="hsl(var(--primary))"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right V */}
      <path
        d="M16 15 L21.8 26 L26.5 12.5"
        stroke="hsl(var(--primary))"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
