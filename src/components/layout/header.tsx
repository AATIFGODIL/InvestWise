
'use client';

import React from 'react';
import { Search, Bell, Settings, LogOut, User as UserIcon, Minus, TrendingUpIcon } from "lucide-react";
import { CommandMenu, appIcons } from "./command-menu";
import { Button } from "../ui/button";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useUserStore } from "@/store/user-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeStore } from "@/store/theme-store";
import { cn } from "@/lib/utils";
import useLoadingStore from "@/store/loading-store";
import { useRouter } from "next/navigation";
import { useFavoritesStore, type Favorite } from "@/store/favorites-store";
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import FavoriteItem from './favorite-item';
import { useIsMobile } from '@/hooks/use-mobile';


const containerVariants = {
  hidden: { width: 0, opacity: 0 },
  visible: {
    width: 'auto',
    opacity: 1,
    transition: {
      delay: 0.1,
      duration: 0.2,
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1 }
};

/**
 * The main header component for the application, displayed on most pages.
 * It provides a central search bar to open the command menu and favorite actions.
 */
export default function Header({ onTriggerRain }: { onTriggerRain: () => void }) {
  const [open, setOpen] = React.useState(false);
  const { user, signOut } = useAuth();
  const { username, photoURL } = useUserStore();
  const { isClearMode, theme } = useThemeStore();
  const { showLoading } = useLoadingStore();
  const router = useRouter();
  const { favorites, setFavorites, toggleFavoriteSize, removeFavorite } = useFavoritesStore();
  const [initialStock, setInitialStock] = React.useState<string | undefined>(undefined);
  const [isHovered, setIsHovered] = React.useState(false);
  const isMobile = useIsMobile();
  const [isTradingViewOpen, setIsTradingViewOpen] = React.useState(false);

  const [isEditing, setEditing] = React.useState(false);
  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = () => {
    longPressTimer.current = setTimeout(() => {
      setEditing((prev) => !prev);
    }, 500); // 500ms to enter editing mode
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const { appActions } = React.useMemo(() => {
    const actions = [
      { name: "Make it rain", keywords: "celebrate money win", onSelect: () => onTriggerRain(), icon: appIcons.party },
      { name: "Dashboard", keywords: "home explore main", onSelect: () => router.push('/dashboard'), icon: appIcons.home },
      { name: "Portfolio", keywords: "holdings assets", onSelect: () => router.push('/portfolio'), icon: appIcons.briefcase },
      { name: "Trade", keywords: "buy sell chart", onSelect: () => router.push('/trade'), icon: appIcons.repeat },
      { name: "Goals", keywords: "savings targets", onSelect: () => router.push('/goals'), icon: appIcons.barChart },
      { name: "Community", keywords: "leaderboard social", onSelect: () => router.push('/community'), icon: appIcons.users },
      { name: "View Leaderboard", keywords: "rankings top investors", onSelect: () => router.push('/community?tab=feed'), icon: appIcons.users2 },
      { name: "View Community Trends", keywords: "popular stocks", onSelect: () => router.push('/community?tab=trends'), icon: appIcons.trendingUp },
      { name: "View Watchlist", keywords: "saved stocks favorites", onSelect: () => router.push('/portfolio'), icon: appIcons.star },
      { name: "Sign Out", keywords: "log out exit", onSelect: () => signOut(), icon: appIcons.logOut },
      { name: "Profile", keywords: "account my info", onSelect: () => router.push('/profile'), icon: appIcons.user },
      { name: "Settings", keywords: "preferences options", onSelect: () => router.push('/settings'), icon: appIcons.settings },
      { name: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, keywords: "theme appearance", onSelect: () => useThemeStore.getState().setTheme(theme === 'dark' ? 'light' : 'dark'), icon: theme === 'dark' ? appIcons.sun : appIcons.moon },
      { name: `${isClearMode ? 'Disable' : 'Enable'} Clear Mode`, keywords: "theme glass liquid transparent", onSelect: () => useThemeStore.getState().setClearMode(!isClearMode), icon: appIcons.sparkles },
      { name: "Set Up Auto-Invest", keywords: "recurring investment", onSelect: () => router.push('/dashboard'), icon: appIcons.repeat },
      { name: "View Trade History", keywords: "transactions log", onSelect: () => router.push('/portfolio'), icon: appIcons.history },
      { name: "Ask InvestWise AI", keywords: "chatbot help question", onSelect: () => {}, icon: appIcons.brain },
      { name: "Educational Content", keywords: "learn video articles", onSelect: () => router.push('/dashboard'), icon: appIcons.bookOpen },
      { name: "View My Certificate", keywords: "award achievement", onSelect: () => router.push('/certificate'), icon: appIcons.award },
      { name: "TradingView", keywords: "chart graph", onSelect: () => setIsTradingViewOpen(true), icon: appIcons.tradingview, logoUrl: "https://cdn.brandfetch.io/idJGnLFA9x/w/400/h/400/theme/dark/icon.png?c=1bxid64Mup7aczewSAYMX&t=1745979227466" },
    ];
    return { appActions: actions };
  }, [theme, isClearMode, onTriggerRain, router, signOut]);

  const handleItemClick = (fav: Favorite) => {
      if (isEditing) {
          toggleFavoriteSize(fav.id);
      } else {
          if (fav.type === 'stock') {
              setInitialStock(fav.value);
              setOpen(true);
          } else {
              const action = appActions.find(a => a.name === fav.value);
              if(action) {
                // Using runCommand for consistency in closing the menu
                runCommand(action.onSelect);
              }
          }
      }
  };
  
  const runCommand = React.useCallback(async (command: () => void | Promise<void>) => {
    setOpen(false); // Close command menu
    await command();
  }, []);

  const isLightClear = isClearMode && theme === 'light';

  const handleNavigate = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    showLoading();
    router.push(href);
  };

    const { displayedFavorites, totalWeight } = React.useMemo(() => {
        const pills = favorites.filter(f => f.size === 'pill');
        const icons = favorites.filter(f => f.size === 'icon');

        if (isEditing) {
            const weight = favorites.reduce((acc, fav) => acc + (fav.size === 'pill' ? 2 : 1), 0);
            return { displayedFavorites: favorites, totalWeight: weight };
        }
        
        const maxWeight = isMobile ? 6 : 14;

        // Special case: 6 or more pills and on desktop, show 6 pills and 1 icon
        if (!isMobile && pills.length >= 6) {
            const visiblePills = pills.slice(0, 6);
            const visibleIcons = icons.slice(0, 1);
            return {
                displayedFavorites: [...visiblePills, ...visibleIcons],
                totalWeight: (6 * 2) + 1,
            };
        }
        
        // General case: fill up to maxWeight
        let weight = 0;
        const visibleFavorites: Favorite[] = [];
        for (const fav of favorites) {
            const itemWeight = fav.size === 'pill' ? 2 : 1;
            if (weight + itemWeight <= maxWeight) {
                weight += itemWeight;
                visibleFavorites.push(fav);
            }
        }
        
        return {
            displayedFavorites: visibleFavorites,
            totalWeight: weight,
        };
    }, [favorites, isEditing, isMobile]);
  
  const { calculatedPillsToDelete, calculatedIconsToDelete } = React.useMemo(() => {
    const maxWeight = isMobile ? 6 : 14;
    if (!isEditing || totalWeight <= maxWeight) {
        return { calculatedPillsToDelete: 0, calculatedIconsToDelete: 0 };
    }

    const pills = favorites.filter(f => f.size === 'pill');
    const icons = favorites.filter(f => f.size === 'icon');

    // Case 1: More than 6 pills on desktop
    if (!isMobile && pills.length > 6) {
        const pToDelete = pills.length - 6;
        const iToDelete = icons.length > 1 ? icons.length - 1 : 0;
        return { calculatedPillsToDelete: pToDelete, calculatedIconsToDelete: iToDelete };
    }

    // Case 2: General overflow
    let excess = totalWeight - maxWeight;
    let pToDelete = 0;
    let iToDelete = 0;

    // Greedily suggest removing icons first (as they are smaller)
    const removableIcons = Math.min(excess, icons.length);
    iToDelete = removableIcons;
    excess -= removableIcons;

    // Then suggest removing pills
    if (excess > 0) {
        pToDelete = Math.ceil(excess / 2);
    }
      
    return { calculatedPillsToDelete: pToDelete, calculatedIconsToDelete: iToDelete };
  }, [isEditing, totalWeight, favorites, isMobile]);


  const handleReorder = (newOrder: Favorite[]) => {
      if (!isEditing) return;
      setFavorites(newOrder);
  }


  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 p-2">
        <div className={cn(
          "relative",
          isEditing && "shimmer-bg"
        )}>
          <nav 
            className={cn(
              "relative flex h-16 w-full items-center justify-between rounded-full p-1 px-2 text-primary-foreground shadow-lg",
              isClearMode 
                  ? isLightClear
                      ? "bg-card/60 ring-1 ring-white/10"
                      : "bg-white/10 ring-1 ring-white/60"
                  : "bg-card ring-1 ring-white/60"
            )}
            style={{ backdropFilter: isClearMode ? "url(#frosted) blur(1px)" : "none" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Link 
              href="/dashboard" 
              className="flex h-full shrink-0 items-center rounded-full bg-primary px-3 sm:px-4 shadow-md"
              onClick={(e) => handleNavigate(e, '/dashboard')}
            >
              <h1 className="text-md sm:text-lg font-bold text-primary-foreground">
                InvestWise
              </h1>
            </Link>
            
              <div className="flex-1 flex justify-center items-center h-full sm:mx-2 overflow-x-auto">
                <div className="relative z-10">
                    <motion.button
                        onPointerDown={handlePointerDown}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        className={cn(
                            "relative z-10 flex h-12 items-center justify-center gap-2 rounded-full px-4 shadow-lg transition-colors min-w-[75px] sm:min-w-[170px]",
                            isClearMode
                                ? isLightClear
                                    ? "bg-card/60 text-foreground ring-1 ring-white/20"
                                    : "bg-white/10 text-slate-100 ring-1 ring-white/60"
                                : "bg-background text-foreground ring-1 ring-border"
                        )}
                        onClick={() => !isEditing && setOpen(true)}
                        style={{ backdropFilter: isClearMode ? "blur(2px)" : "none" }}
                        >
                        <Search className="h-5 w-5" />
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={isEditing ? 'editing' : 'search'}
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -10, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="hidden text-sm md:inline"
                            >
                                {isEditing ? 'Editing Mode' : 'Spotlight Search'}
                            </motion.span>
                        </AnimatePresence>
                    </motion.button>
                </div>

                <AnimatePresence>
                    {((isHovered && !isMobile) || isMobile || isEditing) && favorites.length > 0 && (
                      <motion.div
                        className="flex items-center"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        <Reorder.Group
                            as="div"
                            axis="x"
                            values={favorites}
                            onReorder={handleReorder}
                            className="flex items-center gap-3 pl-3"
                          >
                           {favorites.map(fav => (
                                <motion.div
                                  key={fav.id}
                                  layout
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.5 }}
                                  transition={{ duration: 0.2 }}
                                  className={cn(
                                    (isEditing || displayedFavorites.some(df => df.id === fav.id)) ? 'flex' : 'hidden'
                                  )}
                                >
                                  <FavoriteItem
                                    favorite={fav}
                                    onClick={handleItemClick}
                                    onRemove={removeFavorite}
                                    variants={itemVariants}
                                    isEditing={isEditing}
                                    isPill={fav.size === 'pill'}
                                  />
                                </motion.div>
                              ))}
                          </Reorder.Group>
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>
            
            <div className="flex shrink-0 items-center gap-0 sm:gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="group h-12 w-12 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-primary/10">
                        <Bell className={cn("h-5 w-5 transition-all bell-icon-glow", isClearMode && !isLightClear && "text-white")} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80" align="end" sideOffset={16}>
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled className="p-3">You have no new notifications.</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className={cn("relative h-12 w-12 rounded-full", isClearMode ? "hover:bg-white/10" : "hover:bg-primary/10")}>
                      <Avatar className="h-12 w-12 border-2 border-primary/50">
                        <AvatarImage src={photoURL || ''} alt={username} />
                        <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mt-4" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{username}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Link href="/profile" className="w-full flex items-center">
                              <UserIcon className="mr-2 h-4 w-4" />
                              <span>Profile</span>
                          </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Link href="/settings" className="w-full flex items-center">
                              <Settings className="mr-2 h-4 w-4" />
                              <span>Settings</span>
                          </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </nav>
           {isEditing && totalWeight > (isMobile ? 6 : 14) && (
                <div
                    className={cn(
                        "mt-2 text-center text-xs font-semibold overflow-hidden p-2 rounded-full relative",
                        "mx-auto max-w-[10rem] px-4",
                        isClearMode
                            ? isLightClear
                                ? "bg-card/60 ring-1 ring-white/20 text-foreground"
                                : "bg-white/10 ring-1 ring-white/60 text-white"
                            : "bg-background ring-1 ring-border text-foreground"
                    )}
                    style={{ backdropFilter: isClearMode ? "blur(2px)" : "none" }}
                >
                    <span>
                        {`To fit, remove ${calculatedPillsToDelete > 0 ? `${calculatedPillsToDelete} pill${calculatedPillsToDelete > 1 ? 's' : ''}` : ''}${calculatedPillsToDelete > 0 && calculatedIconsToDelete > 0 ? ' & ' : ''}${calculatedIconsToDelete > 0 ? `${calculatedIconsToDelete} icon${calculatedIconsToDelete > 1 ? 's' : ''}` : ''}`}
                    </span>
                </div>
            )}
        </div>
      </header>
      <CommandMenu 
        open={open} 
        onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) setInitialStock(undefined);
        }} 
        onTriggerRain={onTriggerRain}
        initialStockSymbol={initialStock}
        isEditingFavorites={isEditing}
        isTradingViewOpen={isTradingViewOpen}
        onTradingViewOpenChange={setIsTradingViewOpen}
      />
    </>
  );
}
