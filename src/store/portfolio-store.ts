
import { create } from 'zustand';
import { doc, updateDoc, getFirestore, arrayUnion } from "firebase/firestore";
import { auth } from '@/lib/firebase/config';
import { useTransactionStore, type Transaction } from './transaction-store';

export interface Holding {
    symbol: string;
    description: string;
    currentPrice: number;
    todaysChange: number;
    todaysChangePercent: number;
    purchasePrice: number;
    qty: number;
    annualRatePercent: number;
}

export interface PortfolioSummary {
    totalValue: number;
    todaysChange: number;
    totalGainLoss: number;
    annualRatePercent: number;
}

interface ChartDataPoint {
    date: string;
    value: number;
}

interface ChartData {
    '1W': ChartDataPoint[];
    '1M': ChartDataPoint[];
    '6M': ChartDataPoint[];
    '1Y': ChartDataPoint[];
}

interface MarketHoliday {
    atDate: string; // "YYYY-MM-DD"
    eventName: string;
}

interface PortfolioState {
    holdings: Holding[];
    portfolioSummary: PortfolioSummary;
    chartData: ChartData;
    marketHolidays: Set<string>;
    chartRangeStatus: Record<'1W' | '1M' | '6M' | '1Y', 'idle' | 'loading' | 'success' | 'error'>;
    isLoading: boolean;
    registrationDate: Date | null;
    setLoading: (isLoading: boolean) => void;
    fetchMarketHolidays: () => Promise<void>;
    updateLivePrices: () => Promise<void>;
    updateChartHistory: () => Promise<void>;
    fetchChartData: (range: '1W' | '1M' | '6M' | '1Y') => Promise<void>;
    executeTrade: (trade: { symbol: string, qty: number, price: number, description: string }) => { success: boolean, error?: string };
    loadInitialData: (holdings: Holding[], summary: PortfolioSummary | null, registrationDate: Date) => void;
    resetPortfolio: () => void;
}

const defaultSummary: PortfolioSummary = {
    totalValue: 0,
    todaysChange: 0,
    totalGainLoss: 0,
    annualRatePercent: 0,
};

const defaultChartData: ChartData = {
    '1W': [], '1M': [], '6M': [], '1Y': [],
};

// --- Finnhub API Integration ---
const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY as string;

const fetchHolidaysFromFinnhub = async (): Promise<Set<string>> => {
    if (!API_KEY) {
        console.error("Finnhub API key is not configured. Market holidays will not be accurate.");
        return new Set();
    }
    try {
        const res = await fetch(`https://finnhub.io/api/v1/stock/market-holiday?exchange=US&token=${API_KEY}`);
        if (!res.ok) {
            throw new Error(`Finnhub API error: ${res.statusText}`);
        }
        const responseData = await res.json();
        const holidays: MarketHoliday[] = responseData.data;

        if (!Array.isArray(holidays)) {
            console.error("Finnhub holiday API did not return an array in the 'data' field.", responseData);
            return new Set();
        }

        return new Set(holidays.map(h => h.atDate));
    } catch (error) {
        console.error("Failed to fetch market holidays:", error);
        return new Set(); // Return empty set on error
    }
};

