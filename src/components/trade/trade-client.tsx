
'use client';

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Clock, Star } from "lucide-react";
import TradingViewWidget from "@/components/shared/trading-view-widget";
import TradeForm from "@/components/trade/trade-form";
import TradingViewScreener from "@/components/shared/trading-view-screener";
import AiPredictionTrade from "@/components/ai/ai-prediction-trade";
import InvestmentBundles from "../dashboard/investment-bundles";
import { specializedBundles } from "@/data/bundles";
import { Input } from "@/components/ui/input";
import { useMarketStore } from "@/store/market-store";
import { useWatchlistStore } from "@/store/watchlist-store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Watchlist from "../dashboard/watchlist";
import YouTubePlayer from "../shared/youtube-player";
import { CommandItem, CommandList } from "../ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useDebounce } from "@/hooks/use-debounce";

const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY as string;

interface StockInfo {
    symbol: string;
    description: string;
    type?: string;
}

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  logoUrl: string;
}

interface TradeData {
  p: number; // price
}

const videos = [
    {
        title: "Finance & Trading (Combined)",
        description: "An in-depth look at finance and trading for beginners.",
        youtubeUrl: "https://www.youtube.com/watch?v=BUCPPCXOHbs"
    },
    {
        title: "Reading Stock Charts for Beginners",
        description: "An introduction to candlestick charts, volume, and identifying simple trends.",
        youtubeUrl: "https://www.youtube.com/watch?v=sWTnFS10tdQ"
    }
]

