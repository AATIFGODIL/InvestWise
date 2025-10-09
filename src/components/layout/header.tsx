
'use client';

import React, { useState } from "react";
import { Search, Bell, Settings, LogOut, User as UserIcon, Star, X } from "lucide-react";
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

const FavoriteItem = ({ favorite, onSelect }: { favorite: Favorite; onSelect: (fav: Favorite) => void }) => {
  const Icon = appIcons[favorite.iconName] || null;
  return (
    <Button
      variant="ghost"
      className="h-12 w-12 rounded-full transition-all duration-300 ease-in-out bg-primary/20 hover:bg-primary/30 text-primary-foreground focus-visible:ring-0"
      onClick={() => onSelect(favorite)}
    >
      {favorite.type === 'stock' ? (
        <span className="font-bold text-sm">{favorite.iconName}</span>
      ) : Icon ? (
        <Icon className="h-6 w-6" />
      ) : null}
    </Button>
  );
};


/**
 * The main header component for the application, displayed on most pages.
 * It provides a central search bar to open the command menu and favorite actions.
 */
export default function Header({ onTriggerRain }: { onTriggerRain: () => void }) {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { username, photoURL } = useUserStore();
  const { isClearMode, theme } = useThemeStore();
  const { showLoading } = useLoadingStore();
  const router = useRouter();
  const { favorites } = useFavoritesStore();
  const { openChatbot } = useChatbotStore();

  const isLightClear = isClearMode && theme === 'light';

  const handleNavigate = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    showLoading();
    router.push(href);
  };
  
  const handleFavoriteSelect = (favorite: Favorite) => {
    if (favorite.type === 'stock') {
      showLoading();
      router.push(`/trade?symbol=${favorite.value}`);
    } else {
        // Here you would map action names to functions
        if (favorite.value.includes('Dashboard')) router.push('/dashboard');
        if (favorite.value.includes('Portfolio')) router.push('/portfolio');
        if (favorite.value.includes('Trade')) router.push('/trade');
        if (favorite.value.includes('Goals')) router.push('/goals');
        if (favorite.value.includes('Community')) router.push('/community');
        if (favorite.value.includes('Ask InvestWise AI')) openChatbot();
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
          
           <div className="group absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-2">
            <button
              className={cn(
                "flex h-12 items-center justify-center gap-2 rounded-full shadow-lg transition-all duration-300 ease-in-out md:w-56 z-10 hover:bg-primary/10 group-hover:w-48",
                isClearMode
                    ? isLightClear
                        ? "bg-card/60 text-foreground ring-1 ring-white/20"
                        : "bg-white/10 text-slate-100 ring-1 ring-white/60"
                    : "bg-background text-foreground ring-1 ring-border"
              )}
              onClick={() => setOpen(true)}
              style={{ backdropFilter: isClearMode ? "blur(2px)" : "none" }}
            >
                <Search className="h-5 w-5" />
                <span className="hidden text-sm md:inline">Spotlight Search</span>
            </button>
            <div className="flex items-center gap-2 transition-all duration-300 ease-in-out scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100">
                 {favorites[0] && <FavoriteItem favorite={favorites[0]} onSelect={handleFavoriteSelect} />}
                 {favorites[1] && <FavoriteItem favorite={favorites[1]} onSelect={handleFavoriteSelect} />}
            </div>
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
      <CommandMenu open={open} onOpenChange={setOpen} onTriggerRain={onTriggerRain} />
    </>
  );
}
