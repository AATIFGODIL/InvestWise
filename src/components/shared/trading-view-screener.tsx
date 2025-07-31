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
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "colorTheme": theme,
      "dateRange": "12M",
      "showChart": true,
      "locale": "en",
      "width": "100%",
      "height": "100%",
      "showSymbolLogo": true,
      "showFloatingTooltip": false,
      "tabs": [
        {
          "title": "Stocks",
          "symbols": [
            { "s": "NASDAQ:AAPL", "d": "Apple Inc." },
            { "s": "NASDAQ:GOOGL", "d": "Alphabet Inc." },
            { "s": "NASDAQ:MSFT", "d": "Microsoft Corp." },
            { "s": "NASDAQ:AMZN", "d": "Amazon.com, Inc." },
            { "s": "NASDAQ:TSLA", "d": "Tesla, Inc." },
            { "s": "NASDAQ:NVDA", "d": "NVIDIA Corp." }
          ],
          "originalTitle": "Stocks"
        },
        {
            "title": "Indices",
            "symbols": [
              { "s": "FOREXCOM:SPXUSD", "d": "S&P 500" },
              { "s": "FOREXCOM:NSXUSD", "d": "US 100" },
              { "s": "FOREXCOM:DJI", "d": "Dow 30" },
              { "s": "INDEX:VIX", "d": "VIX" }
            ],
            "originalTitle": "Indices"
        }
      ]
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
