// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React, { useEffect, useRef, memo } from 'react';

// This component is now only used for its visual ticker tape display.
// The data for the command menu is fetched separately.
const TradingViewTickerTape: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current || !container.current) return;
    
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbols": [
        { "proName": "NASDAQ:AAPL", "title": "Apple Inc." },
        { "proName": "NYSE:MSFT", "title": "Microsoft Corporation" },
        { "proName": "NASDAQ:GOOGL", "title": "Alphabet Inc. (Class A)" },
        { "proName": "NASDAQ:AMZN", "title": "Amazon.com, Inc." },
        { "proName": "NASDAQ:NVDA", "title": "NVIDIA Corporation" },
        { "proName": "NASDAQ:TSLA", "title": "Tesla, Inc." },
        { "proName": "NASDAQ:META", "title": "Meta Platforms, Inc." },
      ],
      "showSymbolLogo": true,
      "isTransparent": true,
      "displayMode": "regular",
      "colorTheme": document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      "locale": "en"
    });

    container.current.innerHTML = '';
    container.current.appendChild(script);
    hasLoaded.current = true;
    
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ display: 'none' }}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export default memo(TradingViewTickerTape);
