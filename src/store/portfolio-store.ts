
import { create } from 'zustand';
import { doc, updateDoc, getFirestore } from "firebase/firestore";
import { auth } from '@/lib/firebase/config';

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
    const allTradingDaysData: ChartDataPoint[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentDate = new Date(registrationDate);
    currentDate.setHours(0, 0, 0, 0);

    // 1. Create a list of all valid trading days from registration until today
    const tradingDays: Date[] = [];
    while (currentDate <= today) {
        const dayOfWeek = currentDate.getDay();
        const dateString = currentDate.toISOString().split('T')[0]; // "YYYY-MM-DD"
        
        if (dayOfWeek > 0 && dayOfWeek < 6 && !holidays.has(dateString)) {
            tradingDays.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // 2. Generate the data points based on the list of trading days
    if (tradingDays.length > 0) {
        const numDays = tradingDays.length;
        let currentValue = 0;

        // The first data point is always the first trading day with value 0
        allTradingDaysData.push({
            date: tradingDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: 0.00,
        });

        // If there is more than one trading day, simulate growth
        if (numDays > 1) {
            const increment = totalValue / (numDays - 1);

            for (let i = 1; i < numDays; i++) {
                if (i === numDays - 1) {
                    currentValue = totalValue;
                } else {
                    const noise = (Math.random() - 0.45) * increment * 0.6;
                    currentValue += increment + noise;
                }

                allTradingDaysData.push({
                    date: tradingDays[i].toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    value: Math.max(0, parseFloat(currentValue.toFixed(2))),
                });
            }
        }
        // If there's only one trading day but the user has value (e.g., from a deposit),
        // add a second point for the same day to show the value.
        else if (numDays === 1 && totalValue > 0) {
             allTradingDaysData.push({
                date: tradingDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: totalValue,
            });
        }
    }

    const getRange = (days: number) => allTradingDaysData.slice(-days);

    return {
        '1W': getRange(5),
        '1M': getRange(22),
        '6M': getRange(126),
        '1Y': getRange(252),
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

  loadInitialData: (holdings, summary, registrationDate) => {
    set({ isLoading: true });
    const { marketHolidays } = get();
    const newSummary = summary || calculatePortfolioSummary(holdings);
    const newChartData = generateChartData(newSummary.totalValue, registrationDate, marketHolidays);
    
    set({
      holdings: holdings,
      portfolioSummary: newSummary,
      chartData: newChartData,
      isLoading: false,
    });
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
        todaysChange: 0, // This will be updated by a separate mechanism in a real app
        todaysChangePercent: 0, // This will be updated by a separate mechanism
        annualRatePercent: 0, // Placeholder
      };
      newHoldings.push(newHolding);
    }
    
    // Recalculate summary based on new holdings
    const newSummary = calculatePortfolioSummary(newHoldings);
    
    const userDocRef = doc(getFirestore(), "users", user.uid);
    // Persist changes to Firestore
    updateDoc(userDocRef, { 
        "portfolio.holdings": newHoldings,
        "portfolio.summary": newSummary 
    }).catch(error => {
        console.error("Failed to update portfolio in Firestore:", error);
        // Optionally revert state or show an error to the user
    });
    
    // Update state locally for immediate UI feedback
    set(state => {
        // Here we need the registration date to regenerate the chart correctly.
        // It's not stored in state, so we have to retrieve it or accept a limitation.
        // For now, we'll just update holdings and summary. The chart will update on next full load.
        return {
            holdings: newHoldings,
            portfolioSummary: newSummary
        }
    });

    return { success: true };
  }
}));

// This function calculates the portfolio summary based on the current state of holdings.
const calculatePortfolioSummary = (holdings: Holding[]): PortfolioSummary => {
    if (holdings.length === 0) {
        return { ...defaultSummary };
    }
    const summary = holdings.reduce((acc, holding) => {
        const holdingValue = holding.qty * holding.currentPrice;
        const gainLoss = (holding.currentPrice - holding.purchasePrice) * holding.qty;
        
        acc.totalValue += holdingValue;
        // Today's change is simulated and should ideally come from a live data feed per holding
        acc.todaysChange += holding.todaysChange * holding.qty;
        acc.totalGainLoss += gainLoss;
        return acc;
    }, { totalValue: 0, todaysChange: 0, totalGainLoss: 0, annualRatePercent: 0 });

    // Calculate weighted average for the portfolio's annual return
    if (summary.totalValue > 0) {
        const weightedAnnualRate = holdings.reduce((acc, holding) => {
            const holdingValue = holding.qty * holding.currentPrice;
            if (holdingValue > 0) {
                 // Weight of this holding in the portfolio * its annual rate
                 return acc + (holding.annualRatePercent * (holdingValue / summary.totalValue));
            }
            return acc;
        }, 0);
        summary.annualRatePercent = weightedAnnualRate;
    }
    
    return summary;
};
