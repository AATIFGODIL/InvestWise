// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import { useEffect, useState } from "react";

export type Quote = { price: number; changePercent: number; live: boolean };

/**
 * Reference quotes, shown until (or instead of) real ones. They are only ever
 * a starting frame: if `/api/stock-price` answers, its numbers replace these.
 */
const REFERENCE: Record<string, Omit<Quote, "live">> = {
  NVDA: { price: 184.92, changePercent: 2.44 },
  AAPL: { price: 231.4, changePercent: 0.86 },
  TSLA: { price: 246.31, changePercent: -1.12 },
  MSFT: { price: 516.17, changePercent: 0.34 },
  VOO: { price: 604.12, changePercent: 0.42 },
  AMZN: { price: 228.15, changePercent: 1.61 },
  GOOGL: { price: 247.18, changePercent: 0.72 },
  META: { price: 743.4, changePercent: -0.41 },
  AMD: { price: 162.33, changePercent: 1.07 },
};

/**
 * Quotes for the landing page, fetched once through the app's own
 * `/api/stock-price` route (Finnhub, server-side key). Anything that fails or
 * times out keeps its reference value — the page never waits on the network,
 * and never shows an empty chip.
 */
export function useQuotes(symbols: string[]): Record<string, Quote> {
  const key = symbols.join(",");
  const [quotes, setQuotes] = useState<Record<string, Quote>>(() =>
    Object.fromEntries(
      symbols.map((s) => [s, { ...(REFERENCE[s] ?? { price: 100, changePercent: 0 }), live: false }])
    )
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4000);

    key.split(",").forEach(async (symbol) => {
      try {
        const res = await fetch(`/api/stock-price?symbol=${encodeURIComponent(symbol)}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        if (typeof data?.c !== "number" || data.c <= 0) return;
        setQuotes((q) => ({
          ...q,
          [symbol]: { price: data.c, changePercent: typeof data.dp === "number" ? data.dp : 0, live: true },
        }));
      } catch {
        // Keep the reference value.
      }
    });

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [key]);

  return quotes;
}
