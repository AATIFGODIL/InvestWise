
"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "../ui/label";

interface SymbolSearchProps {
  onSymbolSelect: (symbol: string | null) => void;
}

const mockSymbols = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "AMZN", name: "Amazon.com, Inc." },
  { symbol: "TSLA", name: "Tesla, Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
];

export default function SymbolSearch({ onSymbolSelect }: SymbolSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ symbol: string; name: string }[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedStock, setSelectedStock] = useState<{ symbol: string; name: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedStock(null); // Clear selected stock when user types
    onSymbolSelect(null); // Hide graph when user starts typing a new query

    if (value.length > 0) {
      const filtered = mockSymbols.filter(
        (s) =>
          s.symbol.toLowerCase().includes(value.toLowerCase()) ||
          s.name.toLowerCase().includes(value.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  };

  const handleSymbolClick = (symbol: { symbol: string; name: string }) => {
    setSelectedStock(symbol);
    setQuery(`${symbol.symbol} ${symbol.name}`);
    onSymbolSelect(symbol.symbol);
    setResults([]);
    setIsFocused(false);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    onSymbolSelect(null);
    setSelectedStock(null);
  };
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (selectedStock) {
        e.target.select();
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold uppercase tracking-wider text-muted-foreground">Symbol Lookup</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Label htmlFor="symbol-search" className="text-sm">Symbol</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1-2 h-5 w-5 text-muted-foreground" />
            <Input
              id="symbol-search"
              placeholder="Look up Symbol/Company Name"
              className="pl-10"
              value={query}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              autoComplete="off"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {isFocused && results.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg">
              <ul className="py-1">
                {results.map((item) => (
                  <li
                    key={item.symbol}
                    className="cursor-pointer px-4 py-2 hover:bg-accent"
                    onClick={() => handleSymbolClick(item)}
                  >
                    <p className="font-bold">{item.symbol}</p>
                    <p className="text-sm text-muted-foreground">{item.name}</p>
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
