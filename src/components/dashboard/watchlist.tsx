
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Loader2, Trash2 } from "lucide-react";
import { useWatchlistStore } from "@/store/watchlist-store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/theme-store";
import TradeDialogCMDK from "../trade/trade-dialog-cmdk";
import { useRouter, usePathname } from "next/navigation";
import { useBottomNavStore } from "@/store/bottom-nav-store";

const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY as string;

interface WatchlistItemData {
    symbol: string;
    price: number | null;
    change: number | null;
    changePercent: number | null;
}

export default function Watchlist() {
    const router = useRouter();
    const pathname = usePathname();
    const { watchlist, removeSymbol } = useWatchlistStore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [watchlistData, setWatchlistData] = useState<WatchlistItemData[]>([]);
    const { isClearMode } = useThemeStore();
    const { setActiveIndex, setSamePageIndex } = useBottomNavStore();

    // State for the trade dialog
    const [isTradeDialogOpen, setIsTradeDialogOpen] = useState(false);
    const [selectedStock, setSelectedStock] = useState<{symbol: string, price: number} | null>(null);

    useEffect(() => {
        const fetchWatchlistData = async () => {
            if (watchlist.length === 0) {
                setWatchlistData([]);
                return;
            }
            setIsLoading(true);

            if (!API_KEY || API_KEY.startsWith("AIzaSy") || API_KEY === "your_finnhub_api_key_here") {
                console.warn("Finnhub API key not configured. Using simulated data for watchlist.");
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

    const handleRemove = (e: React.MouseEvent, symbol: string) => {
        e.stopPropagation(); // Prevent navigation
        removeSymbol(symbol);
        toast({
            description: `${symbol} removed from your watchlist.`,
        });
    };

    const handleTradeClick = (e: React.MouseEvent, item: WatchlistItemData) => {
        e.stopPropagation(); // Prevent navigation
        if (item.price !== null) {
            setSelectedStock({ symbol: item.symbol, price: item.price });
            setIsTradeDialogOpen(true);
        } else {
            toast({
                variant: 'destructive',
                title: "Price Unavailable",
                description: "Cannot trade without a current price."
            });
        }
    };

    const handleRowClick = (symbol: string) => {
        const tradePageIndex = 2; // Index of "Trade"
        const tradeUrl = `/trade?symbol=${symbol}`;
        
        if (pathname === '/trade') {
            setSamePageIndex(tradePageIndex);
            // Using window.location.href ensures a page refresh, which guarantees scrolling to the top.
            window.location.href = tradeUrl;
        } else {
            setActiveIndex(tradePageIndex);
            router.push(tradeUrl);
        }
    };
    
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
        <>
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
                        <div className="space-y-2">
                            {watchlistData.map((item) => {
                                const isPositive = item.change !== null && item.change >= 0;
                                return (
                                    <div
                                        key={item.symbol}
                                        className={cn(
                                            "group p-3 rounded-lg transition-colors border border-transparent cursor-pointer",
                                            "hover:bg-muted/50",
                                            isClearMode ? "hover:border-white/20" : "hover:border-border"
                                        )}
                                        onClick={() => handleRowClick(item.symbol)}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="font-bold">{item.symbol}</div>
                                            <div className="text-right font-mono">
                                                {item.price !== null ? `$${item.price.toFixed(2)}` : 'N/A'}
                                            </div>
                                            <div className={cn("text-right hidden sm:block", isPositive ? "text-green-500" : "text-red-500")}>
                                                {item.change !== null && item.changePercent !== null
                                                    ? `${item.change > 0 ? '+' : ''}${item.change.toFixed(2)} (${item.changePercent.toFixed(2)}%)`
                                                    : 'N/A'
                                                }
                                            </div>
                                            <div className="flex gap-2 justify-center">
                                                <Button size="sm" onClick={(e) => handleTradeClick(e, item)}>Trade</Button>
                                                <Button variant="ghost" size="icon" onClick={(e) => handleRemove(e, item.symbol)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedStock && (
                <TradeDialogCMDK
                    isOpen={isTradeDialogOpen}
                    onOpenChange={setIsTradeDialogOpen}
                    symbol={selectedStock.symbol}
                    price={selectedStock.price}
                    action={"buy"} // Default to 'buy', user can change in the dialog
                />
            )}
        </>
    );
}
