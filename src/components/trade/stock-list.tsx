
"use client";

import React, { useEffect, useRef, memo } from 'react';

const TradingViewScreener: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);
  const scriptExists = useRef(false);

  useEffect(() => {
    if (!container.current || scriptExists.current) return;

    const createWidget = () => {
      if (!container.current) return;
      // Clean up previous widget
      container.current.innerHTML = "";

      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
      script.type = "text/javascript";
      script.async = true;
      
      const widgetConfig = {
        "width": "100%",
        "height": 490,
        "defaultColumn": "overview",
        "screener_fleet": "america",
        "defaultScreen": "most_capitalized",
        "market": "america",
        "showToolbar": true,
        "colorTheme": document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        "locale": "en"
      };

      script.innerHTML = JSON.stringify(widgetConfig);
      container.current.appendChild(script);
      scriptExists.current = true;
    };

    createWidget();

    // Observe theme changes to re-render widget
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          scriptExists.current = false; // Allow script re-creation
          createWidget();
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export default memo(TradingViewScreener);
