"use client";

import React, { useEffect, useRef, memo } from 'react';
import useThemeStore from '@/store/theme-store';

const TradingViewScreenerWidget: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();

  useEffect(() => {
    const currentContainer = container.current;
    if (!currentContainer) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "width": "100%",
      "height": "100%",
      "defaultColumn": "overview",
      "screener_type": "stock_mkt",
      "displayCurrency": "USD",
      "colorTheme": theme,
      "locale": "en",
      "isTransparent": false
    });
    
    // Clear the container and append the new script
    currentContainer.innerHTML = '';
    currentContainer.appendChild(script);

    // Clean up the script when the component unmounts
    return () => {
      if (currentContainer) {
        currentContainer.innerHTML = '';
      }
    };
  }, [theme]);

  return (
    <div className="tradingview-widget-container h-full w-full">
      <div ref={container} className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
};

export default memo(TradingViewScreenerWidget);