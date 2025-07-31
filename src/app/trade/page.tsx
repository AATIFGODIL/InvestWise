
"use client"
import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import EducationalVideo from "@/components/shared/educational-video";
import TradeForm from "@/components/trade/trade-form";
import AutoInvest from "@/components/dashboard/auto-invest";
import InvestmentBundles from "@/components/dashboard/investment-bundles";
import { specializedBundles } from "@/data/bundles";
import StockList from "@/components/trade/stock-list";
import TradingViewWidget from "@/components/shared/trading-view-widget";

const videos = [
    {
        title: "What are Stocks and ETFs?",
        description: "A beginner's guide to understanding the basics of stocks and exchange-traded funds.",
        image: "https://placehold.co/600x400.png",
        hint: "chart graph"
    },
    {
        title: "How to Place Your First Trade",
        description: "A step-by-step walkthrough of buying your first asset on an investment platform.",
        image: "https://placehold.co/600x400.png",
        hint: "trading screen"
    }
]

export default function TradePage() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("AAPL");
  const [selectedPrice, setSelectedPrice] = useState<number | null>(150.00); // Example initial price

  // In a real app, you'd have a mechanism to get the live price.
  // For now, we simulate a price update when the symbol changes.
  useEffect(() => {
    // Simulate fetching price for the new symbol
    if (selectedSymbol) {
      // In a real scenario, this would be an API call.
      // Here, we'll just set a new random price to simulate a change.
      const newPrice = parseFloat((Math.random() * (500 - 50) + 50).toFixed(2));
      setSelectedPrice(newPrice);
    }
  }, [selectedSymbol]);

  return (
    <div className="w-full bg-background font-body">
      <Header />
      <main className="p-4 space-y-6 pb-40">
        <h1 className="text-2xl font-bold">Trade</h1>
        
        <div className="h-[600px] w-full">
            <TradingViewWidget symbol={selectedSymbol} onSymbolChange={setSelectedSymbol} />
        </div>

        <TradeForm selectedSymbol={selectedSymbol} selectedPrice={selectedPrice} />
        <StockList />
        <InvestmentBundles 
          bundles={specializedBundles}
          title="Discover Specialized Bundles"
          description="Themed collections for focused strategies"
        />
        <AutoInvest />
        <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold">Learn About Trading</h2>
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
