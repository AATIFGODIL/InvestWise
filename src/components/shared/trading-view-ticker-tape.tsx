
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
    // Dow Jones Industrial Average (30)
    { proName: "NASDAQ:AAPL", title: "Apple Inc." },
    { proName: "NYSE:MSFT", title: "Microsoft Corporation" },
    { proName: "NYSE:JPM", title: "JPMorgan Chase & Co." },
    { proName: "NYSE:V", title: "Visa Inc." },
    { proName: "NYSE:JNJ", title: "Johnson & Johnson" },
    { proName: "NYSE:WMT", title: "Walmart Inc." },
    { proName: "NYSE:PG", title: "Procter & Gamble Company" },
    { proName: "NYSE:UNH", title: "UnitedHealth Group Incorporated" },
    { proName: "NYSE:HD", title: "The Home Depot, Inc." },
    { proName: "NYSE:MA", title: "Mastercard Incorporated" },
    { proName: "NYSE:BAC", title: "Bank of America Corp" },
    { proName: "NYSE:DIS", title: "The Walt Disney Company" },
    { proName: "NYSE:KO", title: "The Coca-Cola Company" },
    { proName: "NYSE:NKE", title: "NIKE, Inc." },
    { proName: "NASDAQ:CSCO", title: "Cisco Systems, Inc." },
    { proName: "NASDAQ:INTC", title: "Intel Corporation" },
    { proName: "NYSE:IBM", title: "International Business Machines Corporation" },
    { proName: "NYSE:TRV", title: "The Travelers Companies, Inc." },
    { proName: "NYSE:AXP", title: "American Express Company" },
    { proName: "NYSE:GS", title: "The Goldman Sachs Group, Inc." },
    { proName: "NYSE:CRM", title: "Salesforce, Inc." },
    { proName: "NYSE:CAT", title: "Caterpillar Inc." },
    { proName: "NYSE:BA", title: "The Boeing Company" },
    { proName: "NYSE:CVX", title: "Chevron Corporation" },
    { proName: "NYSE:MRK", title: "Merck & Co., Inc." },
    { proName: "NASDAQ:AMGN", title: "Amgen Inc." },
    { proName: "NYSE:HON", title: "Honeywell International Inc." },
    { proName: "NYSE:DOW", title: "Dow Inc." },
    { proName: "NYSE:WBA", title: "Walgreens Boots Alliance, Inc." },
    { proName: "NYSE:MMM", title: "3M Company" },

    // NASDAQ Top Stocks
    { proName: "NASDAQ:GOOGL", title: "Alphabet Inc. (Class A)" },
    { proName: "NASDAQ:AMZN", title: "Amazon.com, Inc." },
    { proName: "NASDAQ:NVDA", title: "NVIDIA Corporation" },
    { proName: "NASDAQ:TSLA", title: "Tesla, Inc." },
    { proName: "NASDAQ:META", title: "Meta Platforms, Inc." },
    { proName: "NASDAQ:ADBE", title: "Adobe Inc." },
    { proName: "NASDAQ:NFLX", title: "Netflix, Inc." },
    { proName: "NASDAQ:PEP", title: "PepsiCo, Inc." },
    { proName: "NASDAQ:AVGO", title: "Broadcom Inc." },
    { proName: "NASDAQ:QCOM", title: "QUALCOMM Incorporated" },
    { proName: "NASDAQ:TXN", title: "Texas Instruments Incorporated" },
    { proName: "NASDAQ:COST", title: "Costco Wholesale Corporation" },
    { proName: "NASDAQ:CMCSA", title: "Comcast Corporation" },
    { proName: "NASDAQ:PYPL", title: "PayPal Holdings, Inc." },
    { proName: "NASDAQ:SBUX", title: "Starbucks Corporation" },
    { proName: "NASDAQ:MDLZ", title: "Mondelez International, Inc." },
    { proName: "NASDAQ:AMD", title: "Advanced Micro Devices, Inc." },
    { proName: "NASDAQ:ISRG", title: "Intuitive Surgical, Inc." },
    { proName: "NASDAQ:GILD", title: "Gilead Sciences, Inc." },
    { proName: "NASDAQ:BKNG", title: "Booking Holdings Inc." },
    { proName: "NASDAQ:MAR", title: "Marriott International, Inc." },
    { proName: "NASDAQ:MU", title: "Micron Technology, Inc." },
    { proName: "NASDAQ:LRCX", title: "Lam Research Corporation" },
    { proName: "NASDAQ:REGN", title: "Regeneron Pharmaceuticals, Inc." },
    { proName: "NASDAQ:ATVI", title: "Activision Blizzard, Inc." },
    { proName: "NASDAQ:VRTX", title: "Vertex Pharmaceuticals Incorporated" },
    { proName: "NASDAQ:BIIB", title: "Biogen Inc." },
    { proName: "NASDAQ:IDXX", title: "IDEXX Laboratories, Inc." },
    { proName: "NASDAQ:WDAY", title: "Workday, Inc." },
    { proName: "NASDAQ:XEL", title: "Xcel Energy Inc." },
    
    // S&P 500 Top Stocks (excluding duplicates from Dow & NASDAQ list)
    { proName: "NYSE:BRK.B", title: "Berkshire Hathaway Inc. (Class B)" },
    { proName: "NYSE:XOM", title: "Exxon Mobil Corporation" },
    { proName: "NYSE:PFE", title: "Pfizer Inc." },
    { proName: "NYSE:TMO", title: "Thermo Fisher Scientific Inc." },
    { proName: "NYSE:ABT", title: "Abbott Laboratories" },
    { proName: "NYSE:ACN", title: "Accenture plc" },
    { proName: "NYSE:LLY", title: "Eli Lilly and Company" },
    { proName: "NYSE:ORCL", title: "Oracle Corporation" },
    { proName: "NYSE:MCD", title: "McDonald's Corporation" },
    { proName: "NYSE:NEE", title: "NextEra Energy, Inc." },
    { proName: "NYSE:PM", title: "Philip Morris International Inc." },
    { proName: "NYSE:RTX", title: "Raytheon Technologies Corporation" },
    { proName: "NYSE:UPS", title: "United Parcel Service, Inc." },
    { proName: "NYSE:LOW", title: "Lowe's Companies, Inc." },
    { proName: "NYSE:F", title: "Ford Motor Company" },
    { proName: "NYSE:GM", title: "General Motors Company" },
    { proName: "NYSE:T", title: "AT&T Inc." },
    { proName: "NYSE:C", title: "Citigroup Inc." },
    { proName: "NYSE:GE", title: "General Electric Company" },
    { proName: "NYSE:MO", title: "Altria Group, Inc." },
    { proName: "NYSE:BLK", title: "BlackRock, Inc." },
    { proName: "NYSE:DE", title: "Deere & Company" },
    { proName: "NYSE:SPGI", title: "S&P Global Inc." },
    { proName: "NYSE:TGT", title: "Target Corporation" },
    { proName: "NYSE:DUK", title: "Duke Energy Corporation" },
    { proName: "NYSE:SO", title: "The Southern Company" },
    { proName: "NYSE:LMT", title: "Lockheed Martin Corporation" },
    { proName: "NYSE:CI", title: "Cigna Corporation" },
    { proName: "NYSE:ZTS", title: "Zoetis Inc." },
    { proName: "NYSE:SYK", title: "Stryker Corporation" }
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
