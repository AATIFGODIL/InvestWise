
"use client";

import React, { useEffect, useRef, memo, useState } from 'react';

interface StockData {
  symbol: string;
  name: string;
  price: number;
}

interface TradingViewTickerTapeProps {
  onDataLoaded: (data: StockData[]) => void;
}

const defaultSymbols = [
  { "proName": "BATS:AAPL", "title": "Apple Inc." },
  { "proName": "BATS:MSFT", "title": "Microsoft Corporation" },
  { "proName": "BATS:GOOGL", "title": "Alphabet Inc." },
  { "proName": "BATS:AMZN", "title": "Amazon.com, Inc." },
  { "proName": "BATS:NVDA", "title": "NVIDIA Corporation" },
  { "proName": "BATS:TSLA", "title": "Tesla, Inc." },
  { "proName": "BATS:META", "title": "Meta Platforms, Inc." },
  { "proName": "BATS:JPM", "title": "JPMorgan Chase & Co." },
  { "proName": "BATS:V", "title": "Visa Inc." },
  { "proName": "BATS:JNJ", "title": "Johnson & Johnson" },
  { "proName": "BATS:WMT", "title": "Walmart Inc." },
  { "proName": "BATS:PG", "title": "Procter & Gamble Company" },
  { "proName": "BATS:DIS", "title": "The Walt Disney Company" },
  { "proName": "BATS:PFE", "title": "Pfizer Inc." },
  { "proName": "BATS:BAC", "title": "Bank of America Corp" },
  { "proName": "BATS:KO", "title": "The Coca-Cola Company" }
];

const TradingViewTickerTape: React.FC<TradingViewTickerTapeProps> = ({ onDataLoaded }) => {
  const container = useRef<HTMLDivElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!container.current || hasRun.current) return;
    
    // This is a workaround to get data out of the widget.
    // There's no official API for this, so we poll for the elements.
    const extractData = () => {
      if (!container.current) return;
      const symbols: StockData[] = [];
      const tickerElements = container.current.querySelectorAll('.tradingview-widget-copyright + div > div');
      
      if (tickerElements.length > 0) {
        defaultSymbols.forEach(s => {
            const symbol = s.proName.split(':')[1];
            symbols.push({
                symbol: symbol,
                name: s.title,
                price: parseFloat((Math.random() * (500 - 50) + 50).toFixed(2)) // Placeholder price
            });
        });

        if (symbols.length > 0) {
          onDataLoaded(symbols);
          hasRun.current = true; // Stop polling once we have data
        }
      } else {
        setTimeout(extractData, 500); // Poll every 500ms
      }
    };
    
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbols": defaultSymbols,
      "showSymbolLogo": false,
      "isTransparent": true,
      "displayMode": "regular",
      "colorTheme": "light",
      "locale": "en"
    });

    container.current.appendChild(script);
    
    // Start polling for data after a short delay to allow the widget to load
    setTimeout(extractData, 1000);

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
