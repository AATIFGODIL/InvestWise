// InvestWise - A modern stock trading and investment education platform for young investors
import { getEnvVar } from '@/lib/env';
import { getDanelfinPrediction, type DanelfinPrediction } from '@/lib/danelfin';

/**
 * A plain-text fact sheet for a stock, handed to the assistant so it can answer
 * "Analyze AAPL" with real numbers instead of pointing at the chart.
 *
 * Sources, fetched in parallel (any that fail are simply left out):
 *  - Finnhub: live quote, company profile, key metrics (52-week range, recent
 *    returns, P/E, EPS, beta, dividend, growth), analyst ratings, and the
 *    last week's headlines.
 *  - Danelfin: the AI Score and price forecast.
 *
 * Server-only. Results are memoised per instance for a short while, so a
 * conversation about one stock doesn't refetch everything on every message.
 */

const FINNHUB = 'https://finnhub.io/api/v1';

const memo = new Map<string, { expires: number; value: Promise<unknown> }>();

function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = memo.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as Promise<T>;
  if (memo.size > 500) {
    for (const [k, entry] of memo) if (entry.expires <= Date.now()) memo.delete(k);
  }
  const value = load();
  memo.set(key, { expires: Date.now() + ttlMs, value });
  // Failures shouldn't stick around.
  value.catch(() => memo.delete(key));
  return value;
}

function finnhubKey() {
  return getEnvVar('FINNHUB_API_KEY') || getEnvVar('NEXT_PUBLIC_FINNHUB_API_KEY');
}

async function finnhub<T>(path: string, params: Record<string, string>): Promise<T | null> {
  const token = finnhubKey();
  if (!token) return null;
  const query = new URLSearchParams({ ...params, token });
  const response = await fetch(`${FINNHUB}${path}?${query}`, { cache: 'no-store' });
  if (!response.ok) return null;
  return (await response.json()) as T;
}

type Quote = { c: number; d: number | null; dp: number | null; h: number; l: number; o: number; pc: number };
type Profile = { name?: string; finnhubIndustry?: string; marketCapitalization?: number; exchange?: string; country?: string; ipo?: string };
type Metrics = { metric?: Record<string, number | string | null> };
type Recommendation = { period: string; strongBuy: number; buy: number; hold: number; sell: number; strongSell: number };
type News = { headline: string; source: string; datetime: number };

const MINUTE = 60_000;

const getQuote = (s: string) =>
  cached(`quote:${s}`, 30_000, async () => {
    const q = await finnhub<Quote>('/quote', { symbol: s });
    // Finnhub answers unknown symbols with all zeros.
    return q && q.c ? q : null;
  });
const getProfile = (s: string) => cached(`profile:${s}`, 60 * MINUTE, () => finnhub<Profile>('/stock/profile2', { symbol: s }));
const getMetrics = (s: string) => cached(`metric:${s}`, 60 * MINUTE, () => finnhub<Metrics>('/stock/metric', { symbol: s, metric: 'all' }));
const getRecommendations = (s: string) => cached(`recs:${s}`, 6 * 60 * MINUTE, () => finnhub<Recommendation[]>('/stock/recommendation', { symbol: s }));
const getNews = (s: string) =>
  cached(`news:${s}`, 30 * MINUTE, () => {
    const day = (offset: number) => new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10);
    return finnhub<News[]>('/company-news', { symbol: s, from: day(7), to: day(0) });
  });
const getDanelfin = (s: string) => cached(`danelfin:${s}`, 6 * 60 * MINUTE, () => getDanelfinPrediction(s));

const settled = <T>(result: PromiseSettledResult<T>) => (result.status === 'fulfilled' ? result.value : null);

const money = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const signed = (n: number, digits = 2) => `${n >= 0 ? '+' : ''}${n.toFixed(digits)}`;

function marketCap(millions: number) {
  if (millions >= 1_000_000) return `$${(millions / 1_000_000).toFixed(2)} trillion`;
  if (millions >= 1_000) return `$${(millions / 1_000).toFixed(1)} billion`;
  return `$${millions.toFixed(0)} million`;
}

