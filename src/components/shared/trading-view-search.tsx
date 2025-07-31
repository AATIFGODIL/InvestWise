
"use client";

import React, { useEffect, useRef, memo } from 'react';

interface TradingViewSearchProps {
  onSymbolChange: (symbol: string, price?: number) => void;
}

const TradingViewSearch: React.FC<TradingViewSearchProps> = ({ onSymbolChange }) => {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = `tradingview_search_widget_${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    if (!container.current) return;

    const createWidget = () => {
      if (!container.current) return;
      container.current.innerHTML = "";

      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-search.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "width": "100%",
        "height": "100%",
        "show_popup_button": false,
        "popup_width": "1000",
        "popup_height": "650",
        "symbol": "AAPL",
        "locale": "en"
      });
      
      script.onload = () => {
        // This is a workaround as the search widget does not have a direct event callback.
        // The main chart widget will handle symbol changes.
      };
      
      container.current.appendChild(script);
    };

    createWidget();

     const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class' && mutation.target === document.documentElement) {
          createWidget();
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();

  }, []);

  return (
    <div className="tradingview-widget-container h-12" ref={container}>
      <div id={widgetId} className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export default memo(TradingViewSearch);
