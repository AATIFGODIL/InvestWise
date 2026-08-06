// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { InvestWiseMark } from "@/components/marketing/investwise-mark";

/**
 * The close.
 *
 * On desktop this is pinned to the viewport at z-0 with the whole page
 * scrolling over it, so the last screen of content slides *off* the ending
 * rather than the ending sliding *on* — the page peels back to reveal
 * something that was underneath the entire time. On compact viewports it's
 * an ordinary section at the bottom, because a fixed full-height layer behind
 * a scrolling document is a reliable way to fight a mobile browser's own
 * address-bar collapse.
 */
export function ClosingCta() {
  return (
    <div className="relative flex h-full min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="lp-grain pointer-events-none absolute inset-0" aria-hidden>
        <div className="lp-grid absolute inset-0 opacity-60" />
        <div
          className="lp-aurora lp-drift-a left-1/2 top-1/2 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2"
          style={{ background: "hsl(var(--primary) / 0.34)" }}
        />
      </div>

      <InvestWiseMark className="relative z-10 h-11 w-11" />

      <h2 className="lp-display relative z-10 mt-8 max-w-[14ch] text-[clamp(2.2rem,7vw,4.6rem)] text-foreground">
        Learn it before it costs you.
      </h2>

      <p className="lp-body relative z-10 mt-6 max-w-[42ch] text-[clamp(0.95rem,1.5vw,1.1rem)]">
        Every mistake you make here is free. Open an account, get virtual funds, and
        find out what kind of investor you actually are before any of it is real.
      </p>

      <div className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/auth/signup"
          className="lp-cta lp-focus group flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold text-primary-foreground"
          style={{
            background: "hsl(var(--primary))",
            boxShadow: "0 18px 50px -14px hsl(var(--primary))",
          }}
        >
          Create your account
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/auth/signin"
          className="lp-cta lp-focus lp-glass rounded-full px-7 py-3.5 text-[15px] font-semibold text-foreground"
        >
          I already have one
        </Link>
      </div>

      <footer className="relative z-10 mt-16 flex flex-col items-center gap-2">
        <p className="text-[11px] font-medium text-foreground/40">
          InvestWise is a simulator. Virtual funds only — nothing here is investment advice.
        </p>
        <p className="text-[11px] text-foreground/25">
          © {new Date().getFullYear()} InvestWise
        </p>
      </footer>
    </div>
  );
}
