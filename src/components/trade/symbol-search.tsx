
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
  const isWidgetCreated = useRef(false);

  useEffect(() => {
    if (!container.current || isWidgetCreated.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView && container.current && !isWidgetCreated.current) {
        
        const widgetOptions = {
          "container_id": container.current.id,
          "width": "100%",
          "height": 54,
          "symbol": "AAPL",
          "locale": "en",
          "autosize": true,
          "show_popup_button": false,
          "hideideas": true,
          "theme": document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        };

        const widget = new window.TradingView.widget(widgetOptions);
        isWidgetCreated.current = true;
        
        // This is a workaround to get the symbol and price since onSubmit is not available on this widget type
        // We will listen for the symbol change on the widget's title
        const checkSymbolChange = () => {
          const iframe = container.current?.querySelector('iframe');
          if (iframe?.contentWindow?.document?.body) {
            const symbolElement = iframe.contentWindow.document.body.querySelector('.js-symbol-widget-symbol-name');
            const priceElement = iframe.contentWindow.document.body.querySelector('.js-symbol-widget-last-price');
            if(symbolElement && priceElement){
                const symbol = symbolElement.textContent?.trim();
                const price = parseFloat(priceElement.textContent?.trim() || '0');

                if(symbol && price) {
                    onSymbolSelect(symbol, price);
                }
            }
          }
        };
        
        // Polling to check for changes as a simple event listener is tricky with the iframe.
        const intervalId = setInterval(checkSymbolChange, 1000);

        return () => clearInterval(intervalId);
      }
    };
    document.body.appendChild(script);

    return () => {
        document.body.removeChild(script);
    }
  }, [onSymbolSelect]);

  return (
    <div 
        id={`tradingview-symbol-search-container-${Math.random().toString(36).substr(2, 9)}`}
        ref={container}
        className="tradingview-widget-container"
        style={{ height: '54px' }}
    >
        <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export default memo(SymbolSearch);
