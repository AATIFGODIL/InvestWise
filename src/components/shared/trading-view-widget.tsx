
"use client";

import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol = "AAPL" }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current || !symbol) return;

    const createWidget = () => {
      if (!container.current) return;
      // Ensure the container is clean before appending a new script
      container.current.innerHTML = "";
      
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.type = "text/javascript";
      script.async = true;
      script.onload = () => {
        if (typeof (window as any).TradingView !== 'undefined') {
          new (window as any).TradingView.widget({
            "autosize": true,
            "symbol": symbol,
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": document.documentElement.classList.contains('dark') ? 'dark' : 'light',
            "style": "1",
            "locale": "en",
            "enable_publishing": false,
            "allow_symbol_change": false,
            "container_id": `tradingview-widget-container-${container.current?.id}`
          });
        }
      };
      
      container.current.appendChild(script);
    };

    // Set a unique ID for the container if it doesn't have one
    if (!container.current.id) {
      container.current.id = `tv_widget_container_${Math.random().toString(36).substr(2, 9)}`;
    }

    createWidget();

    // Re-create widget if theme changes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          createWidget();
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();

  }, [symbol]);

  return (
    <div 
      id={`tradingview-widget-container-${container.current?.id}`} 
      className="tradingview-widget-container h-full w-full" 
      ref={container}
    >
      <div className="tradingview-widget-container__widget h-full"></div>
    </div>
  );
};

export default memo(TradingViewWidget);
