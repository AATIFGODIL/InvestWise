
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
    loadInitialData: (holdings: Holding[], summary: PortfolioSummary | null) => void;
    resetPortfolio: () => void;
}

const defaultSummary: PortfolioSummary = {
    totalValue: 0,
    todaysChange: 0,
    totalGainLoss: 0,
    annualRatePercent: 0,
};

const initialHoldings: Holding[] = [
    {
        symbol: "NKE",
        description: "Nike, Inc. - Ordinary Shares - Class B",
        currentPrice: 73.04,
        todaysChange: 1.52,
        todaysChangePercent: 2.13,
        purchasePrice: 107.29,
        qty: 100,
        annualRatePercent: 4.8,
    },
    {
        symbol: "AAPL",
        description: "Apple Inc. - Common Stock",
        currentPrice: 214.29,
        todaysChange: -2.51,
        todaysChangePercent: -1.16,
        purchasePrice: 190.50,
        qty: 50,
        annualRatePercent: 15.2,
    },
    {
        symbol: "VOO",
        description: "Vanguard S&P 500 ETF",
        currentPrice: 502.88,
        todaysChange: 3.12,
        todaysChangePercent: 0.62,
        purchasePrice: 480.20,
        qty: 25,
        annualRatePercent: 12.5,
    },
];

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

const generateChartData = (totalValue: number): ChartData => {
    const generateDateLabel = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    const generateRandomWalk = (days: number, initialValue: number, startDate: Date) => {
        const data = [];
        let currentValue = initialValue;
        let currentDate = new Date(startDate);

        for (let i = 0; i < days; i++) {
            currentDate.setDate(currentDate.getDate() - 1);
            if (currentDate.getDay() === 0 || currentDate.getDay() === 6) { // Skip Sunday (0) and Saturday (6)
                days++; // extend loop to get required number of trading days
                continue;
            }
            data.push({ date: generateDateLabel(currentDate), value: Math.max(0, parseFloat(currentValue.toFixed(2))) });
            currentValue += (Math.random() - 0.5) * (initialValue * 0.05);
        }
        return data.reverse();
    }
    
    const today = new Date();
    
    return {
        '1W': generateRandomWalk(5, totalValue, today),
        '1M': generateRandomWalk(22, totalValue, today),
        '6M': generateRandomWalk(126, totalValue, today),
        '1Y': generateRandomWalk(252, totalValue, today),
    };
};


const usePortfolioStore = create<PortfolioState>((set, get) => ({
  holdings: [],
  portfolioSummary: { ...defaultSummary },
  chartData: generateChartData(0),
  
  loadInitialData: (holdings, summary) => {
    const newSummary = summary || calculatePortfolioSummary(holdings);
    set({
      holdings: holdings,
      portfolioSummary: newSummary,
      chartData: generateChartData(newSummary.totalValue),
    });
  },

  resetPortfolio: () => {
    set({
      holdings: [],
      portfolioSummary: { ...defaultSummary },
      chartData: generateChartData(0),
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
    const newChartData = generateChartData(newSummary.totalValue);

    // Update Firestore
    const userDocRef = doc(getFirestore(), "users", user.uid);
    updateDoc(userDocRef, { 
        "portfolio.holdings": newHoldings,
        "portfolio.summary": newSummary 
    }).catch(console.error);

    set({ 
        holdings: newHoldings,
        portfolioSummary: newSummary,
        chartData: newChartData,
    });

    return { success: true };
  }
}));

export default usePortfolioStore;
