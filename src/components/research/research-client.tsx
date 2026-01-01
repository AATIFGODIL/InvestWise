"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, Grid2X2, Square, LayoutGrid, Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import TopNews from '@/components/dashboard/top-news';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

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

export default function ResearchClient() {
    const [gridMode, setGridMode] = useState<1 | 2 | 4>(4); // 1 = Single, 2 = Split, 4 = Grid
    const [symbols, setSymbols] = useState(DEFAULT_SYMBOLS);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((e) => {
                console.error(`Error attempting to enable fullscreen mode: ${e.message} (${e.name})`);
            });
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const updateSymbol = (index: number, newSymbol: string) => {
        const newSymbols = [...symbols];
        newSymbols[index] = newSymbol;
        setSymbols(newSymbols);
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
        <div className="h-full flex flex-col space-y-4 p-4 pb-24 md:pb-4">
            {/* Visual Header / Toolbar */}
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    Pro Research Station
                </h1>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setGridMode(1)} className={gridMode === 1 ? "bg-muted" : ""}>
                        <Square className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setGridMode(2)} className={gridMode === 2 ? "bg-muted" : ""}>
                        <LayoutGrid className="h-4 w-4 rotate-90" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setGridMode(4)} className={gridMode === 4 ? "bg-muted" : ""}>
                        <Grid2X2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={toggleFullscreen}>
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[80vh]">
                {/* Charts Area */}
                <div className={`col-span-1 lg:col-span-3 grid gap-4 ${getGridClass()} h-full min-h-[600px]`}>
                    {Array.from({ length: gridMode }).map((_, index) => (
                        <Card key={index} className="overflow-hidden flex flex-col h-full border-muted/40">
                            <CardContent className="p-0 flex-1 relative">
                                {/* We use input to quickly change symbol if needed, though widget has it built-in */}
                                <div className="absolute top-2 left-2 z-10 w-24 opacity-0 hover:opacity-100 transition-opacity">
                                    <Input
                                        className="h-8 text-xs bg-background/80 backdrop-blur"
                                        placeholder="Symbol"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') updateSymbol(index, e.currentTarget.value)
                                        }}
                                    />
                                </div>
                                <TradingViewWidget
                                    symbol={symbols[index] || "NASDAQ:AAPL"}
                                    interval="1"
                                    studies={PRO_STUDIES}
                                    containerIdSuffix={`_pro_${index}`}
                                />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* News Side Panel */}
                <div className="col-span-1 h-full flex flex-col">
                    <Card className="flex-1 border-muted/40 flex flex-col overflow-hidden h-[800px] lg:h-auto">
                        <CardHeader className="py-3 px-4 border-b bg-muted/20">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                Create Terminal News
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-y-auto">
                            <div className="p-4">
                                <TopNews />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
