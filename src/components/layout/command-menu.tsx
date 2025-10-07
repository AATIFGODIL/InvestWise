
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home,
  Briefcase,
  Repeat,
  BarChart,
  Users,
  BrainCircuit,
  Star,
  PlusCircle,
  MinusCircle,
  Newspaper,
  Loader2,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { useWatchlistStore } from "@/store/watchlist-store";
import { useToast } from "@/hooks/use-toast";
import useLoadingStore from "@/store/loading-store";
import { handleStockPrediction } from "@/app/actions";
import { type StockPredictionOutput } from "@/ai/types/stock-prediction-types";
import { Button } from "../ui/button";
import { stockList } from "@/data/stocks";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY as string;

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  logo?: string;
  marketCap?: number;
  pe?: number;
  nextEarning?: string;
}

interface NewsArticle {
  headline: string;
  source: string;
  url: string;
  datetime: number;
}

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CommandView = "search" | "stock-detail";

const appActions = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Portfolio", href: "/portfolio", icon: Briefcase },
  { name: "Trade", href: "/trade", icon: Repeat },
  { name: "Goals", href: "/goals", icon: BarChart },
  { name: "Community", href: "/community", icon: Users },
];

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { showLoading } = useLoadingStore();
  const { watchlist, addSymbol, removeSymbol } = useWatchlistStore();

  const [view, setView] = useState<CommandView>("search");
  const [query, setQuery] = useState("");
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  
  const [isFetchingStocks, setIsFetchingStocks] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  // --- Data Fetching ---

  useEffect(() => {
    async function fetchAllStockQuotes() {
        if (!open || stocks.length > 0) return;
        if (!API_KEY || API_KEY.startsWith("AIzaSy")) return;

        setIsFetchingStocks(true);
        const promises = stockList.map(async (stock) => {
            try {
                const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${API_KEY}`);
                if (!res.ok) return null;
                const quote = await res.json();
                return {
                    symbol: stock.symbol,
                    name: stock.name,
                    price: quote.c || 0,
                    change: quote.d || 0,
                    changePercent: quote.dp || 0,
                };
            } catch {
                return null;
            }
        });

        const results = (await Promise.all(promises)).filter(Boolean) as StockData[];
        setStocks(results);
        setIsFetchingStocks(false);
    }
    
    fetchAllStockQuotes();
  }, [open, stocks.length]);

  const fetchStockDetails = async (stock: StockData) => {
    if (!API_KEY || API_KEY.startsWith("AIzaSy")) return;
    
    setIsFetchingDetails(true);
    
    // Fetch Profile & News in parallel
    const [profileRes, newsRes] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${stock.symbol}&token=${API_KEY}`),
      fetch(`https://finnhub.io/api/v1/company-news?symbol=${stock.symbol}&from=2023-01-01&to=2024-01-01&token=${API_KEY}`)
    ]);

    let updatedStock = { ...stock };

    if (profileRes.ok) {
      const profile = await profileRes.json();
      updatedStock = {
        ...updatedStock,
        logo: profile.logo,
        marketCap: profile.marketCapitalization,
        pe: profile.metric?.pe,
        nextEarning: profile.earningsCalendar?.[0]?.date,
      };
    }
    
    if (newsRes.ok) {
      const newsData = await newsRes.json();
      setNews(newsData.slice(0, 2)); // Get top 2 articles
    }

    setSelectedStock(updatedStock);
    setIsFetchingDetails(false);
  };

  // --- UI and Action Handlers ---

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    setQuery("");
    setView("search");
    command();
  };
  
  const handleTradeNavigation = (symbol: string) => {
    showLoading();
    router.push(`/trade?symbol=${symbol}`);
  };

  const handleStockSelect = (stockSymbol: string) => {
    const stock = stocks.find(s => s.symbol === stockSymbol);
    if (stock) {
      setView("stock-detail");
      setSelectedStock(stock); // Set basic data immediately
      fetchStockDetails(stock); // Fetch detailed data
    }
  };

  const handleGoBack = () => {
    setView("search");
    setSelectedStock(null);
    setNews([]);
  };

  // Reset view when dialog is closed
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setQuery("");
        setView("search");
        setSelectedStock(null);
        setNews([]);
      }, 150); // Delay to allow animation
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Filtered stocks for search view
  const filteredStocks = useMemo(() => {
    if (!query) return stocks.slice(0, 5); // Show top 5 if no query
    return stocks
      .filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5);
  }, [query, stocks]);


  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
        {view === "stock-detail" && (
            <Button variant="ghost" size="icon" className="mr-2 h-8 w-8" onClick={handleGoBack}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
        )}
        <CommandInput
            placeholder={view === 'search' ? "Search for a stock or action..." : selectedStock?.name}
            value={query}
            onValueChange={setQuery}
            disabled={view === 'stock-detail'}
        />
      </div>

      <CommandList>
        {view === "search" && (
            <>
                {isFetchingStocks && query.length > 0 && (
                    <div className="py-6 text-center text-sm">Loading stocks...</div>
                )}
                {filteredStocks.length === 0 && !isFetchingStocks && <CommandEmpty>No results found.</CommandEmpty>}

                {filteredStocks.length > 0 && (
                <CommandGroup heading="Stocks">
                    {filteredStocks.map((stock) => (
                    <CommandItem
                        key={stock.symbol}
                        onSelect={() => handleStockSelect(stock.symbol)}
                        value={`${stock.symbol} - ${stock.name}`}
                    >
                        <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>{stock.symbol.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{stock.name} ({stock.symbol})</span>
                        </div>
                        <span className="font-mono">${stock.price.toFixed(2)}</span>
                        </div>
                    </CommandItem>
                    ))}
                </CommandGroup>
                )}

                <CommandGroup heading="App Actions">
                    {appActions
                        .filter((action) =>
                        action.name.toLowerCase().includes(query.toLowerCase())
                        )
                        .map((action) => (
                        <CommandItem
                            key={action.href}
                            onSelect={() => runCommand(() => router.push(action.href))}
                        >
                            <action.icon className="mr-2 h-4 w-4" />
                            <span>{action.name}</span>
                        </CommandItem>
                        ))}
                </CommandGroup>
            </>
        )}
        {view === 'stock-detail' && selectedStock && (
            <div className="p-3 text-sm">
                {isFetchingDetails ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Stock Header */}
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                             <Avatar className="h-14 w-14">
                                <AvatarImage src={selectedStock.logo} alt={selectedStock.name} />
                                <AvatarFallback>{selectedStock.symbol.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-lg font-bold">{selectedStock.name}</h3>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-bold">${selectedStock.price.toFixed(2)}</p>
                                    <p className={cn("font-semibold", selectedStock.change >= 0 ? "text-green-500" : "text-red-500")}>
                                        {selectedStock.changePercent.toFixed(2)}%
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Mkt Cap: {(selectedStock.marketCap / 1000).toFixed(1)}T | P/E: {selectedStock.pe?.toFixed(1)} | Next Earnings: {selectedStock.nextEarning || 'N/A'}
                                </p>
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                         <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm" onClick={() => runCommand(() => handleTradeNavigation(selectedStock.symbol))}>
                                <Repeat className="mr-2 h-4 w-4" /> Trade
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => {
                                const isInWatchlist = watchlist.includes(selectedStock.symbol);
                                if (isInWatchlist) { removeSymbol(selectedStock.symbol); toast({description: "Removed from watchlist."}); }
                                else { addSymbol(selectedStock.symbol); toast({description: "Added to watchlist."}); }
                            }}>
                                <Star className={cn("mr-2 h-4 w-4", watchlist.includes(selectedStock.symbol) ? 'text-yellow-400 fill-yellow-400' : '')} /> Watchlist
                            </Button>
                        </div>
                        
                        {/* News Section */}
                        <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2"><Newspaper className="h-4 w-4" /> News & Analysis</h4>
                            <div className="space-y-2">
                                {news.map((article, i) => (
                                    <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" className="block p-2 rounded-md hover:bg-muted">
                                        <p className="font-medium truncate">{article.headline}</p>
                                        <p className="text-xs text-muted-foreground">{article.source}</p>
                                    </a>
                                ))}
                                {news.length === 0 && <p className="text-xs text-muted-foreground p-2">No recent news found.</p>}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        )}
      </CommandList>
    </CommandDialog>
  );
}

    