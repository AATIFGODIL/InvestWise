
"use client";

import React, { useEffect, useRef, memo } from 'react';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface SymbolSearchProps {
  onSymbolSelect: (symbol: string | null, price: number | null) => void;
}

const SymbolSearch: React.FC<SymbolSearchProps> = ({ onSymbolSelect }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Ensure the script is loaded only once
    if (document.getElementById('tradingview-symbol-search-script')) {
      return;
    }
    
    const script = document.createElement("script");
    script.id = 'tradingview-symbol-search-script';
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (window.TradingView && container.current) {
        new window.TradingView.widget({
          "container_id": container.current.id,
          "width": "100%",
          "height": 54,
          "symbol": "AAPL",
          "locale": "en",
          "autosize": true,
          "show_popup_button": false,
          "hideideas": true,
          "theme": document.documentElement.classList.contains('dark') ? 'dark' : 'light',
          "onSubmit": (symbolInfo: any) => {
            if (symbolInfo && symbolInfo.pro_name) {
              // The widget doesn't directly provide the price in the onSubmit callback.
              // We'll pass the symbol up, and the parent will handle it.
              // For now, we'll pass a null price. A more advanced implementation might fetch it.
              onSymbolSelect(symbolInfo.pro_name, null); // We pass null for price for now
            }
          }
        });

        // This is a workaround to get the price. We listen for symbol changes
        // in the widget's internal iframe. This is not a standard API but works for this case.
        const observer = new MutationObserver(mutations => {
           for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    const node = mutation.addedNodes[0] as HTMLElement;
                    if (node.querySelector) {
                         const priceElement = node.querySelector('.js-symbol-last');
                         const symbolElement = node.querySelector('.js-symbol-name');
                         if (priceElement && symbolElement) {
                            const price = parseFloat(priceElement.textContent || '0');
                            const symbol = symbolElement.textContent || '';
                            if (price && symbol) {
                                onSymbolSelect(symbol, price);
                            }
                         }
                    }
                }
           }
        });

        setTimeout(() => {
            const iframe = container.current?.querySelector('iframe');
            if(iframe?.contentWindow?.document?.body) {
                 observer.observe(iframe.contentWindow.document.body, { childList: true, subtree: true });
            }
        }, 2000); // Wait for widget to load
      }
    };
    
    document.body.appendChild(script);

  }, [onSymbolSelect]);

  return (
    <div 
        id={`tradingview-symbol-search-container-${Math.random()}`}
        ref={container}
        className="tradingview-widget-container"
    >
        <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export default memo(SymbolSearch);
