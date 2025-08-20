
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import TradingViewWidget from "@/components/shared/trading-view-widget";
import TradeForm from "@/components/trade/trade-form";
import TradingViewScreener from "@/components/shared/trading-view-screener";
import AiPredictionTrade from "@/components/ai/ai-prediction-trade";
import EducationalVideo from "@/components/shared/educational-video";

const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY as string;

interface TradeData {
  p: number; // price
}

const videos = [
    {
        title: "Technical Analysis Basics",
        description: "Learn how to read stock charts and identify potential trading opportunities.",
        image: "https://placehold.co/600x400.png",
        hint: "stock chart analysis"
    },
    {
        title: "Understanding Order Types",
        description: "A clear guide to market, limit, and stop orders and when to use each one.",
        image: "https://placehold.co/600x400.png",
        hint: "financial strategy planning"
    }
];

export default function TradeClient() {
  const searchParams = useSearchParams();
  const [symbol, setSymbol] = useState(searchParams.get('symbol')?.toUpperCase() || "AAPL");
  const [inputValue, setInputValue] = useState(symbol);
  const [price, setPrice] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const handleSymbolChange = useCallback((newSymbol: string) => {
    const upperSymbol = newSymbol.toUpperCase();
    setSymbol(upperSymbol);
    setInputValue(upperSymbol);
    // Update URL without reloading page
    window.history.pushState({}, '', `/trade?symbol=${upperSymbol}`);
  }, []);

  useEffect(() => {
    const symbolFromUrl = searchParams.get('symbol');
    if (symbolFromUrl && symbolFromUrl.toUpperCase() !== symbol) {
      handleSymbolChange(symbolFromUrl);
    }
  }, [searchParams, symbol, handleSymbolChange]);
  

  useEffect(() => {
    if (!symbol || !API_KEY) {
      setError(!API_KEY ? "Finnhub API key is not configured." : null);
      return;
    }

    setPrice(null);
    setLoadingPrice(true);
    setError(null);

    // --- 1. Fetch initial price via REST API ---
    async function fetchInitialPrice() {
        try {
            const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`);
            if (!res.ok) {
                throw new Error(`Failed to fetch quote: ${res.statusText}`);
            }
            const data = await res.json();
            if (data && typeof data.c !== 'undefined') {
                setPrice(data.c); // 'c' is the close price / current price
            } else {
                 setError("Invalid data received for symbol.");
            }
        } catch (err: any) {
            console.error("Error fetching initial price:", err);
            setError(`Could not fetch price data for ${symbol}. Please check the symbol.`);
        } finally {
            setLoadingPrice(false);
        }
    }

    fetchInitialPrice();


    // --- 2. Connect to WebSocket for live updates ---
    if (socketRef.current) {
        socketRef.current.close();
    }

    const socket = new WebSocket(`wss://ws.finnhub.io?token=${API_KEY}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log(`✅ Connected to Finnhub WS for ${symbol}`);
      socket.send(JSON.stringify({ type: "subscribe", symbol }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "trade" && data.data && data.data.length > 0) {
        const trade: TradeData = data.data[0];
        setPrice(trade.p);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      // Don't set a blocking error here, as the REST price might still be valid.
    };

    socket.onclose = () => {
      console.log(`Finnhub WebSocket closed for ${symbol}`);
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "unsubscribe", symbol }));
        socket.close();
      }
      socketRef.current = null;
    };
  }, [symbol]);

  const handleSearch = () => {
    handleSymbolChange(inputValue);
  };
  
  const handleScreenerSymbolClick = (screenerSymbol: string) => {
    const cleanSymbol = screenerSymbol.split(':').pop();
    if (cleanSymbol) {
      handleSymbolChange(cleanSymbol);
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
                  onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g., AAPL, TSLA"
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>
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
        
        <Card>
            <CardHeader>
                <CardTitle>Stock Screener</CardTitle>
            </CardHeader>
            <CardContent className="h-[600px]">
                 <TradingViewScreener />
            </CardContent>
        </Card>

        <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold">Trading Education</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videos.map((video) => (
                    <EducationalVideo key={video.title} {...video} />
                ))}
            </div>
        </div>

      </main>
      <BottomNav />
    </div>
  );
}
