
"use client";

import React, { useEffect, useRef, memo } from 'react';
import useThemeStore from '@/store/theme-store';

interface TradingViewWidgetProps {
  symbol: string | null;
  onSymbolChange: (symbol: string) => void;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol, onSymbolChange }) => {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    if (!symbol || !container.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    
    const widgetOptions = {
      "autosize": true,
      "symbol": symbol,
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": theme,
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "support_host": "https://www.tradingview.com"
    };

    script.innerHTML = JSON.stringify(widgetOptions);

    script.onload = () => {
      if (window.TradingView && container.current) {
        widgetRef.current = new window.TradingView.widget({
          ...widgetOptions,
          container_id: container.current.id,
          "onSymbolChange": (newSymbol: { ticker: string }) => {
            if (newSymbol.ticker) {
              onSymbolChange(newSymbol.ticker);
            }
          }
        });
      }
    };
    
    container.current.innerHTML = '';
    container.current.appendChild(script);

  }, [symbol, theme, onSymbolChange]);

  return (
    <div 
      id="tradingview-widget-container-advanced" 
      className="tradingview-widget-container h-full w-full" 
      ref={container}
    >
      <div className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
};

export default memo(TradingViewWidget);
