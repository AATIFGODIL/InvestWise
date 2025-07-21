"use client";

import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol = "AAPL" }) => {
  const container = useRef<HTMLDivElement>(null);
  const isDark = typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false;
  const theme = isDark ? 'dark' : 'light';

  useEffect(() => {
    if (!container.current || !symbol) return;

    const createWidget = (currentTheme: 'dark' | 'light') => {
      if (!container.current) return;
      container.current.innerHTML = ""; // Clear previous widget
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "symbols": [[symbol]],
        "chartOnly": false,
        "width": "100%",
        "height": "100%",
        "locale": "en",
        "colorTheme": currentTheme,
        "autosize": true,
        "showVolume": false,
        "showMA": false,
        "hideDateRanges": false,
        "hideMarketStatus": false,
        "hideSymbolLogo": false,
        "scalePosition": "right",
        "scaleMode": "Normal",
        "fontFamily": "inherit",
        "fontSize": "12",
        "noTimeScale": false,
        "valuesTracking": "1",
        "changeMode": "price-and-percent",
        "chartType": "area",
        "maLineColor": "#2962FF",
        "maLineWidth": 1,
        "maLength": 9,
        "lineWidth": 2,
        "lineType": 0,
        "dateRanges": ["1d|1", "1m|30", "3m|60", "12m|1D", "60m|1W", "all|1M"]
      });
      container.current.appendChild(script);
    }

    createWidget(theme);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const newIsDark = (mutation.target as HTMLElement).classList.contains('dark');
          createWidget(newIsDark ? 'dark' : 'light');
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();

  }, [symbol, theme]);

  return (
    <div className="tradingview-widget-container h-full" ref={container}>
      <div className="tradingview-widget-container__widget h-full"></div>
      <div className="tradingview-widget-copyright">
        <a href={`https://www.tradingview.com/symbols/${symbol}/`} rel="noopener" target="_blank">
          <span className="blue-text">{symbol} stock chart</span>
        </a> by TradingView
      </div>
    </div>
  );
};

export default memo(TradingViewWidget);