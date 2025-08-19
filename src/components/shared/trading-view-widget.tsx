
"use client";

import React, { useEffect, useRef, memo, useCallback } from 'react';
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
  const widgetRef = useRef<any>(null);
  const { theme } = useThemeStore();

  const createWidget = useCallback(() => {
    if (!container.current || typeof window.TradingView === 'undefined') {
      // If the library isn't loaded yet, do nothing.
      // This might happen on initial fast loads, but useEffect will re-run.
      return;
    }

    if (widgetRef.current) {
      widgetRef.current.remove();
      widgetRef.current = null;
    }
    
    const widgetOptions = {
      "autosize": true,
      "symbol": symbol || "AAPL",
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": theme,
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "container_id": container.current.id,
      "onChartReady": () => {
        const widget = widgetRef.current;
        if (widget?.chart) { // Check if chart method exists
          const chart = widget.chart();
          chart.onSymbolChanged().subscribe(null, (newSymbol: { ticker: string }) => {
            const cleanSymbol = newSymbol.ticker ? newSymbol.ticker.split(':').pop() : newSymbol.ticker;
            if (cleanSymbol) {
              onSymbolChange(cleanSymbol);
            }
          });
        }
      }
    };
    
    widgetRef.current = new window.TradingView.widget(widgetOptions);
  }, [symbol, theme, onSymbolChange]);

  useEffect(() => {
    // We assume the TradingView script is loaded globally from layout.tsx
    // We create the widget once the component mounts and the container is available.
    if (container.current) {
      createWidget();
    }

    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }
    };
  }, [createWidget]); // Rerun when symbol or theme changes

  return (
    <div
      id={`tradingview-widget-container-${React.useId()}`}
      className="tradingview-widget-container h-full w-full"
      ref={container}
    >
      <div className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
};

export default memo(TradingViewWidget);
