
"use client";

import Link from "next/link";
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
import { ArrowUp, ArrowDown, PlusCircle, MinusCircle, History, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import usePortfolioStore from "@/store/portfolio-store";

export default function HoldingsTable() {
  const { holdings, portfolioSummary } = usePortfolioStore();

  const calculateTotalValue = (qty: number, price: number) => qty * price;
  const calculateGainLoss = (qty: number, currentPrice: number, purchasePrice: number) => (currentPrice - purchasePrice) * qty;

  const isTodaysChangePositive = portfolioSummary.todaysChange >= 0;
  const todaysChangePercent = portfolioSummary.totalValue !== 0 ? (portfolioSummary.todaysChange / (portfolioSummary.totalValue - portfolioSummary.todaysChange)) * 100 : 0;

  const isTotalGainLossPositive = portfolioSummary.totalGainLoss >= 0;
  const totalPurchaseValue = holdings.reduce((acc, h) => acc + (h.purchasePrice * h.qty), 0);
  const totalGainLossPercent = totalPurchaseValue !== 0 ? (portfolioSummary.totalGainLoss / totalPurchaseValue) * 100 : 0;
  
  const isPortfolioAnnualRatePositive = portfolioSummary.annualRatePercent >= 0;


  return (
    <Card>
      <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border-b">
                <div>
                    <p className="text-xs text-muted-foreground">TOTAL VALUE</p>
                    <p className="text-lg font-bold">${portfolioSummary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">TODAY'S CHANGE</p>
                    <p className={cn("text-lg font-bold flex items-center gap-1", isTodaysChangePositive ? 'text-green-500' : 'text-red-500')}>
                        ${portfolioSummary.todaysChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({todaysChangePercent.toFixed(2)}%) 
                        {isTodaysChangePositive ? <ArrowUp className="h-4 w-4"/> : <ArrowDown className="h-4 w-4"/>}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">TOTAL GAIN/LOSS</p>
                     <p className={cn("text-lg font-bold flex items-center gap-1", isTotalGainLossPositive ? 'text-green-500' : 'text-red-500')}>
                        ${portfolioSummary.totalGainLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({totalGainLossPercent.toFixed(2)}%)
                        {isTotalGainLossPositive ? <ArrowUp className="h-4 w-4"/> : <ArrowDown className="h-4 w-4"/>}
                    </p>
                </div>
                 <div>
                    <p className="text-xs text-muted-foreground">PORTFOLIO ANNUAL RETURN</p>
                     <p className={cn("text-lg font-bold flex items-center gap-1", isPortfolioAnnualRatePositive ? 'text-green-500' : 'text-red-500')}>
                        {portfolioSummary.annualRatePercent.toFixed(2)}%
                        {isPortfolioAnnualRatePositive ? <Percent className="h-4 w-4"/> : <Percent className="h-4 w-4"/>}
                    </p>
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
                        <TableHead className="text-right hidden lg:table-cell">QTY</TableHead>
                        <TableHead className="text-right hidden md:table-cell">Total Value</TableHead>
                        <TableHead className="text-right">Total Gain/Loss</TableHead>
                        <TableHead className="text-right">Annual Return %</TableHead>
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
                        const isChangePositive = holding.todaysChange >= 0;
                        const isAnnualRatePositive = holding.annualRatePercent >= 0;

                        return (
                            <TableRow key={holding.symbol}>
                                <TableCell className="font-bold">{holding.symbol}</TableCell>
                                <TableCell className="hidden md:table-cell">{holding.description}</TableCell>
                                <TableCell className="text-right font-medium">${holding.currentPrice.toFixed(2)}</TableCell>
                                <TableCell className={cn("text-right hidden md:table-cell", { "text-green-500": isChangePositive, "text-red-500": !isChangePositive })}>
                                    ${holding.todaysChange.toFixed(2)} ({holding.todaysChangePercent.toFixed(2)}%)
                                </TableCell>
                                <TableCell className="text-right hidden lg:table-cell">{holding.qty}</TableCell>
                                <TableCell className="text-right hidden md:table-cell font-medium">${totalValue.toFixed(2)}</TableCell>
                                <TableCell className={cn("text-right", { "text-green-500": isGain, "text-red-500": !isGain })}>
                                    ${gainLoss.toFixed(2)}
                                    <span className="text-xs"> ({gainLossPercent.toFixed(2)}%)</span>
                                </TableCell>
                                <TableCell className={cn("text-right font-medium", { "text-green-500": isAnnualRatePositive, "text-red-500": !isAnnualRatePositive })}>
                                    {holding.annualRatePercent.toFixed(2)}%
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                        <Button asChild variant="ghost" size="sm" className="text-primary hover:bg-primary/10 h-auto p-1">
                                            <Link href={`/trade?symbol=${holding.symbol}`}>
                                                <PlusCircle className="h-4 w-4 mr-1"/> Buy
                                            </Link>
                                        </Button>
                                        <Button asChild variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 h-auto p-1">
                                            <Link href={`/trade?symbol=${holding.symbol}`}>
                                                <MinusCircle className="h-4 w-4 mr-1"/> Sell
                                            </Link>
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
      </CardContent>
    </Card>
  );
}
