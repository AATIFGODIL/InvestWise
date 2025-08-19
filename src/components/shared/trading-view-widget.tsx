
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
  const widgetRef = useRef<any>(null);
  const { theme } = useThemeStore();
  const isWidgetReady = useRef(false);

  useEffect(() => {
    // Ensure the TradingView library is loaded
    if (typeof window.TradingView === 'undefined') {
      return;
    }

    if (container.current && !isWidgetReady.current) {
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
            "container_id": `tradingview-widget-container-${Date.now()}` // Unique ID for container
        };
        
        container.current.id = widgetOptions.container_id;

        const widget = new window.TradingView.widget(widgetOptions);
        widgetRef.current = widget;
        isWidgetReady.current = true;

        widget.ready(() => {
            widget.onChartReady(() => {
                widget.chart().onSymbolChanged().subscribe(null, (newSymbol: { name: string }) => {
                    const cleanSymbol = newSymbol.name.split(':').pop();
                    if (cleanSymbol) {
                        onSymbolChange(cleanSymbol);
                    }
                });
            });
        });
    }

    return () => {
        if (widgetRef.current && typeof widgetRef.current.remove === 'function') {
            widgetRef.current.remove();
            widgetRef.current = null;
            isWidgetReady.current = false;
        }
    };
  }, []); // Run only once on mount

  // Effect to update theme
  useEffect(() => {
      if (widgetRef.current && typeof widgetRef.current.changeTheme === 'function') {
          widgetRef.current.changeTheme(theme);
      }
  }, [theme]);

  // Effect to update symbol
  useEffect(() => {
    if (widgetRef.current && typeof widgetRef.current.symbol === 'function') {
      widgetRef.current.symbol(symbol || "AAPL");
    }
  }, [symbol]);

  return (
    <div
      ref={container}
      className="tradingview-widget-container h-full w-full"
    >
      <div className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
};

export default memo(TradingViewWidget);
