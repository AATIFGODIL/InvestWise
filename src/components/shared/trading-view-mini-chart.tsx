
"use client";

import React, { useEffect, useRef, memo } from 'react';
import { useThemeStore } from '@/store/theme-store';

interface TradingViewMiniChartProps {
  symbol: string;
}

const TradingViewMiniChart: React.FC<TradingViewMiniChartProps> = ({ symbol }) => {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();
  const scriptExists = useRef(false);

  useEffect(() => {
    if (!container.current || scriptExists.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbol": symbol,
      "width": "100%",
      "height": "100%",
      "locale": "en",
      "dateRange": "1M",
      "colorTheme": theme,
      "isTransparent": true,
      "autosize": true,
      "largeChartUrl": ""
    });

    container.current.appendChild(script);
    scriptExists.current = true;

  }, [symbol, theme]);

  return (
    <div className="tradingview-widget-container h-full w-full" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export default memo(TradingViewMiniChart);
