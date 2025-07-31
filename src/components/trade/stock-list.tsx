
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { StockData } from '../shared/trading-view-ticker-tape';

interface StockListProps {
  stocks: StockData[];
  onSymbolSelect: (symbol: string, price: number) => void;
}

const StockList: React.FC<StockListProps> = ({ stocks, onSymbolSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStocks = stocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Stocks</CardTitle>
        <Input
          placeholder="Search by symbol or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
          <div className="space-y-2">
            {filteredStocks.map(stock => (
              <div
                key={stock.symbol}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer"
                onClick={() => onSymbolSelect(stock.symbol, stock.price)}
              >
                <div>
                  <p className="font-semibold">{stock.symbol}</p>
                  <p className="text-sm text-muted-foreground">{stock.name}</p>
                </div>
                <p className="font-mono text-lg">${stock.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default StockList;
