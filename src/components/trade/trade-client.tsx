
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import TradingViewWidget from "@/components/shared/trading-view-widget";
import TradeForm from "@/components/trade/trade-form";
import TradingViewScreener from "@/components/shared/trading-view-screener";
import AiPredictionTrade from "@/components/ai/ai-prediction-trade";
import InvestmentBundles from "../dashboard/investment-bundles";
import { specializedBundles } from "@/data/bundles";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY as string;

interface TradeData {
  p: number; // price
}

interface SearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

export default function TradeClient() {
  const searchParams = useSearchParams();
  const [symbol, setSymbol] = useState(searchParams.get('symbol')?.toUpperCase() || "AAPL");
  const [inputValue, setInputValue] = useState(symbol);
  const [price, setPrice] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSymbolChange = useCallback((newSymbol: string) => {
    if (!newSymbol) return;
    const upperSymbol = newSymbol.toUpperCase();
    setSymbol(upperSymbol);
    setInputValue(upperSymbol);
    setIsSearchOpen(false);
    // Update URL without reloading page
    window.history.pushState({}, '', `/trade?symbol=${upperSymbol}`);
  }, []);

  useEffect(() => {
    const symbolFromUrl = searchParams.get('symbol');
    if (symbolFromUrl && symbolFromUrl.toUpperCase() !== symbol) {
      handleSymbolChange(symbolFromUrl);
    }
    // This effect should only run when the search params change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (!symbol || !API_KEY) {
      setError(!API_KEY ? "Finnhub API key is not configured." : null);
      return;
    }

    setPrice(null);
    setLoadingPrice(true);
    setError(null);

    async function fetchInitialPrice() {
        try {
            const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`);
            if (!res.ok) throw new Error(`Failed to fetch quote: ${res.statusText}`);
            const data = await res.json();
            if (data && typeof data.c !== 'undefined' && data.c !== 0) {
                setPrice(data.c);
            } else {
                setError("Invalid data received for symbol. It might be delisted or incorrect.");
            }
        } catch (err: any) {
            console.error("Error fetching initial price:", err);
            setError(`Could not fetch price data for ${symbol}. Please check the symbol.`);
        } finally {
            setLoadingPrice(false);
        }
    }

    fetchInitialPrice();

    if (socketRef.current) socketRef.current.close();

    const socket = new WebSocket(`wss://ws.finnhub.io?token=${API_KEY}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log(`✅ Connected to Finnhub WS for ${symbol}`);
      socket.send(JSON.stringify({ type: "subscribe", symbol }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "trade" && data.data?.length > 0) {
        const trade: TradeData = data.data[0];
        setPrice(trade.p);
      }
    };

    socket.onerror = (err) => console.error("WebSocket error. This is often due to an invalid symbol or connection issue.");
    socket.onclose = () => console.log(`Finnhub WebSocket closed for ${symbol}`);

    return () => {
      if (socketRef.current) {
        if (socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: "unsubscribe", symbol }));
            socketRef.current.close();
        }
        socketRef.current = null;
      }
    };
  }, [symbol]);

  const handleSearchInputChange = async (value: string) => {
    setInputValue(value.toUpperCase());
    if (value.length > 0) {
        if (!isSearchOpen) setIsSearchOpen(true);
        try {
            const res = await fetch(`https://finnhub.io/api/v1/search?q=${value}&token=${API_KEY}`);
            const data = await res.json();
            setSearchResults(data.result || []);
        } catch (err) {
            console.error("Search failed:", err);
        }
    } else {
        if (isSearchOpen) setIsSearchOpen(false);
        setSearchResults([]);
    }
  };

  return (
    <div className="w-full bg-background font-body">
      <Header />
      <main className="p-4 space-y-6 pb-40">
        <h1 className="text-2xl font-bold">Trade</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Stock Chart & Trading</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-2">
                <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                    <PopoverTrigger asChild>
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                             <Command className="w-full">
                                <CommandInput
                                    ref={searchInputRef}
                                    value={inputValue}
                                    onValueChange={handleSearchInputChange}
                                    placeholder="e.g., AAPL, TSLA"
                                    className="pl-10 h-10"
                                />
                            </Command>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
                        <Command>
                            <CommandList>
                                {searchResults.length === 0 && inputValue.length > 1 && <CommandEmpty>No results found.</CommandEmpty>}
                                <CommandGroup>
                                    {searchResults.map((result) => (
                                        <CommandItem
                                            key={result.symbol}
                                            value={result.symbol}
                                            onSelect={() => handleSymbolChange(result.symbol)}
                                            className="cursor-pointer"
                                        >
                                            <span className="font-bold w-20">{result.symbol}</span>
                                            <span className="text-muted-foreground truncate">{result.description}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
              <Button onClick={() => handleSymbolChange(inputValue)}>
                {loadingPrice ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Search
              </Button>
            </div>
             {error && <p className="text-destructive text-sm">{error}</p>}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="h-[400px] md:h-[500px] w-full mb-6">
                        <TradingViewWidget symbol={symbol} onSymbolChange={handleSymbolChange}/>
                    </div>
                    <AiPredictionTrade initialSymbol={symbol} />
                </div>
                <div className="lg:col-span-1">
                    <TradeForm 
                        selectedSymbol={symbol}
                        selectedPrice={price}
                        loadingPrice={loadingPrice}
                    />
                </div>
            </div>
          </CardContent>
        </Card>

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

      </main>
      <BottomNav />
    </div>
  );
}
