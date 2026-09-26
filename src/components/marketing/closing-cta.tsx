// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { HeroBackdrop } from "@/components/marketing/hero-backdrop";
import { InvestWiseLogo } from "@/components/marketing/investwise-logo";

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
 *
 * It ends where the hero began, with the same moving market behind it, so the
 * page reads as one thought. The last things on it are two glass pills: the
 * Privacy Policy and the copyright line.
 */
export function ClosingCta() {
  return (
    <div className="relative flex h-full min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden px-6 text-center">
      <HeroBackdrop />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[80vh] w-[80vw] -translate-x-1/2 -translate-y-1/2"
        style={{ background: "radial-gradient(closest-side, hsl(var(--primary) / 0.22), transparent)" }}
        aria-hidden
      />

      <InvestWiseLogo className="relative z-10 w-[clamp(180px,17vw,240px)]" sizes="240px" />

      {/* One line at every width: the size scales with the viewport instead of wrapping. */}
      <h2 className="lp-display relative z-10 mt-10 whitespace-nowrap pb-1 text-[clamp(1.6rem,7vw,5rem)] text-foreground">
        Start before it&apos;s <span className="lp-gradient-text">real.</span>
      </h2>

      <p className="lp-body relative z-10 mt-6 max-w-[40ch] text-[clamp(1rem,1.5vw,1.15rem)]">
        Trade real companies at live prices with virtual money, and learn from an AI that explains every
        move. Build the habits now. Every mistake here is free.
      </p>

      <div className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/auth/signup"
          className="lp-cta lp-focus group flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold text-primary-foreground"
          style={{
            background: "hsl(var(--primary))",
            boxShadow: "0 18px 50px -14px hsl(var(--primary)), inset 0 1px 0 0 hsl(0 0% 100% / 0.24)",
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

      <footer className="relative z-10 mt-16 flex flex-col items-center gap-4">
        <p className="max-w-[46ch] text-[11.5px] font-medium leading-relaxed text-foreground/40">
          InvestWise is a simulator. Virtual funds only. Nothing here is investment advice.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/privacy"
            className="lp-cta lp-focus lp-glass flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-semibold text-foreground/80 hover:text-foreground"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Privacy Policy
          </Link>
          <span className="lp-glass rounded-full px-4 py-2 text-[12.5px] font-medium text-foreground/60">
            © {new Date().getFullYear()} InvestWise. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
