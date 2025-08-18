
"use client";

import React, { useEffect, useRef, memo } from 'react';
import useThemeStore from '@/store/theme-store';

interface TradingViewWidgetProps {
  symbol: string | null;
  onSymbolChange: (symbol: string) => void;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol, onSymbolChange }) => {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    if (!symbol || !container.current || typeof window.TradingView === 'undefined') {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        createWidget();
      };

      return () => {
        document.body.removeChild(script);
      };
    } else {
        createWidget();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, theme]);

  const createWidget = () => {
    if (!container.current || !symbol || typeof window.TradingView === 'undefined') return;
    
    // Clear any previous widget
    container.current.innerHTML = '';
    
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
      "support_host": "https://www.tradingview.com",
      "container_id": container.current.id,
    };

    widgetRef.current = new window.TradingView.widget(widgetOptions);

    widgetRef.current.onChartReady(() => {
        widgetRef.current.subscribe('symbol_change', (newSymbol: { ticker: string }) => {
            if (newSymbol.ticker) {
              onSymbolChange(newSymbol.ticker.split(':')[1] || newSymbol.ticker);
            }
        });
    });
  };

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
