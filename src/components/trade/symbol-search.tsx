
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Expanded mock data for a more realistic search experience
const mockSymbols = [
  { symbol: "AAPL", name: "Apple Inc.", price: 172.25 },
  { symbol: "MSFT", name: "Microsoft Corporation", price: 340.54 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 135.99 },
  { symbol: "AMZN", name: "Amazon.com, Inc.", price: 134.25 },
  { symbol: "NVDA", name: "NVIDIA Corporation", price: 469.59 },
  { symbol: "TSLA", name: "Tesla, Inc.", price: 259.46 },
  { symbol: "META", name: "Meta Platforms, Inc.", price: 325.48 },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", price: 155.76 },
  { symbol: "V", name: "Visa Inc.", price: 245.33 },
  { symbol: "JNJ", name: "Johnson & Johnson", price: 160.21 },
  { symbol: "WMT", name: "Walmart Inc.", price: 162.11 },
  { symbol: "PG", name: "Procter & Gamble Company", price: 151.30 },
  { symbol: "DIS", name: "The Walt Disney Company", price: 85.67 },
  { symbol: "PFE", name: "Pfizer Inc.", price: 35.89 },
  { symbol: "BAC", name: "Bank of America Corp", price: 29.55 },
  { symbol: "KO", name: "The Coca-Cola Company", price: 58.90 },
];

interface SymbolSearchProps {
  onSymbolSelect: (symbol: string, price: number) => void;
  onClear: () => void;
}

export default function SymbolSearch({ onSymbolSelect, onClear }: SymbolSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<{ symbol: string; name: string; price: number }[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (term) {
      const filtered = mockSymbols.filter(
        (s) =>
          s.symbol.toLowerCase().includes(term.toLowerCase()) ||
          s.name.toLowerCase().includes(term.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
      onClear();
    }
  }, [onClear]);

  const handleSelect = (symbol: string, name: string, price: number) => {
    setSearchTerm(`${symbol} - ${name}`);
    setResults([]);
    onSymbolSelect(symbol, price);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.currentTarget.select();
    setIsFocused(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold uppercase tracking-wider text-muted-foreground">Symbol Lookup</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="symbol-search"
              placeholder="Search for a stock (e.g., AAPL)"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onClick={handleInputClick}
              autoComplete="off"
            />
          </div>
          {isFocused && results.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {results.map(({ symbol, name, price }) => (
                <div
                  key={symbol}
                  className="px-4 py-2 hover:bg-muted cursor-pointer"
                  onClick={() => handleSelect(symbol, name, price)}
                >
                  <p className="font-bold">{symbol}</p>
                  <p className="text-sm text-muted-foreground">{name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
