'use client';

import React, { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Clock, Star } from "lucide-react";
import AiPredictionTrade from "@/components/ai/ai-prediction-trade";
import { specializedBundles } from "@/data/bundles";
import { Input } from "@/components/ui/input";
import { useMarketStore } from "@/store/market-store";
import { useWatchlistStore } from "@/store/watchlist-store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Watchlist from "../dashboard/watchlist";
import { CommandItem, CommandList } from "../ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useDebounce } from "@/hooks/use-debounce";
import { useThemeStore } from "@/store/theme-store";
import { motion } from "framer-motion";
import { Skeleton } from "../ui/skeleton";

const TradingViewWidget = dynamic(() => import("@/components/shared/trading-view-widget"), {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] md:h-[500px] w-full" />,
});

const TradeForm = dynamic(() => import("@/components/trade/trade-form"), {
    ssr: false,
    loading: () => <Skeleton className="h-[500px] w-full" />,
});

const TradingViewScreener = dynamic(() => import("@/components/shared/trading-view-screener"), {
    ssr: false,
    loading: () => <Skeleton className="h-[600px] w-full" />,
});

const YouTubePlayer = dynamic(() => import('../shared/youtube-player'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full aspect-video" />,
});

const InvestmentBundles = dynamic(() => import("../dashboard/investment-bundles"), {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full" />,
});


const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY as string;

interface StockSearchResult {
    symbol: string;
    description: string;
    type: string;
    displaySymbol: string;
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const PageSkeleton = () => (
    <div className="p-4 space-y-6 pb-24">
        <Skeleton className="h-9 w-32" />
        <div className="space-y-4">
             <Skeleton className="h-[600px] w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[500px] w-full" />
            <div className="space-y-6">
                <Skeleton className="h-[250px] w-full" />
                <Skeleton className="h-[250px] w-full" />
            </div>
        </div>
         <Skeleton className="h-[400px] w-full" />
    </div>
)

export default function TradeClient() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const { isClearMode, theme } = useThemeStore();
  const isLightClear = isClearMode && theme === 'light';

  const [initialSymbol, setInitialSymbol] = useState("AAPL");
  
  const [widgetSymbol, setWidgetSymbol] = useState(initialSymbol);
  
  const [inputValue, setInputValue] = useState(initialSymbol);
  const debouncedInputValue = useDebounce(inputValue, 350);
  const [displayedStocks, setDisplayedStocks] = useState<StockData[]>([]);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  
  const [searchedSymbol, setSearchedSymbol] = useState(initialSymbol);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [price, setPrice] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const { isMarketOpen, fetchMarketStatus } = useMarketStore();
  const { watchlist, addSymbol, removeSymbol } = useWatchlistStore();

  const isSymbolInWatchlist = watchlist.includes(searchedSymbol);
  
  useEffect(() => {
    const symbolFromParams = searchParams.get('symbol')?.toUpperCase() || "AAPL";
    setInitialSymbol(symbolFromParams);
    setWidgetSymbol(symbolFromParams);
    setInputValue(symbolFromParams);
    setSearchedSymbol(symbolFromParams);
    fetchMarketStatus();
    setIsClient(true);
  }, [searchParams, fetchMarketStatus]);


