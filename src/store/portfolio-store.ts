
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
    isLoading: boolean;
    registrationDate: Date | null; // Add this
    setLoading: (isLoading: boolean) => void;
    fetchMarketHolidays: () => Promise<void>;
    updateLivePrices: () => Promise<void>;
    updateChartHistory: () => Promise<void>;
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

const reconstructPortfolioHistory = async (transactions: Transaction[], registrationDate: Date): Promise<ChartData> => {
    if (transactions.length === 0) return defaultChartData;

    // 1. Identify universe of symbols and time range
    const symbols = Array.from(new Set(transactions.map(t => t.symbol)));
    // Start from the very first transaction or registration date, whichever is earlier, but practically first transaction matters most for value.
    // Actually, graph should probably start from first transaction.
    const firstTransactionTime = Math.min(...transactions.map(t => new Date(t.timestamp).getTime()));
    // Go back a bit to ensure we cover the start day
    const startTime = Math.floor(firstTransactionTime / 1000) - 86400;
    const endTime = Math.floor(Date.now() / 1000);

    // 2. Fetch history for all symbols
    const priceHistory: Record<string, { [timestamp: number]: number }> = {};

    await Promise.all(symbols.map(async (symbol) => {
        const data = await fetchHistoricalPrices(symbol, startTime, endTime);
        if (data) {
            priceHistory[symbol] = {};
            data.t.forEach((timestamp, index) => {
                // Normalize timestamp to midnight for easier matching
                const date = new Date(timestamp * 1000);
                date.setHours(0, 0, 0, 0);
                priceHistory[symbol][date.getTime()] = data.c[index];
            });
        }
    }));

    // 3. Replay history day by day
    const dailyValues: { date: Date, value: number }[] = [];
    // Start loop from first transaction day
    const startDate = new Date(firstTransactionTime);
    startDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Helper to get holdings at a specific point in time
    // Optimization: Calculate daily deltas? Or just replay everything? 
    // Given the number of days might be small (months), replaying transactions up to that day is fine or maintaining running state.
    // Running state is better.

    const currentPortfolio: Record<string, number> = {}; // Symbol -> Qty
    const lastKnownPrices: Record<string, number> = {}; // Symbol -> Last known price

    // Sort transactions by time
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    let txIndex = 0;

    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
        const dayStart = d.getTime();
        // const dayEnd = dayStart + 86400000; // Not strictly needed if we process transactions before dayStart

        // Apply transactions that happened BEFORE or ON this day
        while (txIndex < sortedTransactions.length) {
            const tx = sortedTransactions[txIndex];
            const txDate = new Date(tx.timestamp);
            txDate.setHours(0, 0, 0, 0); // Normalize transaction date to midnight

            if (txDate.getTime() <= dayStart) {
                const qtyChange = tx.action === 'buy' ? tx.quantity : -tx.quantity;
                currentPortfolio[tx.symbol] = (currentPortfolio[tx.symbol] || 0) + qtyChange;
                // Update last known price for this symbol with transaction price
                lastKnownPrices[tx.symbol] = tx.price;
                txIndex++;
            } else {
                break; // Transactions for future days
            }
        }

        // Calculate value for this day
        let dayValue = 0;
        // let hasPriceData = false; // Not strictly needed for the current logic

        for (const [symbol, qty] of Object.entries(currentPortfolio)) {
            if (qty > 0) {
                let price = 0;
                if (priceHistory[symbol]) {
                    // Try to get price for the exact day
                    if (priceHistory[symbol][dayStart]) {
                        price = priceHistory[symbol][dayStart];
                        lastKnownPrices[symbol] = price; // Update last known price
                    } else {
                        // If no price for exact day (e.g., weekend/holiday), use last known price
                        price = lastKnownPrices[symbol] || 0;
                    }
                } else {
                    // If no historical data for symbol, use last known price (e.g., from transaction)
                    price = lastKnownPrices[symbol] || 0;
                }

                dayValue += qty * price;
            }
        }

        dailyValues.push({
            date: new Date(d),
            value: Number(dayValue.toFixed(2))
        });
    }

    // 4. Slice for ranges
    const formatData = (days: number) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return dailyValues
            .filter(v => v.date >= cutoff)
            .map(v => ({
                date: v.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: v.value
            }));
    };

    return {
        '1W': formatData(7),
        '1M': formatData(30),
        '6M': formatData(180),
        '1Y': formatData(365),
    };
};

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
    holdings: [],
    portfolioSummary: { ...defaultSummary },
    marketHolidays: new Set(),
    chartData: { ...defaultChartData },
    isLoading: true,
    registrationDate: null,

    setLoading: (isLoading) => set({ isLoading }),

    fetchMarketHolidays: async () => {
        // Only fetch if not already fetched
        if (get().marketHolidays.size === 0) {
            const holidays = await fetchHolidaysFromFinnhub();
            set({ marketHolidays: holidays });
        }
    },

    updateLivePrices: async () => {
        const holdings = get().holdings;
        if (holdings.length === 0 || !API_KEY) {
            // No need to fetch if there are no holdings or no API key
            return;
        }

        try {
            const updatedHoldings = await Promise.all(
                holdings.map(async (holding) => {
                    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${holding.symbol}&token=${API_KEY}`);
                    if (!res.ok) {
                        console.error(`Failed to fetch quote for ${holding.symbol}`);
                        return holding; // Return original holding on error
                    }
                    const data = await res.json();
                    if (data && typeof data.c !== 'undefined') {
                        return {
                            ...holding,
                            currentPrice: data.c, // current price
                            todaysChange: data.d, // change
                            todaysChangePercent: data.dp, // percent change
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

            // Trigger history update separately as it is heavy
            usePortfolioStore.getState().updateChartHistory();

        } catch (error) {
            console.error("Error updating live prices:", error);
        }
    },

    updateChartHistory: async () => {
        const transactions = useTransactionStore.getState().transactions;
        const { registrationDate } = get();
        // Only run if we have a registration date (or just default)
        const chartData = await reconstructPortfolioHistory(transactions, registrationDate || new Date());
        set({ chartData });
    },


    loadInitialData: async (holdings, summary, registrationDate) => {
        const { updateLivePrices, updateChartHistory } = get();
        // Use stored summary if available, otherwise calculate from stored holdings
        const initialSummary = summary || calculatePortfolioSummary(holdings);

        set({
            holdings: holdings,
            portfolioSummary: initialSummary,
            registrationDate: registrationDate, // Store the date
            isLoading: false, // Set loading to false after initial data is set
        });

        // Trigger history reconstruction
        await updateChartHistory();

        // Then, trigger the live price update
        if (holdings.length > 0) {
            updateLivePrices();
        }
    },

    resetPortfolio: () => {
        set({
            holdings: [],
            portfolioSummary: { ...defaultSummary },
            chartData: { ...defaultChartData },
            registrationDate: null,
            isLoading: true, // Set to true on reset, will be false after new user data is loaded
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
