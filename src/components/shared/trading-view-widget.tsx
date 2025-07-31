
"use client";

import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
  onSymbolChange: (symbol: string) => void;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol = "AAPL", onSymbolChange }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Clear the container to prevent duplicate widgets
    container.current.innerHTML = '';
    
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": symbol,
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "withdateranges": true,
      "hide_side_toolbar": false,
      "details": true,
      "hotlist": true,
      "calendar": true,
      "studies": [
        "Volume@tv-basicstudies"
      ]
    });

    container.current.appendChild(script);

    // This is a simplified way to detect symbol changes from the chart.
    // TradingView doesn't provide a direct API for this in the embed, 
    // so we'll rely on user interaction with the form for now.
    // A more robust solution might involve a more advanced integration.

  }, [symbol]);

  // Handle theme changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class' && mutation.target === document.documentElement) {
          if (container.current) {
            container.current.innerHTML = ''; // Clear and re-append
            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
            script.type = "text/javascript";
            script.async = true;
            script.innerHTML = JSON.stringify({
              "autosize": true,
              "symbol": symbol,
              "interval": "D",
              "timezone": "Etc/UTC",
              "theme": document.documentElement.classList.contains('dark') ? 'dark' : 'light',
              "style": "1",
              "locale": "en",
              "enable_publishing": false,
              "allow_symbol_change": true,
              "withdateranges": true,
              "hide_side_toolbar": false,
              "details": true,
              "hotlist": true,
              "calendar": true,
              "studies": [
                "Volume@tv-basicstudies"
              ]
            });
            container.current.appendChild(script);
          }
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, [symbol]);

  return (
    <div className="tradingview-widget-container h-full w-full">
      <div ref={container} className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
};

export default memo(TradingViewWidget);
