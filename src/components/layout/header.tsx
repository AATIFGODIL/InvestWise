
'use client';

import React, { useState } from "react";
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

/**
 * The main header component for the application, displayed on most pages.
 * It provides a central search bar to open the command menu.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { username, photoURL } = useUserStore();

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-30 p-2">
        <nav 
          className="relative flex h-16 items-center justify-between rounded-full bg-white/10 p-1 px-2 text-primary-foreground shadow-2xl shadow-black/20 ring-1 ring-white/60"
          style={{ backdropFilter: "url(#frosted) blur(1px)" }}
        >
          <div className="flex h-full items-center font-semibold">
            <Link 
              href="/dashboard" 
              className="flex h-full items-center rounded-full bg-primary px-4 shadow-md"
            >
              <h1 className="text-xl font-bold text-primary-foreground">
                InvestWise
              </h1>
            </Link>
          </div>
          
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <button
              className="flex h-12 w-48 items-center justify-center gap-2 rounded-full bg-white/10 text-slate-100 shadow-lg ring-1 ring-white/60 transition-colors hover:bg-white/20 hover:text-white md:w-72"
              onClick={() => setOpen(true)}
              style={{ backdropFilter: "blur(2px)" }}
            >
                <Search className="h-5 w-5" />
                <span className="hidden text-sm md:inline">Spotlight Search</span>
            </button>
          </div>
          
          <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-12 w-12 rounded-full hover:bg-white/10">
                      <Bell className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled className="p-3">You have no new notifications.</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-12 w-12 rounded-full hover:bg-white/10">
                    <Avatar className="h-12 w-12 border-2 border-primary/50">
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
                        <UserIcon className="mr-2 h-4 w-4" />
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
        </nav>
      </div>
      <CommandMenu open={open} onOpenChange={setOpen} />
    </>
  );
}
