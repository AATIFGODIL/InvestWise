
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
  LogOut,
  User,
  Settings,
  Sun,
  Moon,
  Sparkles,
  CreditCard,
  Target,
  History,
  TrendingUpIcon,
  BookOpen,
  Award,
  PartyPopper,
} from "lucide-react";
import { useWatchlistStore } from "@/store/watchlist-store";
import { useToast } from "@/hooks/use-toast";
import useLoadingStore from "@/store/loading-store";
import { handleStockPrediction, handleStockNews, createTransaction } from "@/app/actions";
import type { StockPredictionOutput } from "@/ai/types/stock-prediction-types";
import type { StockNewsOutput } from "@/ai/flows/fetch-stock-news";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { usePortfolioStore } from "@/store/portfolio-store";
import TradeDialogCMDK from "../trade/trade-dialog-cmdk";
import TradingViewMiniChart from "../shared/trading-view-mini-chart";
import { CommandInput, CommandItem, CommandList, CommandSeparator } from "../ui/command";
import { useAuth } from "@/hooks/use-auth";
import { useThemeStore } from "@/store/theme-store";
import useChatbotStore from "@/store/chatbot-store";
import CreateGoal from "../goals/create-goal";
import { useGoalStore } from "@/store/goal-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { useUserStore } from "@/store/user-store";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useFavoritesStore, type Favorite } from "@/store/favorites-store";


const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY as string;

interface StockInfo {
  symbol: string;
  name: string;
  domain?: string;
}

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  logoUrl: string;
}

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTriggerRain: () => void;
  initialStockSymbol?: string;
}

type CommandView = "search" | "stock-detail";

export const appIcons: { [key: string]: React.ElementType } = { home: Home, briefcase: Briefcase, repeat: Repeat, barChart: BarChart, users: Users, users2: Users, trendingUp: TrendingUpIcon, star: Star, logOut: LogOut, user: User, settings: Settings, sun: Sun, moon: Moon, sparkles: Sparkles, creditCard: CreditCard, target: Target, history: History, brain: BrainCircuit, bookOpen: BookOpen, award: Award, party: PartyPopper };


