
"use client";

import React, { useEffect, useRef, memo } from 'react';
import { useThemeStore } from '@/store/theme-store';

interface TradingViewNewsWidgetProps {
  displayMode?: "regular" | "compact";
}

const TradingViewNewsWidget: React.FC<TradingViewNewsWidgetProps> = ({ displayMode = "regular" }) => {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();
  const hasRun = useRef(false);

  useEffect(() => {
    // Check if the script has already been added to avoid duplicates
    if (!container.current || hasRun.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
    script.type = "text/javascript";
    script.async = true;

    // The height determines how many articles are shown.
    // '400' shows ~2 articles, '800' shows ~4.
    const height = displayMode === 'compact' ? 400 : 800;

    script.innerHTML = JSON.stringify({
      "feedMode": "all_symbols",
      "isTransparent": true,
      "displayMode": "regular",
      "width": "100%",
      "height": height,
      "locale": "en",
      "colorTheme": theme,
      "autosize": false
    });
    
    container.current.appendChild(script);
    hasRun.current = true;
    
  }, [theme, displayMode]);

  const heightClass = displayMode === 'compact' ? 'h-[400px]' : 'h-[800px]';

  return (
    <div className={`tradingview-widget-container ${heightClass}`} ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export default memo(TradingViewNewsWidget);
