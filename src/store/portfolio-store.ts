
import { create } from 'zustand';

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
}

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
    const today = new Date();
    const generateDate = (daysAgo: number) => {
        const date = new Date(today);
        date.setDate(today.getDate() - daysAgo);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }

    const generateRandomWalk = (days: number, initialValue: number) => {
        const data = [];
        let currentValue = initialValue;
        for (let i = days - 1; i >= 0; i--) {
            data.push({ date: generateDate(i), value: Math.max(0, currentValue) });
            currentValue += (Math.random() - 0.5) * (initialValue * 0.05);
        }
        return data;
    }
    
    return {
        '1W': generateRandomWalk(7, totalValue),
        '1M': generateRandomWalk(30, totalValue),
        '6M': generateRandomWalk(180, totalValue),
        '1Y': generateRandomWalk(365, totalValue),
    };
};

const usePortfolioStore = create<PortfolioState>((set, get) => ({
  holdings: initialHoldings,
  portfolioSummary: calculatePortfolioSummary(initialHoldings),
  chartData: generateChartData(calculatePortfolioSummary(initialHoldings).totalValue),
  
  executeTrade: (trade) => {
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
        // Calculate new average purchase price for buys
        const newPurchasePrice = trade.qty > 0 
          ? ((existingHolding.purchasePrice * existingHolding.qty) + (trade.price * trade.qty)) / newQty
          : existingHolding.purchasePrice;
          
        newHoldings[existingHoldingIndex] = {
          ...existingHolding,
          qty: newQty,
          purchasePrice: newPurchasePrice,
          currentPrice: trade.price, // Update current price for realism
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
        todaysChange: 0, // Mock data
        todaysChangePercent: 0, // Mock data
        annualRatePercent: 0, // Mock data
      };
      newHoldings.push(newHolding);
    }
    
    const newSummary = calculatePortfolioSummary(newHoldings);
    const newChartData = generateChartData(newSummary.totalValue);

    set({ 
        holdings: newHoldings,
        portfolioSummary: newSummary,
        chartData: newChartData,
    });

    return { success: true };
  }
}));

export default usePortfolioStore;

    