  const fetchStockDetailsBySymbol = useCallback(async (symbol: string) => {
    const isApiKeyValid = API_KEY && !API_KEY.startsWith("AIzaSy") && API_KEY !== "your_finnhub_api_key_here";
    const logoUrl = `https://img.logokit.com/ticker/${symbol}?token=pk_fr7a1b76952087586937fa`;

    if (!isApiKeyValid) {
        return { symbol, name: symbol, price: Math.random() * 500, change: Math.random() * 10 - 5, changePercent: Math.random() * 5 - 2.5, logoUrl };
    }

    try {
        const [quoteRes, profileRes] = await Promise.all([
            fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`),
            fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`)
        ]);
        if (!quoteRes.ok || !profileRes.ok) return null;
        const quote = await quoteRes.json();
        const profile = await profileRes.json();
        return { symbol, name: profile.name || symbol, price: quote.c || 0, change: quote.d || 0, changePercent: quote.dp || 0, logoUrl };
    } catch {
        return null;
    }
  }, []);


  useEffect(() => {
    const searchStocks = async () => {
        if (!debouncedInputValue) {
            setDisplayedStocks([]);
            return;
        }

        setIsFetchingDetails(true);
        const isApiKeyValid = API_KEY && !API_KEY.startsWith("AIzaSy") && API_KEY !== "your_finnhub_api_key_here";

        if (!isApiKeyValid) {
            console.warn("Finnhub API key not configured. Search is disabled.");
            setDisplayedStocks([]);
            setIsFetchingDetails(false);
            return;
        }

        try {
            const searchRes = await fetch(`https://finnhub.io/api/v1/search?q=${debouncedInputValue}&token=${API_KEY}`);
            const searchData = await searchRes.json();
            const searchResults = (searchData.result || [])
                .filter((s: StockSearchResult) => s.type === "Common Stock" && !s.symbol.includes('.'))
                .slice(0, 5);

            const promises = searchResults.map((stock: StockSearchResult) => fetchStockDetailsBySymbol(stock.symbol));
            const results = (await Promise.all(promises)).filter(Boolean) as StockData[];
            setDisplayedStocks(results);
        } catch (error) {
            console.error("Failed to search stocks:", error);
            setDisplayedStocks([]);
        } finally {
            setIsFetchingDetails(false);
        }
    };
    
    searchStocks();
  }, [debouncedInputValue, fetchStockDetailsBySymbol]);

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

  const handleStockSelection = (stock: StockData) => {
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

  if (!isClient) {
      return <PageSkeleton />;
  }

  return (
      <main>
        <motion.div 
            className="p-4 space-y-6 pb-24"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
        <motion.h1 variants={itemVariants} className="text-2xl font-bold">Trade</motion.h1>
        
        <motion.div variants={itemVariants}>
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
                        <div className={cn(
                            "relative flex h-12 w-full items-center rounded-full px-4 text-primary-foreground shadow-lg",
                            isClearMode
                                ? isLightClear
                                    ? "bg-card/60 ring-1 ring-white/10"
                                    : "bg-white/10 ring-1 ring-white/60"
                                : "bg-card ring-1 ring-border"
                        )} style={{ backdropFilter: "blur(16px)" }}>
                            <Search className={cn("h-5 w-5", isClearMode ? "text-slate-100" : "text-muted-foreground")} />
                            <Input
                                value={inputValue}
                                onChange={(e) => {
                                    setInputValue(e.target.value.toUpperCase())
                                    setShowSuggestions(true)
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch();
                                    }
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                placeholder="Search stocks..."
                                className={cn(
                                    "w-full h-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground",
                                    isLightClear ? "text-foreground" : (isClearMode ? "text-slate-100" : "text-foreground")
                                )}
                            />
                            {loadingPrice && searchedSymbol === inputValue.toUpperCase() && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                        </div>

                        {showSuggestions && inputValue && (
                             <div 
                               className={cn(
                                "absolute top-full mt-2 w-full rounded-3xl shadow-lg z-20 overflow-hidden",
                                isClearMode 
                                    ? isLightClear
                                        ? "bg-card/60 ring-1 ring-white/10"
                                        : "bg-white/10 ring-1 ring-white/60"
                                    : "bg-background border"
                               )}
                               style={{ backdropFilter: "blur(16px)" }}
                             >
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
        </motion.div>
        
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TradeForm 
                selectedSymbol={searchedSymbol}
                selectedPrice={price}
                loadingPrice={loadingPrice}
            />
            <div className="space-y-6">
                <Watchlist />
                <AiPredictionTrade initialSymbol={searchedSymbol} />
            </div>
        </motion.div>

        <motion.div variants={itemVariants}>
             <InvestmentBundles
                title="Explore Specialized Bundles"
                description="Discover themed collections for more focused strategies."
                bundles={specializedBundles}
            />
        </motion.div>
        
        <motion.div variants={itemVariants}>
            <Card>
                <CardHeader>
                    <CardTitle>Stock Screener</CardTitle>
                </CardHeader>
                <CardContent className="h-[600px]">
                        <TradingViewScreener />
                </CardContent>
            </Card>
        </motion.div>
        
        <motion.div variants={itemVariants} className="space-y-4 pt-4">
            <h2 className="text-xl font-bold">Learn About Trading</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videos.map((video) => (
                    <YouTubePlayer key={video.title} videoTitle={video.title} description={video.description} youtubeUrl={video.youtubeUrl} />
                ))}
            </div>
        </motion.div>
        
        </motion.div>
      </main>
  );
}
