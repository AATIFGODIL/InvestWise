
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

const calculateTotalValue = (qty: number, price: number) => qty * price;
const calculateGainLoss = (qty: number, currentPrice: number, purchasePrice: number) => (currentPrice - purchasePrice) * qty;

const initialSummary = { totalValue: 0, todaysChange: 0, totalGainLoss: 0, annualRatePercent: 0 };

export const portfolioSummary = holdings.reduce((acc, holding) => {
    const holdingValue = calculateTotalValue(holding.qty, holding.currentPrice);
    acc.totalValue += holdingValue;
    acc.todaysChange += holding.todaysChange * holding.qty;
    acc.totalGainLoss += calculateGainLoss(holding.qty, holding.currentPrice, holding.purchasePrice);
    return acc;
}, { ...initialSummary });

if (portfolioSummary.totalValue > 0) {
    const weightedAnnualRate = holdings.reduce((acc, holding) => {
        const holdingValue = calculateTotalValue(holding.qty, holding.currentPrice);
        return acc + (holding.annualRatePercent * (holdingValue / portfolioSummary.totalValue));
    }, 0);
    portfolioSummary.annualRatePercent = weightedAnnualRate;
}


// Adjusted to make the final value match the calculated totalValue
const finalValue = portfolioSummary.totalValue;

export const chartData = {
    '1W': [
        { date: "July 14, 2025", value: finalValue - 250 }, // Monday
        { date: "July 15, 2025", value: finalValue - 180 }, // Tuesday
        { date: "July 16, 2025", value: finalValue - 210 }, // Wednesday
        { date: "July 17, 2025", value: finalValue - 120 }, // Thursday
        { date: "July 18, 2025", value: finalValue - 50 },  // Friday
        { date: "July 19, 2025", value: finalValue - 50 },  // Saturday
        { date: "July 20, 2025", value: finalValue - 50 },  // Sunday -> final value for the week
    ],
    '1M': [
        { date: "June 23, 2025", value: finalValue - 590 },
        { date: "June 24, 2025", value: finalValue - 550 },
        { date: "June 25, 2025", value: finalValue - 570 },
        { date: "June 26, 2025", value: finalValue - 520 },
        { date: "June 27, 2025", value: finalValue - 490 },
        { date: "June 30, 2025", value: finalValue - 480 },
        { date: "July 01, 2025", value: finalValue - 450 },
        { date: "July 02, 2025", value: finalValue - 470 },
        { date: "July 03, 2025", value: finalValue - 420 },
        // July 4th is a holiday
        { date: "July 07, 2025", value: finalValue - 390 },
        { date: "July 08, 2025", value: finalValue - 350 },
        { date: "July 09, 2025", value: finalValue - 370 },
        { date: "July 10, 2025", value: finalValue - 320 },
        { date: "July 11, 2025", value: finalValue - 290 },
        { date: "July 14, 2025", value: finalValue - 250 },
        { date: "July 15, 2025", value: finalValue - 180 },
        { date: "July 16, 2025", value: finalValue - 210 },
        { date: "July 17, 2025", value: finalValue - 120 },
        { date: "July 18, 2025", value: finalValue - 50 },
    ],
    '6M': [
        { date: "January 20, 2025", value: finalValue - 1090 },
        { date: "February 20, 2025", value: finalValue - 790 },
        { date: "March 20, 2025", value: finalValue - 890 },
        { date: "April 21, 2025", value: finalValue - 590 }, // Monday after weekend
        { date: "May 20, 2025", value: finalValue - 490 },
        { date: "June 20, 2025", value: finalValue - 550 },
        { date: "July 18, 2025", value: finalValue - 50 }, 
    ],
    '1Y': [
        { date: "July 19, 2024", value: finalValue - 1590 }, 
        { date: "October 21, 2024", value: finalValue - 1390 }, // Monday
        { date: "January 20, 2025", value: finalValue - 1090 },
        { date: "April 21, 2025", value: finalValue - 590 }, // Monday
        { date: "July 18, 2025", value: finalValue - 50 }, // Friday
    ]
};
