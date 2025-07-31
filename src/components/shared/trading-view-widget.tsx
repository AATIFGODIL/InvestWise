
"use client";

import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
  onSymbolChange: (symbol: string) => void;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol = "AAPL", onSymbolChange }) => {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = `tradingview_widget_${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    if (!container.current || !symbol) return;
    
    const createWidget = () => {
        if (!container.current) return;
        container.current.innerHTML = "";

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
          "autosize": true,
          "symbol": symbol,
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": document.documentElement.classList.contains('dark') ? 'dark' : 'light',
          "style": "3",
          "locale": "en",
          "enable_publishing": false,
          "allow_symbol_change": true,
          "withdateranges": true,
          "hide_side_toolbar": false,
          "details": true,
          "hotlist": true,
          "calendar": true,
          "studies": [
            "Volume@tv-basicstudies"
          ],
          "container_id": widgetId,
        });

        script.onload = () => {
          if (window.TradingView && container.current) {
            try {
              // @ts-ignore
              const widget = new window.TradingView.widget({
                "autosize": true,
                "symbol": symbol,
                "interval": "D",
                "timezone": "Etc/UTC",
                "theme": document.documentElement.classList.contains('dark') ? 'dark' : 'light',
                "style": "3",
                "locale": "en",
                "enable_publishing": false,
                "allow_symbol_change": true,
                "withdateranges": true,
                "hide_side_toolbar": false,
                "details": true,
                "hotlist": true,
                "calendar": true,
                "studies": [
                  "Volume@tv-basicstudies"
                ],
                "container_id": widgetId,
              });

              widget.onChartReady(() => {
                widget.subscribe("symbol_change", (newSymbol: any) => {
                   if(newSymbol?.name) {
                       onSymbolChange(newSymbol.name);
                   }
                });
              });

            } catch (e) {
                // Fallback to script injection if direct instantiation fails
                container.current?.appendChild(script);
            }
          } else {
             container.current?.appendChild(script);
          }
        }
        
        // Fallback in case onload does not fire correctly
        if(!script.onload) {
            container.current.appendChild(script);
        }

    }

    createWidget();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class' && mutation.target === document.documentElement) {
          createWidget();
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();

  }, [symbol, onSymbolChange, widgetId]);

  return (
    <div 
      className="tradingview-widget-container h-full w-full" 
      ref={container}
    >
      <div 
        id={widgetId}
        className="tradingview-widget-container__widget h-full"
      ></div>
    </div>
  );
};

export default memo(TradingViewWidget);
