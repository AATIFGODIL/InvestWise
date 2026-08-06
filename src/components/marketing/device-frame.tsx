// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The logical size every demo is authored at. The demos lay themselves out in
 * these pixels and nothing else — no responsive branching inside a demo, ever.
 * The frame then scales the whole screen to whatever space it has been given,
 * so a demo composed for a 1440px display stays pixel-proportional inside a
 * 380px card on a phone. This is the same trick a design tool uses, and it is
 * the only way four scripted recordings stay in register with each other.
 */
export const SCREEN_W = 1040;
export const SCREEN_H = 650;

/**
 * The device the feature demos play inside.
 *
 * Chrome is deliberately InvestWise's own rather than a generic laptop bezel:
 * the 6px indigo accent line across the top is the exact affordance the app
 * shows when its desktop header is collapsed (`layout-content.tsx`), so the
 * frame reads as the product and not as a stock mockup.
 */
export function DeviceFrame({
  children,
  className,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  /** Announced to assistive tech in place of the silent visual demo. */
  label: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Width is the only constraint that matters: the frame's own height is
    // derived from the scale, so the screen can never be letterboxed.
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (width > 0) setScale(width / SCREEN_W);
    });

    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={hostRef} className={cn("lp-device w-full", className)}>
      <div
        className="lp-device-screen"
        // Reserving the height from the measured scale rather than an aspect
        // ratio keeps the box and its contents from ever disagreeing by a
        // sub-pixel, which is what produces a hairline of background along one
        // edge at certain widths.
        style={{ height: scale ? SCREEN_H * scale : undefined, aspectRatio: scale ? undefined : `${SCREEN_W} / ${SCREEN_H}` }}
        role="img"
        aria-label={label}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: SCREEN_W,
            height: SCREEN_H,
            transform: `scale(${scale || 0.0001})`,
            // The screen is authored dark. The app's own `.dark` token block
            // is scoped to a class, so declaring it here means every colour
            // inside a demo resolves through the product's real variables.
            visibility: scale ? "visible" : "hidden",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * The synthetic pointer. Moving it is a transform, so a demo can fly it across
 * the frame without touching layout; the CSS transition on `.lp-cursor` does
 * the easing.
 */
export function DemoCursor({
  x,
  y,
  pressed = false,
  tapKey,
}: {
  x: number;
  y: number;
  pressed?: boolean;
  /** Changing this value fires a fresh tap ring at the current position. */
  tapKey?: string | number;
}) {
  return (
    <>
      <svg
        className="lp-cursor"
        viewBox="0 0 24 24"
        style={{ transform: `translate3d(${x}px, ${y}px, 0) scale(${pressed ? 0.86 : 1})` }}
        aria-hidden
      >
        <path
          d="M5 2.5 L5 18.2 L9.1 14.3 L11.7 20.4 L14.6 19.2 L12 13.2 L17.6 13.2 Z"
          fill="hsl(0 0% 100%)"
          stroke="hsl(0 0% 0% / 0.55)"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
      {tapKey !== undefined && (
        <span
          key={tapKey}
          className="lp-tap pointer-events-none absolute z-40 rounded-full"
          style={{
            left: x - 21,
            top: y - 21,
            height: 42,
            width: 42,
            border: "2px solid hsl(var(--primary))",
          }}
          aria-hidden
        />
      )}
    </>
  );
}
