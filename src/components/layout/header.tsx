
'use client';

import React from "react";
import Link from "next/link";
import {
  Bell,
  LogOut,
  Settings,
  User,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useUserStore } from "@/store/user-store";

/**
 * The main header component for the application, displayed on most pages.
 * It provides navigation to the dashboard, a notifications center, and a user profile dropdown
 * with links to profile, settings, and sign-out functionality.
 */
export default function Header() {
  const { user, signOut } = useAuth();
  const { username, photoURL } = useUserStore();

  return (
    <header 
      className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/20 bg-primary/80 px-4 text-primary-foreground sm:px-6 shadow-2xl shadow-black/20"
      style={{ backdropFilter: "url(#frosted) blur(1px)" }}
    >
      <div className="flex items-center gap-2 font-semibold">
        <Link href="/dashboard" className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-primary-foreground">InvestWise</h1>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-primary/10">
                <Bell className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="end">
             <DropdownMenuLabel>Notifications</DropdownMenuLabel>
             <DropdownMenuSeparator />
             {/* This is a placeholder. In a real app, this would map over notifications from a store. */}
             <DropdownMenuItem disabled className="p-3">You have no new notifications.</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-primary/10">
              <Avatar className="h-10 w-10 border-2 border-primary/50">
                <AvatarImage src={photoURL || ''} alt={username} />
                <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
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
              <Link href="/profile">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/settings">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
