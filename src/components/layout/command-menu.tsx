
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
} from "lucide-react";
import { useWatchlistStore } from "@/store/watchlist-store";
import { useToast } from "@/hooks/use-toast";
import useLoadingStore from "@/store/loading-store";
import { handleStockPrediction } from "@/app/actions";
import { type StockPredictionOutput } from "@/ai/types/stock-prediction-types";
import { Button } from "../ui/button";
import { stockList } from "@/data/stocks";

const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY as string;

interface StockData {
  symbol: string;
  name: string;
  price: number;
}

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

  const [stocks, setStocks] = useState<StockData[]>([]);
  const [query, setQuery] = useState("");
  const [prediction, setPrediction] = useState<StockPredictionOutput | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingStocks, setIsFetchingStocks] = useState(false);

  useEffect(() => {
    async function fetchStockData() {
        if (!open || stocks.length > 0) return; // Don't refetch if already loaded

        setIsFetchingStocks(true);
        if (!API_KEY || API_KEY.startsWith("AIzaSy")) {
            console.warn("Finnhub API key not configured. Using simulated data for command menu.");
            const simulatedData = stockList.map(stock => ({
                symbol: stock.symbol,
                name: stock.name,
                price: parseFloat((Math.random() * 500).toFixed(2))
            }));
            setStocks(simulatedData);
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
                };
            } catch (error) {
                console.error(`Error fetching price for ${stock.symbol}:`, error);
                return {
                    symbol: stock.symbol,
                    name: stock.name,
                    price: 0, // Default to 0 on error
                };
            }
        });

        const results = await Promise.all(promises);
        setStocks(results.filter(stock => stock.price > 0)); // Filter out stocks with no price
        setIsFetchingStocks(false);
    }
    
    fetchStockData();
  }, [open, stocks.length]);

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };
  
  const handleTradeNavigation = (symbol: string) => {
    showLoading();
    router.push(`/trade?symbol=${symbol}`);
  };

  const perfectMatch = useMemo(() => {
    const matchedStock = stocks.find(
      (stock) => stock.symbol.toUpperCase() === query.toUpperCase()
    );
    if (!matchedStock) {
        setPrediction(null);
        return null;
    }
    return matchedStock;
  }, [query, stocks]);

  const handlePredict = async () => {
    if (!perfectMatch) return;
    setIsPredicting(true);
    setPrediction(null);
    setError(null);

    const result = await handleStockPrediction(perfectMatch.symbol);
    if (result.success && result.prediction) {
      setPrediction(result.prediction);
    } else {
      setError(result.error || "An unknown error occurred.");
    }
    setIsPredicting(false);
  };
  

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search for a stock or action..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isFetchingStocks ? (
           <div className="py-6 text-center text-sm">Loading stocks...</div>
        ) : (
          <CommandEmpty>No results found.</CommandEmpty>
        )}

        {perfectMatch && (
           <CommandGroup heading={perfectMatch.name}>
              <div className="p-2 space-y-2">
                  <div className="flex justify-between items-center text-sm px-2">
                      <span className="font-semibold">{perfectMatch.symbol}</span>
                      <span className="font-mono text-lg">${perfectMatch.price.toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                       <Button variant="outline" size="sm" onClick={() => runCommand(() => handleTradeNavigation(perfectMatch.symbol))}>
                          <Repeat className="mr-2 h-4 w-4" /> Trade
                      </Button>
                      <Button variant="outline" size="sm" className="text-green-600" onClick={() => runCommand(() => handleTradeNavigation(perfectMatch.symbol))}>
                          <PlusCircle className="mr-2 h-4 w-4" /> Buy
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600" onClick={() => runCommand(() => handleTradeNavigation(perfectMatch.symbol))}>
                          <MinusCircle className="mr-2 h-4 w-4" /> Sell
                      </Button>
                      <Button variant="outline" size="sm" onClick={handlePredict} disabled={isPredicting}>
                          {isPredicting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <BrainCircuit className="mr-2 h-4 w-4" />}
                           Predict
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => runCommand(() => window.open(`https://www.google.com/search?q=${perfectMatch.name}+stock+news`, '_blank'))}>
                          <Newspaper className="mr-2 h-4 w-4" /> News
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                          const isInWatchlist = watchlist.includes(perfectMatch.symbol);
                          if (isInWatchlist) {
                              removeSymbol(perfectMatch.symbol);
                              toast({ description: `${perfectMatch.symbol} removed from watchlist.`});
                          } else {
                              addSymbol(perfectMatch.symbol);
                              toast({ description: `${perfectMatch.symbol} added to watchlist.`});
                          }
                      }}>
                          <Star className={`mr-2 h-4 w-4 ${watchlist.includes(perfectMatch.symbol) ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                           Watchlist
                      </Button>
                  </div>
                  {prediction && (
                      <div className="p-2 mt-2 bg-muted rounded-md text-xs">
                          <p className="font-bold">AI Prediction ({prediction.confidence}):</p>
                          <p>{prediction.prediction}</p>
                      </div>
                  )}
                  {error && (
                      <div className="p-2 mt-2 bg-destructive/20 text-destructive text-xs rounded-md">
                          <p>{error}</p>
                      </div>
                  )}
              </div>
           </CommandGroup>
        )}

        {query && !perfectMatch && stocks.length > 0 && (
          <CommandGroup heading="Stocks">
            {stocks
              .filter(
                (stock) =>
                  stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
                  stock.name.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 5)
              .map((stock) => (
                <CommandItem
                  key={stock.symbol}
                  onSelect={() => runCommand(() => handleTradeNavigation(stock.symbol))}
                  value={`${stock.symbol} - ${stock.name}`}
                >
                  <div className="flex justify-between w-full">
                    <span>{stock.name} ({stock.symbol})</span>
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
      </CommandList>
    </CommandDialog>
  );
}
