"use client";

import React, { useEffect, memo } from 'react';
import useThemeStore from '@/store/theme-store';

const TradingViewScreenerWidget: React.FC = () => {
  const { theme } = useThemeStore();

  useEffect(() => {
    const screenerContainer = document.getElementById("tv-screener-widget-container");
    if (!screenerContainer) return;

    // Clear previous widget script if any
    screenerContainer.innerHTML = '';

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
    });

    screenerContainer.appendChild(script);

  }, [theme]);

  return (
    <div className="tradingview-widget-container h-full w-full">
      <div id="tv-screener-widget-container" className="h-full w-full" />
    </div>
  );
};

export default memo(TradingViewScreenerWidget);
