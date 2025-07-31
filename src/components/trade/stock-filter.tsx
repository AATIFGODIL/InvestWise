
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import TradingViewSearch from "../shared/trading-view-search";

export default function StockFilter() {
  return (
    <div>
      <TradingViewSearch />
    </div>
  );
}
