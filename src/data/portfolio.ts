

export const holdings = [
  {
    symbol: "NKE",
    description: "Nike, Inc. - Ordinary Shares - Class B",
    currentPrice: 73.04,
    todaysChange: 1.52,
    todaysChangePercent: 2.13,
    purchasePrice: 107.29,
    qty: 100,
  },
  {
    symbol: "AAPL",
    description: "Apple Inc. - Common Stock",
    currentPrice: 214.29,
    todaysChange: -2.51,
    todaysChangePercent: -1.16,
    purchasePrice: 190.50,
    qty: 50,
  },
  {
    symbol: "VOO",
    description: "Vanguard S&P 500 ETF",
    currentPrice: 502.88,
    todaysChange: 3.12,
    todaysChangePercent: 0.62,
    purchasePrice: 480.20,
    qty: 25,
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
const prevValue = finalValue - portfolioSummary.todaysChange;

export const chartData = {
    '1W': [
        { date: "2024-06-24", value: prevValue - 250 },
        { date: "2024-06-25", value: prevValue - 200 },
        { date: "2024-06-26", value: prevValue - 300 },
        { date: "2024-06-27", value: prevValue - 150 },
        { date: "2024-06-28", value: prevValue - 170 },
        { date: "2024-06-29", value: prevValue - 100 },
        { date: "2024-06-30", value: finalValue },
    ],
    '1M': [
        { date: "2024-06-01", value: finalValue - 590 },
        { date: "2024-06-08", value: finalValue - 490 },
        { date: "2024-06-15", value: finalValue - 540 },
        { date: "2024-06-22", value: finalValue - 390 },
        { date: "2024-06-30", value: finalValue },
    ],
    '6M': [
        { date: "2024-01-01", value: finalValue - 1090 },
        { date: "2024-02-01", value: finalValue - 790 },
        { date: "2024-03-01", value: finalValue - 890 },
        { date: "2024-04-01", value: finalValue - 590 },
        { date: "2024-05-01", value: finalValue - 490 },
        { date: "2024-06-30", value: finalValue },
    ],
    '1Y': [
        { date: "2023-07-01", value: finalValue - 1590 },
        { date: "2023-10-01", value: finalValue - 1390 },
        { date: "2024-01-01", value: finalValue - 1090 },
        { date: "2024-04-01", value: finalValue - 590 },
        { date: "2024-06-30", value: finalValue },
    ]
};