/** Finnhub metrics come back as numbers, strings or null; only keep real numbers. */
function metricReader(metrics: Metrics | null) {
  const m = metrics?.metric ?? {};
  return (...keys: string[]) => {
    for (const key of keys) {
      const value = m[key];
      if (typeof value === 'number' && Number.isFinite(value)) return value;
    }
    return null;
  };
}

function describeDanelfin(d: DanelfinPrediction): string[] {
  const lines: string[] = [];
  if (d.aiScore !== null) {
    const subs = [
      ['Technical', d.subScores.technical],
      ['Fundamental', d.subScores.fundamental],
      ['Sentiment', d.subScores.sentiment],
      ['Low Risk', d.subScores.lowRisk],
    ]
      .filter(([, v]) => typeof v === 'number')
      .map(([k, v]) => `${k} ${v}/10`)
      .join(', ');
    lines.push(`- Danelfin AI Score: ${d.aiScore}/10 (chance of beating the market over the next 3 months; 10 is best)${subs ? `. Sub-scores: ${subs}` : ''}`);
  }
  if (d.signal) lines.push(`- Danelfin signal: ${d.signal}`);
  for (const f of d.forecasts) {
    lines.push(`- Danelfin ${f.horizon} forecast: ${signed(f.median * 100, 1)}% expected, likely range ${signed(f.low * 100, 1)}% to ${signed(f.high * 100, 1)}%`);
  }
  if (d.date) lines.push(`- Danelfin data as of ${d.date}`);
  return lines;
}

/** Everything we know about one stock, as plain text, or null if it isn't a real ticker. */
export async function buildStockBrief(rawSymbol: string): Promise<string | null> {
  const symbol = rawSymbol.trim().toUpperCase();
  if (!/^[A-Z][A-Z0-9.\-]{0,9}$/.test(symbol)) return null;

  // Check the ticker is real before spending Danelfin calls (500 a month) on it.
  const quote = await getQuote(symbol).catch(() => null);
  if (!quote && finnhubKey()) return null;

  const [profileR, metricsR, recsR, newsR, danelfinR] = await Promise.allSettled([
    getProfile(symbol),
    getMetrics(symbol),
    getRecommendations(symbol),
    getNews(symbol),
    getDanelfin(symbol),
  ]);
  const profile = settled(profileR);
  const danelfin = settled(danelfinR);
  if (!quote && !danelfin) return null;

  const lines: string[] = [];
  const name = profile?.name;
  lines.push(`${symbol}${name ? ` (${name})` : ''}`);
  if (profile?.finnhubIndustry) lines.push(`- Industry: ${profile.finnhubIndustry}`);
  if (profile?.marketCapitalization) lines.push(`- Market cap: ${marketCap(profile.marketCapitalization)}`);

  if (quote) {
    const change = quote.d !== null && quote.dp !== null ? `, ${signed(quote.d)} (${signed(quote.dp)}%) today` : '';
    lines.push(`- Price: ${money(quote.c)}${change}. Open ${money(quote.o)}, day range ${money(quote.l)} to ${money(quote.h)}, previous close ${money(quote.pc)}`);
  }

  const m = metricReader(settled(metricsR));
  const high = m('52WeekHigh');
  const low = m('52WeekLow');
  if (high !== null && low !== null) {
    let position = '';
    if (quote && high > low) {
      const pct = Math.round(((quote.c - low) / (high - low)) * 100);
      position = `; the price sits ${pct}% of the way from the low to the high, ${Math.abs(((quote.c - high) / high) * 100).toFixed(1)}% below the high`;
    }
    lines.push(`- 52-week range: ${money(low)} to ${money(high)}${position}`);
  }

  const returns = [
    ['5 days', m('5DayPriceReturnDaily')],
    ['month to date', m('monthToDatePriceReturnDaily')],
    ['3 months', m('13WeekPriceReturnDaily')],
    ['6 months', m('26WeekPriceReturnDaily')],
    ['year to date', m('yearToDatePriceReturnDaily')],
    ['1 year', m('52WeekPriceReturnDaily')],
  ].filter((entry): entry is [string, number] => entry[1] !== null);
  if (returns.length) lines.push(`- Price change: ${returns.map(([k, v]) => `${k} ${signed(v, 1)}%`).join(', ')}`);

  const vsMarket = m('priceRelativeToS&P50052Week');
  if (vsMarket !== null) lines.push(`- Versus the S&P 500 over 1 year: ${signed(vsMarket, 1)} percentage points`);

  const pe = m('peTTM', 'peBasicExclExtraTTM', 'peNormalizedAnnual');
  const eps = m('epsTTM', 'epsBasicExclExtraItemsTTM');
  const valuation = [
    pe !== null ? `P/E ${pe.toFixed(1)}` : null,
    eps !== null ? `EPS ${money(eps)}` : null,
    m('psTTM') !== null ? `P/S ${m('psTTM')!.toFixed(1)}` : null,
  ].filter(Boolean);
  if (valuation.length) lines.push(`- Valuation (last 12 months): ${valuation.join(', ')}`);

  const revenueGrowth = m('revenueGrowthTTMYoy');
  const epsGrowth = m('epsGrowthTTMYoy');
  const margin = m('netProfitMarginTTM');
  const fundamentals = [
    revenueGrowth !== null ? `revenue growth ${signed(revenueGrowth, 1)}% year over year` : null,
    epsGrowth !== null ? `earnings growth ${signed(epsGrowth, 1)}%` : null,
    margin !== null ? `net profit margin ${margin.toFixed(1)}%` : null,
  ].filter(Boolean);
  if (fundamentals.length) lines.push(`- Business: ${fundamentals.join(', ')}`);

  const beta = m('beta');
  if (beta !== null) lines.push(`- Beta: ${beta.toFixed(2)} (1 moves with the market; higher swings more)`);
  const dividend = m('dividendYieldIndicatedAnnual', 'currentDividendYieldTTM');
  if (dividend !== null && dividend > 0) lines.push(`- Dividend yield: ${dividend.toFixed(2)}%`);

  const latestRecs = settled(recsR)?.[0];
  if (latestRecs) {
    const buy = latestRecs.strongBuy + latestRecs.buy;
    const sell = latestRecs.sell + latestRecs.strongSell;
    const total = buy + latestRecs.hold + sell;
    if (total > 0) lines.push(`- Wall Street analysts (${latestRecs.period}): ${buy} buy, ${latestRecs.hold} hold, ${sell} sell`);
  }

  if (danelfin) lines.push(...describeDanelfin(danelfin));

  const news = (settled(newsR) ?? []).filter((n) => n.headline).slice(0, 4);
  if (news.length) {
    lines.push('- Headlines from the past week:');
    for (const n of news) {
      const date = new Date(n.datetime * 1000).toISOString().slice(0, 10);
      lines.push(`  - ${date}, ${n.source}: ${n.headline}`);
    }
  }

  return lines.join('\n');
}

