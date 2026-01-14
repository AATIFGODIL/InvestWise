// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React, { useEffect, useRef, memo, useState } from 'react';
import { useThemeStore } from '@/store/theme-store';

interface TradingViewMiniChartProps {
  symbol: string;
}

const TradingViewMiniChart: React.FC<TradingViewMiniChartProps> = ({ symbol }) => {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();
  const [isMounted, setIsMounted] = useState(false);
  const widgetId = `tradingview-mini-chart-${symbol}-${Math.random().toString(36).substring(7)}`;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !container.current) return;

    // Clear previous widget before creating a new one
    container.current.innerHTML = '';

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
      "largeChartUrl": "",
      "container_id": widgetId
    });

    container.current.appendChild(script);

    // No cleanup function needed as we clear the container at the start of the effect
  }, [symbol, theme, isMounted, widgetId]);

  return (
    <div id={widgetId} className="tradingview-widget-container h-full w-full" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export default memo(TradingViewMiniChart);
