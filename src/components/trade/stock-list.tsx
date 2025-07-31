"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StockData } from "@/components/shared/trading-view-ticker-tape";
import { cn } from "@/lib/utils";

interface StockListProps {
  stocks: StockData[];
  onSymbolSelect: (symbol: string, price: number) => void;
}

export default function StockList({ stocks, onSymbolSelect }: StockListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (symbol: string, price: number) => {
    setSelectedSymbol(symbol);
    onSymbolSelect(symbol, price);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Stocks</CardTitle>
        <Input
          placeholder="Search by symbol or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-2"
        />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {filteredStocks.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => handleSelect(stock.symbol, stock.price)}
                className={cn(
                  "flex justify-between items-center p-3 rounded-lg cursor-pointer hover:bg-muted",
                  selectedSymbol === stock.symbol && "bg-muted"
                )}
              >
                <div>
                  <p className="font-bold">{stock.symbol}</p>
                  <p className="text-sm text-muted-foreground">{stock.name}</p>
                </div>
                <p className="font-medium">${stock.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
