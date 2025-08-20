
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
        
        // The API returns the full holiday object, we only need the date string "YYYY-MM-DD"
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
    
    // Create a list of all trading days from registration until today
    const tradingDays: Date[] = [];
    while (currentDate <= today) {
        const dayOfWeek = currentDate.getDay();
        const dateString = currentDate.toISOString().split('T')[0]; // "YYYY-MM-DD"
        
        // Check if it's a weekday (Monday-Friday) and not a market holiday
        if (dayOfWeek > 0 && dayOfWeek < 6 && !holidays.has(dateString)) {
            tradingDays.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if (tradingDays.length > 0) {
        const numDays = tradingDays.length;
        let currentValue = 0;
        
        // Always start with 0 on the first trading day, which is the registration date or the next available trading day
        allTradingDaysData.push({
            date: tradingDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: 0.00,
        });

        if (numDays > 1) {
            // Distribute the total value growth over the remaining trading days
            const increment = totalValue / (numDays - 1);

            for (let i = 1; i < numDays; i++) {
                if (i === numDays - 1) {
                    currentValue = totalValue; // Ensure the last point is the exact total value
                } else {
                    // Simulate a random walk for more realistic chart
                    const noise = (Math.random() - 0.45) * increment * 0.6; 
                    currentValue += increment + noise;
                }
                 allTradingDaysData.push({
                    date: tradingDays[i].toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    value: Math.max(0, parseFloat(currentValue.toFixed(2))),
                });
            }
        } else if (numDays === 1 && totalValue > 0) {
             // If the only trading day is today, show the jump from 0 to current value
            allTradingDaysData.push({
                date: tradingDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: totalValue,
            });
        }
    }

    const getRange = (days: number) => {
        return allTradingDaysData.slice(-days);
    };

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
  chartData: generateChartData(0, new Date(), new Set()),
  
  fetchMarketHolidays: async () => {
    const holidays = await fetchHolidaysFromFinnhub();
    set({ marketHolidays: holidays });
  },

  loadInitialData: (holdings, summary, registrationDate) => {
    const { marketHolidays } = get();
    const newSummary = summary || calculatePortfolioSummary(holdings);
    set({
      holdings: holdings,
      portfolioSummary: newSummary,
      chartData: generateChartData(newSummary.totalValue, registrationDate, marketHolidays),
    });
  },

  resetPortfolio: () => {
    set({
      holdings: [],
      portfolioSummary: { ...defaultSummary },
      chartData: generateChartData(0, new Date(), get().marketHolidays),
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
          currentPrice: trade.price,
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
    
    const userDocRef = doc(getFirestore(), "users", user.uid);
    updateDoc(userDocRef, { 
        "portfolio.holdings": newHoldings,
        "portfolio.summary": newSummary 
    }).catch(console.error);
    
    set(state => {
        // We need the registration date to regenerate the chart correctly.
        // It's not stored in state, so we have to assume a recent date. This is a limitation.
        // For now, we'll just update the holdings and summary.
        // A full re-fetch via useUserData would be the most robust solution.
        return {
            holdings: newHoldings,
            portfolioSummary: newSummary
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
        acc.todaysChange += holding.todaysChange * holding.qty;
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

    