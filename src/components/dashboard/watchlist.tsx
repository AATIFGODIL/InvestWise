
"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Loader2, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { useWatchlistStore } from "@/store/watchlist-store";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import Link from "next/link";
import useLoadingStore from "@/store/loading-store";

const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY as string;

interface WatchlistItemData {
    symbol: string;
    price: number | null;
    change: number | null;
    changePercent: number | null;
}

export default function Watchlist() {
    const { watchlist, removeSymbol } = useWatchlistStore();
    const { toast } = useToast();
    const { showLoading } = useLoadingStore();
    const [isLoading, setIsLoading] = useState(false);
    const [watchlistData, setWatchlistData] = useState<WatchlistItemData[]>([]);

    useEffect(() => {
        const fetchWatchlistData = async () => {
            if (watchlist.length === 0) {
                setWatchlistData([]);
                return;
            }
            setIsLoading(true);

            if (!API_KEY) {
                console.error("Finnhub API key not configured. Using simulated data for watchlist.");
                const simulatedData = watchlist.map(symbol => ({
                    symbol,
                    price: parseFloat((Math.random() * 500).toFixed(2)),
                    change: parseFloat((Math.random() * 10 - 5).toFixed(2)),
                    changePercent: parseFloat((Math.random() * 5 - 2.5).toFixed(2)),
                }));
                setWatchlistData(simulatedData);
                setIsLoading(false);
                return;
            }

            const data = await Promise.all(
                watchlist.map(async (symbol) => {
                    try {
                        const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`);
                        if (!res.ok) throw new Error(`Failed for ${symbol}`);
                        const quote = await res.json();
                        return {
                            symbol,
                            price: quote.c,
                            change: quote.d,
                            changePercent: quote.dp,
                        };
                    } catch (error) {
                        console.error(`Error fetching data for ${symbol}:`, error);
                        return { symbol, price: null, change: null, changePercent: null };
                    }
                })
            );
            setWatchlistData(data);
            setIsLoading(false);
        };

        fetchWatchlistData();
    }, [watchlist]);

    const handleRemove = (symbol: string) => {
        removeSymbol(symbol);
        toast({
            description: `${symbol} removed from your watchlist.`,
        });
    };

    const handleTradeClick = (symbol: string) => {
        showLoading();
        window.location.href = `/trade?symbol=${symbol}`;
    }

    if (watchlist.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-primary" />
                        My Watchlist
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-8">
                    <p>Your watchlist is empty.</p>
                    <p className="text-sm">Add stocks from the Trade page to start tracking them.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    My Watchlist
                </CardTitle>
                <CardDescription>Track the performance of stocks you are interested in.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Symbol</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right hidden sm:table-cell">Change</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {watchlistData.map((item) => {
                                const isPositive = item.change !== null && item.change >= 0;
                                return (
                                    <TableRow key={item.symbol}>
                                        <TableCell className="font-bold">{item.symbol}</TableCell>
                                        <TableCell className="text-right font-mono">
                                            {item.price !== null ? `$${item.price.toFixed(2)}` : 'N/A'}
                                        </TableCell>
                                        <TableCell className={cn("text-right hidden sm:table-cell", isPositive ? "text-green-500" : "text-red-500")}>
                                            {item.change !== null && item.changePercent !== null 
                                                ? `${item.change.toFixed(2)} (${item.changePercent.toFixed(2)}%)` 
                                                : 'N/A'
                                            }
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex gap-2 justify-center">
                                                <Button size="sm" onClick={() => handleTradeClick(item.symbol)}>Trade</Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleRemove(item.symbol)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
