// InvestWise - A modern stock trading and investment education platform for young investors
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
import { ProModeToggle } from '@/components/shared/pro-mode-toggle';

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
    const containerRef = useRef<HTMLDivElement>(null);

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

    // Helper: Fetch Stock Details
    const fetchStockDetailsBySymbol = async (symbol: string): Promise<StockData | null> => {
        const isApiKeyValid = API_KEY && !API_KEY.startsWith("AIzaSy") && API_KEY !== "your_finnhub_api_key_here";
        const logoUrl = `https://img.logokit.com/ticker/${symbol}?token=pk_fr7a1b76952087586937fa`;

        if (!isApiKeyValid) {
            // Simulated data
            return { symbol, name: symbol, price: Math.random() * 500, change: Math.random() * 10 - 5, changePercent: Math.random() * 5 - 2.5, logoUrl, high: 0, low: 0, open: 0, pc: 0 };
        }

        try {
            const [quoteRes, profileRes] = await Promise.all([
                fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`),
                fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`)
            ]);
            if (!quoteRes.ok || !profileRes.ok) return null;
            const quote = await quoteRes.json();
            const profile = await profileRes.json();

            return {
                symbol,
                name: profile.name || symbol,
                price: quote.c || 0,
                change: quote.d || 0,
                changePercent: quote.dp || 0,
                logoUrl,
                high: quote.h || 0,
                low: quote.l || 0,
                open: quote.o || 0,
                pc: quote.pc || 0
            };
        } catch {
            return null;
        }
    };

    // Update Symbol Helper
    const updateSymbol = (index: number, newSymbol: string) => {
        const newSymbols = [...symbols];
        newSymbols[index] = newSymbol;
        setSymbols(newSymbols);
    };

    // Fetch News & Market Status
    useEffect(() => {
        async function getNews() {
            try {
                const data = await fetchTopFinancialNewsAction(5);
                setNews(data);
            } catch (e) {
                console.error("Failed to fetch news:", e);
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
                    const filtered = data.result
                        .filter((s: any) => s.type === "Common Stock" && !s.symbol.includes('.'))
                        .slice(0, 5);

                    const promises = filtered.map((stock: any) => fetchStockDetailsBySymbol(stock.symbol));
                    const results = (await Promise.all(promises)).filter(Boolean) as StockData[];
                    setSearchResults(results);
                }
            } catch (e) {
                console.error(e);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }
        search();
    }, [debouncedInputValue]);

    // Fullscreen Toggle
    const toggleZoom = async () => {
        if (!isCustomZoom) {
            // Attempt to Enter Fullscreen
            // We use a try-catch pattern to support mobile/iOS where API might be missing or fail
            // If API fails, we still set isCustomZoom(true) to trigger the CSS-based fullscreen mode
            try {
                if (containerRef.current) {
                    const el = containerRef.current as any;
                    if (el.requestFullscreen) {
                        await el.requestFullscreen();
                    } else if (el.webkitRequestFullscreen) {
                        await el.webkitRequestFullscreen();
                    } else if (el.mozRequestFullScreen) {
                        await el.mozRequestFullScreen();
                    } else if (el.msRequestFullscreen) {
                        await el.msRequestFullscreen();
                    }
                }
            } catch (err) {
                console.warn("Fullscreen API failed or blocked, falling back to CSS mode:", err);
            }
            // Always set state to true, ensuring "Fake Fullscreen" works on mobile even if API failed
            setIsCustomZoom(true);
        } else {
            // Attempt to Exit Fullscreen
            try {
                const doc = document as any;
                if (doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement) {
                    if (doc.exitFullscreen) {
                        await doc.exitFullscreen();
                    } else if (doc.webkitExitFullscreen) {
                        await doc.webkitExitFullscreen();
                    } else if (doc.mozCancelFullScreen) {
                        await doc.mozCancelFullScreen();
                    } else if (doc.msExitFullscreen) {
                        await doc.msExitFullscreen();
                    }
                }
            } catch (err) {
                console.warn("Exit Fullscreen API failed:", err);
            }
            setIsCustomZoom(false);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsCustomZoom(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const handleSelectStock = async (symbol: string) => {
        setInputValue("");
        setShowSuggestions(false);
        setLoadingDetails(true);
        setShowTradeForm(false);

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
        setGridMode(1);
        updateSymbol(0, selectedStock.symbol);

        const mainContent = document.getElementById('main-content');
        if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
        if (containerRef.current) containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleTradeClick = () => {
        const willShow = !showTradeForm;
        setShowTradeForm(willShow);
        if (willShow) {
            setTimeout(() => {
                tradeFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }

    const getGridClass = () => {
        switch (gridMode) {
            case 1: return "grid-cols-1 grid-rows-1";
            case 2: return "grid-cols-1 md:grid-cols-2 grid-rows-1";
            case 4: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 grid-rows-2";
            default: return "grid-cols-2 grid-rows-2";
        }
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                "flex flex-col space-y-6 p-4 mx-auto transition-all duration-500",
                isCustomZoom ? "bg-background py-6 h-screen w-screen overflow-y-auto" : "min-h-full pb-12 md:pb-12 max-w-[1920px]"
            )}
        >
            {/* Header Toolbar */}
            <div className="flex justify-between items-center shrink-0">
                <h1 className="text-2xl font-bold text-white tracking-tight ml-20">Pro Research Station</h1>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setGridMode(1)} className={gridMode === 1 ? "bg-muted" : "text-muted-foreground"}><Square className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setGridMode(2)} className={gridMode === 2 ? "bg-muted" : "text-muted-foreground"}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                        >
                            <rect width="8" height="16" x="3" y="4" rx="3" />
                            <rect width="8" height="16" x="13" y="4" rx="3" />
                        </svg>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setGridMode(4)} className={gridMode === 4 ? "bg-muted" : "text-muted-foreground"}><LayoutGrid className="h-4 w-4 rotate-90" /></Button>
                    <ProModeToggle className="ml-2 mr-2" showLabel={false} />
                    <Button variant="outline" size="icon" onClick={toggleZoom} className="ml-2 border-white/20 text-white hover:bg-white/10">
                        {isCustomZoom ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* TradingView Grid */}
            <div className={cn("grid gap-4 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]", getGridClass(), isCustomZoom ? "flex-1 min-h-[calc(100vh-8rem)]" : "min-h-[600px]")}>
                {Array.from({ length: gridMode }).map((_, index) => (
                    <Card key={index} className="overflow-hidden flex flex-col h-full border-muted/20 bg-card/40 backdrop-blur-sm shadow-2xl">
                        <CardContent className="p-0 flex-1 relative">
                            <div className="absolute top-2 left-2 z-10 w-24 opacity-0 hover:opacity-100 transition-opacity">
                                <Input className="h-8 text-xs bg-black/60 backdrop-blur border-none text-white" placeholder="Symbol" onKeyDown={(e) => { if (e.key === 'Enter') updateSymbol(index, e.currentTarget.value) }} />
                            </div>
                            <TradingViewWidget symbol={symbols[index]} interval="1" studies={PRO_STUDIES} containerIdSuffix={`_pro_${index}`} />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* News Section */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className={cn("text-lg font-semibold", isClearMode ? "text-primary-foreground" : "text-foreground")}>Latest Headlines</h3>
                        <Button variant="ghost" size="sm" onClick={() => setNewsExpanded(!newsExpanded)} className={cn("hover:text-primary", isClearMode ? "text-white/70" : "text-muted-foreground")}>
                            {newsExpanded ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                            {newsExpanded ? "Show Less" : "Reveal 5"}
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {newsLoading ? <Skeleton className="h-24 w-full col-span-5" /> : (newsExpanded ? news.slice(0, 5) : news.slice(0, 1)).map((article, i) => (
                            <a key={i} href={article.url} target="_blank" rel="noreferrer" className={cn("group relative block overflow-hidden rounded-lg transition-colors border", !newsExpanded ? "md:col-span-5 flex items-center p-4 gap-4 h-24" : "aspect-[4/3]", isClearMode ? "bg-white/10 border-white/10 hover:bg-white/20" : "bg-card border-border hover:bg-accent")}>
                                {!newsExpanded ? (
                                    <>
                                        {article.image && <img src={article.image} alt="news" className="h-16 w-24 object-cover rounded" />}
                                        <div>
                                            <h4 className={cn("font-medium group-hover:text-primary transition-colors line-clamp-1", isClearMode ? "text-white" : "text-foreground")}>{article.title}</h4>
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{article.description}</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {article.image && <img src={article.image} alt="news" className="absolute inset-0 h-full w-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />}
                                        <div className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-black/90 to-transparent">
                                            <h4 className="text-sm font-medium text-white line-clamp-2 leading-tight">{article.title}</h4>
                                            <span className="text-[10px] text-zinc-400 mt-1">{article.source.name}</span>
                                        </div>
                                    </>
                                )}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Detailed Analysis Section */}
                <div className={cn("pt-8 border-t space-y-6 transition-all duration-300",
                    (showSuggestions && inputValue) ? "pb-96" : "pb-32",
                    isClearMode ? "border-white/10" : "border-border")}>
                    <h3 className={cn("text-lg font-semibold", isClearMode ? "text-primary-foreground" : "text-foreground")}>Detailed Stock Analysis</h3>
                    <div className="relative w-full px-4" ref={searchContainerRef}>
                        <div className={cn("relative flex h-14 w-full items-center rounded-full px-4 text-primary-foreground shadow-lg transition-all", isClearMode ? "bg-white/10 ring-1 ring-white/60" : "bg-card ring-1 ring-border")} style={{ backdropFilter: "blur(16px)" }}>
                            <Search className={cn("h-5 w-5 ml-2 cursor-pointer", isClearMode ? "text-primary-foreground" : "text-muted-foreground")} />
                            <Input value={inputValue} onChange={(e) => { setInputValue(e.target.value.toUpperCase()); setShowSuggestions(true); }} onFocus={() => setShowSuggestions(true)} placeholder="Search symbol (e.g. AAPL) for deep analysis..." className={cn("w-full h-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg placeholder:text-muted-foreground ml-2", isClearMode ? "text-primary-foreground placeholder:text-primary-foreground/50" : "text-foreground")} />
                            {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />}
                        </div>
                        {showSuggestions && inputValue && (
                            <div className={cn("absolute top-full mt-2 left-4 right-4 rounded-3xl shadow-lg z-50 overflow-hidden", isClearMode ? "bg-white/10 ring-1 ring-white/60" : "bg-background border")} style={{ backdropFilter: "blur(16px)" }}>
                                <CommandList>
                                    {isSearching && <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>}
                                    {!isSearching && searchResults.length === 0 && <div className="p-4 text-center text-sm text-muted-foreground">No results found.</div>}
                                    {searchResults.map(stock => (
                                        <CommandItem key={stock.symbol} onSelect={() => handleSelectStock(stock.symbol)} className={cn("cursor-pointer p-3", isClearMode ? "hover:bg-white/10" : "hover:bg-accent")}>
                                            <div className="flex justify-between items-center w-full">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8 bg-muted"><AvatarImage src={stock.logoUrl} alt={stock.name} /><AvatarFallback>{stock.symbol.charAt(0)}</AvatarFallback></Avatar>
                                                    <div><p className={cn("font-medium", isClearMode ? "text-primary-foreground" : "text-foreground")}>{stock.name}</p><p className="text-xs text-muted-foreground">{stock.symbol}</p></div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={cn("font-mono font-medium", isClearMode ? "text-primary-foreground" : "text-foreground")}>${stock.price.toFixed(2)}</p>
                                                    <p className={cn("text-xs", stock.change >= 0 ? "text-green-500" : "text-red-500")}>{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)</p>
                                                </div>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandList>
                            </div>
                        )}
                    </div>

                    <AnimatePresence>
                        {selectedStock && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                                    <div className="space-y-8">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-4">
                                                <Avatar className="h-16 w-16"><AvatarImage src={selectedStock.logoUrl} /><AvatarFallback>{selectedStock.symbol[0]}</AvatarFallback></Avatar>
                                                <div>
                                                    <h2 className={cn("text-4xl font-bold", isClearMode ? "text-white" : "text-foreground")}>{selectedStock.symbol}</h2>
                                                    <p className="text-lg text-muted-foreground">{selectedStock.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={cn("text-3xl font-mono", isClearMode ? "text-white" : "text-foreground")}>${selectedStock.price.toFixed(2)}</span>
                                                        <span className={cn("text-lg font-medium", selectedStock.change >= 0 ? "text-green-500" : "text-red-500")}>{selectedStock.change.toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button onClick={handleTradeClick} size="lg" className={cn(isClearMode ? "bg-white text-black hover:bg-zinc-200" : "")}>{showTradeForm ? "Cancel Trade" : `Trade ${selectedStock.symbol}`}</Button>
                                                <Button onClick={handleMoreInfo} size="lg" variant="default">More Info</Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-12">
                                            <div><p className="text-muted-foreground text-xs uppercase tracking-wider">Volume</p><p className={cn("font-mono text-lg", isClearMode ? "text-white" : "text-foreground")}>---</p></div>
                                            <div><p className="text-muted-foreground text-xs uppercase tracking-wider">High</p><p className={cn("font-mono text-lg", isClearMode ? "text-white" : "text-foreground")}>${selectedStock.high.toFixed(2)}</p></div>
                                            <div><p className="text-muted-foreground text-xs uppercase tracking-wider">Low</p><p className={cn("font-mono text-lg", isClearMode ? "text-white" : "text-foreground")}>${selectedStock.low.toFixed(2)}</p></div>
                                            <div><p className="text-muted-foreground text-xs uppercase tracking-wider">Open</p><p className={cn("font-mono text-lg", isClearMode ? "text-white" : "text-foreground")}>${selectedStock.open.toFixed(2)}</p></div>

                                            <div><p className="text-muted-foreground text-xs uppercase tracking-wider">52W High</p><p className={cn("font-mono text-lg", isClearMode ? "text-white" : "text-foreground")}>{stockMetrics?.metric["52WeekHigh"]?.toFixed(2) ?? '---'}</p></div>
                                            <div><p className="text-muted-foreground text-xs uppercase tracking-wider">52W Low</p><p className={cn("font-mono text-lg", isClearMode ? "text-white" : "text-foreground")}>{stockMetrics?.metric["52WeekLow"]?.toFixed(2) ?? '---'}</p></div>
                                            <div><p className="text-muted-foreground text-xs uppercase tracking-wider">Mkt Cap</p><p className={cn("font-mono text-lg", isClearMode ? "text-white" : "text-foreground")}>{stockMetrics?.metric?.marketCapitalization ? `${(stockMetrics.metric.marketCapitalization / 1000).toFixed(2)}B` : '---'}</p></div>
                                            <div><p className="text-muted-foreground text-xs uppercase tracking-wider">P/E Ratio</p><p className={cn("font-mono text-lg", isClearMode ? "text-white" : "text-foreground")}>{stockMetrics?.metric?.peTTM?.toFixed(2) ?? '---'}</p></div>

                                            <div><p className="text-muted-foreground text-xs uppercase tracking-wider">Div Yield</p><p className={cn("font-mono text-lg", isClearMode ? "text-white" : "text-foreground")}>{stockMetrics?.metric?.dividendYieldIndicatedAnnual ? `${stockMetrics.metric.dividendYieldIndicatedAnnual.toFixed(2)}%` : '---'}</p></div>
                                            <div><p className="text-muted-foreground text-xs uppercase tracking-wider">EPS (TTM)</p><p className={cn("font-mono text-lg", isClearMode ? "text-white" : "text-foreground")}>${stockMetrics?.metric?.epsTTM?.toFixed(2) ?? '---'}</p></div>
                                        </div>

                                        <AnimatePresence>
                                            {showTradeForm && (
                                                <motion.div ref={tradeFormRef} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className={cn("pt-8 overflow-visible")}>
                                                    <ResearchTradeForm selectedSymbol={selectedStock.symbol} selectedPrice={selectedStock.price} loadingPrice={loadingDetails} onClose={() => setShowTradeForm(false)} onTradeSuccess={() => { }} />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div ref={chartContainerRef} className={cn("border rounded-xl overflow-hidden transition-all duration-500 ease-in-out h-[400px]", isClearMode ? "border-white/10 bg-black/20" : "border-border bg-card")}>
                                        <TradingViewWidget symbol={selectedStock.symbol} interval="D" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
