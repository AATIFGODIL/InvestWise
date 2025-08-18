"use client"
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import EducationalVideo from "@/components/shared/educational-video";
import TradeForm from "@/components/trade/trade-form";
import AutoInvest from "@/components/dashboard/auto-invest";
import InvestmentBundles from "@/components/dashboard/investment-bundles";
import { specializedBundles } from "@/data/bundles";
import TradingViewWidget from "@/components/shared/trading-view-widget";
import TradingViewScreener from "@/components/shared/trading-view-screener";
import AiPredictionTrade from "../ai/ai-prediction-trade";
import { fetchPrice } from "@/lib/alphaVantage";

const videos = [
    {
        title: "What are Stocks and ETFs?",
        description: "A beginner's guide to understanding the basics of stocks and exchange-traded-funds.",
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

export default function TradePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedSymbol, setSelectedSymbol] = useState<string>("AAPL");
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null); 
  const [loadingPrice, setLoadingPrice] = useState(false);

  // update symbol from URL on initial load
  useEffect(() => {
    const symbolFromUrl = searchParams.get('symbol');
    if (symbolFromUrl) {
      setSelectedSymbol(symbolFromUrl.toUpperCase());
    }
  }, [searchParams]);

  // fetch price whenever symbol changes
  useEffect(() => {
    async function getPrice() {
      setLoadingPrice(true);
      const price = await fetchPrice(selectedSymbol);
      setSelectedPrice(price);
      setLoadingPrice(false);
    }
    if (selectedSymbol) {
      getPrice();
    }
  }, [selectedSymbol]);

  const handleSymbolChange = useCallback((newSymbol: string) => {
    if (newSymbol && newSymbol !== selectedSymbol) {
      setSelectedSymbol(newSymbol);
      // Update the URL without reloading the page
      router.replace(`/trade?symbol=${newSymbol}`, { scroll: false });
    }
  }, [selectedSymbol, router]);

  return (
    <div className="w-full bg-background font-body">
      <Header />
      <main className="p-4 space-y-6 pb-40">
        <h1 className="text-2xl font-bold">Trade</h1>
        
        <div className="h-[600px] w-full">
            <TradingViewWidget symbol={selectedSymbol} onSymbolChange={handleSymbolChange} />
        </div>

        <TradeForm 
          selectedSymbol={selectedSymbol} 
          selectedPrice={selectedPrice} 
          loadingPrice={loadingPrice}
        />

        <AiPredictionTrade initialSymbol={selectedSymbol} />
        
        <div className="h-[550px] w-full">
            <TradingViewScreener />
        </div>
        
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
