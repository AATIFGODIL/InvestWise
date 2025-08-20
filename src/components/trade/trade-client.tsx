
"use client";

import React, a, { useEffect, useState, useRef, useCallback } from "react";
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
import { Input } from "@/components/ui/input";

const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY as string;

interface TradeData {
  p: number; // price
}

export default function TradeClient() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get('symbol')?.toUpperCase() || "AAPL";

  // State for the main TradingView widget symbol, managed independently
  const [widgetSymbol, setWidgetSymbol] = useState(initialSymbol);
  
  // State for the search input and the symbol passed to other components
  const [inputValue, setInputValue] = useState(initialSymbol);
  const [searchedSymbol, setSearchedSymbol] = useState(initialSymbol);

  const [price, setPrice] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // This callback is ONLY for the TradingView widget to update its own state
  const handleWidgetSymbolChange = useCallback((newSymbol: string) => {
    if (!newSymbol) return;
    setWidgetSymbol(newSymbol.toUpperCase());
  }, []);

  // Effect to fetch price when the *searchedSymbol* changes
  useEffect(() => {
    if (!searchedSymbol || !API_KEY) {
      setError(!API_KEY ? "Finnhub API key is not configured." : null);
      return;
    }

    setPrice(null);
    setLoadingPrice(true);
    setError(null);

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
      console.log(`✅ Connected to Finnhub WS for ${searchedSymbol}`);
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
    socket.onclose = () => console.log(`Finnhub WebSocket closed for ${searchedSymbol}`);

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
        // We don't sync the widget anymore, per user request.
        // setWidgetSymbol(upperCaseSymbol); 
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
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="e.g., AAPL, TSLA"
                        className="pl-10 h-10"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                    />
                </div>
              <Button onClick={handleSearch}>
                {loadingPrice && searchedSymbol === inputValue.toUpperCase() ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Search
              </Button>
            </div>
             {error && <p className="text-destructive text-sm">{error}</p>}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="h-[400px] md:h-[500px] w-full mb-6">
                        <TradingViewWidget symbol={widgetSymbol} onSymbolChange={handleWidgetSymbolChange}/>
                    </div>
                    <AiPredictionTrade initialSymbol={searchedSymbol} />
                </div>
                <div className="lg:col-span-1">
                    <TradeForm 
                        selectedSymbol={searchedSymbol}
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
