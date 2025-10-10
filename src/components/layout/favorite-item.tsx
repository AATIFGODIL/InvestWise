
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useThemeStore } from '@/store/theme-store';
import { type Favorite } from '@/store/favorites-store';
import { cn } from '@/lib/utils';
import { appIcons } from './command-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { TrendingUp, TrendingDown } from 'lucide-react';

const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY as string;

const pillVariants = {
    initial: { width: 48, height: 48 },
    expanded: { 
        width: 140, 
        height: 48,
        transition: { type: 'spring', stiffness: 400, damping: 30 }
    },
    icon: { 
        width: 48, 
        height: 48,
        transition: { type: 'spring', stiffness: 400, damping: 30 }
    },
};

const contentVariants = {
    hidden: { opacity: 0, transition: { duration: 0.1 } },
    visible: { opacity: 1, transition: { delay: 0.1, duration: 0.2 } },
};

const iconVariants = {
    hidden: { opacity: 0, scale: 0.8, transition: { duration: 0.1 } },
    visible: { opacity: 1, scale: 1, transition: { delay: 0.1, duration: 0.2 } },
};

interface FavoriteItemProps {
  favorite: Favorite;
  onSelect: (fav: Favorite) => void;
  variants: any;
  isEditing: boolean;
}

export default function FavoriteItem({ favorite, onSelect, variants, isEditing }: FavoriteItemProps) {
    const { isClearMode, theme } = useThemeStore();
    const isLightClear = isClearMode && theme === 'light';
    const [price, setPrice] = useState<number | undefined>(undefined);
    const [change, setChange] = useState<number | undefined>(undefined);
    const Icon = appIcons[favorite.iconName] || null;
    const isPill = favorite.size === 'pill';
    
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
        "rounded-full transition-colors duration-300 ease-in-out focus-visible:ring-0 flex items-center justify-center relative overflow-hidden",
        isEditing ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        isClearMode
          ? isLightClear
            ? "bg-card/60 text-foreground ring-1 ring-white/20"
            : "bg-white/10 text-slate-100 ring-1 ring-white/60"
          : "bg-background text-foreground ring-1 ring-border"
    );

    return (
        <Reorder.Item
            as="button"
            value={favorite}
            variants={variants}
            className={cn("flex-shrink-0", containerClasses)}
            style={{ backdropFilter: "blur(2px)" }}
            onClick={() => onSelect(favorite)}
            animate={{ height: '3rem', width: isPill ? '140px' : '3rem' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            whileDrag={{ scale: 1.1 }}
        >
            <AnimatePresence mode="wait">
                {isPill ? (
                    <motion.div
                        key="pill"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={contentVariants}
                        className="flex items-center gap-2 px-3 whitespace-nowrap w-full"
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
                                        <span>{price !== undefined ? `$${price.toFixed(2)}` : '...'}</span>
                                        {change !== undefined && (
                                            <span className={cn(change >= 0 ? "text-green-400" : "text-red-400", "flex items-center")}>
                                                {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                             <div className="flex items-center justify-center gap-2 w-full">
                                {Icon && <Icon className="h-5 w-5" />}
                                <span className="font-semibold text-sm truncate">{favorite.name}</span>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="icon"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={iconVariants}
                        className="pointer-events-none"
                    >
                        {favorite.type === 'stock' ? (
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={favorite.logoUrl} alt={favorite.name} />
                                <AvatarFallback className="text-sm">{favorite.iconName}</AvatarFallback>
                            </Avatar>
                        ) : Icon ? (
                            <Icon className={cn("h-6 w-6", isClearMode ? "text-slate-100" : "text-foreground")} />
                        ) : null}
                    </motion.div>
                )}
            </AnimatePresence>
        </Reorder.Item>
    );
}
