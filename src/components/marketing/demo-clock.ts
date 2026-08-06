// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import { useEffect, useRef, useState } from "react";

/** How coarsely the clock is sampled, ms. */
const TICK = 40;

/**
 * A looping playhead for the feature demos.
 *
 * The demos are scripted recordings — a caret typing, a panel opening, a
 * pointer crossing the frame — and they need a shared sense of time. This is
 * that clock: it starts when a demo takes the frame, loops its script, and
 * stops dead the moment the demo leaves.
 *
 * It deliberately does *not* push a React render per frame. Everything that
 * has to move smoothly (the pointer, the panel materialising, the glass
 * blurring up) is a CSS transition on `transform`/`opacity`/`filter`, so the
 * compositor carries it at display rate on its own. React is only needed when
 * the demo changes *state* — another character typed, a result list appearing
 * — so the playhead is quantised to `TICK` and the value is only committed
 * when that bucket actually changes. 25 renders a second on a few dozen nodes,
 * instead of 120 on every frame the display can draw.
 *
 * @param active   Whether the demo currently owns the frame.
 * @param duration Length of one pass of the script, ms.
 * @param options  `staticFrame` is the playhead to hold at when the user has
 *                 asked for reduced motion — pick a moment that shows the
 *                 feature resolved rather than mid-gesture.
 */
export function useDemoClock(
  active: boolean,
  duration: number,
  options: { staticFrame?: number; reducedMotion?: boolean } = {}
): number {
  const { staticFrame = duration * 0.7, reducedMotion = false } = options;
  const [elapsed, setElapsed] = useState(0);
  const frame = useRef<number | null>(null);
  const startedAt = useRef(0);
  const lastBucket = useRef(-1);

  useEffect(() => {
    if (reducedMotion) {
      // No playback at all: hold the frame that best shows the finished state.
      setElapsed(staticFrame);
      return;
    }

    if (!active) {
      // Rewind on the way out, so re-entering a panel replays the script from
      // the top rather than resuming halfway through a sentence.
      setElapsed(0);
      lastBucket.current = -1;
      return;
    }

    startedAt.current = performance.now();

    const step = (now: number) => {
      const t = (now - startedAt.current) % duration;
      const bucket = Math.floor(t / TICK);
      if (bucket !== lastBucket.current) {
        lastBucket.current = bucket;
        setElapsed(bucket * TICK);
      }
      frame.current = requestAnimationFrame(step);
    };

    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [active, duration, reducedMotion, staticFrame]);

  return elapsed;
}

/**
 * Types `text` out one character at a time, at a human-ish rate.
 *
 * Real typing is not metronomic, but it is also not random — a deterministic
 * wobble derived from the character index gives it a pulse without the demo
 * playing back differently on every loop.
 */
export function typeAt(text: string, elapsed: number, startAt: number, msPerChar = 92): string {
  if (elapsed < startAt) return "";
  const t = elapsed - startAt;
  let cursor = 0;
  let count = 0;
  while (count < text.length) {
    // ±22% either side of the nominal rate, keyed to position.
    const jitter = 1 + 0.22 * Math.sin(count * 2.399);
    cursor += msPerChar * jitter;
    if (cursor > t) break;
    count += 1;
  }
  return text.slice(0, count);
}

/** Linear ramp from 0→1 across a window, clamped at both ends. */
export function ramp(elapsed: number, from: number, to: number): number {
  if (to <= from) return elapsed >= to ? 1 : 0;
  return Math.min(1, Math.max(0, (elapsed - from) / (to - from)));
}

/** True across a half-open window — the demos' `if (on screen yet?)` test. */
export function between(elapsed: number, from: number, to = Infinity): boolean {
  return elapsed >= from && elapsed < to;
}
