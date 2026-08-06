// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { InvestWiseLogo } from "@/components/marketing/investwise-logo";

/**
 * The floating chrome.
 *
 * Modelled on the app's own header rather than on a generic marketing bar:
 * `header.tsx` carries three *separate* floating groups over a transparent nav
 * — logo on the left, controls in the middle, actions on the right — instead of
 * one continuous strip. Doing the same here is what stops the top of the page
 * feeling like a different product from the thing it's advertising.
 *
 * It starts out of the way and only materialises once you've left the hero. The
 * first screen is the logo at full size; putting a second, smaller copy of the
 * same logo directly above it is the kind of duplication that reads as an
 * oversight, so the bar simply isn't there yet.
 */
export function LandingNav() {
  const { scrollYProgress } = useScroll();

  // A spring on the progress rail, not the raw value: trackpad scroll is noisy
  // enough that a 1:1 bar visibly stutters, and this is ambient chrome rather
  // than a control, so a few ms of lag costs nothing.
  const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 40, mass: 0.4 });

  // Committed to state rather than a motion value because it gates
  // `pointer-events` — a bar that is invisible but still swallowing clicks over
  // the hero's CTAs is worse than no bar.
  const [shown, setShown] = React.useState(false);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = p > 0.02;
    setShown((current) => (current === next ? current : next));
  });

  return (
    <>
      <motion.div
        className="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left"
        style={{
          scaleX: progress,
          background: "hsl(var(--primary))",
          boxShadow: "0 0 12px hsl(var(--primary) / 0.9)",
        }}
        aria-hidden
      />

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[60] flex items-center justify-between gap-3 px-4 pt-4 transition-all duration-500 sm:px-6",
          shown ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
        )}
      >
        {/* The centre group is absolutely centred on the *viewport*, not placed
            between its neighbours. `justify-between` centres the middle child
            only when the outer two are exactly the same width, and here they
            never are — the logo pill and the CTA pill differ by tens of pixels,
            which pushes the links visibly off-centre. Taking it out of the flow
            makes it centred by construction. */}
        {/* Left group: the official mark, on its own pill. */}
        <Link
          href="/landing"
          className="lp-glass lp-focus lp-cta flex items-center rounded-full px-3.5 py-2"
          aria-label="InvestWise home"
        >
          <InvestWiseLogo className="w-[104px]" sizes="104px" />
        </Link>

        {/* Centre group: section links. Hidden below `sm`, where there isn't
            room for three groups and the CTA is what matters. */}
        <nav className="lp-glass absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 rounded-full px-1.5 py-1.5 sm:flex">
          {[
            { label: "Features", href: "#features" },
            { label: "Learn", href: "#learn" },
            { label: "Pricing", href: "#learn" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="lp-focus rounded-full px-3.5 py-1.5 text-[12.5px] font-medium text-foreground/60 transition-colors duration-200 hover:bg-white/[0.07] hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right group: the one thing this page is for. */}
        <div className="lp-glass flex items-center gap-1 rounded-full p-1.5">
          <Link
            href="/auth/signin"
            className="lp-focus hidden rounded-full px-3.5 py-1.5 text-[12.5px] font-medium text-foreground/70 transition-colors duration-200 hover:text-foreground sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="lp-cta lp-focus group flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-semibold text-primary-foreground"
            style={{
              background: "hsl(var(--primary))",
              boxShadow:
                "0 8px 24px -8px hsl(var(--primary)), inset 0 1px 0 0 hsl(0 0% 100% / 0.25)",
            }}
          >
            Get started
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </header>
    </>
  );
}
