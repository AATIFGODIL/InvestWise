
"use client";

import React, { useEffect, useRef, memo } from 'react';

const TradingViewScreenerWidget: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "width": "100%",
        "height": "100%",
        "defaultColumn": "overview",
        "screener_type": "stock_mkt",
        "displayCurrency": "USD",
        "colorTheme": "light",
        "locale": "en",
        "isTransparent": false
      }
    `;
    
    // Clear the container before appending to avoid duplicates
    container.current.innerHTML = '';
    container.current.appendChild(script);

  }, []);

  return (
    <div className="tradingview-widget-container h-full w-full" ref={container}>
      <div className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
};

export default memo(TradingViewScreenerWidget);
