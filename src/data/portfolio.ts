
'use client';
import { useMemo } from 'react';

export const holdings = [
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

export const usePortfolioData = () => {
    const portfolioSummary = useMemo(() => {
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
                return acc + (holding.annualRatePercent * (holdingValue / summary.totalValue));
            }, 0);
            summary.annualRatePercent = weightedAnnualRate;
        }
        
        return summary;

    }, []);

    const chartData = useMemo(() => {
        const finalValue = portfolioSummary.totalValue;
        const fridayValue = finalValue - 50;
        return {
            '1W': [
                { date: "July 14, 2025", value: finalValue - 250 },
                { date: "July 15, 2025", value: finalValue - 180 },
                { date: "July 16, 2025", value: finalValue - 210 },
                { date: "July 17, 2025", value: finalValue - 120 },
                { date: "July 18, 2025", value: fridayValue },
                { date: "July 19, 2025", value: fridayValue },
                { date: "July 20, 2025", value: fridayValue },
            ],
            '1M': [
                { date: "June 23, 2025", value: finalValue - 590 },
                { date: "June 30, 2025", value: finalValue - 480 },
                { date: "July 07, 2025", value: finalValue - 390 },
                { date: "July 14, 2025", value: finalValue - 250 },
                { date: "July 19, 2025", value: fridayValue },
                { date: "July 20, 2025", value: fridayValue },
            ],
            '6M': [
                { date: "January 20, 2025", value: finalValue - 1090 },
                { date: "February 20, 2025", value: finalValue - 790 },
                { date: "March 20, 2025", value: finalValue - 890 },
                { date: "April 21, 2025", value: finalValue - 590 },
                { date: "May 20, 2025", value: finalValue - 490 },
                { date: "June 20, 2025", value: finalValue - 550 },
                { date: "July 19, 2025", value: fridayValue },
                { date: "July 20, 2025", value: fridayValue },
            ],
            '1Y': [
                { date: "July 19, 2024", value: finalValue - 1590 },
                { date: "October 21, 2024", value: finalValue - 1390 },
                { date: "January 20, 2025", value: finalValue - 1090 },
                { date: "April 21, 2025", value: finalValue - 590 },
                { date: "July 19, 2025", value: fridayValue },
                { date: "July 20, 2025", value: fridayValue },
            ]
        };
    }, [portfolioSummary.totalValue]);
    
    return { holdings, portfolioSummary, chartData };
};
