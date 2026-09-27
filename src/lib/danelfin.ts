// InvestWise - A modern stock trading and investment education platform for young investors
import { getEnvVar } from '@/lib/env';

/**
 * Danelfin: AI Scores and price forecasts for US stocks and ETFs.
 *
 * Two calls per ticker, both cached for six hours (Danelfin updates once a
 * day, and the free plan is 500 calls a month):
 *  - `/ranking` — the daily AI Score, 1 to 10: how likely the stock is to beat
 *    the market over the next 3 months, with its Technical, Fundamental,
 *    Sentiment and Low Risk sub-scores.
 *  - `/v3/price-forecast` — a buy / hold / sell signal and the expected return
 *    over 1, 3, 6 and 12 months, with a likely range (the middle two thirds of
 *    outcomes).
 *
 * The data is already structured, so no language model sits on top of it: the
 * one-line summary is written from the numbers directly, which is instant and
 * can't misstate a figure.
 *
 * Server-only. The key lives in the `DANELFIN_API_KEY` environment variable.
 */

const BASE_URL = 'https://apirest.danelfin.com';
const CACHE_SECONDS = 6 * 60 * 60;

export type DanelfinSignal = 'buy' | 'hold' | 'sell';

export interface DanelfinForecast {
  horizon: '1 month' | '3 months' | '6 months' | '1 year';
  /** Expected return, as a fraction (0.061 = +6.1%). */
  median: number;
  /** Likely range: the middle two thirds of outcomes. */
  low: number;
  high: number;
}

export interface DanelfinPrediction {
  symbol: string;
  /** The trading day the scores are for (YYYY-MM-DD). */
  date: string;
  /** 1 to 10. Higher means a higher chance of beating the market over 3 months. */
  aiScore: number | null;
  subScores: { technical: number | null; fundamental: number | null; sentiment: number | null; lowRisk: number | null };
  signal: DanelfinSignal | null;
  forecasts: DanelfinForecast[];
  summary: string;
}

export class DanelfinError extends Error {
  constructor(message: string, readonly reason: 'not_configured' | 'not_covered' | 'unavailable' | 'invalid') {
    super(message);
  }
}

type ByDate<T> = Record<string, T | null>;

async function get<T>(path: string, ticker: string): Promise<ByDate<T> | null> {
  const apiKey = getEnvVar('DANELFIN_API_KEY');
  if (!apiKey) throw new DanelfinError("Predictions aren't set up yet.", 'not_configured');

  const response = await fetch(`${BASE_URL}${path}?ticker=${encodeURIComponent(ticker)}`, {
    headers: { 'x-api-key': apiKey },
    next: { revalidate: CACHE_SECONDS },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new DanelfinError('Danelfin is unavailable right now. Try again soon.', 'unavailable');
  const body = await response.json();
  return body && typeof body === 'object' && !Array.isArray(body) ? (body as ByDate<T>) : null;
}

/** The most recent non-empty entry of a date-keyed response. */
function latest<T>(byDate: ByDate<T> | null): { date: string; value: T } | null {
  if (!byDate) return null;
  const dates = Object.keys(byDate).sort();
  for (let i = dates.length - 1; i >= 0; i--) {
    const value = byDate[dates[i]];
    if (value) return { date: dates[i], value };
  }
  return null;
}

const pct = (fraction: number) => `${fraction >= 0 ? '+' : ''}${(fraction * 100).toFixed(1)}%`;

function describeScore(score: number): string {
  if (score >= 9) return 'a strong';
  if (score >= 7) return 'an above-average';
  if (score >= 4) return 'an average';
  if (score >= 2) return 'a below-average';
  return 'a weak';
}

export async function getDanelfinPrediction(rawSymbol: string): Promise<DanelfinPrediction> {
  const symbol = rawSymbol.trim().toUpperCase();
  if (!/^[A-Z][A-Z0-9.\-]{0,9}$/.test(symbol)) {
    throw new DanelfinError('Enter a stock symbol, like AAPL.', 'invalid');
  }

  type Ranking = { aiscore?: number; technical?: number; fundamental?: number; sentiment?: number; low_risk?: number };
  type Forecast = { signal?: string } & Record<string, number | string | undefined>;

  const [rankingByDate, forecastByDate] = await Promise.all([
    get<Ranking>('/ranking', symbol),
    get<Forecast>('/v3/price-forecast', symbol),
  ]);
  const ranking = latest(rankingByDate);
  const forecast = latest(forecastByDate);

  if (!ranking && !forecast) {
    throw new DanelfinError(`Danelfin doesn't cover ${symbol}. Try a US stock or ETF like AAPL or VOO.`, 'not_covered');
  }

  const f = forecast?.value;
  const num = (key: string) => (typeof f?.[key] === 'number' ? (f[key] as number) : null);
  const horizons: [DanelfinForecast['horizon'], string][] = [
    ['1 month', '1m'],
    ['3 months', '3m'],
    ['6 months', '6m'],
    ['1 year', '1y'],
  ];
  const forecasts: DanelfinForecast[] = horizons.flatMap(([horizon, key]) => {
    const median = num(`median_${key}`);
    const low = num(`q16_${key}`);
    const high = num(`q84_${key}`);
    return median === null || low === null || high === null ? [] : [{ horizon, median, low, high }];
  });

  const signal = f?.signal === 'buy' || f?.signal === 'hold' || f?.signal === 'sell' ? f.signal : null;
  const r = ranking?.value;
  const aiScore = typeof r?.aiscore === 'number' ? r.aiscore : null;

  const parts: string[] = [];
  if (aiScore !== null) {
    parts.push(
      `Danelfin's AI rates ${symbol} ${aiScore}/10: ${describeScore(aiScore)} chance of beating the market over the next 3 months.`
    );
  }
  const threeMonths = forecasts.find((x) => x.horizon === '3 months');
  if (threeMonths) {
    parts.push(
      `Its expected 3-month return is ${pct(threeMonths.median)}, most likely between ${pct(threeMonths.low)} and ${pct(threeMonths.high)}.`
    );
  }

  return {
    symbol,
    date: ranking?.date ?? forecast?.date ?? '',
    aiScore,
    subScores: {
      technical: r?.technical ?? null,
      fundamental: r?.fundamental ?? null,
      sentiment: r?.sentiment ?? null,
      lowRisk: r?.low_risk ?? null,
    },
    signal,
    forecasts,
    summary: parts.join(' '),
  };
}
