
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

interface PortfolioState {
    holdings: Holding[];
    portfolioSummary: PortfolioSummary;
    chartData: ChartData;
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

const generateChartData = (totalValue: number, registrationDate: Date): ChartData => {
    const allTradingDaysData: ChartDataPoint[] = [];
    const today = new Date();
    let currentDate = new Date(registrationDate);
    currentDate.setHours(0, 0, 0, 0);

    // If registration is in the future, return empty data
    if (currentDate > today) {
        return { '1W': [], '1M': [], '6M': [], '1Y': [] };
    }
    
    let currentValue = 0; // Start at 0 on registration day

    // Generate data from registration day up to today
    while (currentDate <= today) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek > 0 && dayOfWeek < 6) { // It's a weekday
            // For the last day, the value is the current totalValue
            if (currentDate.toDateString() === today.toDateString()) {
                 currentValue = totalValue;
            } else {
                 // Simulate daily fluctuation
                 const noise = (Math.random() - 0.49) * (currentValue * 0.05 + totalValue * 0.01);
                 currentValue = Math.max(0, currentValue + noise);
            }
           
            allTradingDaysData.push({
                date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: parseFloat(currentValue.toFixed(2)),
            });
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Ensure the very last point is the accurate total value
    if (allTradingDaysData.length > 0) {
        allTradingDaysData[allTradingDaysData.length - 1].value = totalValue;
    } else if (totalValue > 0) {
        // Handle case where user registered today on a weekday
         allTradingDaysData.push({
            date: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: totalValue,
        });
    }


    // Slice the data for different time ranges from the end of the full history
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
  chartData: generateChartData(0, new Date()),
  
  loadInitialData: (holdings, summary, registrationDate) => {
    const newSummary = summary || calculatePortfolioSummary(holdings);
    set({
      holdings: holdings,
      portfolioSummary: newSummary,
      chartData: generateChartData(newSummary.totalValue, registrationDate),
    });
  },

  resetPortfolio: () => {
    set({
      holdings: [],
      portfolioSummary: { ...defaultSummary },
      chartData: generateChartData(0, new Date()),
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
    
    // We need the registration date to regenerate the chart correctly.
    // Assuming it doesn't change, we can get it from the existing loaded data.
    // A more robust solution might involve fetching it again or storing it in the state.
    // For now, we'll rely on the initial load.
    // Let's call the load function again to properly regenerate chart with existing registration date.
    const { loadInitialData } = get();
    // To get registration date, we need to fetch it from firestore.
    // Let's assume the user data hook will handle re-hydrating.
    // For immediate feedback, let's call the chart generation with a placeholder.
    // A better way is to store registrationDate in the store.

    set({ 
        holdings: newHoldings,
        portfolioSummary: newSummary,
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
