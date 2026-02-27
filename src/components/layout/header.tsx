// InvestWise - A modern stock trading and investment education platform for young investors

'use client';

import React, { useEffect } from 'react';
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
import { useAutoInvestStore } from "@/store/auto-invest-store";
import { useNotificationStore, type AppNotification } from "@/store/notification-store";
import { usePendingTradeStore } from "@/store/pending-trade-store";
import AutoTradeApprovalDialog from "@/components/trade/auto-trade-approval-dialog";
import { useProModeStore } from "@/store/pro-mode-store";


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
export default function Header({ onTriggerRain, isMobileCompact = false, onHide, onCommandMenuChange }: { onTriggerRain: () => void; isMobileCompact?: boolean; onHide?: () => void; onCommandMenuChange?: (isOpen: boolean) => void }) {
  // onHide is no longer used directly (swipe handles it globally now)
  const [open, setOpen] = React.useState(false);

  // Notify parent when command menu opens/closes
  React.useEffect(() => {
    onCommandMenuChange?.(open);
  }, [open, onCommandMenuChange]);
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
  const [showGlow, setShowGlow] = React.useState(false);

  const [isEditing, setEditing] = React.useState(false);
  // Duplicate removed
  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);

  const { checkForDueTrades } = useAutoInvestStore();
  const { notifications, removeNotification, unreadCount } = useNotificationStore();
  const { setPendingTrade } = usePendingTradeStore();

  useEffect(() => {
    if (user) {
      checkForDueTrades();
    }
  }, [user, checkForDueTrades]);

  const handleNotificationClick = async (e: React.MouseEvent, notification: AppNotification) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent closing if needed, or allow close. Usually closing is better.

    // Always close the menu/popover by letting event bubble? 
    // Actually Radix closing depends on item click. ensuring we don't preventdefault if we want close. 
    // But we are doing async work for autotrade.

    if (notification.id.startsWith('autotrade-')) {
      const investmentId = notification.id.replace('autotrade-', '');
      const investment = useAutoInvestStore.getState().autoInvestments.find(i => i.id === investmentId);

      if (investment) {
        showLoading();
        try {
          const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
          if (!apiKey) throw new Error("API Key missing");

          const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${investment.symbol}&token=${apiKey}`);
          const data = await res.json();

          if (data && typeof data.c !== 'undefined' && data.c !== 0) {
            const currentPrice = data.c;
            const quantity = parseFloat((investment.amount / currentPrice).toFixed(6));

            setPendingTrade({
              id: investment.id,
              symbol: investment.symbol,
              quantity: quantity,
              price: currentPrice
            });

            // Mark as read or remove.
            removeNotification(notification.id);
          } else {
            console.error("Failed to fetch price");
          }
        } catch (err) {
          console.error(err);
        } finally {
          // hideLoading(); // showLoading mimics navigation loading, usually handled by nextjs
          // We might want to manually turn it off or just let the dialog appear.
          // showLoading from store usually needs manual reset if not navigating?
          // Checking store implementation... 
          // Let's assume the dialog opening is feedback enough?
          // But showLoading overlays the screen? 
          useLoadingStore.getState().hideLoading();
        }
      }
    } else {
      router.push(notification.href);
      removeNotification(notification.id);
    }
  };

  useEffect(() => {
    // Check for the glow effect flag on component mount
    if (sessionStorage.getItem('showGlowEffect') === 'true') {
      setShowGlow(true);

      // Remove the flag so it doesn't run again, but with a slight delay
      // so other components can pick it up
      setTimeout(() => {
        sessionStorage.removeItem('showGlowEffect');
      }, 500);

      // Turn off the glow after a few seconds
      const timer = setTimeout(() => {
        setShowGlow(false);
      }, 4000); // 4 seconds

      return () => clearTimeout(timer);
    }
  }, []);

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
      { name: "Ask InvestWise AI", keywords: "chatbot help question", onSelect: () => { }, icon: appIcons.brain },
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
        if (action) {
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

  const { displayedFavorites } = React.useMemo(() => {
    const pills = favorites.filter(f => f.size === 'pill');
    const icons = favorites.filter(f => f.size === 'icon');

    if (isEditing) {
      return { displayedFavorites: favorites };
    }

    // Special case: 6 or more pills and on desktop, show 6 pills and 1 icon
    if (!isMobile && pills.length >= 6) {
      const visiblePills = pills.slice(0, 6);
      const visibleIcons = icons.slice(0, 1);
      return {
        displayedFavorites: [...visiblePills, ...visibleIcons],
      };
    }

    const maxWeight = isMobile ? 6 : 14;

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
    };
  }, [favorites, isEditing, isMobile]);

  const { overflowMessage } = React.useMemo(() => {
    let calculatedPillsToDelete = 0;
    let calculatedIconsToDelete = 0;
    let message = '';

    if (isEditing) {
      const pills = favorites.filter(f => f.size === 'pill');
      const icons = favorites.filter(f => f.size === 'icon');

      if (!isMobile && pills.length >= 7) {
        calculatedPillsToDelete = pills.length - 6;
        calculatedIconsToDelete = Math.max(0, icons.length - 1);
      } else {
        const currentWeight = pills.length * 2 + icons.length;
        const maxWeight = isMobile ? 6 : 14;
        if (currentWeight > maxWeight) {
          let excess = currentWeight - maxWeight;
          const removableIcons = Math.min(excess, icons.length);
          calculatedIconsToDelete = removableIcons;
          excess -= removableIcons;
          if (excess > 0) {
            calculatedPillsToDelete = Math.ceil(excess / 2);
          }
        }
      }

      if (calculatedPillsToDelete === 1 && calculatedIconsToDelete === 0 && !isMobile) {
        message = "To fit, modify 1 pill";
      } else if (calculatedPillsToDelete > 0 && calculatedIconsToDelete > 0) {
        message = `To fit, remove ${calculatedPillsToDelete} pill(s) & ${calculatedIconsToDelete} icon(s)`;
      } else if (calculatedPillsToDelete > 0) {
        message = `To fit, remove ${calculatedPillsToDelete} pill(s)`;
      } else if (calculatedIconsToDelete > 0) {
        message = `To fit, remove ${calculatedIconsToDelete} icon(s)`;
      }
    }

    return { overflowMessage: message };
  }, [isEditing, favorites, isMobile]);



  const handleReorder = (newOrder: Favorite[]) => {
    if (!isEditing) return;
    setFavorites(newOrder);
  }


  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 p-2">
        <div className={cn(
          "relative"
        )}>
          <nav
            className={cn(
              "relative flex w-full items-center justify-between rounded-full p-1 px-2",
              isMobileCompact ? "h-10" : "h-16",
              // No background - transparent nav bar
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div
              className={cn(
                "flex shrink-0 items-center rounded-full px-3 shadow-lg",
                isMobileCompact ? "h-10" : "h-16",
                isClearMode
                  ? isLightClear
                    ? "bg-card/60 ring-1 ring-black/10"
                    : "bg-white/10 ring-1 ring-white/60"
                  : "bg-card ring-1 ring-black/40",
                showGlow && "login-glow"
              )}
              style={{ backdropFilter: isClearMode ? "url(#frosted) blur(1px)" : "blur(12px)" }}
            >
              <Link
                href="/dashboard"
                className={cn(
                  "flex shrink-0 items-center rounded-full bg-primary shadow-md",
                  isMobileCompact ? "h-8 px-2" : "h-[52px] px-3 sm:px-4"
                )}
                onClick={(e) => {
                  handleNavigate(e, '/dashboard');
                }}
              >
                <h1 className={cn(isMobileCompact ? "text-xs" : "text-md sm:text-lg", "font-bold text-primary-foreground")}>
                  InvestWise
                </h1>
              </Link>
            </div>

            <div className="flex-1 flex justify-center items-center h-full sm:mx-2 overflow-x-auto hide-scrollbar">
              <div className="relative z-10">
                <motion.button
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  className={cn(
                    "relative z-10 flex items-center justify-center gap-2 rounded-full px-4 shadow-lg transition-colors",
                    isMobileCompact ? "h-7 min-w-[60px]" : "h-12 min-w-[75px] sm:min-w-[170px]",
                    isClearMode
                      ? isLightClear
                        ? "bg-card/60 text-foreground ring-1 ring-black/20"
                        : "bg-white/10 text-slate-100 ring-1 ring-white/60"
                      : "bg-background text-foreground ring-1 ring-border",
                    isEditing && "shimmer-bg"
                  )}
                  onClick={() => !isEditing && setOpen(true)}
                  style={{ backdropFilter: isClearMode ? "blur(2px)" : "none" }}
                >
                  <Search className={cn(isMobileCompact ? "h-4 w-4" : "h-5 w-5")} />
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
                            onSelect={handleItemClick}
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

            <div
              className={cn(
                "flex shrink-0 items-center gap-0 sm:gap-1 rounded-full px-1 shadow-lg",
                isMobileCompact ? "h-10" : "h-16",
                isClearMode
                  ? isLightClear
                    ? "bg-card/60 ring-1 ring-black/10"
                    : "bg-white/10 ring-1 ring-white/60"
                  : "bg-card ring-1 ring-black/40",
                showGlow && "login-glow"
              )}
              style={{ backdropFilter: isClearMode ? "url(#frosted) blur(1px)" : "blur(12px)" }}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={cn("group rounded-full focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-primary/10 relative", isMobileCompact ? "h-8 w-8" : "h-12 w-12")}>
                    <Bell className={cn("transition-all bell-icon-glow", isMobileCompact ? "h-4 w-4" : "h-5 w-5", isClearMode && !isLightClear && "text-white")} />
                    {notifications.length > 0 && (
                      <span className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background box-content pointer-events-none" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end" sideOffset={16}>
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <DropdownMenuItem disabled className="p-3">You have no new notifications.</DropdownMenuItem>
                  ) : (
                    <div className="flex flex-col gap-2 p-2">
                      {notifications.map(notification => (
                        <DropdownMenuItem
                          key={notification.id}
                          className={cn(
                            "cursor-pointer flex flex-col items-start gap-1 p-3 rounded-lg transition-colors relative overflow-hidden",
                            isClearMode
                              ? cn(
                                isLightClear
                                  ? "bg-black/5 ring-1 ring-black/10"
                                  : "bg-white/20 ring-1 ring-white/60",
                                "hover:bg-white/30 transition-colors" // Adding a subtle hover effect for interactivity since these are buttons
                              )
                              : "bg-muted/50 border border-transparent hover:bg-muted"
                          )}
                          style={{ backdropFilter: isClearMode ? "blur(64px)" : undefined }}
                          onClick={(e) => handleNotificationClick(e, notification)}                        >
                          <div className={cn("font-semibold text-sm relative z-10", isClearMode && "text-white")}>{notification.title}</div>
                          <div className={cn("text-xs relative z-10", isClearMode ? "text-white/90" : "text-muted-foreground")}>{notification.description}</div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={cn("relative rounded-full", isMobileCompact ? "h-8 w-8" : "h-12 w-12", isClearMode ? "hover:bg-white/10" : "hover:bg-primary/10")}>
                    <Avatar className={cn("border-2 border-primary/50", isMobileCompact ? "h-8 w-8" : "h-12 w-12")}>
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
          {overflowMessage && (
            <div
              className={cn(
                "mt-2 text-center text-xs font-semibold overflow-hidden p-2 rounded-full relative shimmer-bg max-w-xs mx-auto px-4",
                isClearMode
                  ? isLightClear
                    ? "bg-card/60 ring-1 ring-black/20 text-foreground"
                    : "bg-white/10 ring-1 ring-white/60 text-white"
                  : isLightClear ? "bg-background ring-1 ring-black/40 text-foreground" : "bg-background ring-1 ring-border text-foreground"
              )}
              style={{ backdropFilter: isClearMode ? "blur(2px)" : "none" }}
            >
              <span>{overflowMessage}</span>
            </div>
          )}
        </div >
      </header >
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
      <AutoTradeApprovalDialog />
    </>
  );
}
 