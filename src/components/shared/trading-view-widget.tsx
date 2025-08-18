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
  const isMounted = useRef(false);
  const { theme } = useThemeStore();

  useEffect(() => {
    isMounted.current = true;
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = createWidget;
    document.body.appendChild(script);

    return () => {
        isMounted.current = false;
        document.body.removeChild(script);
        if (widgetRef.current) {
            widgetRef.current.remove();
            widgetRef.current = null;
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  useEffect(() => {
    if (widgetRef.current && symbol) {
        widgetRef.current.setSymbol(symbol, 'D', () => {});
    }
  }, [symbol]);

   useEffect(() => {
    if (widgetRef.current) {
      widgetRef.current.changeTheme(theme);
    }
  }, [theme]);


  const createWidget = () => {
    if (!container.current || !isMounted.current || typeof window.TradingView === 'undefined' || widgetRef.current) {
      return;
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
      "container_id": "tradingview-widget-container-advanced",
    };

    widgetRef.current = new window.TradingView.widget(widgetOptions);

    widgetRef.current.onChartReady(() => {
        if(widgetRef.current) {
            widgetRef.current.subscribe('symbol_change', (newSymbol: { ticker: string }) => {
                const cleanSymbol = newSymbol.ticker ? newSymbol.ticker.split(':').pop() : newSymbol.ticker;
                if (cleanSymbol) {
                    onSymbolChange(cleanSymbol);
                }
            });
        }
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