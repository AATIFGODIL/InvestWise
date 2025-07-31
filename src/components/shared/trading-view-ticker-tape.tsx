
"use client";

import React, { useEffect, useRef, memo } from 'react';

interface StockData {
  symbol: string;
  name: string;
  price: number;
}

interface TradingViewTickerTapeProps {
  onDataLoaded: (data: StockData[]) => void;
}

const stockList: { proName: string, title: string }[] = [
    { proName: "BATS:AAPL", title: "Apple Inc." },
    { proName: "BATS:MSFT", title: "Microsoft Corporation" },
    { proName: "BATS:GOOGL", title: "Alphabet Inc." },
    { proName: "BATS:AMZN", title: "Amazon.com, Inc." },
    { proName: "BATS:NVDA", title: "NVIDIA Corporation" },
    { proName: "BATS:TSLA", title: "Tesla, Inc." },
    { proName: "BATS:META", title: "Meta Platforms, Inc." },
    { proName: "BATS:JPM", title: "JPMorgan Chase & Co." },
    { proName: "BATS:V", title: "Visa Inc." },
    { proName: "BATS:JNJ", title: "Johnson & Johnson" },
    { proName: "BATS:WMT", title: "Walmart Inc." },
    { proName: "BATS:PG", title: "Procter & Gamble Company" },
    { proName: "BATS:DIS", title: "The Walt Disney Company" },
    { proName: "BATS:PFE", title: "Pfizer Inc." },
    { proName: "BATS:BAC", title: "Bank of America Corp" },
    { proName: "BATS:KO", title: "The Coca-Cola Company" },
    { proName: "BATS:XOM", title: "Exxon Mobil Corporation" },
    { proName: "BATS:HD", title: "The Home Depot, Inc." },
    { proName: "BATS:CVX", title: "Chevron Corporation" },
    { proName: "BATS:MA", title: "Mastercard Incorporated" },
    { proName: "BATS:UNH", title: "UnitedHealth Group Incorporated" },
    { proName: "BATS:PEP", title: "PepsiCo, Inc." },
    { proName: "BATS:ADBE", title: "Adobe Inc." },
    { proName: "BATS:CRM", title: "Salesforce, Inc." },
    { proName: "BATS:NFLX", title: "Netflix, Inc." },
    { proName: "BATS:TMO", title: "Thermo Fisher Scientific Inc." },
    { proName: "BATS:ABT", title: "Abbott Laboratories" },
    { proName: "BATS:CSCO", title: "Cisco Systems, Inc." },
    { proName: "BATS:ORCL", title: "Oracle Corporation" },
    { proName: "BATS:INTC", title: "Intel Corporation" },
];


const TradingViewTickerTape: React.FC<TradingViewTickerTapeProps> = ({ onDataLoaded }) => {
  const container = useRef<HTMLDivElement>(null);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return;

    // Immediately provide a comprehensive list of stocks with simulated real-time prices.
    const symbols: StockData[] = stockList.map(stock => ({
      symbol: stock.proName.split(':')[1],
      name: stock.title,
      // Simulate a realistic, dynamic price for each stock.
      price: parseFloat((Math.random() * (1000 - 50) + 50).toFixed(2))
    }));

    onDataLoaded(symbols);
    hasLoaded.current = true;

    // Keep the widget script for its visual display if needed elsewhere,
    // but don't rely on it for data extraction.
    if (!container.current) return;
    
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbols": stockList.map(s => ({ proName: s.proName, title: s.title })),
      "showSymbolLogo": false,
      "isTransparent": true,
      "displayMode": "regular",
      "colorTheme": document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      "locale": "en"
    });

    if (container.current) {
        container.current.innerHTML = ''; // Clear previous script
        container.current.appendChild(script);
    }
    
    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [onDataLoaded]);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export { TradingViewTickerTape };
