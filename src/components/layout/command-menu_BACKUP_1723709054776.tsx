
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Briefcase,
  Repeat,
  BarChart,
  Users,
  BrainCircuit,
  Star,
  Newspaper,
  Loader2,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building,
  Search,
  X,
} from "lucide-react";
import { useWatchlistStore } from "@/store/watchlist-store";
import { useToast } from "@/hooks/use-toast";
import useLoadingStore from "@/store/loading-store";
import { handleStockPrediction, handleStockNews } from "@/app/actions";
import { type StockPredictionOutput } from "@/ai/types/stock-prediction-types";
import { type StockNewsOutput } from "@/ai/flows/fetch-stock-news";
import { Button } from "../ui/button";
import { stockList } from "@/data/stocks";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { usePortfolioStore } from "@/store/portfolio-store";
import TradeDialogCMDK from "../trade/trade-dialog-cmdk";
import TradingViewMiniChart from "../shared/trading-view-mini-chart";
import { CommandInput, CommandItem, CommandList, CommandSeparator } from "../ui/command";

const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY as string;

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
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
  const { holdings } = usePortfolioStore();

  const [view, setView] = useState<CommandView>("search");
  const [query, setQuery] = useState("");
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  
  const [prediction, setPrediction] = useState<StockPredictionOutput | null>(null);
  const [news, setNews] = useState<StockNewsOutput | null>(null);
  
  const [isFetchingStocks, setIsFetchingStocks] = useState(false);
  const [isFetchingPrediction, setIsFetchingPrediction] = useState(false);
  const [isFetchingNews, setIsFetchingNews] = useState(false);
  const [isTradeDialogOpen, setIsTradeDialogOpen] = useState(false);
  const [tradeAction, setTradeAction] = useState<"buy" | "sell">("buy");


  // --- Data Fetching ---

  useEffect(() => {
    async function fetchStockData() {
      if (!open || stocks.length > 0) return;
      
      const isApiKeyValid = API_KEY && !API_KEY.startsWith("AIzaSy") && API_KEY !== "your_finnhub_api_key_here";

      setIsFetchingStocks(true);
      if (!isApiKeyValid) {
        console.warn("Finnhub API key not configured. Using simulated stock data for search.");
        const simulatedStocks = stockList.map(stock => ({
            ...stock,
            price: parseFloat((Math.random() * 500).toFixed(2)),
            change: parseFloat((Math.random() * 10 - 5).toFixed(2)),
            changePercent: parseFloat((Math.random() * 5 - 2.5).toFixed(2)),
        }))
        setStocks(simulatedStocks);
        setIsFetchingStocks(false);
        return;
      }
      
      const promises = stockList.map(async (stock) => {
        try {
            const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${API_KEY}`);
            if (!res.ok) throw new Error(`Failed for ${stock.symbol}`);
            const quote = await res.json();
            return {
                symbol: stock.symbol,
                name: stock.name,
                price: quote.c || 0,
                change: quote.d || 0,
                changePercent: quote.dp || 0,
            };
        } catch(error) {
            console.error(`Error fetching data for ${stock.symbol}:`, error);
            return {
                symbol: stock.symbol,
                name: stock.name,
                price: 0,
                change: 0,
                changePercent: 0,
            };
        }
      });

      const results = (await Promise.all(promises)).filter(Boolean) as StockData[];
      setStocks(results);
      setIsFetchingStocks(false);
    }
    
    fetchStockData();
  }, [open, stocks.length]);

  const fetchStockDetails = (stock: StockData) => {
    // Show detail view immediately
    setView("stock-detail");
    setSelectedStock(stock);

    // Fetch prediction in the background
    setIsFetchingPrediction(true);
    setPrediction(null);
    handleStockPrediction(stock.symbol).then(predictionResult => {
        if (predictionResult.success && predictionResult.prediction) {
            setPrediction(predictionResult.prediction);
        }
        setIsFetchingPrediction(false);
    });

    // Fetch news in the background
    setIsFetchingNews(true);
    setNews(null);
    handleStockNews(stock.symbol).then(newsResult => {
        if (newsResult.success && newsResult.news) {
            setNews(newsResult.news);
        }
        setIsFetchingNews(false);
    });
  };

  const runCommand = useCallback((command: () => void) => {
    onOpenChange(false);
    setQuery("");
    setView("search");
    command();
  }, [onOpenChange]);
  
  const handleTradeNavigation = (symbol: string) => {
    showLoading();
    router.push(`/trade?symbol=${symbol}`);
  };

  const handleStockSelect = useCallback((stockSymbol: string) => {
    const stock = stocks.find(s => s.symbol === stockSymbol);
    if (stock) {
        fetchStockDetails(stock);
    }
  }, [stocks]);

  const handleGoBack = () => {
    setView("search");
    setQuery("");
    setSelectedStock(null);
    setPrediction(null);
    setNews(null);
  };

  const handleBuySellClick = (action: "buy" | "sell") => {
    setTradeAction(action);
    setIsTradeDialogOpen(true);
  }

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        handleGoBack();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const filteredStocks = useMemo(() => {
    if (!query) return stocks.slice(0, 5);
    return stocks
      .filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5);
  }, [query, stocks]);

  const selectedStockHolding = useMemo(() => {
    if (!selectedStock) return null;
    return holdings.find(h => h.symbol === selectedStock.symbol);
  }, [selectedStock, holdings]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80" onClick={() => onOpenChange(false)} />
      <div 
        className="fixed top-1/4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg overflow-hidden rounded-xl shadow-2xl shadow-black/20 bg-white/10 ring-1 ring-white/60 border-0"
        style={{ backdropFilter: "url(#frosted) blur(1px)" }}
      >
        <div className="text-primary-foreground">
             <div className="flex items-center border-b border-border/50 px-3">
                {view === "stock-detail" ? (
                    <Button variant="ghost" size="icon" className="mr-2 h-8 w-8 shrink-0 hover:bg-white/10" onClick={handleGoBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                ) : (
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                )}
                <CommandInput
                    placeholder={view === 'search' ? "Search for a stock or action..." : `${selectedStock?.name} (${selectedStock?.symbol})`}
                    onChange={(e) => setQuery(e.target.value)}
                    value={query}
                    disabled={view === 'stock-detail'}
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hover:bg-white/10" onClick={() => onOpenChange(false)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
            
            {view === "search" && (
            <CommandList>
                {isFetchingStocks && query.length === 0 && (
                    <div className="p-4 text-center text-sm text-slate-400">Loading stocks...</div>
                )}
                {filteredStocks.length === 0 && !isFetchingStocks && <div className="py-6 text-center text-sm">No results found.</div>}

                {filteredStocks.length > 0 && (
                <div className="p-1 text-foreground">
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Stocks</div>
                    {filteredStocks.map((stock) => (
                    <CommandItem
                        key={stock.symbol}
                        onClick={() => handleStockSelect(stock.symbol)}
                    >
                        <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 bg-slate-800">
                                    <AvatarFallback className="bg-transparent">{stock.symbol.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p>{stock.name}</p>
                                    <p className="text-xs text-slate-400">{stock.symbol}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-mono">${stock.price.toFixed(2)}</p>
                                <p className={cn("text-xs", stock.change >= 0 ? "text-green-400" : "text-red-400")}>
                                    {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                                </p>
                            </div>
                        </div>
                    </CommandItem>
                    ))}
                </div>
                )}

                <CommandSeparator />

                <div className="p-1 text-foreground">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">App Actions</div>
                    {appActions
                        .filter((action) => action.name.toLowerCase().includes(query.toLowerCase()))
                        .map((action) => (
                        <CommandItem
                            key={action.href}
                            onClick={() => runCommand(() => router.push(action.href))}
                        >
                            <action.icon className="mr-2 h-4 w-4" />
                            <span>{action.name}</span>
                        </CommandItem>
                        ))}
                </div>
            </CommandList>
            )}

            {view === 'stock-detail' && selectedStock && (
                <div className="p-2 text-sm overflow-y-auto max-h-[calc(75vh-50px)]">
                    <div className="space-y-4">
                        {/* Stock Header */}
                        <div className="flex items-start gap-4 p-2 rounded-lg">
                            <Avatar className="h-14 w-14 border-2 border-white/20 bg-slate-800">
                                <AvatarFallback className="text-2xl bg-transparent">{selectedStock.symbol.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-lg font-bold">{selectedStock.name}</h3>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-bold">${selectedStock.price.toFixed(2)}</p>
                                    <p className={cn("font-semibold flex items-center", selectedStock.change >= 0 ? "text-green-400" : "text-red-400")}>
                                        {selectedStock.change >= 0 ? <TrendingUp className="h-4 w-4 mr-1"/> : <TrendingDown className="h-4 w-4 mr-1" />}
                                        {selectedStock.change.toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Mini Chart */}
                        <div className="h-40 w-full">
                            <TradingViewMiniChart symbol={selectedStock.symbol} />
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => handleBuySellClick('buy')}>
                                    Buy
                                </Button>
                                <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white" onClick={() => handleBuySellClick('sell')}>
                                    Sell
                                </Button>
                            </div>
                            <Button variant="outline" size="sm" className="w-full bg-white/10 border-white/20 hover:bg-white/20" onClick={() => runCommand(() => handleTradeNavigation(selectedStock.symbol))}>
                                <Repeat className="mr-2 h-4 w-4" /> Go to Trade Page
                            </Button>
                            <Button variant="outline" size="sm" className="w-full bg-white/10 border-white/20 hover:bg-white/20" onClick={() => {
                                if (watchlist.includes(selectedStock.symbol)) { removeSymbol(selectedStock.symbol); toast({description: "Removed from watchlist."}); }
                                else { addSymbol(selectedStock.symbol); toast({description: "Added to watchlist."}); }
                            }}>
                                <Star className={cn("mr-2 h-4 w-4", watchlist.includes(selectedStock.symbol) ? 'text-yellow-400 fill-yellow-400' : '')} /> 
                                {watchlist.includes(selectedStock.symbol) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                            </Button>
                        </div>
                        
                        {selectedStockHolding && (
                            <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2 text-slate-400"><Building className="h-4 w-4" /> Your Holdings</h4>
                                 <div className="p-3 rounded-lg bg-black/20">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">{selectedStockHolding.qty} Shares</span>
                                        <span className="font-medium">Value: ${(selectedStockHolding.qty * selectedStock.price).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Prediction Section */}
                        <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-slate-400"><BrainCircuit className="h-4 w-4" /> AI Prediction</h4>
                            <div className="p-3 rounded-lg bg-black/20 text-xs min-h-[60px] relative">
                            {isFetchingPrediction ? (
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Loader2 className="h-4 w-4 animate-spin"/>
                                    <span>Generating prediction...</span>
                                </div>
                            ) : prediction ? (
                                <>
                                    <div className="flex justify-between items-center mb-1">
                                        <Badge className={cn("text-white", prediction.confidence === "High" ? "bg-green-500" : prediction.confidence === "Medium" ? "bg-yellow-500" : "bg-red-500")}>
                                            {prediction.confidence} Confidence
                                        </Badge>
                                    </div>
                                    <p className="whitespace-pre-wrap">{prediction.prediction}</p>
                                </>
                            ) : (
                                <p className="text-slate-400">Could not load AI prediction.</p>
                            )}
                            </div>
                        </div>

                        {/* News Section */}
                        <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-slate-400"><Newspaper className="h-4 w-4" /> Recent News</h4>
                            <div className="space-y-2">
                                {isFetchingNews ? (
                                    <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
                                        <Loader2 className="h-4 w-4 animate-spin"/>
                                        <span>Fetching recent news...</span>
                                    </div>
                                ) : news?.articles && news.articles.length > 0 ? (
                                    news.articles.map((article, i) => (
                                    <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" className="block p-2 rounded-md hover:bg-black/20 text-white no-underline">
                                        <p className="font-medium truncate leading-tight whitespace-pre-wrap">{article.headline}</p>
                                        <p className="text-xs text-slate-400">{article.source}</p>
                                    </a>
                                ))) : (
                                    <div className="p-2 text-xs text-slate-400">No recent news found.</div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
      </div>
    {selectedStock && (
        <TradeDialogCMDK
            isOpen={isTradeDialogOpen}
            onOpenChange={setIsTradeDialogOpen}
            symbol={selectedStock.symbol}
            price={selectedStock.price}
            action={tradeAction}
        />
    )}
    </>
  );
}

    



    

    
