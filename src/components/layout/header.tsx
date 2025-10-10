'use client';

import React from 'react';
import { Search, Bell, Settings, LogOut, User as UserIcon } from "lucide-react";
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
  const { user, signOut, updateFavorites: saveFavoritesToFirestore } = useAuth();
  const { username, photoURL } = useUserStore();
  const { isClearMode, theme } = useThemeStore();
  const { showLoading } = useLoadingStore();
  const router = useRouter();
  const { favorites, setFavorites } = useFavoritesStore();
  const [initialStock, setInitialStock] = React.useState<string | undefined>(undefined);
  const [isHovered, setIsHovered] = React.useState(false);
  const isMobile = useIsMobile();

  const [isEditing, setEditing] = React.useState(false);
  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = () => {
    longPressTimer.current = setTimeout(() => {
      setEditing((prev) => !prev);
    }, 500); // 500ms for a long press
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };
  
  const handleSetFavorites = (newFavorites: Favorite[]) => {
      setFavorites(newFavorites);
      saveFavoritesToFirestore(newFavorites);
  }

  const isLightClear = isClearMode && theme === 'light';

  const handleNavigate = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    showLoading();
    router.push(href);
  };
  
    const handleFavoriteSelect = (clickedFavorite: Favorite) => {
        if (!isEditing) return;

        const newFavorites = favorites.map(f => {
            if (f.id === clickedFavorite.id) {
                return { ...f, size: f.size === 'icon' ? 'pill' as const : 'icon' as const };
            }
            return f;
        });

        handleSetFavorites(newFavorites);
    };
  
  const displayedFavorites = React.useMemo(() => {
    if (isEditing) {
        let weight = 0;
        const visibleFavorites = [];
        
        for (const fav of favorites) {
            const itemWeight = fav.size === 'pill' ? 2 : 1;
            if (weight + itemWeight <= 6) {
                weight += itemWeight;
                visibleFavorites.push(fav);
            } else {
                break; // Stop adding items if the weight limit is exceeded
            }
        }
        return visibleFavorites;
    }
    
    // Non-editing mode logic
    const sliceCount = isMobile ? 2 : 4;
    return favorites.filter(f => f.size === 'icon').slice(0, sliceCount);

  }, [favorites, isEditing, isMobile]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 p-2">
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
          
            <div className="flex-1 flex justify-center items-center h-full sm:mx-2">
               <div className="relative z-10">
                  <motion.button
                      onPointerDown={handlePointerDown}
                      onPointerUp={handlePointerUp}
                      onPointerLeave={handlePointerUp}
                      className={cn(
                          "relative z-10 flex h-12 items-center justify-center gap-2 rounded-full px-4 shadow-lg transition-colors",
                          isClearMode
                              ? isLightClear
                                  ? "bg-card/60 text-foreground ring-1 ring-white/20"
                                  : "bg-white/10 text-slate-100 ring-1 ring-white/60"
                              : "bg-background text-foreground ring-1 ring-border",
                          isEditing && "shimmer-bg" 
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
                  {((isHovered && !isMobile) || isMobile || isEditing) && displayedFavorites.length > 0 && (
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
                          values={displayedFavorites}
                          onReorder={(newOrder) => {
                            const remainingFavorites = favorites.filter(
                                (fav) => !displayedFavorites.some(df => df.id === fav.id)
                            );
                            handleSetFavorites([...newOrder, ...remainingFavorites]);
                          }}
                          className="flex items-center gap-3 pl-3"
                          disabled={!isEditing}
                        >
                          {displayedFavorites.map((fav) => (
                              <FavoriteItem 
                                key={fav.id}
                                favorite={fav} 
                                onSelect={handleFavoriteSelect} 
                                variants={itemVariants}
                                isEditing={isEditing}
                              />
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
      </header>
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
