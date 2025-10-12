
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

interface PortfolioSummary {
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
    fetchMarketHolidays: () => Promise<void>;
    updateLivePrices: () => Promise<void>;
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

const generateChartData = (totalValue: number, registrationDate: Date, holidays: Set<string>): ChartData => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Make a copy of the registration date to avoid modifying the original
    const regDate = new Date(registrationDate);
    regDate.setHours(0, 0, 0, 0);

    const generateRangeData = (daysToLookBack: number): ChartDataPoint[] => {
        const rangeStartDate = new Date(today);
        rangeStartDate.setDate(today.getDate() - daysToLookBack + 1);

        const actualStartDate = regDate > rangeStartDate ? regDate : rangeStartDate;

        const tradingDays: Date[] = [];
        let currentDate = new Date(actualStartDate);
        while (currentDate <= today) {
            const dayOfWeek = currentDate.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const dateString = currentDate.toISOString().split('T')[0];
            const isHoliday = holidays.has(dateString);

            if (!isWeekend && !isHoliday) {
                tradingDays.push(new Date(currentDate));
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // If no trading days are found (e.g., registered on a weekend),
        // create a simple two-point line from registration to today.
        if (tradingDays.length <= 1) {
            const chartPoints = [
                {
                    date: regDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    value: 0
                },
                {
                    date: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    value: totalValue
                }
            ];
            // If the dates are the same, just show one point
            if (chartPoints[0].date === chartPoints[1].date) {
                return [chartPoints[1]];
            }
            return chartPoints;
        }

        const totalTradingDaysSinceRegistration = tradingDays.filter(d => d >= regDate).length;
        
        return tradingDays.map((tradeDate, index) => {
            const daysIntoTrading = index + 1;
            const progress = totalTradingDaysSinceRegistration > 0
                ? daysIntoTrading / totalTradingDaysSinceRegistration
                : 1;

            const interpolatedValue = totalValue * progress;

            return {
                date: tradeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: parseFloat(interpolatedValue.toFixed(2)),
            };
        });
    };

    const dayMap: { [key: string]: number } = { '1W': 7, '1M': 30, '6M': 180, '1Y': 365 };

    return {
        '1W': generateRangeData(dayMap['1W']),
        '1M': generateRangeData(dayMap['1M']),
        '6M': generateRangeData(dayMap['6M']),
        '1Y': generateRangeData(dayMap['1Y']),
    };
};

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  holdings: [],
  portfolioSummary: { ...defaultSummary },
  marketHolidays: new Set(),
  chartData: { ...defaultChartData },
  isLoading: true,
  
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

        set(state => {
             // We need the registration date to regenerate the chart correctly.
            // This is a limitation, but for now we'll update summary and holdings.
            // The chart will be based on the new total value but won't reflect historical accuracy of this specific price update.
            const registrationDate = new Date(); // This is a fallback.
            const newChartData = generateChartData(newSummary.totalValue, registrationDate, state.marketHolidays);

            return {
                holdings: updatedHoldings,
                portfolioSummary: newSummary,
                chartData: newChartData
            }
        });

    } catch (error) {
        console.error("Error updating live prices:", error);
    }
  },


  loadInitialData: (holdings, summary, registrationDate) => {
    set({ isLoading: true });
    const { marketHolidays, updateLivePrices } = get();
    // Use stored summary if available, otherwise calculate from stored holdings
    const initialSummary = summary || calculatePortfolioSummary(holdings);
    
    // Generate chart with potentially stale data first for a quick render
    const initialChartData = generateChartData(initialSummary.totalValue, registrationDate, marketHolidays);
    
    set({
      holdings: holdings,
      portfolioSummary: initialSummary,
      chartData: initialChartData,
      isLoading: false, // Set loading to false after initial data is set
    });

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

    set(state => {
        const registrationDate = new Date(); 
        const newChartData = generateChartData(newSummary.totalValue, registrationDate, state.marketHolidays);

        return {
            holdings: newHoldings,
            portfolioSummary: newSummary,
            chartData: newChartData
        }
    });

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
