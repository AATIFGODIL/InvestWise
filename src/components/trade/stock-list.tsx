
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type StockData } from "@/components/shared/trading-view-ticker-tape";
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StockListProps {
  stocks: StockData[];
  onSymbolSelect: (symbol: string, price: number) => void;
}

const StockList: React.FC<StockListProps> = ({ stocks, onSymbolSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStocks = stocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 100); // Limit to 100 results for performance

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
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {filteredStocks.map(stock => {
                const isPositive = stock.price > (stock.price - (Math.random() * 5 - 2.5)); // Simulate change
                return (
                     <div
                        key={stock.symbol}
                        onClick={() => onSymbolSelect(stock.symbol, stock.price)}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
                    >
                        <div>
                            <p className="font-bold text-md">{stock.symbol}</p>
                            <p className="text-xs text-muted-foreground">{stock.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-md">${stock.price.toFixed(2)}</p>
                            <div className={cn("flex items-center justify-end gap-1 text-xs", isPositive ? 'text-green-500' : 'text-red-500')}>
                                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                <span>{(Math.random() * 2.5).toFixed(2)}%</span>
                            </div>
                        </div>
                    </div>
                )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default StockList;
