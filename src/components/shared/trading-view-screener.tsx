"use client";
import { useEffect } from "react";

const TradingViewScreenerWidget = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: "600",
      defaultColumn: "overview",
      screener_type: "stock_mkt",
      displayCurrency: "USD",
      colorTheme: "light",
      locale: "en",
      isTransparent: false
    });

    const container = document.getElementById("tradingview-screener-container");
    if (container) {
      container.innerHTML = ""; // Clear previous widget if any
      container.appendChild(script);
    }
  }, []);

  return (
    <div id="tradingview-screener-container" style={{ height: 600 }} />
  );
};

export default TradingViewScreenerWidget;
