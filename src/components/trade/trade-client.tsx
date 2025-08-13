
"use client"
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import EducationalVideo from "@/components/shared/educational-video";
import TradeForm from "@/components/trade/trade-form";
import AutoInvest from "@/components/dashboard/auto-invest";
import InvestmentBundles from "@/components/dashboard/investment-bundles";
import { specializedBundles } from "@/data/bundles";
import TradingViewWidget from "@/components/shared/trading-view-widget";
import TradingViewScreener from "@/components/shared/trading-view-screener";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AiPredictionTrade from "../ai/ai-prediction-trade";

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
  const [selectedSymbol, setSelectedSymbol] = useState<string>("AAPL");
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null); 

  useEffect(() => {
    const symbolFromUrl = searchParams.get('symbol');
    if (symbolFromUrl) {
      setSelectedSymbol(symbolFromUrl.toUpperCase());
    }
  }, [searchParams]);

  return (
    <div className="w-full bg-background font-body">
      <Header />
      <main className="p-4 space-y-6 pb-40">
        <h1 className="text-2xl font-bold">Trade</h1>
        
        <div className="h-[600px] w-full">
            <TradingViewWidget symbol={selectedSymbol} />
        </div>

        <TradeForm selectedSymbol={selectedSymbol} selectedPrice={selectedPrice} />

        <Tabs defaultValue="market-screener" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="market-screener">Market Screener</TabsTrigger>
                <TabsTrigger value="ai-prediction">AI Prediction</TabsTrigger>
            </TabsList>
            <TabsContent value="market-screener" className="mt-6">
                <div className="h-[550px] w-full">
                    <TradingViewScreener />
                </div>
            </TabsContent>
             <TabsContent value="ai-prediction" className="mt-6">
                <AiPredictionTrade initialSymbol={selectedSymbol} />
            </TabsContent>
        </Tabs>
        
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