export default function TradeClient() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get('symbol')?.toUpperCase() || "AAPL";
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  const [stockList, setStockList] = useState<StockInfo[]>([]);
  const [widgetSymbol, setWidgetSymbol] = useState(initialSymbol);
  
  const [inputValue, setInputValue] = useState(initialSymbol);
  const debouncedInputValue = useDebounce(inputValue, 300);
  const [displayedStocks, setDisplayedStocks] = useState<StockData[]>([]);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  
  const [searchedSymbol, setSearchedSymbol] = useState(initialSymbol);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [price, setPrice] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const { isMarketOpen, fetchMarketStatus } = useMarketStore();
  const { watchlist, addSymbol, removeSymbol } = useWatchlistStore();

  const isSymbolInWatchlist = watchlist.includes(searchedSymbol);
  
  useEffect(() => {
    setIsClient(true);
    fetchMarketStatus();
  }, [fetchMarketStatus]);

  useEffect(() => {
    if (!isClient) return;

    const fetchStockList = async () => {
        if (!API_KEY) {
            console.error("Finnhub API key not configured.");
            return;
        }
        try {
            const res = await fetch(`https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${API_KEY}`);

            if (!res.ok) {
                throw new Error('Failed to fetch stock symbols from Finnhub.');
            }
            
            const data: StockInfo[] = await res.json();
            
            const commonStocks = data.filter(stock => 
                stock.description && 
                !stock.symbol.includes('.') &&
                stock.type === 'Common Stock'
            );

            const uniqueSymbols = new Set<string>();
            const uniqueStockList = commonStocks.filter(stock => {
                if (uniqueSymbols.has(stock.symbol)) {
                    return false;
                }
                uniqueSymbols.add(stock.symbol);
                return true;
            });

            setStockList(uniqueStockList);
        } catch (err: any) {
            console.error(err);
            toast({
                variant: 'destructive',
                title: 'Could Not Load Stock List',
                description: 'Failed to fetch stock data from the server.'
            });
        }
    };
    fetchStockList();
  }, [isClient, toast]);

    useEffect(() => {
    if (!stockList.length) return;

    const fetchQuotes = async (symbolsToFetch: { symbol: string, description: string }[]) => {
      setIsFetchingDetails(true);
      const isApiKeyValid = API_KEY && !API_KEY.startsWith("AIzaSy") && API_KEY !== "your_finnhub_api_key_here";

      if (!isApiKeyValid) {
        const simulatedData = symbolsToFetch.map(stock => ({
          symbol: stock.symbol,
          name: stock.description,
          price: parseFloat((Math.random() * 500).toFixed(2)),
          change: parseFloat((Math.random() * 10 - 5).toFixed(2)),
          changePercent: parseFloat((Math.random() * 5 - 2.5).toFixed(2)),
          logoUrl: `https://img.logokit.com/ticker/${stock.symbol}?token=pk_fr7a1b76952087586937fa`,
        }));
        setDisplayedStocks(simulatedData);
        setIsFetchingDetails(false);
        return;
      }

      const promises = symbolsToFetch.map(async (stock) => {
        const logoUrl = `https://img.logokit.com/ticker/${stock.symbol}?token=pk_fr7a1b76952087586937fa`;
        try {
          const quoteRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${API_KEY}`);
          if (!quoteRes.ok) return null;
          const quote = await quoteRes.json();
          return { symbol: stock.symbol, name: stock.description, price: quote.c || 0, change: quote.d || 0, changePercent: quote.dp || 0, logoUrl };
        } catch { return null; }
      });

      const results = (await Promise.all(promises)).filter(Boolean) as StockData[];
      setDisplayedStocks(results);
      setIsFetchingDetails(false);
    };

    if (debouncedInputValue) {
        const lowercasedQuery = debouncedInputValue.toLowerCase();
        
        const filteredResults = stockList.filter(s => 
            s.symbol.toLowerCase().includes(lowercasedQuery) || 
            s.description.toLowerCase().includes(lowercasedQuery)
        );

        const sortedResults = filteredResults.sort((a, b) => {
            const aIsExactMatch = a.symbol.toLowerCase() === lowercasedQuery;
            const bIsExactMatch = b.symbol.toLowerCase() === lowercasedQuery;

            if (aIsExactMatch && !bIsExactMatch) return -1;
            if (!aIsExactMatch && bIsExactMatch) return 1;

            const aSymbolIndex = a.symbol.toLowerCase().indexOf(lowercasedQuery);
            const bSymbolIndex = b.symbol.toLowerCase().indexOf(lowercasedQuery);
            if (aSymbolIndex === 0 && bSymbolIndex !== 0) return -1;
            if (aSymbolIndex !== 0 && bSymbolIndex === 0) return 1;

            return a.symbol.localeCompare(b.symbol);
        });
        
        fetchQuotes(sortedResults.slice(0, 5));
    } else {
        setDisplayedStocks([]);
    }

  }, [debouncedInputValue, stockList]);

  const handleToggleWatchlist = () => {
    if (isSymbolInWatchlist) {
      removeSymbol(searchedSymbol);
      toast({
        description: `${searchedSymbol} removed from your watchlist.`,
      });
    } else {
      addSymbol(searchedSymbol);
      toast({
        description: `${searchedSymbol} added to your watchlist.`,
      });
    }
  };

  const handleWidgetSymbolChange = useCallback((newSymbol: string) => {
    if (!newSymbol) return;
    setWidgetSymbol(newSymbol.toUpperCase());
    setInputValue(newSymbol.toUpperCase());
    setSearchedSymbol(newSymbol.toUpperCase());
  }, []);

  useEffect(() => {
    if (!searchedSymbol) return;

    setPrice(null);
    setLoadingPrice(true);
    setError(null);

    if (!API_KEY || API_KEY.startsWith("AIzaSy") || API_KEY === "your_finnhub_api_key_here") {
      console.warn("Finnhub API key not configured. Using simulated data.");
      setError("Live price data is unavailable. Using simulated data.");
      setTimeout(() => {
        const simulatedPrice = parseFloat((Math.random() * (500 - 100) + 100).toFixed(2));
        setPrice(simulatedPrice);
        setLoadingPrice(false);
      }, 500);
      return;
    }
    
    async function fetchInitialPrice() {
        try {
            const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${searchedSymbol}&token=${API_KEY}`);
            if (!res.ok) throw new Error(`Failed to fetch quote: ${res.statusText}`);
            const data = await res.json();
            if (data && typeof data.c !== 'undefined' && data.c !== 0) {
                setPrice(data.c);
            } else {
                setError("Invalid data received for symbol. It might be delisted or incorrect.");
            }
        } catch (err: any) {
            console.error("Error fetching initial price:", err);
            setError(`Could not fetch price data for ${searchedSymbol}. Please check the symbol.`);
        } finally {
            setLoadingPrice(false);
        }
    }

    fetchInitialPrice();

    if (socketRef.current) socketRef.current.close();

    const socket = new WebSocket(`wss://ws.finnhub.io?token=${API_KEY}`);
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "subscribe", symbol: searchedSymbol }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "trade" && data.data?.length > 0) {
        const trade: TradeData = data.data[0];
        setPrice(trade.p);
      }
    };

    socket.onerror = (err) => {
        setError("Could not connect to live price feed. The symbol may be invalid or delisted.");
        console.error("WebSocket error:", err);
    }

    return () => {
      if (socketRef.current) {
        if (socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: "unsubscribe", symbol: searchedSymbol }));
            socketRef.current.close();
        }
        socketRef.current = null;
      }
    };
  }, [searchedSymbol]);

  const handleSearch = () => {
    if (inputValue) {
        const upperCaseSymbol = inputValue.toUpperCase();
        setSearchedSymbol(upperCaseSymbol);
        setWidgetSymbol(upperCaseSymbol);
        setShowSuggestions(false);
    }
  };

  const handleStockSelection = (stock: StockInfo) => {
    setInputValue(stock.symbol);
    setSearchedSymbol(stock.symbol);
    setWidgetSymbol(stock.symbol);
    setShowSuggestions(false);
  }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


  return (
      <main>
        <div className="p-4 space-y-6 pb-24">
        <h1 className="text-2xl font-bold">Trade</h1>
        
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <CardTitle>Stock Chart</CardTitle>
                        <Button variant="ghost" size="icon" onClick={handleToggleWatchlist} className="h-8 w-8">
                            <Star className={cn("h-5 w-5", isSymbolInWatchlist ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-primary">
                        <Clock className="h-4 w-4" />
                        <span>Market is {isMarketOpen ? 'open' : 'closed'}.</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div ref={searchContainerRef} className="relative">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                value={inputValue}
                                onChange={(e) => {
                                    setInputValue(e.target.value.toUpperCase())
                                    setShowSuggestions(true)
                                }}
                                placeholder="e.g., AAPL, TSLA"
                                className="pl-10 h-10 focus-visible:ring-primary"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch();
                                    }
                                }}
                                onFocus={() => setShowSuggestions(true)}
                            />
                        </div>
                        <Button onClick={handleSearch}>
                            {loadingPrice && searchedSymbol === inputValue.toUpperCase() ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                            Search
                        </Button>
                    </div>
                    {showSuggestions && inputValue && (
                         <div className="absolute top-full mt-2 w-full sm:w-[calc(100%-100px)] rounded-md border bg-background shadow-lg z-20">
                            <CommandList>
                                {isFetchingDetails && <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>}
                                {!isFetchingDetails && displayedStocks.length === 0 && <div className="p-4 text-center text-sm text-muted-foreground">No results found.</div>}
                                {displayedStocks.map(stock => (
                                    <CommandItem key={stock.symbol} onSelect={() => handleStockSelection(stock)}>
                                         <div className="flex justify-between items-center w-full">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 bg-muted">
                                                     <AvatarImage src={stock.logoUrl} alt={stock.name} />
                                                    <AvatarFallback>{stock.symbol.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p>{stock.name}</p>
                                                    <p className="text-xs text-muted-foreground">{stock.symbol}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-mono">${stock.price.toFixed(2)}</p>
                                                <p className={cn("text-xs", stock.change >= 0 ? "text-green-500" : "text-red-500")}>
                                                    {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                                                </p>
                                            </div>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandList>
                        </div>
                    )}
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <div className="h-[400px] md:h-[500px] w-full">
                    {isClient && <TradingViewWidget symbol={widgetSymbol} onSymbolChange={handleWidgetSymbolChange}/>}
                </div>
            </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TradeForm 
                selectedSymbol={searchedSymbol}
                selectedPrice={price}
                loadingPrice={loadingPrice}
            />
            <div className="space-y-6">
                <Watchlist />
                <AiPredictionTrade initialSymbol={searchedSymbol} />
            </div>
        </div>

        <InvestmentBundles
            title="Explore Specialized Bundles"
            description="Discover themed collections for more focused strategies."
            bundles={specializedBundles}
        />
        
        <Card>
            <CardHeader>
                <CardTitle>Stock Screener</CardTitle>
            </CardHeader>
            <CardContent className="h-[600px]">
                    <TradingViewScreener />
            </CardContent>
        </Card>

        <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold">Learn About Trading</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videos.map((video) => (
                    <YouTubePlayer key={video.title} videoTitle={video.title} description={video.description} youtubeUrl={video.youtubeUrl} />
                ))}
            </div>
        </div>
        
        </div>
      </main>
  );
}
