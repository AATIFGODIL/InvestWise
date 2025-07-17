
"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUp, ArrowDown, PlusCircle, MinusCircle, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const holdings = [
  {
    symbol: "NKE",
    description: "Nike, Inc. - Ordinary Shares - Class B",
    currentPrice: 73.04,
    todaysChange: 1.52,
    todaysChangePercent: 2.13,
    purchasePrice: 107.29,
    qty: 100,
  },
  {
    symbol: "AAPL",
    description: "Apple Inc. - Common Stock",
    currentPrice: 214.29,
    todaysChange: -2.51,
    todaysChangePercent: -1.16,
    purchasePrice: 190.50,
    qty: 50,
  },
  {
    symbol: "VOO",
    description: "Vanguard S&P 500 ETF",
    currentPrice: 502.88,
    todaysChange: 3.12,
    todaysChangePercent: 0.62,
    purchasePrice: 480.20,
    qty: 25,
  },
];

export default function HoldingsTable() {

  const calculateTotalValue = (qty: number, price: number) => qty * price;
  const calculateGainLoss = (qty: number, currentPrice: number, purchasePrice: number) => (currentPrice - purchasePrice) * qty;

  return (
    <Card>
      <CardContent className="p-0">
        <Tabs defaultValue="stocks">
          <TabsList className="p-2 m-2 bg-muted dark:bg-card">
            <TabsTrigger value="stocks">Stocks & ETFs</TabsTrigger>
            <TabsTrigger value="options" disabled>Options</TabsTrigger>
            <TabsTrigger value="shorts" disabled>Shorts</TabsTrigger>
          </TabsList>
          <TabsContent value="stocks">
            <div className="grid grid-cols-3 gap-4 p-4 border-b dark:border-border/50">
                <div>
                    <p className="text-xs text-muted-foreground">TOTAL VALUE</p>
                    <p className="text-lg font-bold">$7,303.50</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">TODAY'S CHANGE</p>
                    <p className="text-lg font-bold flex items-center gap-1">$93.50 (1.30%) <ArrowUp className="h-4 w-4"/></p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">TOTAL GAIN/LOSS</p>
                    <p className="text-lg font-bold flex items-center gap-1">-$3,425.50 (-31.93%) <ArrowDown className="h-4 w-4"/></p>
                </div>
            </div>
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow className="text-xs uppercase">
                        <TableHead>Symbol</TableHead>
                        <TableHead className="hidden md:table-cell">Description</TableHead>
                        <TableHead className="text-right">Current Price</TableHead>
                        <TableHead className="text-right hidden md:table-cell">Today's Change</TableHead>
                        <TableHead className="text-right hidden lg:table-cell">Purchase Price</TableHead>
                        <TableHead className="text-right hidden lg:table-cell">QTY</TableHead>
                        <TableHead className="text-right hidden md:table-cell">Total Value</TableHead>
                        <TableHead className="text-right">Total Gain/Loss</TableHead>
                        <TableHead className="text-center">Trade Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {holdings.map((holding) => {
                        const totalValue = calculateTotalValue(holding.qty, holding.currentPrice);
                        const gainLoss = calculateGainLoss(holding.qty, holding.currentPrice, holding.purchasePrice);
                        const purchaseValue = holding.purchasePrice * holding.qty;
                        const gainLossPercent = purchaseValue !== 0 ? (gainLoss / purchaseValue) * 100 : 0;
                        const isGain = gainLoss >= 0;

                        return (
                            <TableRow key={holding.symbol}>
                                <TableCell className="font-bold">{holding.symbol}</TableCell>
                                <TableCell className="hidden md:table-cell">{holding.description}</TableCell>
                                <TableCell className="text-right font-medium">${holding.currentPrice.toFixed(2)}</TableCell>
                                <TableCell className={cn("text-right hidden md:table-cell", holding.todaysChange >= 0 ? "text-green-500" : "text-red-500")}>
                                    ${holding.todaysChange.toFixed(2)} ({holding.todaysChangePercent.toFixed(2)}%)
                                </TableCell>
                                <TableCell className="text-right hidden lg:table-cell">${holding.purchasePrice.toFixed(2)}</TableCell>
                                <TableCell className="text-right hidden lg:table-cell">{holding.qty}</TableCell>
                                <TableCell className="text-right hidden md:table-cell font-medium">${totalValue.toFixed(2)}</TableCell>
                                <TableCell className={cn("text-right", isGain ? "text-green-500" : "text-red-500")}>
                                    ${gainLoss.toFixed(2)}
                                    <span className="text-xs"> ({gainLossPercent.toFixed(2)}%)</span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 h-auto p-1">
                                            <PlusCircle className="h-4 w-4 mr-1"/> Buy
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10 h-auto p-1">
                                            <MinusCircle className="h-4 w-4 mr-1"/> Sell
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
                </Table>
            </div>
            <div className="p-4 mt-4">
                <Button className="w-full sm:w-auto" variant="outline">
                    <History className="h-4 w-4 mr-2"/>
                    Trade History
                </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
