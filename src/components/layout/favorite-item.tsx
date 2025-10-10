
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useThemeStore } from '@/store/theme-store';
import { type Favorite } from '@/store/favorites-store';
import { cn } from '@/lib/utils';
import { appIcons } from './command-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY as string;

interface FavoriteItemProps {
  favorite: Favorite;
  onClick: (fav: Favorite) => void;
  onRemove: (id: string) => void;
  variants: any;
  isEditing: boolean;
  isPill: boolean;
}

export default function FavoriteItem({ favorite, onClick, onRemove, variants, isEditing, isPill }: FavoriteItemProps) {
    const { isClearMode, theme } = useThemeStore();
    const isLightClear = isClearMode && theme === 'light';
    const [price, setPrice] = useState<number | null>(null);
    const [change, setChange] = useState<number | null>(null);
    const Icon = appIcons[favorite.iconName] || null;

    useEffect(() => {
        if (favorite.type === 'stock' && isPill) {
            const fetchPrice = async () => {
                try {
                    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${favorite.value}&token=${API_KEY}`);
                    const data = await res.json();
                    setPrice(data.c);
                    setChange(data.d);
                } catch (e) {
                    console.error("Failed to fetch price for favorite:", e);
                }
            };
            fetchPrice();
        }
    }, [favorite.type, favorite.value, isPill]);

    const containerClasses = cn(
        "rounded-full transition-colors duration-300 ease-in-out focus-visible:ring-0 flex items-center justify-center relative",
        isEditing ? "cursor-grab active:cursor-grabbing shimmer-bg" : "cursor-pointer",
        isClearMode
          ? isLightClear
            ? "bg-card/60 text-foreground ring-1 ring-white/20"
            : "bg-white/10 text-slate-100 ring-1 ring-white/60"
          : "bg-background text-foreground ring-1 ring-border"
    );

    const handleRemoveClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the main onClick from firing
        onRemove(favorite.id);
    };

    return (
        <Reorder.Item
            value={favorite}
            variants={variants}
            className={cn("z-10 flex-shrink-0", containerClasses)}
            style={{ backdropFilter: "blur(2px)" }}
            onClick={() => onClick(favorite)}
            whileDrag={{ scale: 1.1 }}
            animate={{ height: '3rem', width: isPill ? '140px' : '3rem' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
             {isEditing && (
                <button
                    onClick={handleRemoveClick}
                    className="absolute -top-1 -left-1 z-20 h-5 w-5 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/50"
                >
                    <Minus className="h-4 w-4 text-white" />
                </button>
            )}
            <AnimatePresence>
                {isPill ? (
                    <motion.div
                        key="pill"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: 0.1 } }}
                        className="flex items-center gap-2 px-4 w-full h-full"
                    >
                        {favorite.type === 'stock' ? (
                            <>
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={favorite.logoUrl} alt={favorite.name} />
                                    <AvatarFallback className="text-sm">{favorite.iconName}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-start text-xs overflow-hidden">
                                    <span className="font-bold truncate">{favorite.name.length > 10 ? favorite.value : favorite.name}</span>
                                    <div className="flex items-center gap-1">
                                        <span>{typeof price === 'number' ? `$${price.toFixed(2)}` : '...'}</span>
                                        {change !== null && (
                                            <span className={cn(change >= 0 ? "text-green-500" : "text-red-500", "flex items-center")}>
                                                {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : favorite.value === 'TradingView' ? (
                             <div className="flex items-center justify-center w-full h-full">
                                <img src="https://cdn.brandfetch.io/idJGnLFA9x/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1745979241741" alt="TradingView Logo" className="h-5" />
                            </div>
                        ) : (
                             <div className="flex items-center justify-center gap-2 w-full text-center">
                                {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                                 <span className="font-semibold text-xs whitespace-normal leading-tight text-center">{favorite.name}</span>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="icon" exit={{ opacity: 0 }}>
                        {favorite.type === 'stock' ? (
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={favorite.logoUrl} alt={favorite.name} />
                                <AvatarFallback className="text-sm">{favorite.iconName}</AvatarFallback>
                            </Avatar>
                        ) : Icon ? (
                            (favorite.value === 'TradingView' && favorite.logoUrl) ? (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={favorite.logoUrl} alt={favorite.name} />
                                    <AvatarFallback><Icon className="h-5 w-5" /></AvatarFallback>
                                </Avatar>
                            ) : (
                                <Icon className={cn("h-6 w-6", isClearMode ? "text-slate-100" : "text-foreground")} />
                            )
                        ) : null}
                    </motion.div>
                )}
            </AnimatePresence>
        </Reorder.Item>
    );
}

    
