
"use client";

import React, { useEffect, useRef, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SymbolSearchProps {
  onSymbolSelect: (symbol: string, lastPrice: number) => void;
  onClear: () => void;
}

const TradingViewSymbolSearch: React.FC<SymbolSearchProps> = ({ onSymbolSelect, onClear }) => {
  const container = useRef<HTMLDivElement>(null);
  const scriptExists = useRef(false);

  useEffect(() => {
    if (!container.current || scriptExists.current) return;

    const createWidget = () => {
        if (!container.current) return;
        container.current.innerHTML = ""; // Clean up previous widget

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-search.js";
        script.type = "text/javascript";
        script.async = true;
        
        const config = {
          "width": "100%",
          "height": "100%",
          "show_popup_button": false,
          "symbol": "AAPL",
          "locale": "en",
          "colorTheme": document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        };
        script.innerHTML = JSON.stringify(config);
        
        // Expose a global function for the widget to call
        (window as any).onTradingViewSymbolSelected = (symbolInfo: any) => {
            if (symbolInfo && symbolInfo.symbol && symbolInfo.last) {
                onSymbolSelect(symbolInfo.symbol, symbolInfo.last);
            }
        };

        // Modify the script to call our global function
        script.innerHTML = JSON.stringify({ ...config, "onReady": (widget: any) => {
             // This is a bit of a hack as onSymbolSelect is not a standard TradingView option.
             // We can listen to DOM changes or other events if this proves unreliable.
        }});
        
        container.current.appendChild(script);
        scriptExists.current = true;
    }

    createWidget();

     const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          scriptExists.current = false;
          createWidget();
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
    
  }, [onSymbolSelect]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold uppercase tracking-wider text-muted-foreground">Symbol Lookup</CardTitle>
      </CardHeader>
      <CardContent>
          {/* This is a placeholder as the actual search functionality comes from TradingView's script */}
           <div className="tradingview-widget-container h-[50px]" ref={container}>
                <div className="tradingview-widget-container__widget"></div>
           </div>
      </CardContent>
    </Card>
  );
};

export default memo(TradingViewSymbolSearch);
