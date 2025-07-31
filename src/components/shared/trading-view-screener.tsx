
"use client";

import React, { useEffect, useRef, memo } from 'react';
import useThemeStore from '@/store/theme-store';

const TradingViewScreenerWidget: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();

  useEffect(() => {
    if (!container.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
    script.type = "text/javascript";
    script.async = true;
    // Using a template literal for innerHTML as provided by the user, which is a robust method.
    // The configuration is stringified JSON.
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
    
    // Clear the container before appending the new script to avoid duplicates on re-render.
    container.current.innerHTML = '';
    container.current.appendChild(script);

  }, [theme]);

  return (
    <div className="tradingview-widget-container h-full w-full" ref={container}>
      <div className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
};

export default memo(TradingViewScreenerWidget);
