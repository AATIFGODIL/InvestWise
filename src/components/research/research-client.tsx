"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, Grid2X2, Square, LayoutGrid, Search, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { NewsArticle } from '@/lib/gnews';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CommandItem, CommandList } from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDebounce } from '@/hooks/use-debounce';
import { useMarketStore } from '@/store/market-store';
import { useThemeStore } from '@/store/theme-store';
import ResearchTradeForm from './research-trade-form';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchTopFinancialNewsAction } from '@/app/actions';

const TradingViewWidget = dynamic(
    () => import('@/components/shared/trading-view-widget'),
    { ssr: false, loading: () => <Skeleton className="w-full h-full" /> }
);

const PRO_STUDIES = [
    "RSI@tv-basicstudies",
    "MASimple@tv-basicstudies",
    "MACD@tv-basicstudies",
    "BollingerBands@tv-basicstudies"
];

const DEFAULT_SYMBOLS = ["NASDAQ:AAPL", "NASDAQ:TSLA", "NASDAQ:NVDA", "BTCUSD"];
const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY as string;

interface StockData {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    logoUrl: string;
    high: number;
    low: number;
    open: number;
    pc: number;
}

interface MetricData {
    metric: {
        "52WeekHigh": number;
        "52WeekLow": number;
        "marketCapitalization": number;
        "dividendYieldIndicatedAnnual": number;
        "epsTTM": number;
        "peTTM": number;
    }
}

export default function ResearchClient() {
    const [gridMode, setGridMode] = useState<1 | 2 | 4>(4);
    const [symbols, setSymbols] = useState(DEFAULT_SYMBOLS);
    const [isCustomZoom, setIsCustomZoom] = useState(false);

    // News State
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [newsLoading, setNewsLoading] = useState(true);
    const [newsExpanded, setNewsExpanded] = useState(false);

    // Stock Search State
    const [inputValue, setInputValue] = useState("");
    const debouncedInputValue = useDebounce(inputValue, 500);
    const [searchResults, setSearchResults] = useState<StockData[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Detailed Stock State
    const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
    const [stockMetrics, setStockMetrics] = useState<MetricData | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const { isMarketOpen, fetchMarketStatus } = useMarketStore();
    const { isClearMode } = useThemeStore();

    // Trade State
    const [showTradeForm, setShowTradeForm] = useState(false);
    const chartContainerRef = useRef<HTMLDivElement | null>(null);
    const tradeFormRef = useRef<HTMLDivElement | null>(null);

    // ... (fetchStockDetailsBySymbol logic skipped for brevity if not changing) ...

    // ...

    const handleMoreInfo = () => {
        if (!selectedStock) return;

        // 1. Reset Grid
        setGridMode(1);

        // 2. Set Symbol
        updateSymbol(0, selectedStock.symbol);

        // 3. Scroll to Top - Robust approach targeting all potential scroll parents
        const mainContent = document.getElementById('main-content');
        if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });

        if (containerRef.current) containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleTradeClick = () => {
        const willShow = !showTradeForm;
        setShowTradeForm(willShow);

        // Smooth scroll to trade form area if we are opening it
        if (willShow) {
            setTimeout(() => {
                tradeFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }

    // ...

    {/* Trade Form Section */ }
    <AnimatePresence>
        {showTradeForm && (
            <motion.div
                ref={tradeFormRef}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={cn("pt-8 border-t overflow-visible", isClearMode ? "border-white/10" : "border-border")}
            >
                <ResearchTradeForm
                    selectedSymbol={selectedStock.symbol}
                    selectedPrice={selectedStock.price}
                    loadingPrice={loadingDetails}
                    onClose={() => setShowTradeForm(false)}
                    onTradeSuccess={() => {/* Refresh? */ }}
                />
            </motion.div>
        )}
    </AnimatePresence>
                                    </div >

        {/* Right: Chart (Fixed Size) */ }
        < div
    ref = { chartContainerRef }
    className = {
        cn(
                                            "lg:col-span-1 border rounded-xl overflow-hidden transition-all duration-500 ease-in-out h-[400px]",
            isClearMode? "border-white/10 bg-black/20" : "border-border bg-card"
        )
    }
        >
        <TradingViewWidget symbol={selectedStock.symbol} interval="D" />
                                    </div >
                                </div >
                            </motion.div >
                        )
}
                    </AnimatePresence >
                </div >
            </motion.div >
        </div >
    );
}
