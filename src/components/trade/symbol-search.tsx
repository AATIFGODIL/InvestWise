"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface SymbolSearchProps {
  onSymbolSelect: (symbol: string | null, price: number | null) => void;
}

const mockSymbols = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 214.29 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 179.22 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 447.67 },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', price: 185.57 },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 183.01 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 120.98 },
];

export default function SymbolSearch({ onSymbolSelect }: SymbolSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ symbol: string; name: string; price: number }[]>([]);
  const [selectedSymbolInfo, setSelectedSymbolInfo] = useState<{ symbol: string; name: string; price: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedSymbolInfo(null); 

    if (value.length > 0) {
      const filtered = mockSymbols.filter(
        (item) =>
          item.symbol.toLowerCase().includes(value.toLowerCase()) ||
          item.name.toLowerCase().includes(value.toLowerCase())
      );
      setResults(filtered);
      onSymbolSelect(null, null); // Hide graph when user is typing a new query
    } else {
      setResults([]);
      onSymbolSelect(null, null); // Hide graph when input is cleared
    }
  };

  const handleSelect = (item: { symbol: string; name: string; price: number }) => {
    onSymbolSelect(item.symbol, item.price);
    setSelectedSymbolInfo(item);
    setQuery(`${item.symbol} - ${item.name}`);
    setResults([]);
    if (inputRef.current) {
        inputRef.current.blur(); // Remove focus after selection
    }
  }

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    if(selectedSymbolInfo) {
      e.currentTarget.select();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold uppercase tracking-wider text-muted-foreground">Symbol Lookup</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Label htmlFor="symbol-search" className="text-sm">Symbol</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              id="symbol-search"
              placeholder="Look up Symbol/Company Name"
              className="pl-10"
              value={query}
              onChange={handleSearch}
              onClick={handleInputClick}
              autoComplete="off"
            />
          </div>
          {results.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
              <ul className="py-1">
                {results.map((item) => (
                  <li 
                    key={item.symbol} 
                    className="px-3 py-2 cursor-pointer hover:bg-accent"
                    onClick={() => handleSelect(item)}
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
