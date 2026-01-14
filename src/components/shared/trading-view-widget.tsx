// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React, { useEffect, useRef, memo } from 'react';
import { useThemeStore } from '@/store/theme-store';

interface TradingViewWidgetProps {
  symbol: string;
  onSymbolChange?: (newSymbol: string) => void;
  interval?: string;
  studies?: string[];
  containerIdSuffix?: string;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  symbol,
  interval = "D",
  studies = [],
  containerIdSuffix = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();
  const containerId = `tradingview_chart_${symbol.replace(/[^a-zA-Z0-9]/g, '')}${containerIdSuffix}`;

  useEffect(() => {
    // Ensure the container exists and the symbol is valid
    if (!containerRef.current || !symbol) {
      return;
    }

    // Clear any existing widget to ensure a fresh load
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.type = 'text/javascript';

    // Configure the widget with the current symbol prop
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": symbol,
      "interval": interval,
      "timezone": "exchange",
      "theme": theme,
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "withdateranges": true,
      "hide_side_toolbar": false,
      "allow_symbol_change": true,
      "details": true,
      "hotlist": false,
      "calendar": false,
      "studies": studies,
      "show_popup_button": true,
      "popup_width": "1000",
      "popup_height": "600",
      "container_id": containerId
    });

    containerRef.current.appendChild(script);

    // Cleanup function: This runs when the component unmounts or before the effect re-runs
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''; // Clean up the widget when symbol changes or component unmounts
      }
    };
  }, [symbol, theme, interval, studies, containerId]); // Re-run this effect whenever the props change

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ height: '100%', width: '100%' }}
    >
      {/* TradingView script will append content here */}
    </div>
  );
};

export default memo(TradingViewWidget);
