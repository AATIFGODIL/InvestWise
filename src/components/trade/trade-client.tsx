
"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ✅ Finnhub API key directly from .env
const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY as string;

interface TradeData {
  p: number; // price
}

export default function TradeClient() {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("AAPL");
  const [price, setPrice] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // 🔹 Step 1: Load NASDAQ symbol list from Finnhub
  useEffect(() => {
    async function fetchSymbols() {
      if (!API_KEY) {
        setError("Finnhub API key is not configured. Please set NEXT_PUBLIC_FINNHUB_API_KEY in your .env file.");
        console.error("Finnhub API key is not configured.");
        return;
      }
      setError(null);
      try {
        const res = await fetch(
          `https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${API_KEY}`
        );
        if (!res.ok) {
          throw new Error(`Failed to fetch symbols: ${res.statusText}`);
        }
        const data = await res.json();
        const nasdaqOnly = data
          .filter((s: any) => s.mic === "XNAS") // only NASDAQ
          .map((s: any) => s.symbol)
          .sort(); // Sort symbols alphabetically
        setSymbols(nasdaqOnly);
      } catch (err: any) {
        console.error("Error fetching NASDAQ symbols:", err);
        setError(`Failed to load stock symbols. ${err.message}`);
      }
    }
    fetchSymbols();
  }, []);

  // 🔹 Step 2: Subscribe to WebSocket for live prices
  useEffect(() => {
    if (!selectedSymbol || !API_KEY) return;

    setPrice(null); // Reset price when symbol changes
    setLastUpdated("");

    const ws = new WebSocket(`wss://ws.finnhub.io?token=${API_KEY}`);

    ws.onopen = () => {
      console.log(`✅ Connected to Finnhub WS for ${selectedSymbol}`);
      ws.send(JSON.stringify({ type: "subscribe", symbol: selectedSymbol }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "trade" && data.data && data.data.length > 0) {
        const trade: TradeData = data.data[0];
        setPrice(trade.p);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    };

    ws.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
      setError("WebSocket connection failed. Live price updates may not be available.");
    };
    
    ws.onclose = () => {
        console.log(`Finnhub WebSocket closed for ${selectedSymbol}`);
    }

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "unsubscribe", symbol: selectedSymbol }));
        ws.close();
      }
    };
  }, [selectedSymbol]);

  return (
    <div className="w-full bg-background font-body">
      <Header />
      <main className="p-4 space-y-6 pb-40">
        <Card>
            <CardHeader>
                 <CardTitle className="text-2xl font-bold">📈 Live NASDAQ Prices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && <p className="text-destructive text-sm">{error}</p>}
                
                {/* Symbol Selector */}
                <div>
                    <label htmlFor="symbol-select" className="block text-sm font-medium text-muted-foreground mb-1">Select Stock</label>
                    <select
                        id="symbol-select"
                        value={selectedSymbol}
                        onChange={(e) => setSelectedSymbol(e.target.value)}
                        className="p-2 rounded-lg border w-full bg-background"
                        disabled={symbols.length === 0}
                    >
                        {symbols.length > 0 ? (
                        symbols.map((sym) => (
                            <option key={sym} value={sym}>
                            {sym}
                            </option>
                        ))
                        ) : (
                        <option>Loading symbols...</option>
                        )}
                    </select>
                </div>


                {/* Live Price Display */}
                <div className="mt-6 text-lg">
                    {price !== null ? (
                    <p className="text-3xl font-bold">
                        {selectedSymbol}:{" "}
                        <span>${price.toFixed(2)}</span>  
                        <span className="text-sm text-muted-foreground ml-2"> (updated {lastUpdated})</span>
                    </p>
                    ) : (
                    <p>Waiting for price...</p>
                    )}
                </div>
            </CardContent>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
