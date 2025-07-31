
"use client";

import React, { useEffect, useRef, memo } from 'react';

const TradingViewSearch: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!container.current) return;
    
    // Clean up any previous script to avoid duplicates
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-search.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "width": "100%",
      "height": 400,
      "show_popup_button": false,
      "popup_width": "1000",
      "popup_height": "650",
      "symbol": "AAPL",
      "locale": "en"
    });
    
    container.current.appendChild(script);

  }, []);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: '400px', width: '100%' }}>
      <div className="tradingview-widget-container__widget" style={{ height: '100%', width: '100%' }}></div>
    </div>
  );
};

export default memo(TradingViewSearch);
