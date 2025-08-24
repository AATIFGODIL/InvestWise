
"use client";

import React, { useEffect, useRef, memo, useState } from 'react';
import { useThemeStore } from '@/store/theme-store';

function TradingViewScreener() {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();
  const [isMounted, setIsMounted] = useState(false);
  const isWidgetCreated = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Ensure the component is mounted and the widget hasn't been created yet
    if (!isMounted || !container.current || isWidgetCreated.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
        "width": "100%",
        "height": "100%",
        "defaultColumn": "overview",
        "defaultScreen": "most_capitalized",
        "market": "us",
        "showToolbar": true,
        "locale": "en",
        "colorTheme": theme
      });
    
    container.current.appendChild(script);
    isWidgetCreated.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, theme]);

  return (
    <div className="tradingview-widget-container h-full" ref={container}>
      <div className="tradingview-widget-container__widget h-full"></div>
    </div>
  );
}

export default memo(TradingViewScreener);
