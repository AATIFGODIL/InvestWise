
export interface Bundle {
  title: string;
  description: string;
  image?: string;
  hint: string;
  stocks: { name: string; symbol: string }[];
}

export const recommendedBundles: Bundle[] = [
  {
    title: "Tech Starter Pack",
    description: "Invest in leading tech companies with this diversified bundle. Ideal for growth-oriented beginners.",
    image: "https://placehold.co/600x400.png",
    hint: "tech computer",
    stocks: [
      { name: "Apple Inc.", symbol: "AAPL" },
      { name: "Microsoft Corp.", symbol: "MSFT" },
      { name: "Alphabet Inc.", symbol: "GOOGL" },
    ],
  },
  {
    title: "Global Giants",
    description: "A stable collection of well-established international corporations with a history of solid returns.",
    image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    hint: "city skyline",
    stocks: [
      { name: "Procter & Gamble", symbol: "PG" },
      { name: "Johnson & Johnson", symbol: "JNJ" },
      { name: "Coca-Cola Co", symbol: "KO" },
    ],
  },
];

export const specializedBundles: Bundle[] = [
    {
    title: "Green Energy Fund",
    description: "Support a sustainable future by investing in renewable energy and clean technology companies.",
    image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    hint: "solar panels",
    stocks: [
        { name: "NextEra Energy", symbol: "NEE" },
        { name: "SolarEdge Tech", symbol: "SEDG" },
        { name: "Enphase Energy", symbol: "ENPH" },
    ]
  },
  {
    title: "Healthcare Innovators",
    description: "Focus on the future of health with companies in biotechnology and medical research.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    hint: "science laboratory",
     stocks: [
        { name: "Pfizer Inc.", symbol: "PFE" },
        { name: "Eli Lilly and Co", symbol: "LLY" },
        { name: "Vertex Pharma", symbol: "VRTX" },
    ]
  },
  {
    title: "Disruptive Tech",
    description: "High-risk, high-reward bundle focusing on emerging technologies like AI, blockchain, and robotics.",
    image: "https://images.unsplash.com/photo-1677756119517-756a188d2d94?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    hint: "abstract technology",
     stocks: [
        { name: "NVIDIA Corp.", symbol: "NVDA" },
        { name: "UiPath Inc.", symbol: "PATH" },
        { name: "C3.ai, Inc.", symbol: "AI" },
    ]
  },
  {
    title: "Dividend Champions",
    description: "A collection of companies with a long history of consistently paying and increasing their dividends.",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    hint: "stock chart",
     stocks: [
        { name: "Realty Income", symbol: "O" },
        { name: "3M Company", symbol: "MMM" },
        { name: "AT&T Inc.", symbol: "T" },
    ]
  },
];
