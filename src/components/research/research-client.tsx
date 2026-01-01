"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, Grid2X2, Square, LayoutGrid, Plus, Search, Loader2, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { NewsArticle } from '@/lib/gnews';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { CommandItem, CommandList } from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDebounce } from '@/hooks/use-debounce';
import { useMarketStore } from '@/store/market-store';
import ResearchTradeForm from './research-trade-form';
import { AnimatePresence, motion } from 'framer-motion';

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
    pc: number; // prev close
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
    const [isFullscreen, setIsFullscreen] = useState(false);

    // News State
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [newsLoading, setNewsLoading] = useState(true);
    const [newsExpanded, setNewsExpanded] = useState(false);

    // Stock Search State
    const [inputValue, setInputValue] = useState("");
    const debouncedInputValue = useDebounce(inputValue, 500);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Detailed Stock State
    const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
    const [stockMetrics, setStockMetrics] = useState<MetricData | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const { isMarketOpen, fetchMarketStatus } = useMarketStore();

    // Trade State
    const [showTradeForm, setShowTradeForm] = useState(false);


    // Fetch News
    useEffect(() => {
        async function getNews() {
            try {
                // Using a server action would be better, but standard fetch for now to match pattern or use existing action if possible.
                // Assuming fetchTopFinancialNewsAction exists or similar. using generic fetch for now.
                // Reusing logic from market-news. 
                // Mocking strictly for this refined implementation to ensure stability without checking actions file again.
                // Ideally import { fetchMarketNewsAction } from "@/app/actions";
                const res = await fetch(`https://gnews.io/api/v4/top-headlines?category=business&lang=en&max=5&apikey=${process.env.NEXT_PUBLIC_GNEWS_API_KEY}`);
                const data = await res.json();
                if (data.articles) setNews(data.articles);
            } catch (e) {
                console.error(e);
            } finally {
                setNewsLoading(false);
            }
        }
        getNews();
        fetchMarketStatus();
    }, [fetchMarketStatus]);

    // Search Logic
    useEffect(() => {
        if (!debouncedInputValue) {
            setSearchResults([]);
            return;
        }
        async function search() {
            setIsSearching(true);
            try {
                const res = await fetch(`https://finnhub.io/api/v1/search?q=${debouncedInputValue}&token=${API_KEY}`);
                const data = await res.json();
                if (data.result) {
                    setSearchResults(data.result.filter((s: any) => s.type === "Common Stock" && !s.symbol.includes('.')).slice(0, 5));
                }
            } catch (e) { console.error(e); }
            finally { setIsSearching(false); }
        }
        search();
    }, [debouncedInputValue]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const updateSymbol = (index: number, newSymbol: string) => {
        const newSymbols = [...symbols];
        newSymbols[index] = newSymbol;
        setSymbols(newSymbols);
    };

    const handleSelectStock = async (symbol: string) => {
        setInputValue("");
        setShowSuggestions(false);
        setLoadingDetails(true);
        setShowTradeForm(false); // Reset trade form

        try {
            const [quoteRes, profileRes, metricsRes] = await Promise.all([
                fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`),
                fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`),
                fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${API_KEY}`)
            ]);

            const quote = await quoteRes.json();
            const profile = await profileRes.json();
            const metrics = await metricsRes.json();

            const logoUrl = `https://img.logokit.com/ticker/${symbol}?token=pk_fr7a1b76952087586937fa`;

            setSelectedStock({
                symbol: symbol,
                name: profile.name || symbol,
                price: quote.c,
                change: quote.d,
                changePercent: quote.dp,
                logoUrl: logoUrl,
                high: quote.h,
                low: quote.l,
                open: quote.o,
                pc: quote.pc
            });
            setStockMetrics(metrics);

        } catch (error) {
            console.error("Error details:", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleMoreInfo = () => {
        if (!selectedStock) return;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setGridMode(1);
        updateSymbol(0, selectedStock.symbol);
    };

    const getGridClass = () => {
        switch (gridMode) {
            case 1: return "grid-cols-1 grid-rows-1";
            case 2: return "grid-cols-1 md:grid-cols-2 grid-rows-1";
            case 4: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 grid-rows-2";
            default: return "grid-cols-2 grid-rows-2";
        }
    };

    return (
        <div className="h-full flex flex-col space-y-6 p-4 pb-24 md:pb-4 max-w-[1920px] mx-auto">
            {/* 1. Header Toolbar */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                    Pro Research Station
                </h1>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setGridMode(1)} className={gridMode === 1 ? "bg-muted" : "text-muted-foreground"}>
                        <Square className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setGridMode(2)} className={gridMode === 2 ? "bg-muted" : "text-muted-foreground"}>
                        <LayoutGrid className="h-4 w-4 rotate-90" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setGridMode(4)} className={gridMode === 4 ? "bg-muted" : "text-muted-foreground"}>
                        <Grid2X2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={toggleFullscreen} className="ml-2 border-white/20 text-white hover:bg-white/10">
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* 2. Main Grid */}
            <div className={`grid gap-4 ${getGridClass()} min-h-[600px] transition-all duration-300`}>
                {Array.from({ length: gridMode }).map((_, index) => (
                    <Card key={index} className="overflow-hidden flex flex-col h-full border-muted/20 bg-card/40 backdrop-blur-sm">
                        <CardContent className="p-0 flex-1 relative">
                            <div className="absolute top-2 left-2 z-10 w-24 opacity-0 hover:opacity-100 transition-opacity">
                                <Input
                                    className="h-8 text-xs bg-black/60 backdrop-blur border-none text-white"
                                    placeholder="Symbol"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') updateSymbol(index, e.currentTarget.value)
                                    }}
                                />
                            </div>
                            <TradingViewWidget
                                symbol={symbols[index]}
                                interval="1"
                                studies={PRO_STUDIES}
                                containerIdSuffix={`_pro_${index}`}
                            />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 3. News Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Latest Headlines</h3>
                    <Button variant="ghost" size="sm" onClick={() => setNewsExpanded(!newsExpanded)} className="text-muted-foreground hover:text-white">
                        {newsExpanded ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                        {newsExpanded ? "Show Less" : "Reveal 5"}
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {newsLoading ? (
                        <Skeleton className="h-32 w-full col-span-5" />
                    ) : (
                        (newsExpanded ? news.slice(0, 5) : news.slice(0, 1)).map((article, i) => (
                            <a key={i} href={article.url} target="_blank" rel="noreferrer" className={cn("group relative block overflow-hidden rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors", !newsExpanded ? "md:col-span-5 flex items-center p-4 gap-4 h-24" : "aspect-[4/3]")}>
                                {/* Different Layout based on expanded state */}
                                {!newsExpanded ? (
                                    <>
                                        {article.image && <img src={article.image} alt="news" className="h-16 w-24 object-cover rounded" />}
                                        <div>
                                            <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-1">{article.title}</h4>
                                            <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{article.description}</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {article.image && <img src={article.image} alt="news" className="absolute inset-0 h-full w-full object-cover opacity-40 group-hover:opacity-20 transition-opacity" />}
                                        <div className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-black/90 to-transparent">
                                            <h4 className="text-sm font-medium text-white line-clamp-2 leading-tight">{article.title}</h4>
                                            <span className="text-[10px] text-zinc-400 mt-1">{article.source.name}</span>
                                        </div>
                                    </>
                                )}
                            </a>
                        ))
                    )}
                </div>
            </div>

            {/* 4. Deep Dive Search Section */}
            <div className="pt-8 border-t border-white/10 space-y-6">
                <h3 className="text-lg font-semibold text-white">Detailed Stock Analysis</h3>
                {/* Search Bar */}
                <div className="relative max-w-2xl" ref={searchContainerRef}>
                    <div className="relative flex items-center">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search symbol (e.g. AAPL) for deep analysis..."
                            className="pl-12 h-14 rounded-full bg-white/5 border-white/10 text-lg focus-visible:ring-purple-500/50 transition-all font-light"
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value.toUpperCase());
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                        />
                        {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />}
                    </div>
                    {showSuggestions && searchResults.length > 0 && (
                        <div className="absolute top-full mt-2 w-full bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                            <CommandList>
                                {searchResults.map((s) => (
                                    <CommandItem key={s.symbol} onSelect={() => handleSelectStock(s.symbol)} className="cursor-pointer hover:bg-white/5 p-3">
                                        <div className="flex gap-3 items-center">
                                            <Avatar className="h-8 w-8 bg-zinc-800"><AvatarFallback>{s.symbol[0]}</AvatarFallback></Avatar>
                                            <div>
                                                <p className="font-bold text-white">{s.symbol}</p>
                                                <p className="text-xs text-zinc-400">{s.description}</p>
                                            </div>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandList>
                        </div>
                    )}
                </div>

                {/* Results Area */}
                <AnimatePresence>
                    {selectedStock && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                                {/* Left: Chart */}
                                <div className="lg:col-span-1 h-[400px] rounded-xl overflow-hidden border border-white/10 bg-black/20">
                                    <TradingViewWidget symbol={selectedStock.symbol} interval="D" />
                                </div>

                                {/* Right: Info */}
                                <div className="lg:col-span-2 space-y-8">
                                    {/* Header Info */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className="h-16 w-16 bg-white rounded-xl flex items-center justify-center p-2 shadow-lg">
                                                <img src={selectedStock.logoUrl} alt={selectedStock.symbol} className="max-w-full max-h-full object-contain" />
                                            </div>
                                            <div>
                                                <h2 className="text-4xl font-bold text-white">{selectedStock.symbol}</h2>
                                                <p className="text-lg text-zinc-400">{selectedStock.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-3xl font-mono text-white">${selectedStock.price.toFixed(2)}</span>
                                                    <span className={cn("text-lg font-medium", selectedStock.change >= 0 ? "text-green-400" : "text-red-400")}>
                                                        {selectedStock.change > 0 ? "+" : ""}{selectedStock.change.toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                                                    <span>Market is {isMarketOpen ? 'Open' : 'Closed'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={() => setShowTradeForm(!showTradeForm)} size="lg" className="bg-white text-black hover:bg-zinc-200">
                                                {showTradeForm ? "Cancel Trade" : `Trade ${selectedStock.symbol}`}
                                            </Button>
                                            <Button onClick={handleMoreInfo} size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
                                                More Info
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-12">
                                        <div><p className="text-zinc-500 text-xs uppercase tracking-wider">Volume (Current)</p><p className="text-white font-mono text-lg">---</p></div> {/* Not available in basic quote */}
                                        <div><p className="text-zinc-500 text-xs uppercase tracking-wider">High (Day)</p><p className="text-white font-mono text-lg">${selectedStock.high.toFixed(2)}</p></div>
                                        <div><p className="text-zinc-500 text-xs uppercase tracking-wider">Low (Day)</p><p className="text-white font-mono text-lg">${selectedStock.low.toFixed(2)}</p></div>
                                        <div><p className="text-zinc-500 text-xs uppercase tracking-wider">Open</p><p className="text-white font-mono text-lg">${selectedStock.open.toFixed(2)}</p></div>

                                        <div><p className="text-zinc-500 text-xs uppercase tracking-wider">52 Week High</p><p className="text-white font-mono text-lg">${stockMetrics?.metric["52WeekHigh"].toFixed(2)}</p></div>
                                        <div><p className="text-zinc-500 text-xs uppercase tracking-wider">52 Week Low</p><p className="text-white font-mono text-lg">${stockMetrics?.metric["52WeekLow"].toFixed(2)}</p></div>
                                        <div><p className="text-zinc-500 text-xs uppercase tracking-wider">Market Cap</p><p className="text-white font-mono text-lg">{stockMetrics?.metric.marketCapitalization ? `${(stockMetrics.metric.marketCapitalization / 1000).toFixed(2)}B` : '---'}</p></div>
                                        <div><p className="text-zinc-500 text-xs uppercase tracking-wider">P/E Ratio</p><p className="text-white font-mono text-lg">{stockMetrics?.metric.peTTM.toFixed(2)}</p></div>

                                        <div><p className="text-zinc-500 text-xs uppercase tracking-wider">Div Yield</p><p className="text-white font-mono text-lg">{stockMetrics?.metric.dividendYieldIndicatedAnnual ? `${stockMetrics.metric.dividendYieldIndicatedAnnual.toFixed(2)}%` : '---'}</p></div>
                                        <div><p className="text-zinc-500 text-xs uppercase tracking-wider">EPS (TTM)</p><p className="text-white font-mono text-lg">${stockMetrics?.metric.epsTTM.toFixed(2)}</p></div>
                                    </div>
                                </div>
                            </div>

                            {/* Trade Form Section */}
                            <AnimatePresence>
                                {showTradeForm && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        className="mt-8 pt-8 border-t border-white/10"
                                    >
                                        <ResearchTradeForm
                                            selectedSymbol={selectedStock.symbol}
                                            selectedPrice={selectedStock.price}
                                            loadingPrice={loadingDetails}
                                            onClose={() => setShowTradeForm(false)}
                                            onTradeSuccess={() => {/* Maybe refresh data? */ }}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
