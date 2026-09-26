// InvestWise - A modern stock trading and investment education platform for young investors

export interface Bundle {
  title: string;
  description: string;
  /** One word for the bundle's character, shown on its tile. */
  tag: string;
  /** Hue of the tile, 0–360. */
  hue: number;
  stocks: { name: string; symbol: string }[];
}

export const recommendedBundles: Bundle[] = [
  {
    title: "Tech Starter Pack",
    tag: "Growth",
    hue: 252,
    description: "Invest in leading tech companies with this diversified bundle. Ideal for growth-oriented beginners.",
    stocks: [
      { name: "Apple Inc.", symbol: "AAPL" },
      { name: "Microsoft Corp.", symbol: "MSFT" },
      { name: "Alphabet Inc.", symbol: "GOOGL" },
    ],
  },
  {
    title: "Global Giants",
    tag: "Steady",
    hue: 208,
    description: "A stable collection of well-established international corporations with a history of solid returns.",
    stocks: [
      { name: "Procter & Gamble", symbol: "PG" },
      { name: "Johnson & Johnson", symbol: "JNJ" },
      { name: "Coca-Cola Co", symbol: "KO" },
    ],
  },
];

export const specializedBundles: Bundle[] = [
    {
    title: "Green Energy Bundle",
    tag: "Sustainable",
    hue: 152,
    description: "Support a sustainable future by investing in renewable energy and clean technology companies.",
    stocks: [
        { name: "NextEra Energy", symbol: "NEE" },
        { name: "SolarEdge Tech", symbol: "SEDG" },
        { name: "Enphase Energy", symbol: "ENPH" },
    ]
  },
  {
    title: "Healthcare Innovators",
    tag: "Innovation",
    hue: 345,
    description: "Focus on the future of health with companies in biotechnology and medical research.",
     stocks: [
        { name: "Pfizer Inc.", symbol: "PFE" },
        { name: "Eli Lilly and Co", symbol: "LLY" },
        { name: "Vertex Pharma", symbol: "VRTX" },
    ]
  },
  {
    title: "Disruptive Tech",
    tag: "High risk",
    hue: 285,
    description: "High-risk, high-reward bundle focusing on emerging technologies like AI, blockchain, and robotics.",
     stocks: [
        { name: "NVIDIA Corp.", symbol: "NVDA" },
        { name: "UiPath Inc.", symbol: "PATH" },
        { name: "C3.ai, Inc.", symbol: "AI" },
    ]
  },
  {
    title: "Dividend Champions",
    tag: "Income",
    hue: 38,
    description: "A collection of companies with a long history of consistently paying and increasing their dividends.",
     stocks: [
        { name: "Realty Income", symbol: "O" },
        { name: "3M Company", symbol: "MMM" },
        { name: "AT&T Inc.", symbol: "T" },
    ]
  },
];
