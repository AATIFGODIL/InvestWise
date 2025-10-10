
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useFavoritesStore, type Favorite } from '@/store/favorites-store';
import { useThemeStore } from '@/store/theme-store';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { appIcons } from './command-menu';

const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY as string;

const pillVariants = {
    initial: { width: 48, height: 48 },
    expanded: { 
        width: 180, 
        height: 60,
        transition: { type: 'spring', stiffness: 400, damping: 30, duration: 0.4 }
    },
    icon: { 
        width: 48, 
        height: 48,
        transition: { type: 'spring', stiffness: 400, damping: 30, duration: 0.4 }
    },
};

const contentVariants = {
    hidden: { opacity: 0, y: 5, transition: { duration: 0.1 } },
    visible: { opacity: 1, y: 0, transition: { delay: 0.25, duration: 0.2 } },
};

const iconVariants = {
    hidden: { opacity: 0, scale: 0.8, transition: { duration: 0.1 } },
    visible: { opacity: 1, scale: 1, transition: { delay: 0.25, duration: 0.2 } },
};


export default function FavoriteItem({ favorite, isEditing }: { favorite: Favorite, isEditing: boolean }) {
    const { setFavorites, favorites } = useFavoritesStore();
    const { isClearMode, theme } = useThemeStore();
    const isLightClear = isClearMode && theme === 'light';
    const [price, setPrice] = useState<number | null>(null);

    const isExpanded = favorite.size === 'expanded';
    const Icon = appIcons[favorite.iconName] || null;

    useEffect(() => {
        if (favorite.type === 'stock' && isExpanded) {
            const fetchPrice = async () => {
                try {
                    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${favorite.value}&token=${API_KEY}`);
                    const data = await res.json();
                    if (data.c) {
                        setPrice(data.c);
                    }
                } catch (e) {
                    console.error("Failed to fetch price for favorite:", e);
                }
            };
            fetchPrice();
        }
    }, [favorite.type, favorite.value, isExpanded]);
    
    const handleToggleExpand = () => {
        if (!isEditing) return;

        const newFavorites = favorites.map(f => {
            if (f.id === favorite.id) {
                return { ...f, size: f.size === 'icon' ? 'expanded' : 'icon' };
            }
            return f;
        });
        setFavorites(newFavorites);
    };
    
    const glassStyle = {
        backgroundColor: isLightClear ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(16px)',
    };


    return (
        <Reorder.Item
            as="div"
            value={favorite}
            className="relative flex items-center justify-center cursor-grab active:cursor-grabbing"
            initial="initial"
            animate={isExpanded ? 'expanded' : 'icon'}
            variants={pillVariants}
            style={{
                borderRadius: '9999px',
                boxShadow: "0 10px 18px -6px rgb(0 0 0 / 0.22), 0 6px 10px -8px rgb(0 0 0 / 0.12)",
            }}
            onClick={handleToggleExpand}
            whileDrag={{ scale: 1.1 }}
        >
             {/* Glassy background for transition */}
            <motion.div
                className={cn(
                    "absolute inset-0 rounded-full",
                    isClearMode
                        ? "ring-1 ring-white/60"
                        : "ring-1 ring-border"
                )}
                style={glassStyle}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            />
            
            <AnimatePresence mode="wait">
                {isExpanded ? (
                    <motion.div
                        key="content"
                        className="flex items-center gap-3 text-white pointer-events-none w-full px-4"
                        variants={contentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                         {favorite.type === 'stock' && (
                            <>
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={favorite.logoUrl} alt={favorite.name} />
                                    <AvatarFallback>{favorite.iconName}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm leading-tight">{favorite.name}</span>
                                    <span className="text-lg font-mono leading-tight">{price ? `$${price.toFixed(2)}` : '...'}</span>
                                </div>
                            </>
                         )}
                         {favorite.type === 'action' && (
                              <span className="font-bold text-sm text-center w-full">{favorite.name}</span>
                         )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="icon"
                        variants={iconVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="pointer-events-none"
                    >
                        {favorite.type === 'stock' ? (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={favorite.logoUrl} alt={favorite.name} />
                                <AvatarFallback>{favorite.iconName}</AvatarFallback>
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