// Upper-case words that are finance jargon rather than tickers.
const NOT_TICKERS = new Set([
  'I', 'A', 'AI', 'ETF', 'ETFS', 'PE', 'EPS', 'CEO', 'CFO', 'IPO', 'US', 'USA', 'USD', 'GDP', 'ROI', 'ROE',
  'YTD', 'ATH', 'DCA', 'IRA', 'SEC', 'FED', 'CPI', 'EV', 'ESG', 'REIT', 'NYSE', 'NASDAQ', 'OK', 'FAQ', 'API',
  'P', 'E', 'S', 'Q', 'VS', 'AM', 'PM', 'TLDR', 'ELI5', 'LLC', 'INC', 'UK', 'EU', 'IMO',
]);

/**
 * The stocks a message is about: tickers written in capitals or with a `$`
 * (like "AAPL" or "$tsla"), then the stock on screen. At most three.
 */
export function symbolsForQuery(query: string, onScreen?: string): string[] {
  const found: string[] = [];
  for (const match of query.matchAll(/\$([A-Za-z][A-Za-z.]{0,5})\b/g)) found.push(match[1].toUpperCase());

  // If the whole message is in capitals, capitals don't mean anything.
  const letters = query.replace(/[^A-Za-z]/g, '');
  const shouting = letters.length > 12 && letters === letters.toUpperCase();
  if (!shouting) {
    for (const match of query.matchAll(/\b([A-Z]{1,5}(?:\.[A-Z])?)\b/g)) {
      if (!NOT_TICKERS.has(match[1])) found.push(match[1]);
    }
  }
  if (onScreen) found.push(onScreen.toUpperCase());
  return [...new Set(found)].slice(0, 3);
}
