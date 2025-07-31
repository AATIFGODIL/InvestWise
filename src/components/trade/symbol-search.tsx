
"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface SymbolSearchProps {
  onSymbolSelect: (symbol: string, price: number) => void;
  onClear: () => void;
}

// This is a placeholder for a real API call.
const fetchSymbols = async (query: string) => {
  const mockSymbols = [
    // Tech
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corp." },
    { symbol: "GOOGL", name: "Alphabet Inc. (Class A)" },
    { symbol: "GOOG", name: "Alphabet Inc. (Class C)" },
    { symbol: "AMZN", name: "Amazon.com, Inc." },
    { symbol: "NVDA", name: "NVIDIA Corp." },
    { symbol: "META", name: "Meta Platforms, Inc." },
    { symbol: "TSLA", name: "Tesla, Inc." },
    { symbol: "AVGO", name: "Broadcom Inc." },
    { symbol: "ASML", name: "ASML Holding N.V." },
    { symbol: "ADBE", name: "Adobe Inc." },
    { symbol: "CRM", name: "Salesforce, Inc." },
    { symbol: "AMD", name: "Advanced Micro Devices, Inc." },
    { symbol: "INTC", name: "Intel Corp." },
    { symbol: "ORCL", name: "Oracle Corp." },
    { symbol: "QCOM", name: "QUALCOMM Inc." },
    { symbol: "CSCO", name: "Cisco Systems, Inc." },
    { symbol: "IBM", name: "International Business Machines Corp." },
    // Financials
    { symbol: "JPM", name: "JPMorgan Chase & Co." },
    { symbol: "V", name: "Visa Inc." },
    { symbol: "MA", name: "Mastercard Inc." },
    { symbol: "BAC", name: "Bank of America Corp." },
    { symbol: "WFC", name: "Wells Fargo & Co." },
    { symbol: "GS", name: "The Goldman Sachs Group, Inc." },
    { symbol: "MS", name: "Morgan Stanley" },
    { symbol: "BLK", name: "BlackRock, Inc." },
    { symbol: "AXP", name: "American Express Co." },
    // Healthcare
    { symbol: "LLY", name: "Eli Lilly and Co." },
    { symbol: "UNH", name: "UnitedHealth Group Inc." },
    { symbol: "JNJ", name: "Johnson & Johnson" },
    { symbol: "MRK", name: "Merck & Co., Inc." },
    { symbol: "ABBV", name: "AbbVie Inc." },
    { symbol: "PFE", name: "Pfizer Inc." },
    { symbol: "TMO", name: "Thermo Fisher Scientific Inc." },
    { symbol: "DHR", name: "Danaher Corp." },
    // Consumer Discretionary & Staples
    { symbol: "WMT", name: "Walmart Inc." },
    { symbol: "PG", name: "The Procter & Gamble Co." },
    { symbol: "COST", name: "Costco Wholesale Corp." },
    { symbol: "KO", name: "The Coca-Cola Co." },
    { symbol: "PEP", name: "PepsiCo, Inc." },
    { symbol: "MCD", name: "McDonald's Corp." },
    { symbol: "NKE", name: "NIKE, Inc." },
    { symbol: "HD", name: "The Home Depot, Inc." },
    { symbol: "SBUX", name: "Starbucks Corp." },
    // Industrials & Energy
    { symbol: "XOM", name: "Exxon Mobil Corp." },
    { symbol: "CVX", name: "Chevron Corp." },
    { symbol: "CAT", name: "Caterpillar Inc." },
    { symbol: "BA", name: "The Boeing Co." },
    { symbol: "GE", name: "General Electric Co." },
    { symbol: "UPS", name: "United Parcel Service, Inc." },
    // Other notable stocks
    { symbol: "DIS", name: "The Walt Disney Co." },
    { symbol: "NFLX", name: "Netflix, Inc." },
    { symbol: "BABA", name: "Alibaba Group Holding Ltd." },
    { symbol: "TM", name: "Toyota Motor Corp." },
    { symbol: "SONY", name: "Sony Group Corp." },
  ];

  if (!query) return [];

  const lowercasedQuery = query.toLowerCase();
  const results = mockSymbols.filter(
    s =>
      s.symbol.toLowerCase().includes(lowercasedQuery) ||
      s.name.toLowerCase().includes(lowercasedQuery)
  );

  // Simulate fetching a "live" price
  return results.map(s => ({
    ...s,
    // Generate a pseudo-random price for demonstration
    price: parseFloat((100 + Math.random() * 400).toFixed(2))
  }));
};

export default function SymbolSearch({ onSymbolSelect, onClear }: SymbolSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ symbol: string; name: string; price: number }[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const performSearch = async () => {
        if (query) {
            const symbols = await fetchSymbols(query);
            setResults(symbols);
        } else {
            setResults([]);
            onClear();
        }
    }
    performSearch();
  }, [query, onClear]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleSelectSymbol = (symbol: { symbol: string, name: string, price: number }) => {
    setQuery(`${symbol.symbol} - ${symbol.name}`);
    onSymbolSelect(symbol.symbol, symbol.price);
    setResults([]);
    setIsFocused(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value)
  };

  const handleInputClick = () => {
      setIsFocused(true);
      const input = document.getElementById("symbol-search") as HTMLInputElement;
      if (input) {
          input.select();
      }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold uppercase tracking-wider text-muted-foreground">Symbol Lookup</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative" ref={searchContainerRef}>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="symbol-search"
              placeholder="Search for a stock..."
              className="pl-10"
              value={query}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onClick={handleInputClick}
              autoComplete="off"
            />
          </div>
          {isFocused && results.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
              <ul>
                {results.map(s => (
                  <li
                    key={s.symbol}
                    className="px-4 py-2 hover:bg-accent cursor-pointer"
                    onClick={() => handleSelectSymbol(s)}
                  >
                    <div className="font-bold">{s.symbol}</div>
                    <div className="text-sm text-muted-foreground">{s.name}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

