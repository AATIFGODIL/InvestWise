// InvestWise - A modern stock trading and investment education platform for young investors

import { usePortfolioStore } from "@/store/portfolio-store";
import { useWatchlistStore } from "@/store/watchlist-store";
import { useGoalStore } from "@/store/goal-store";
import { useAutoInvestStore } from "@/store/auto-invest-store";
import { useMarketStore } from "@/store/market-store";
import { useProModeStore } from "@/store/pro-mode-store";
import { useUserStore } from "@/store/user-store";

/** Sent as the chat message when someone taps "Explain this page". */
export const EXPLAIN_PAGE_QUERY = "Explain this page for me.";

const money = (n: number) =>
  `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const signed = (n: number) => `${n >= 0 ? "+" : "-"}${money(Math.abs(n)).replace("-", "")}`;

/**
 * A plain-text picture of what the user is looking at: their own portfolio,
 * holdings, watchlist, goals and auto-invest plans, as the app currently has
 * them. It goes to the assistant with every question, so "how am I doing?"
 * and "explain this page" are answered with their numbers, not generalities.
 */
export function buildPageSnapshot(): string {
  const { portfolioSummary, holdings } = usePortfolioStore.getState();
  const { watchlist } = useWatchlistStore.getState();
  const { goals } = useGoalStore.getState();
  const { autoInvestments } = useAutoInvestStore.getState();
  const { isMarketOpen } = useMarketStore.getState();
  const { isProMode } = useProModeStore.getState();
  const { username } = useUserStore.getState();

  const lines: string[] = [];
  lines.push(`Name: ${username || "Investor"}`);
  lines.push(`Market: ${isMarketOpen === null ? "unknown" : isMarketOpen ? "open" : "closed"}`);
  lines.push(`Pro Mode: ${isProMode ? "on" : "off"}`);
  lines.push(
    `Portfolio value: ${money(portfolioSummary.totalValue)} (today ${signed(portfolioSummary.todaysChange)}, total gain/loss ${signed(portfolioSummary.totalGainLoss)})`
  );
  lines.push(
    holdings.length
      ? `Holdings (${holdings.length}): ${holdings
          .map(
            (h) =>
              `${h.symbol} ${h.qty} sh worth ${money(h.qty * h.currentPrice)} (today ${h.todaysChangePercent >= 0 ? "+" : ""}${h.todaysChangePercent.toFixed(2)}%)`
          )
          .join("; ")}`
      : "Holdings: none yet"
  );
  lines.push(watchlist.length ? `Watchlist: ${watchlist.join(", ")}` : "Watchlist: empty");
  lines.push(
    goals.length
      ? `Goals: ${goals.map((g) => `${g.name} ${money(g.current)} of ${money(g.target)} (${g.progress}%)`).join("; ")}`
      : "Goals: none yet"
  );
  lines.push(
    autoInvestments.length
      ? `Auto-invest: ${autoInvestments
          .map((a) => `${money(a.amount)} into ${a.symbol} ${a.frequency.toLowerCase()} (next ${new Date(a.nextDate).toLocaleDateString()})`)
          .join("; ")}`
      : "Auto-invest: none set up"
  );
  return lines.join("\n");
}
