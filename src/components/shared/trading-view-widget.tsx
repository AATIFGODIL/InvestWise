
"use client";

import React, { useEffect, useRef, memo, useState } from 'react';
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

const TRADINGVIEW_SCRIPT_ID = "tradingview-widget-script";

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol, onSymbolChange }) => {
  const container = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const { theme } = useThemeStore();
  const [isScriptReady, setIsScriptReady] = useState(false);

  // Effect to load the TradingView script
  useEffect(() => {
    if (window.TradingView) {
      setIsScriptReady(true);
      return;
    }

    const script = document.createElement('script');
    script.id = TRADINGVIEW_SCRIPT_ID;
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
        setIsScriptReady(true);
    };
    script.onerror = () => {
        console.error("TradingView script failed to load.");
    };

    document.head.appendChild(script);

    return () => {
      // Clean up script if component unmounts before it loads
      const existingScript = document.getElementById(TRADINGVIEW_SCRIPT_ID);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // Effect to create/update the widget once the script is ready
  useEffect(() => {
    if (!isScriptReady || !container.current) {
      return;
    }
    
    // Clean up previous widget instance if it exists
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
        "container_id": container.current.id
    };

    const widget = new window.TradingView.widget(widgetOptions);
    widgetRef.current = widget;

    widget.onChartReady(() => {
      widget.chart().onSymbolChanged().subscribe(null, (newSymbol: { name: string }) => {
          const cleanSymbol = newSymbol.name.split(':').pop();
          if (cleanSymbol) {
              onSymbolChange(cleanSymbol);
          }
      });
    });

    // No explicit cleanup needed for the widget itself on re-render, 
    // as we handle it at the start of the effect.
    // However, we ensure it's removed if the component unmounts.
    return () => {
        if (widgetRef.current) {
            widgetRef.current.remove();
            widgetRef.current = null;
        }
    };
  }, [isScriptReady, symbol, theme, onSymbolChange]);

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
