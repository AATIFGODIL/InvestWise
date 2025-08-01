
"use client";

import React, { useEffect, useRef, memo } from 'react';
import useThemeStore from '@/store/theme-store';

function TradingViewScreener() {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();

  useEffect(
    () => {
      if (!container.current) return;

      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
          "market": "forex",
          "showToolbar": true,
          "defaultColumn": "overview",
          "defaultScreen": "general",
          "isTransparent": false,
          "locale": "en",
          "colorTheme": theme,
          "width": "100%",
          "height": 550
        });
      
      container.current.innerHTML = ''; // Clear previous widget
      container.current.appendChild(script);
    },
    [theme]
  );

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

export default memo(TradingViewScreener);