const fetchHistoricalPrices = async (symbol: string, from: number, to: number): Promise<{ t: number[], c: number[] } | null> => {
    if (!API_KEY) return null;
    try {
        const resolution = 'D'; // Daily candles
        const res = await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${API_KEY}`);
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        if (data.s === 'ok' && data.t && data.c) {
            return { t: data.t, c: data.c };
        }
        return null;
    } catch (error) {
        console.error(`Failed to fetch history for ${symbol}:`, error);
        return null;
    }
};

const reconstructPortfolioHistory = async (
    transactions: Transaction[],
    startDate: Date,
    targetPoints: number,
    currentPrices: Record<string, number>
): Promise<ChartDataPoint[]> => {
    if (transactions.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nowTs = Date.now();

    // 1. Build Price Anchors for each symbol
    // Anchors = Transactions + Current Price
    const priceAnchors: Record<string, { time: number, price: number }[]> = {};
    const symbols = Array.from(new Set(transactions.map(t => t.symbol)));

    symbols.forEach(symbol => {
        const symbolTx = transactions.filter(t => t.symbol === symbol).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        const anchors: { time: number, price: number }[] = [];

        // Add transaction points
        symbolTx.forEach(tx => {
            anchors.push({
                time: new Date(tx.timestamp).getTime(),
                price: tx.price
            });
        });

        // Add today's current price as the final anchor
        if (currentPrices[symbol]) {
            anchors.push({
                time: nowTs,
                price: currentPrices[symbol]
            });
        } else if (anchors.length > 0) {
            // Fallback: if no current price, assume flat from last transaction
            anchors.push({
                time: nowTs,
                price: anchors[anchors.length - 1].price
            });
        }

        // Deduplicate timestamps (keep latest price for same timestamp)
        // Sort just in case
        priceAnchors[symbol] = anchors.sort((a, b) => a.time - b.time);
    });

    // Helper: Interpolate price at time t
    const getPriceAtTime = (symbol: string, t: number): number => {
        const anchors = priceAnchors[symbol];
        if (!anchors || anchors.length === 0) return 0;

        // If t is before first anchor, use first anchor price
        if (t <= anchors[0].time) return anchors[0].price;
        // If t is after last anchor, use last anchor price
        if (t >= anchors[anchors.length - 1].time) return anchors[anchors.length - 1].price;

        // Find anchors surrounding t
        for (let i = 0; i < anchors.length - 1; i++) {
            const p1 = anchors[i];
            const p2 = anchors[i + 1];
            if (t >= p1.time && t <= p2.time) {
                // Linear interpolation
                const range = p2.time - p1.time;
                if (range === 0) return p2.price;
                const progress = (t - p1.time) / range;
                return p1.price + (p2.price - p1.price) * progress;
            }
        }
        return anchors[anchors.length - 1].price;
    };

    // 2. Replay history day by day from startDate to today
    const dailyValues: { date: Date, value: number }[] = [];

    // Portfolio state tracking
    const currentPortfolio: Record<string, number> = {};
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    let txIndex = 0;

    // Fast-forward portfolio state to startDate
    // Warning: logic duplicated from previous version, optimized?
    // Ideally we assume portfolio at startDate starts from 0 calculation or replay all.
    // Let's replay logic exactly as before for quantity.

    // Better: Replay ALL transactions to determine Qty curve, and simply sample at daily intervals.

    // Iterate daily from startDate
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
        // Use Noon or End of Day? Or Midnight?
        // Interpolation works for any time.
        // Transactions usually have timestamps.
        // Consistent: Midnight of that day.
        const dayTime = d.getTime();

        // Catch up transactions for this day
        while (txIndex < sortedTransactions.length) {
            const tx = sortedTransactions[txIndex];
            const txTime = new Date(tx.timestamp).getTime();
            // If tx happened ON this day (before next day), include it?
            // Simple check: if txTime <= dayTime.
            if (txTime <= dayTime) {
                const qtyChange = tx.action === 'buy' ? tx.quantity : -tx.quantity;
                currentPortfolio[tx.symbol] = (currentPortfolio[tx.symbol] || 0) + qtyChange;
                txIndex++;
            } else {
                break;
            }
        }

        // Calculate Value
        let dayValue = 0;
        for (const [symbol, qty] of Object.entries(currentPortfolio)) {
            if (qty > 0) {
                const price = getPriceAtTime(symbol, dayTime);
                dayValue += qty * price;
            }
        }

        dailyValues.push({
            date: new Date(dayTime),
            value: Number(dayValue.toFixed(2))
        });
    }

    // Add "Now" point if not covered (usually loop covers today 00:00, but we want live value at end)
    const lastVal = dailyValues[dailyValues.length - 1];
    if (lastVal) {
        // Update the last point to be NOW instead of midnight?
        // Or append a point?
        // Let's Just Update the last point to NOW's value/time if it's "Today"
        if (lastVal.date.toDateString() === today.toDateString()) {
            // Catch up remaining transactions for today
            while (txIndex < sortedTransactions.length) {
                const tx = sortedTransactions[txIndex];
                const qtyChange = tx.action === 'buy' ? tx.quantity : -tx.quantity;
                currentPortfolio[tx.symbol] = (currentPortfolio[tx.symbol] || 0) + qtyChange;
                txIndex++;
            }

            let nowValue = 0;
            for (const [symbol, qty] of Object.entries(currentPortfolio)) {
                if (qty > 0) {
                    // Use the explicit current price anchor (which is at nowTs)
                    const price = getPriceAtTime(symbol, nowTs);
                    nowValue += qty * price;
                }
            }
            lastVal.value = Number(nowValue.toFixed(2));
            // lastVal.date is still midnight date object, but value is fresh.
        }
    }

    // 4. Downsampling
    if (dailyValues.length <= targetPoints) {
        return dailyValues.map(v => ({
            date: v.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: v.value
        }));
    }

    const sampledData: ChartDataPoint[] = [];
    const step = (dailyValues.length - 1) / (targetPoints - 1);

    for (let i = 0; i < targetPoints; i++) {
        const index = Math.round(i * step);
        const v = dailyValues[Math.min(index, dailyValues.length - 1)];
        sampledData.push({
            date: v.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: v.value
        });
    }

    return sampledData;
};

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
    holdings: [],
    portfolioSummary: { ...defaultSummary },
    marketHolidays: new Set(),
    chartData: { ...defaultChartData },
    chartRangeStatus: { '1W': 'idle', '1M': 'idle', '6M': 'idle', '1Y': 'idle' },
    isLoading: true,
    registrationDate: null,

    setLoading: (isLoading) => set({ isLoading }),

    fetchMarketHolidays: async () => {
        if (get().marketHolidays.size === 0) {
            const holidays = await fetchHolidaysFromFinnhub();
            set({ marketHolidays: holidays });
        }
    },

    updateLivePrices: async () => {
        const holdings = get().holdings;
        if (holdings.length === 0 || !API_KEY) return;

        try {
            const updatedHoldings = await Promise.all(
                holdings.map(async (holding) => {
                    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${holding.symbol}&token=${API_KEY}`);
                    if (!res.ok) return holding;
                    const data = await res.json();
                    if (data && typeof data.c !== 'undefined') {
                        return {
                            ...holding,
                            currentPrice: data.c,
                            todaysChange: data.d,
                            todaysChangePercent: data.dp,
                        };
                    }
                    return holding;
                })
            );

            const newSummary = calculatePortfolioSummary(updatedHoldings);
            set(state => ({
                holdings: updatedHoldings,
                portfolioSummary: newSummary,
            }));
            // We don't verify chart history here anymore, explicit fetch needed
            // OR we can update the active range.
            // Let's stick to explicit fetch.
        } catch (error) {
            console.error("Error updating live prices:", error);
        }
    },

    fetchChartData: async (range: '1W' | '1M' | '6M' | '1Y') => {
        const { chartRangeStatus, chartData, holdings } = get();

        // If already loaded or loading, do nothing (unless forced refresh needed?)
        // For now, simple caching.
        if (chartRangeStatus[range] === 'success' || chartRangeStatus[range] === 'loading') {
            return;
        }

        set(state => ({
            chartRangeStatus: { ...state.chartRangeStatus, [range]: 'loading' }
        }));

        try {
            // Ensure we have current prices for interpolation!
            // If holdings are stale or empty prices, try updateLivePrices first?
            // But updateLivePrices is async and sets state.
            // Let's just use what we have, or trigger a price update if we suspect they are empty?
            // User likely calls loadInitialData -> updateLivePrices.

            // Collect current prices from holdings state
            const currentPrices: Record<string, number> = {};
            holdings.forEach(h => {
                if (h.currentPrice) currentPrices[h.symbol] = h.currentPrice;
            });

            const transactions = useTransactionStore.getState().transactions;
            const now = new Date();
            let startDate = new Date();
            let targetPoints = 7;

            switch (range) {
                case '1W':
                    startDate.setDate(now.getDate() - 7);
                    targetPoints = 7;
                    break;
                case '1M':
                    startDate.setMonth(now.getMonth() - 1);
                    targetPoints = 10;
                    break;
                case '6M':
                    startDate.setMonth(now.getMonth() - 6);
                    targetPoints = 21;
                    break;
                case '1Y':
                    startDate.setFullYear(now.getFullYear() - 1);
                    targetPoints = 24;
                    break;
            }

            // Ensure we don't go before registration/first transaction if desired,
            // but reconstructPortfolioHistory handles empty periods correctly (flat 0 or initial buy).
            // Actually, we should check if first transaction is *after* startDate.
            // If so, maybe clamp startDate? Or just let it be 0 until then.
            // Let it be 0.

            const data = await reconstructPortfolioHistory(transactions, startDate, targetPoints, currentPrices);

            set(state => ({
                chartData: { ...state.chartData, [range]: data },
                chartRangeStatus: { ...state.chartRangeStatus, [range]: 'success' }
            }));

        } catch (error) {
            console.error(`Failed to fetch chart data for ${range}:`, error);
            set(state => ({
                chartRangeStatus: { ...state.chartRangeStatus, [range]: 'error' }
            }));
        }
    },

    updateChartHistory: async () => {
        // Deprecated / Legacy support or specific refresh
        // Now just refetches 1W to ensure immediate view is up to date
        await get().fetchChartData('1W');
    },


    loadInitialData: async (holdings, summary, registrationDate) => {
        const { updateLivePrices, fetchChartData } = get();
        const initialSummary = summary || calculatePortfolioSummary(holdings);

        set({
            holdings: holdings,
            portfolioSummary: initialSummary,
            registrationDate: registrationDate,
            isLoading: false,
        });

        // Only fetch 1W initially
        await fetchChartData('1W');

        if (holdings.length > 0) {
            updateLivePrices();
        }
    },

    resetPortfolio: () => {
        set({
            holdings: [],
            portfolioSummary: { ...defaultSummary },
            chartData: { ...defaultChartData },
            chartRangeStatus: { '1W': 'idle', '1M': 'idle', '6M': 'idle', '1Y': 'idle' },
            registrationDate: null,
            isLoading: true,
        });
    },

    executeTrade: (trade) => {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, error: "You must be logged in to trade." };
        }

        const currentHoldings = get().holdings;
        const existingHoldingIndex = currentHoldings.findIndex(h => h.symbol === trade.symbol);
        let newHoldings = [...currentHoldings];

        if (existingHoldingIndex > -1) {
            const existingHolding = newHoldings[existingHoldingIndex];
            const newQty = existingHolding.qty + trade.qty;

            if (newQty < 0) {
                return { success: false, error: "You cannot sell more shares than you own." };
            }

            if (newQty === 0) {
                newHoldings.splice(existingHoldingIndex, 1);
            } else {
                const newPurchasePrice = trade.qty > 0
                    ? ((existingHolding.purchasePrice * existingHolding.qty) + (trade.price * trade.qty)) / newQty
                    : existingHolding.purchasePrice;

                newHoldings[existingHoldingIndex] = {
                    ...existingHolding,
                    qty: newQty,
                    purchasePrice: newPurchasePrice,
                    currentPrice: trade.price, // Update with the latest trade price
                };
            }
        } else {
            if (trade.qty < 0) {
                return { success: false, error: "You cannot sell shares you do not own." };
            }
            const newHolding: Holding = {
                symbol: trade.symbol,
                description: trade.description,
                currentPrice: trade.price,
                purchasePrice: trade.price,
                qty: trade.qty,
                todaysChange: 0,
                todaysChangePercent: 0,
                annualRatePercent: 0,
            };
            newHoldings.push(newHolding);
        }

        const newSummary = calculatePortfolioSummary(newHoldings);
        const newTransaction: Transaction = {
            symbol: trade.symbol,
            action: trade.qty > 0 ? 'buy' : 'sell',
            quantity: Math.abs(trade.qty),
            price: trade.price,
            timestamp: new Date().toISOString(),
        };

        const userDocRef = doc(getFirestore(), "users", user.uid);
        updateDoc(userDocRef, {
            "portfolio.holdings": newHoldings,
            "portfolio.summary": newSummary,
            "transactions": arrayUnion(newTransaction)
        }).catch(error => {
            console.error("Failed to update portfolio in Firestore:", error);
        });

        // Add to local transaction store immediately for UI update
        useTransactionStore.getState().addTransaction(newTransaction);

        set(state => ({
            holdings: newHoldings,
            portfolioSummary: newSummary,
            isLoading: false // Ensure loading is false after trade
        }));

        // Update chart with new transaction
        get().updateChartHistory();

        return { success: true };
    }
}));

const calculatePortfolioSummary = (holdings: Holding[]): PortfolioSummary => {
    if (holdings.length === 0) {
        return { ...defaultSummary };
    }
    const summary = holdings.reduce((acc, holding) => {
        const holdingValue = holding.qty * holding.currentPrice;
        const gainLoss = (holding.currentPrice - holding.purchasePrice) * holding.qty;

        acc.totalValue += holdingValue;
        acc.todaysChange += (holding.todaysChange || 0) * holding.qty; // Use live todaysChange
        acc.totalGainLoss += gainLoss;
        return acc;
    }, { totalValue: 0, todaysChange: 0, totalGainLoss: 0, annualRatePercent: 0 });

    if (summary.totalValue > 0) {
        const weightedAnnualRate = holdings.reduce((acc, holding) => {
            const holdingValue = holding.qty * holding.currentPrice;
            if (holdingValue > 0) {
                return acc + (holding.annualRatePercent * (holdingValue / summary.totalValue));
            }
            return acc;
        }, 0);
        summary.annualRatePercent = weightedAnnualRate;
    }

    return summary;
};
