
import { create } from 'zustand';
import { doc, updateDoc, getFirestore } from "firebase/firestore";
import { auth } from '@/lib/firebase/config';

interface Holding {
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

interface ChartData {
    '1W': { date: string, value: number }[];
    '1M': { date: string, value: number }[];
    '6M': { date: string, value: number }[];
    '1Y': { date: string, value: number }[];
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
    const generateDateLabel = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    const generateRandomWalk = (days: number, initialValue: number, startDate: Date) => {
        const data = [];
        let currentValue = initialValue;
        let currentDate = new Date(startDate);

        for (let i = 0; i < days; i++) {
            data.push({ date: generateDateLabel(currentDate), value: Math.max(0, parseFloat(currentValue.toFixed(2))) });
            currentDate.setDate(currentDate.getDate() - 1);
            if (currentDate.getDay() === 0 || currentDate.getDay() === 6) { // Skip Sunday (0) and Saturday (6)
                // Do not increment i, just continue to next day
            }
            currentValue += (Math.random() - 0.5) * (initialValue * 0.05);
        }
        return data.reverse();
    }
    
    const today = new Date();
    const timeRanges = {
        '1W': 7,
        '1M': 30,
        '6M': 180,
        '1Y': 365,
    };

    const generatedData: Partial<ChartData> = {};

    for (const [range, defaultDays] of Object.entries(timeRanges)) {
        const rangeStartDate = new Date(today);
        rangeStartDate.setDate(rangeStartDate.getDate() - defaultDays);

        const chartStartDate = rangeStartDate > registrationDate ? rangeStartDate : registrationDate;
        const daysSinceChartStart = Math.ceil((today.getTime() - chartStartDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysToGenerate = Math.max(1, daysSinceChartStart);
        
        generatedData[range as keyof typeof timeRanges] = generateRandomWalk(daysToGenerate, totalValue, today);
    }

    return generatedData as ChartData;
};


const usePortfolioStore = create<PortfolioState>((set, get) => ({
  holdings: [],
  portfolioSummary: { ...defaultSummary },
  chartData: generateChartData(0, new Date()),
  
  loadInitialData: (holdings, summary, registrationDate) => {
    // User specified a join date of July 29th. We will use this for their chart.
    const hardcodedRegistrationDate = new Date('2024-07-29T12:00:00Z');
    const actualRegistrationDate = registrationDate > hardcodedRegistrationDate ? hardcodedRegistrationDate : registrationDate;

    const newSummary = summary || calculatePortfolioSummary(holdings);
    set({
      holdings: holdings,
      portfolioSummary: newSummary,
      chartData: generateChartData(newSummary.totalValue, actualRegistrationDate),
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

    set({ 
        holdings: newHoldings,
        portfolioSummary: newSummary,
        // Re-generate chart data with the new total value to keep it consistent
        chartData: generateChartData(newSummary.totalValue, new Date()) // Assume we can refetch registration date if needed, for now use today
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


export default usePortfolioStore;