export function CommandMenu({ open, onOpenChange, onTriggerRain, initialStockSymbol }: CommandMenuProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { showLoading } = useLoadingStore();
  const { watchlist, addSymbol, removeSymbol } = useWatchlistStore();
  const { holdings } = usePortfolioStore();
  const { user, signOut, updateUserTheme } = useAuth();
  const { theme, isClearMode } = useThemeStore();
  const { openChatbot } = useChatbotStore();
  const { addGoal } = useGoalStore();
  const { paymentMethodToken } = useUserStore();
  const { favorites, addFavorite, removeFavoriteByName } = useFavoritesStore();

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
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isFundsDialogOpen, setIsFundsDialogOpen] = useState(false);
  const [fundsAmount, setFundsAmount] = useState("100.00");
  const [isAddingFunds, setIsAddingFunds] = useState(false);


  // --- Data Fetching & State ---

  useEffect(() => {
    async function fetchStockData() {
        if (!open || stocks.length > 0) return;
        setIsFetchingStocks(true);
        
        const isApiKeyValid = API_KEY && !API_KEY.startsWith("AIzaSy") && API_KEY !== "your_finnhub_api_key_here";

        if (!isApiKeyValid) {
            console.warn("Finnhub API key not configured. Using simulated stock data for search.");
            const simulatedData = [
                { symbol: "AAPL", name: "APPLE INC", domain: "apple.com" },
                { symbol: "MSFT", name: "MICROSOFT CORP", domain: "microsoft.com" },
                { symbol: "GOOGL", name: "ALPHABET INC-CL A", domain: "abc.xyz" },
                { symbol: "TSLA", name: "TESLA INC", domain: "tesla.com" },
                { symbol: "NVDA", name: "NVIDIA CORP", domain: "nvidia.com" },
            ].map(stock => ({
                ...stock,
                price: parseFloat((Math.random() * 500).toFixed(2)),
                change: parseFloat((Math.random() * 10 - 5).toFixed(2)),
                changePercent: parseFloat((Math.random() * 5 - 2.5).toFixed(2)),
                logoUrl: `https://logo.clearbit.com/${stock.domain}`,
            }));
            setStocks(simulatedData);
            setIsFetchingStocks(false);
            return;
        }

        try {
            const res = await fetch(`https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${API_KEY}`);
            const data: { symbol: string, description: string }[] = await res.json();
            const filteredData = data.filter(s => s.description && !s.symbol.includes('.'));
            
            const promises = filteredData.slice(0, 100).map(async (stock) => {
                const logoUrl = `https://logo.clearbit.com/${stock.description.toLowerCase().replace(/ /g, '').replace('inc', '')}.com`;
                try {
                    const quoteRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${API_KEY}`);
                    if (!quoteRes.ok) return null;
                    const quote = await quoteRes.json();
                    return { ...stock, name: stock.description, price: quote.c || 0, change: quote.d || 0, changePercent: quote.dp || 0, logoUrl };
                } catch {
                    return null;
                }
            });

            const results = (await Promise.all(promises)).filter(Boolean) as StockData[];
            setStocks(results);

        } catch (err) {
            console.error("Failed to fetch stock list for command menu:", err);
            toast({ variant: 'destructive', title: 'Could not load stocks' });
        } finally {
            setIsFetchingStocks(false);
        }
    }
    fetchStockData();
  }, [open, stocks.length, toast]);

  useEffect(() => {
    if (initialStockSymbol && stocks.length > 0) {
      handleStockSelect(initialStockSymbol);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStockSymbol, stocks]);

  const runCommand = useCallback(async (command: () => void | Promise<void>) => {
    onOpenChange(false);
    await command();
  }, [onOpenChange]);

  const fetchStockDetails = (stock: StockData) => {
    setView("stock-detail");
    setSelectedStock(stock);
    setIsFetchingPrediction(true);
    setPrediction(null);
    handleStockPrediction(stock.symbol).then(res => {
        if (res.success && res.prediction) setPrediction(res.prediction);
        setIsFetchingPrediction(false);
    });
    setIsFetchingNews(true);
    setNews(null);
    handleStockNews(stock.symbol).then(res => {
        if (res.success && res.news) setNews(res.news);
        setIsFetchingNews(false);
    });
  };

  const handleStockSelect = useCallback((stockSymbol: string) => {
    const stock = stocks.find(s => s.symbol === stockSymbol);
    if (stock) fetchStockDetails(stock);
  }, [stocks]);

  const handleGoBack = () => {
    setView("search"); setQuery(""); setSelectedStock(null); setPrediction(null); setNews(null);
  };

  const handleBuySellClick = (action: "buy" | "sell") => {
    setTradeAction(action); setIsTradeDialogOpen(true);
  }

  const handleAddFunds = async () => {
    if (!paymentMethodToken) {
      toast({
        variant: "destructive", title: "No Payment Method", description: "Please add a payment method in your profile first.",
        action: <Button onClick={() => runCommand(() => { router.push('/profile'); })}>Go to Profile</Button>
      });
      return;
    }
    if (!user) return;
    setIsAddingFunds(true);
    try {
      await createTransaction({ userId: user.uid, amount: fundsAmount });
      toast({ title: "Funds Added!", description: `$${fundsAmount} has been added to your account.` });
      setIsFundsDialogOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to Add Funds", description: error.message || "An unexpected error occurred." });
    } finally {
        setIsAddingFunds(false);
    }
  }
  
  const handleToggleFavorite = (e: React.MouseEvent, item: {type: 'action' | 'stock', name: string, value: string, icon?: React.ElementType, logoUrl?: string}) => {
    e.stopPropagation();
    const isFavorite = favorites.some(fav => fav.value === item.value);

    if(isFavorite) {
      removeFavoriteByName(item.value);
      toast({ description: `${item.name} removed from favorites.` });
    } else {
      const favoriteItem: Favorite = {
        type: item.type,
        name: item.name,
        value: item.value,
        iconName: item.icon ? (Object.entries(appIcons).find(([,Icon]) => Icon === item.icon)?.[0] || 'search') : item.value.charAt(0),
        logoUrl: item.logoUrl,
      }
      addFavorite(favoriteItem);
      toast({ title: 'Favorite Added!', description: `${item.name} has been added to your favorites.` });
    }
  };

  const appActions = useMemo(() => [
      { name: "Make it rain", keywords: "celebrate money win", onSelect: () => runCommand(onTriggerRain), icon: PartyPopper },
      { name: "Dashboard", keywords: "home explore main", onSelect: () => runCommand(() => router.push('/dashboard')), icon: Home },
      { name: "Portfolio", keywords: "holdings assets", onSelect: () => runCommand(() => router.push('/portfolio')), icon: Briefcase },
      { name: "Trade", keywords: "buy sell chart", onSelect: () => runCommand(() => router.push('/trade')), icon: Repeat },
      { name: "Goals", keywords: "savings targets", onSelect: () => runCommand(() => router.push('/goals')), icon: BarChart },
      { name: "Community", keywords: "leaderboard social", onSelect: () => runCommand(() => router.push('/community')), icon: Users },
      { name: "View Leaderboard", keywords: "rankings top investors", onSelect: () => runCommand(() => router.push('/community?tab=feed')), icon: Users },
      { name: "View Community Trends", keywords: "popular stocks", onSelect: () => runCommand(() => router.push('/community?tab=trends')), icon: TrendingUpIcon },
      { name: "View Watchlist", keywords: "saved stocks favorites", onSelect: () => runCommand(() => router.push('/portfolio')), icon: Star },
      { name: "Sign Out", keywords: "log out exit", onSelect: () => runCommand(signOut), icon: LogOut },
      { name: "Profile", keywords: "account my info", onSelect: () => runCommand(() => router.push('/profile')), icon: User },
      { name: "Settings", keywords: "preferences options", onSelect: () => runCommand(() => router.push('/settings')), icon: Settings },
      { name: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, keywords: "theme appearance", onSelect: () => runCommand(() => updateUserTheme({ theme: theme === 'dark' ? 'light' : 'dark' })), icon: theme === 'dark' ? Sun : Moon },
      { name: `${isClearMode ? 'Disable' : 'Enable'} Clear Mode`, keywords: "theme glass liquid transparent", onSelect: () => runCommand(() => updateUserTheme({ isClearMode: !isClearMode })), icon: Sparkles },
      { name: "Add Funds", keywords: "deposit money wallet", onSelect: () => runCommand(() => setIsFundsDialogOpen(true)), icon: CreditCard },
      { name: "Create New Goal", keywords: "new savings target", onSelect: () => runCommand(() => setIsGoalDialogOpen(true)), icon: Target },
      { name: "Set Up Auto-Invest", keywords: "recurring investment", onSelect: () => runCommand(() => router.push('/dashboard')), icon: Repeat },
      { name: "View Trade History", keywords: "transactions log", onSelect: () => runCommand(() => router.push('/portfolio')), icon: History },
      { name: "Ask InvestWise AI", keywords: "chatbot help question", onSelect: () => runCommand(openChatbot), icon: BrainCircuit },
      { name: "Educational Content", keywords: "learn video articles", onSelect: () => runCommand(() => router.push('/dashboard')), icon: BookOpen },
      { name: "View My Certificate", keywords: "award achievement", onSelect: () => runCommand(() => router.push('/certificate')), icon: Award },
    ], [router, runCommand, signOut, theme, isClearMode, updateUserTheme, openChatbot, onTriggerRain]);

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => { handleGoBack(); }, 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const filteredStocks = useMemo(() => {
    if (!stocks.length) return [];
    if (!query) {
      const defaultSymbols = ["TSLA", "AAPL", "MSFT", "GOOGL", "NVDA"];
      return stocks.filter(s => defaultSymbols.includes(s.symbol));
    }
    return stocks.filter(s => s.symbol.toLowerCase().includes(query.toLowerCase()) || s.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  }, [query, stocks]);

  const filteredAppActions = useMemo(() => {
    if (!query) return [];
    return appActions.filter(a => a.name.toLowerCase().includes(query.toLowerCase()) || a.keywords.toLowerCase().includes(query.toLowerCase()));
  }, [query, appActions]);

  const selectedStockHolding = useMemo(() => {
    if (!selectedStock) return null;
    return holdings.find(h => h.symbol === selectedStock.symbol);
  }, [selectedStock, holdings]);


  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80" onClick={() => onOpenChange(false)} />
      <div className="fixed inset-x-0 inset-y-0 z-50 flex items-center justify-center p-4 pt-24 pb-24">
        <div className={cn("w-full max-w-lg overflow-hidden rounded-xl shadow-2xl", isClearMode ? "shadow-black/20 bg-white/10 ring-1 ring-white/60 border-0" : "bg-popover border")} style={{ backdropFilter: isClearMode ? "url(#frosted) blur(1px)" : "none" }}>
          <div className={cn(isClearMode ? "text-primary-foreground" : "text-popover-foreground")}>
              <div className={cn("flex items-center border-b px-3", isClearMode ? "border-border/50" : "border-border")}>
                  {view === "stock-detail" ? ( <Button variant="ghost" size="icon" className={cn("mr-2 h-8 w-8 shrink-0", isClearMode ? "hover:bg-white/10" : "")} onClick={handleGoBack}><ArrowLeft className="h-4 w-4" /></Button> ) : ( <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" /> )}
                  <CommandInput placeholder={view === 'search' ? "Search stocks or commands..." : `${selectedStock?.name} (${selectedStock?.symbol})`} onValueChange={setQuery} value={query} disabled={view === 'stock-detail'} />
                  <Button variant="ghost" size="icon" className={cn("h-8 w-8 shrink-0", isClearMode ? "hover:bg-white/10" : "")} onClick={() => onOpenChange(false)}><X className="h-4 w-4" /></Button>
              </div>
              
              {view === "search" && (
              <CommandList>
                  {isFetchingStocks && query.length === 0 && ( <div className="p-4 text-center text-sm text-muted-foreground">Loading stocks...</div> )}
                  
                  {filteredStocks.length === 0 && filteredAppActions.length === 0 && !isFetchingStocks && query && <div className="py-6 text-center text-sm">No results found.</div>}
                  
                  {filteredStocks.length > 0 && (<div className="p-1"><div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Stocks</div>
                    {filteredStocks.map((stock) => (
                      <CommandItem key={stock.symbol} onSelect={() => handleStockSelect(stock.symbol)}>
                        <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 bg-background">
                                    <AvatarImage src={stock.logoUrl} alt={stock.name} />
                                    <AvatarFallback>{stock.symbol.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div><p>{stock.name}</p><p className="text-xs text-muted-foreground">{stock.symbol}</p></div>
                            </div>
                            <div className="text-right"><p className="font-mono">${stock.price.toFixed(2)}</p><p className={cn("text-xs", stock.change >= 0 ? "text-green-500" : "text-red-500")}>{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)</p></div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 ml-2 group" onClick={(e) => handleToggleFavorite(e, {type: 'stock', name: stock.name, value: stock.symbol, logoUrl: stock.logoUrl})}>
                          <Star className={cn("h-4 w-4 text-muted-foreground group-hover:text-yellow-400", favorites.some(f => f.value === stock.symbol) && "text-yellow-400 fill-yellow-400")} />
                        </Button>
                      </CommandItem>
                    ))}
                  </div>)}

                  {filteredAppActions.length > 0 && (<><CommandSeparator /><div className="p-1"><div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">App Actions</div>
                    {filteredAppActions.map((action) => (
                      <CommandItem key={action.name} onSelect={action.onSelect}>
                        <div className="flex items-center justify-between w-full">
                           <div className="flex items-center">
                            <action.icon className="mr-2 h-4 w-4" />
                            <span>{action.name}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 group" onClick={(e) => handleToggleFavorite(e, { type: 'action', name: action.name, value: action.name, icon: action.icon })}>
                             <Star className={cn("h-4 w-4 text-muted-foreground group-hover:text-yellow-400", favorites.some(f => f.value === action.name) && "text-yellow-400 fill-yellow-400")} />
                          </Button>
                        </div>
                      </CommandItem>
                    ))}
                  </div></>)}
              </CommandList>
              )}

              {view === 'stock-detail' && selectedStock && (
                  <div className="p-2 text-sm overflow-y-auto max-h-[calc(70vh-50px)]"><div className="space-y-4">
                      <div className="flex items-start gap-4 p-2 rounded-lg">
                          <Avatar className="h-14 w-14 border-2 border-primary/20 bg-muted">
                            <AvatarImage src={selectedStock.logoUrl} alt={selectedStock.name} />
                            <AvatarFallback className="text-2xl">{selectedStock.symbol.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div><h3 className="text-lg font-bold">{selectedStock.name}</h3><div className="flex items-baseline gap-2"><p className="text-2xl font-bold">${selectedStock.price.toFixed(2)}</p><p className={cn("font-semibold flex items-center", selectedStock.change >= 0 ? "text-green-500" : "text-red-500")}>{selectedStock.change >= 0 ? <TrendingUp className="h-4 w-4 mr-1"/> : <TrendingDown className="h-4 w-4 mr-1" />} {selectedStock.change.toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)</p></div></div>
                      </div>
                      <div className="h-40 w-full"><TradingViewMiniChart symbol={selectedStock.symbol} /></div>
                      <div className="space-y-2"><div className="grid grid-cols-2 gap-2">
                          <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => handleBuySellClick('buy')}>Buy</Button>
                          <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white" onClick={() => handleBuySellClick('sell')}>Sell</Button>
                      </div>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => runCommand(() => router.push(`/trade?symbol=${selectedStock.symbol}`))}><Repeat className="mr-2 h-4 w-4" /> Go to Trade Page</Button>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => { if (watchlist.includes(selectedStock.symbol)) { removeSymbol(selectedStock.symbol); toast({description: "Removed from watchlist."}); } else { addSymbol(selectedStock.symbol); toast({description: "Added to watchlist."}); } }}><Star className={cn("mr-2 h-4 w-4", watchlist.includes(selectedStock.symbol) ? 'text-yellow-400 fill-yellow-400' : '')} /> {watchlist.includes(selectedStock.symbol) ? 'Remove from Watchlist' : 'Add to Watchlist'}</Button>
                      </div>
                      {selectedStockHolding && (<div><h4 className="font-semibold mb-2 flex items-center gap-2 text-muted-foreground"><Building className="h-4 w-4" /> Your Holdings</h4><div className="p-3 rounded-lg bg-muted/50"><div className="flex justify-between items-center"><span className="font-medium">{selectedStockHolding.qty} Shares</span><span className="font-medium">Value: ${(selectedStockHolding.qty * selectedStock.price).toFixed(2)}</span></div></div></div>)}
                      <div><h4 className="font-semibold mb-2 flex items-center gap-2 text-muted-foreground"><BrainCircuit className="h-4 w-4" /> AI Prediction</h4><div className="p-3 rounded-lg bg-muted/50 text-xs min-h-[60px] relative">{isFetchingPrediction ? (<div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/><span>Generating prediction...</span></div>) : prediction ? (<><div className="flex justify-between items-center mb-1"><Badge className={cn("text-white", prediction.confidence === "High" ? "bg-green-500" : prediction.confidence === "Medium" ? "bg-yellow-500" : "bg-red-500")}>{prediction.confidence} Confidence</Badge></div><p className="whitespace-pre-wrap">{prediction.prediction}</p></>) : (<p className="text-muted-foreground">Could not load AI prediction.</p>)}</div></div>
                      <div><h4 className="font-semibold mb-2 flex items-center gap-2 text-muted-foreground"><Newspaper className="h-4 w-4" /> Recent News</h4><div className="space-y-2">{isFetchingNews ? (<div className="flex items-center gap-2 text-muted-foreground text-xs p-2"><Loader2 className="h-4 w-4 animate-spin"/><span>Fetching recent news...</span></div>) : news?.articles && news.articles.length > 0 ? (news.articles.map((article, i) => (<a key={i} href={article.url} target="_blank" rel="noopener noreferrer" className="block p-2 rounded-md hover:bg-muted/50 no-underline"><p className="font-medium truncate leading-tight whitespace-pre-wrap">{article.headline}</p><p className="text-xs text-muted-foreground">{article.source}</p></a>))) : (<div className="p-2 text-xs text-muted-foreground">No recent news found.</div>)}</div></div>
                  </div></div>
              )}
          </div>
        </div>
      </div>

    {selectedStock && (<TradeDialogCMDK isOpen={isTradeDialogOpen} onOpenChange={setIsTradeDialogOpen} symbol={selectedStock.symbol} price={selectedStock.price} action={tradeAction} />)}
    <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}><DialogContent><CreateGoal onAddGoal={(goal) => { addGoal(goal); setIsGoalDialogOpen(false); }} /></DialogContent></Dialog>
    <Dialog open={isFundsDialogOpen} onOpenChange={setIsFundsDialogOpen}><DialogContent><DialogHeader><DialogTitle>Add Funds</DialogTitle><DialogDescription>Your saved payment method will be charged.</DialogDescription></DialogHeader><div className="space-y-4 py-4"><div className="space-y-2"><Label htmlFor="amount">Amount</Label><div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="amount" type="number" value={fundsAmount} onChange={(e) => setFundsAmount(e.target.value)} className="pl-8"/></div></div><Button onClick={handleAddFunds} disabled={isAddingFunds} className="w-full">{isAddingFunds ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}Confirm Deposit</Button></div></DialogContent></Dialog>
    </>
  );
}
