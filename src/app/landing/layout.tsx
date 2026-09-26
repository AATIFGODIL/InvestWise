// InvestWise - A modern stock trading and investment education platform for young investors

import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "InvestWise | Paper trading platform for the youth",
  description:
    "A trading floor that explains itself. Real market data, an AI that knows what you're looking at, and not a cent of your own money at risk while you learn.",
};

/**
 * Metadata only. The page's dark palette, stylesheet and full-viewport backdrop
 * all live in `LandingExperience`, because `/` renders that same component and
 * a route layout here could never reach it.
 */
export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
