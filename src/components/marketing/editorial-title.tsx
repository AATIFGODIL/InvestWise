// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A heading that resolves one character at a time — each letter rising out of
 * a blur, staggered left to right.
 *
 * The whole string is rendered into an `aria-label` on the host and every span
 * is `aria-hidden`, so a screen reader gets one clean phrase instead of a
 * letter-by-letter spelling. Words are wrapped in their own inline-block so a
 * line break can only ever fall in a space, never mid-word.
 */
export function EditorialTitle({
  text,
  active,
  as: Tag = "h2",
  className,
  stagger = 26,
}: {
  text: string;
  /** Drives the reveal. Flipping back to false re-arms it for the next pass. */
  active: boolean;
  as?: "h1" | "h2" | "h3";
  className?: string;
  /** Delay between adjacent characters, ms. */
  stagger?: number;
}) {
  const [revealed, setRevealed] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Clearing on every change is what makes the reveal re-armable: scrolling
    // back up past a panel and down again has to replay it, and a half-finished
    // stagger from the previous pass must not leak into the next one.
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setRevealed(active);
  }, [active]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const words = text.split(" ");
  let charIndex = -1;

  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, wordIndex) => (
        <span key={`${word}-${wordIndex}`} className="inline-block whitespace-nowrap" aria-hidden>
          {Array.from(word).map((char, i) => {
            charIndex += 1;
            return (
              <span
                key={`${char}-${i}`}
                className={cn("lp-char", revealed && "is-revealed")}
                style={{ transitionDelay: `${charIndex * stagger}ms` }}
              >
                {char}
              </span>
            );
          })}
          {wordIndex < words.length - 1 && <span className="lp-char is-revealed">&nbsp;</span>}
        </span>
      ))}
    </Tag>
  );
}
