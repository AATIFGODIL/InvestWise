
"use client";

import React, { useEffect, useRef, memo } from 'react';

const TradingViewSearch: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);
  const scriptExists = useRef(false);

  useEffect(() => {
    if (!container.current || scriptExists.current) return;
    
    const createWidget = () => {
        if (!container.current) return;
        container.current.innerHTML = "";

        const script = document.createElement("script");
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
          "locale": "en",
          "colorTheme": document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        });
        
        container.current.appendChild(script);
        scriptExists.current = true;
    }

    createWidget();

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
    <div className="tradingview-widget-container" ref={container} style={{ height: '400px', width: '100%' }}>
      <div className="tradingview-widget-container__widget" style={{ height: '100%', width: '100%' }}></div>
    </div>
  );
};

export default memo(TradingViewSearch);
