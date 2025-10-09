
'use client';

import React from 'react';
import { Search, Bell, Settings, LogOut, User as UserIcon, Star } from "lucide-react";
import { CommandMenu } from "./command-menu";
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
import useChatbotStore from "@/store/chatbot-store";
import { appIcons } from "@/components/layout/command-menu";
import { motion, AnimatePresence } from 'framer-motion';

const FavoriteItem = ({ favorite, onSelect }: { favorite: Favorite; onSelect: (fav: Favorite) => void }) => {
  const Icon = appIcons[favorite.iconName] || null;
  const { isClearMode, theme } = useThemeStore();
  const isLightClear = isClearMode && theme === 'light';
  
  return (
    <motion.button
      layoutId={`favorite-${favorite.value}`}
      className={cn(
        "h-12 w-12 rounded-full transition-all duration-300 ease-in-out focus-visible:ring-0 flex items-center justify-center",
        isClearMode
            ? isLightClear
                ? "bg-card/60 text-foreground ring-1 ring-white/20"
                : "bg-white/10 text-slate-100 ring-1 ring-white/60"
            : "bg-background text-foreground ring-1 ring-border"
      )}
      style={{ backdropFilter: "blur(2px)" }}
      onClick={() => onSelect(favorite)}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {favorite.type === 'stock' ? (
        <span className="font-bold text-sm">{favorite.iconName}</span>
      ) : Icon ? (
        <Icon className="h-6 w-6" />
      ) : null}
    </motion.button>
  );
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
  const { favorites } = useFavoritesStore();
  const { openChatbot } = useChatbotStore();
  const [isHovered, setIsHovered] = React.useState(false);
  const [initialStock, setInitialStock] = React.useState<string | undefined>(undefined);

  const isLightClear = isClearMode && theme === 'light';

  const handleNavigate = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    showLoading();
    router.push(href);
  };
  
  const handleFavoriteSelect = (favorite: Favorite) => {
    if (favorite.type === 'stock') {
      setInitialStock(favorite.value);
      setOpen(true);
    } else {
        const actionMap: { [key: string]: () => void } = {
            "Dashboard": () => router.push('/dashboard'),
            "Portfolio": () => router.push('/portfolio'),
            "Trade": () => router.push('/trade'),
            "Goals": () => router.push('/goals'),
            "Community": () => router.push('/community'),
            "Ask InvestWise AI": () => openChatbot(),
            "Make it rain": () => onTriggerRain(),
        };
        const action = actionMap[favorite.name];
        if (action) {
            action();
        }
    }
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-30 p-2">
        <nav 
          className={cn(
            "relative flex h-16 items-center justify-between rounded-full p-1 px-2 text-primary-foreground shadow-lg",
             isClearMode 
                ? isLightClear
                    ? "bg-card/60 ring-1 ring-white/10"
                    : "bg-white/10 ring-1 ring-white/60"
                : "bg-card ring-1 ring-white/60"
          )}
          style={{ backdropFilter: isClearMode ? "url(#frosted) blur(1px)" : "none" }}
        >
          <div className="flex h-full items-center font-semibold">
            <Link 
              href="/dashboard" 
              className="flex h-full items-center rounded-full bg-primary px-4 shadow-md"
              onClick={(e) => handleNavigate(e, '/dashboard')}
            >
              <h1 className="text-xl font-bold text-primary-foreground">
                InvestWise
              </h1>
            </Link>
          </div>
          
           <div 
              className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
                <motion.button
                    layout
                    className={cn(
                        "relative z-10 flex h-12 items-center justify-center gap-2 rounded-full px-4 shadow-lg",
                        isClearMode
                            ? isLightClear
                                ? "bg-card/60 text-foreground ring-1 ring-white/20"
                                : "bg-white/10 text-slate-100 ring-1 ring-white/60"
                            : "bg-background text-foreground ring-1 ring-border"
                    )}
                    onClick={() => setOpen(true)}
                    style={{ backdropFilter: isClearMode ? "blur(2px)" : "none" }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                    <Search className="h-5 w-5" />
                    <span className="hidden text-sm md:inline">Spotlight Search</span>
                </motion.button>
                <AnimatePresence>
                {isHovered && (
                  <motion.div 
                    className="flex items-center"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                      <motion.div
                        className="flex items-center gap-2 pl-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: 0.1 } }}
                      >
                        {favorites.map((fav) => (
                           <FavoriteItem key={fav.value} favorite={fav} onSelect={handleFavoriteSelect} />
                        ))}
                      </motion.div>
                  </motion.div>
                )}
                </AnimatePresence>
          </div>
          
          <div className="flex items-center gap-1">
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
      </div>
      <CommandMenu 
        open={open} 
        onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) setInitialStock(undefined);
        }} 
        onTriggerRain={onTriggerRain}
        initialStockSymbol={initialStock}
      />
    </>
  );
}
