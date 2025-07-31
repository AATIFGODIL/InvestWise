
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface StockData {
  symbol: string;
  name: string;
  price: number;
}

interface SymbolSearchProps {
  onSymbolSelect: (symbol: string, price: number) => void;
  onClear: () => void;
  stockData: StockData[];
}

export default function SymbolSearch({ onSymbolSelect, onClear, stockData }: SymbolSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<StockData[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (term && stockData.length > 0) {
      const filtered = stockData.filter(
        (s) =>
          s.symbol.toLowerCase().includes(term.toLowerCase()) ||
          s.name.toLowerCase().includes(term.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
      if(!term) {
        onClear();
      }
    }
  }, [stockData, onClear]);

  const handleSelect = (symbol: string, name: string, price: number) => {
    setSearchTerm(`${symbol} - ${name}`);
    setResults([]);
    setIsFocused(false);
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
        <div className="text-base font-semibold uppercase tracking-wider text-muted-foreground">Symbol Lookup</div>
      </CardHeader>
      <CardContent>
        <div className="relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="symbol-search"
              placeholder="Search for a stock..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onClick={handleInputClick}
              autoComplete="off"
              disabled={stockData.length === 0}
            />
             {stockData.length === 0 && <p className="text-xs text-muted-foreground mt-2">Loading live stock data...</p>}
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
