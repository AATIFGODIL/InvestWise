
"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  LogOut,
  PlayCircle,
  Settings,
  TrendingUp,
  Trophy,
  User,
  PartyPopper,
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
import useUserStore from "@/store/user-store";
import useNotificationStore, { type Notification } from "@/store/notification-store";

const notificationIcons: { [key: string]: React.ElementType } = {
  holdings: TrendingUp,
  content: PlayCircle,
  leaderboard: Trophy,
  welcome: PartyPopper,
  default: Bell,
};

const getIconForNotification = (type: string) => {
  return notificationIcons[type] || notificationIcons.default;
};

export default function Header() {
  const { user, signOut } = useAuth();
  const { username, profilePic } = useUserStore();
  const { notifications, unreadCount, removeNotification } = useNotificationStore();
  const router = useRouter();

  const handleNotificationClick = (notification: Notification) => {
    removeNotification(notification.id);
    router.push(notification.href);
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-primary px-4 sm:px-6 text-primary-foreground">
      <div className="flex items-center gap-2 font-semibold">
        <Link href="/dashboard">
          <h1 className="text-xl font-bold">InvestWise</h1>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="end">
             <DropdownMenuLabel>Notifications</DropdownMenuLabel>
             <DropdownMenuSeparator />
             {notifications.length === 0 ? (
               <DropdownMenuItem disabled className="p-3">You have no new notifications.</DropdownMenuItem>
             ) : (
                notifications.map((notif, index) => {
                  const Icon = getIconForNotification(notif.type);
                  return (
                    <React.Fragment key={notif.id}>
                      <DropdownMenuItem className="flex items-start gap-3 p-3 cursor-pointer" onClick={() => handleNotificationClick(notif)}>
                        <Icon className="h-5 w-5 mt-1 text-primary" />
                        <div>
                            <p className="font-semibold">{notif.title}</p>
                            <p className="text-xs text-muted-foreground">{notif.description}</p>
                        </div>
                      </DropdownMenuItem>
                      {index < notifications.length - 1 && <DropdownMenuSeparator />}
                    </React.Fragment>
                  );
                })
             )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 border-2 border-primary-foreground">
                <AvatarImage src={profilePic} alt={username} />
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
