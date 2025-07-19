
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

export const chartData = {
    '1W': [
        { date: "2024-06-24", value: 7200 },
        { date: "2024-06-25", value: 7250 },
        { date: "2024-06-26", value: 7150 },
        { date: "2024-06-27", value: 7300 },
        { date: "2024-06-28", value: 7280 },
        { date: "2024-06-29", value: 7350 },
        { date: "2024-06-30", value: 7303.50 },
    ],
    '1M': [
        { date: "2024-06-01", value: 7000 },
        { date: "2024-06-08", value: 7100 },
        { date: "2024-06-15", value: 7050 },
        { date: "2024-06-22", value: 7200 },
        { date: "2024-06-30", value: 7303.50 },
    ],
    '6M': [
        { date: "2024-01-01", value: 6500 },
        { date: "2024-02-01", value: 6800 },
        { date: "2024-03-01", value: 6700 },
        { date: "2024-04-01", value: 7000 },
        { date: "2024-05-01", value: 7100 },
        { date: "2024-06-30", value: 7303.50 },
    ],
    '1Y': [
        { date: "2023-07-01", value: 6000 },
        { date: "2023-10-01", value: 6200 },
        { date: "2024-01-01", value: 6500 },
        { date: "2024-04-01", value: 7000 },
        { date: "2024-06-30", value: 7303.50 },
    ]
};
