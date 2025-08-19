
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

    const createWidget = () => {
      if (container.current && !isWidgetReady.current) {
          const containerId = `tradingview-widget-container-${Date.now()}`;
          container.current.id = containerId;

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
              "container_id": containerId,
              "onChartReady": (widget: any) => {
                  widget.chart().onSymbolChanged().subscribe(null, (newSymbol: { name: string }) => {
                      const cleanSymbol = newSymbol.name.split(':').pop();
                      if (cleanSymbol) {
                          onSymbolChange(cleanSymbol);
                      }
                  });
              }
          };
          
          const widget = new window.TradingView.widget(widgetOptions);
          widgetRef.current = widget;
          isWidgetReady.current = true;
      }
    };
    
    createWidget();

    return () => {
        if (widgetRef.current && typeof widgetRef.current.remove === 'function') {
            widgetRef.current.remove();
            widgetRef.current = null;
            isWidgetReady.current = false;
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Effect to update theme
  useEffect(() => {
      if (widgetRef.current && isWidgetReady.current && typeof widgetRef.current.changeTheme === 'function') {
          widgetRef.current.changeTheme(theme);
      }
  }, [theme]);

  // Effect to update symbol
  useEffect(() => {
    if (widgetRef.current && isWidgetReady.current && symbol && typeof widgetRef.current.setSymbol === 'function') {
      widgetRef.current.setSymbol(symbol, 'D', () => {});
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
