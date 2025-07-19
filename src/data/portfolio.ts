
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

export const portfolioSummary = holdings.reduce((acc, holding) => {
    acc.totalValue += calculateTotalValue(holding.qty, holding.currentPrice);
    acc.todaysChange += holding.todaysChange * holding.qty;
    acc.totalGainLoss += calculateGainLoss(holding.qty, holding.currentPrice, holding.purchasePrice);
    return acc;
}, { totalValue: 0, todaysChange: 0, totalGainLoss: 0 });


// Adjusted to make the final value match the calculated totalValue
const finalValue = portfolioSummary.totalValue;

export const chartData = {
    '1W': [
        { date: "2025-07-14", value: finalValue - 250 },
        { date: "2025-07-15", value: finalValue - 250 },
        { date: "2025-07-16", value: finalValue - 200 },
        { date: "2025-07-17", value: finalValue - 300 },
        { date: "2025-07-18", value: finalValue - 150 },
        { date: "2025-07-19", value: finalValue - 100 },
        { date: "2025-07-20", value: finalValue },
    ],
    '1M': [
        { date: "2025-06-21", value: finalValue - 590 },
        { date: "2025-06-28", value: finalValue - 490 },
        { date: "2025-07-05", value: finalValue - 540 },
        { date: "2025-07-12", value: finalValue - 390 },
        { date: "2025-07-20", value: finalValue },
    ],
    '6M': [
        { date: "2025-01-20", value: finalValue - 1090 },
        { date: "2025-02-20", value: finalValue - 790 },
        { date: "2025-03-20", value: finalValue - 890 },
        { date: "2025-04-20", value: finalValue - 590 },
        { date: "2025-05-20", value: finalValue - 490 },
        { date: "2025-07-20", value: finalValue },
    ],
    '1Y': [
        { date: "Jul '24", value: finalValue - 1590 },
        { date: "Oct '24", value: finalValue - 1390 },
        { date: "Jan '25", value: finalValue - 1090 },
        { date: "Apr '25", value: finalValue - 590 },
        { date: "Jul '25", value: finalValue },
    ]
};
