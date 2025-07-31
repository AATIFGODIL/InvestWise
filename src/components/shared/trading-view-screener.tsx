"use client";

import React, { useEffect, useRef, memo } from 'react';

const TradingViewScreenerWidget: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Clear the container before appending a new script
    container.current.innerHTML = '';

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "width": "100%",
      "height": "100%",
      "defaultColumn": "overview",
      "screener_type": "crypto_mkt",
      "displayCurrency": "USD",
      "colorTheme": document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      "locale": "en",
      "isTransparent": false
    });

    container.current.appendChild(script);

    // Also handle theme changes
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                 // Re-create widget when theme changes
                if (container.current) {
                    container.current.innerHTML = '';
                    container.current.appendChild(script.cloneNode(true));
                }
            }
        }
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();

  }, []);

  return (
    <div className="tradingview-widget-container h-full w-full">
      <div ref={container} className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
};

export default memo(TradingViewScreenerWidget);
