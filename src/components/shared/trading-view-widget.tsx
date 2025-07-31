
"use client";

import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
  onSymbolChange: (symbol: string) => void;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol = "AAPL", onSymbolChange }) => {
  const container = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current && container.current?.querySelector('iframe')) return;
    if (!container.current) return;
    
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
      "style": "1",
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
      "support_host": "https://www.tradingview.com"
    });

    container.current.innerHTML = '';
    container.current.appendChild(script);
    isMounted.current = true;

  }, [symbol]);

  // This effect will listen for changes in the 'symbol' prop from the parent
  // and re-create the widget if necessary. The 'onSymbolChange' prop is for
  // potential future use where a child component might need to notify the parent.
  // For now, the parent controls the symbol.

  return (
    <div className="tradingview-widget-container h-full w-full">
      <div ref={container} className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
};

export default memo(TradingViewWidget);
