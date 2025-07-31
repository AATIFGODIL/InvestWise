
"use client";

import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol = "AAPL" }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    
    // Clear the container before appending a new script
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
      ],
      "support_host": "https://www.tradingview.com"
    });

    container.current.appendChild(script);

    // Also handle theme changes
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                 // Re-create widget when theme changes
                if (container.current) {
                    container.current.innerHTML = '';
                    container.current.appendChild(script.cloneNode(true));
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
