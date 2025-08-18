
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
  const isMounted = useRef(false);
  const { theme } = useThemeStore();

  const createWidget = useCallback(() => {
    if (!container.current || !isMounted.current || typeof window.TradingView === 'undefined') {
      return;
    }
    
    // If a widget already exists, remove it before creating a new one
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
        if (widget) {
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
    isMounted.current = true;

    const initialize = () => {
        if (window.TradingView) {
            createWidget();
        } else {
            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/tv.js";
            script.async = true;
            script.onload = createWidget;
            document.body.appendChild(script);

            return () => {
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            };
        }
    };
    
    const cleanup = initialize();

    return () => {
        isMounted.current = false;
        if (widgetRef.current) {
            widgetRef.current.remove();
            widgetRef.current = null;
        }
        if (cleanup) {
            cleanup();
        }
    };
  }, [createWidget]);
  
   useEffect(() => {
    if (widgetRef.current && widgetRef.current.changeTheme) {
      widgetRef.current.changeTheme(theme);
    }
  }, [theme]);

   useEffect(() => {
    if (widgetRef.current && widgetRef.current.chart && symbol && widgetRef.current.chart().symbol() !== symbol) {
        widgetRef.current.chart().setSymbol(symbol, () => {});
    }
   }, [symbol]);

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
