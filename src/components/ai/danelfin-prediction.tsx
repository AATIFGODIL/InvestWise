// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { DanelfinPrediction } from "@/lib/danelfin";

const SIGNAL_STYLE: Record<string, string> = {
  buy: "bg-green-500 text-white",
  hold: "bg-yellow-500 text-white",
  sell: "bg-red-500 text-white",
};

const pct = (fraction: number) => `${fraction >= 0 ? "+" : ""}${(fraction * 100).toFixed(1)}%`;

/** Required attribution for Danelfin data, linking to their site. */
export function PoweredByDanelfin({ className }: { className?: string }) {
  return (
    <a
      href="https://danelfin.com"
      target="_blank"
      rel="noopener noreferrer"
      className={cn("text-[11px] text-muted-foreground transition-colors hover:text-foreground", className)}
    >
      Powered by <span className="font-semibold">Danelfin</span>
    </a>
  );
}

/**
 * A Danelfin result: the AI Score as a 10-step meter, the signal, a plain
 * summary, the four sub-scores and the forecast ranges. `compact` drops the
 * sub-scores and shows only the 3-month and 1-year forecasts, for Spotlight.
 */
export function DanelfinPredictionView({
  prediction,
  compact = false,
  showAttribution = true,
}: {
  prediction: DanelfinPrediction;
  compact?: boolean;
  /** Off where the surrounding card already credits Danelfin. */
  showAttribution?: boolean;
}) {
  const { aiScore, signal, subScores, forecasts, summary, symbol, date } = prediction;
  const shownForecasts = compact
    ? forecasts.filter((f) => f.horizon === "3 months" || f.horizon === "1 year")
    : forecasts;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">AI Score · {symbol}</p>
          <p className="mt-0.5 text-3xl font-bold tabular-nums">
            {aiScore ?? "–"}
            <span className="text-base font-semibold text-muted-foreground">/10</span>
          </p>
        </div>
        {signal && (
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold capitalize", SIGNAL_STYLE[signal])}>
            {signal === "hold" ? "Hold" : `${signal} signal`}
          </span>
        )}
      </div>

      {aiScore !== null && (
        <div className="flex gap-1" aria-hidden>
          {Array.from({ length: 10 }, (_, i) => (
            <span
              key={i}
              className={cn("h-1.5 flex-1 rounded-full", i < aiScore ? "bg-primary" : "bg-muted-foreground/20")}
            />
          ))}
        </div>
      )}

      {summary && <p className="text-sm leading-relaxed">{summary}</p>}

      {!compact && (
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {(
            [
              ["Technical", subScores.technical],
              ["Fundamental", subScores.fundamental],
              ["Sentiment", subScores.sentiment],
              ["Low risk", subScores.lowRisk],
            ] as const
          ).map(([label, value]) =>
            value === null ? null : (
              <div key={label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold tabular-nums">{value}/10</span>
              </div>
            )
          )}
        </div>
      )}

      {shownForecasts.length > 0 && (
        <div className="rounded-2xl bg-muted/50 p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Price forecast</p>
          <div className="space-y-1.5">
            {shownForecasts.map((f) => (
              <div key={f.horizon} className="flex items-center justify-between gap-3 text-xs">
                <span className="w-16 text-muted-foreground">{f.horizon}</span>
                <span className={cn("font-semibold tabular-nums", f.median >= 0 ? "text-green-500" : "text-red-500")}>
                  {pct(f.median)}
                </span>
                <span className="flex-1 text-right tabular-nums text-muted-foreground">
                  likely {pct(f.low)} to {pct(f.high)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground">
          {date ? `As of ${new Date(`${date}T00:00:00`).toLocaleDateString()}. ` : ""}Not financial advice.
        </p>
        {showAttribution && <PoweredByDanelfin />}
      </div>
    </div>
  );
}
