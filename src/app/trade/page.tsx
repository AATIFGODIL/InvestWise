
"use client"
import { useState } from "react";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import EducationalVideo from "@/components/shared/educational-video";
import TradeForm from "@/components/trade/trade-form";
import AutoInvest from "@/components/dashboard/auto-invest";
import InvestmentBundles from "@/components/dashboard/investment-bundles";
import { specializedBundles } from "@/data/bundles";
import TradingViewWidget from "@/components/shared/trading-view-widget";

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

export default function TradePage() {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>("AAPL");
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null); 

  return (
    <div className="w-full bg-background font-body">
      <Header />
      <main className="p-4 space-y-6 pb-40">
        <h1 className="text-2xl font-bold">Trade</h1>
        
        <div className="h-[600px] w-full">
            <TradingViewWidget symbol={selectedSymbol} />
        </div>

        <TradeForm selectedSymbol={selectedSymbol} selectedPrice={selectedPrice} />

        <div className="h-[700px] w-full">
            <div className="tradingview-widget-container" style={{height: "100%", width: "100%"}}>
              <div id="tradingview_123" style={{height: "calc(100% - 32px)", width: "100%"}}></div>
              <div className="tradingview-widget-copyright">
                  <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
                      <span className="blue-text">Track all markets on TradingView</span>
                  </a>
              </div>
              <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
              <script type="text/javascript" dangerouslySetInnerHTML={{
                __html: `
                new TradingView.widget(
                {
                  "width": "100%",
                  "height": "100%",
                  "symbol": "NASDAQ:AAPL",
                  "interval": "D",
                  "timezone": "Etc/UTC",
                  "theme": "light",
                  "style": "1",
                  "locale": "en",
                  "enable_publishing": false,
                  "allow_symbol_change": true,
                  "container_id": "tradingview_123"
                }
                );
                `
              }} />
            </div>
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
