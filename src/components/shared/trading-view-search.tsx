
"use client";

import React, { useEffect, useRef, memo } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';

interface TradingViewSearchProps {
  onSymbolSelect: (symbol: string) => void;
}

const TradingViewSearch: React.FC<TradingViewSearchProps> = ({ onSymbolSelect }) => {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef(`tradingview_search_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!container.current) return;
    
    // Clean up any previous script to avoid duplicates
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.id = `${widgetId.current}_script`;
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-search.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "width": "100%",
      "height": "100%",
      "show_popup_button": false,
      "popup_width": "1000",
      "popup_height": "650",
      "symbol": "AAPL",
      "locale": "en"
    });

    const observer = new MutationObserver(() => {
        const symbolLink = container.current?.querySelector('.tradingview-widget-copyright a');
        if (symbolLink) {
            const href = symbolLink.getAttribute('href');
            if (href) {
                const parts = href.split('/');
                const symbol = parts.pop() || parts.pop(); // handle trailing slash
                if (symbol) {
                    onSymbolSelect(symbol);
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    container.current.appendChild(script);

    return () => {
        observer.disconnect();
    }
  }, [onSymbolSelect]);

  return (
    <Card>
      <CardHeader>
        <div className="text-base font-semibold uppercase tracking-wider text-muted-foreground">Symbol Lookup</div>
      </CardHeader>
      <CardContent>
        <div 
            className="tradingview-widget-container" 
            ref={container} 
            style={{ height: '56px', width: '100%' }}
        >
          <div 
            className="tradingview-widget-container__widget" 
            id={widgetId.current}
            style={{ height: '100%', width: '100%' }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(TradingViewSearch);
