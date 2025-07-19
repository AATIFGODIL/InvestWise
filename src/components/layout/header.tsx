
"use client";

import Link from "next/link";
import {
  Bell,
  LogOut,
  PlayCircle,
  Settings,
  TrendingUp,
  Trophy,
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
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/auth/signin');
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-primary px-4 sm:px-6 text-primary-foreground">
      <div className="flex items-center gap-2 font-semibold">
        <h1 className="text-xl font-bold">InvestWise</h1>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
                <Bell className="h-6 w-6" />
                <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="end">
             <DropdownMenuLabel>Notifications</DropdownMenuLabel>
             <DropdownMenuSeparator />
             <DropdownMenuItem className="flex items-start gap-3 p-3">
                <TrendingUp className="h-5 w-5 mt-1 text-green-500" />
                <div>
                    <p className="font-semibold">Holdings Update</p>
                    <p className="text-xs text-muted-foreground">Your investment in NKE is up 2.13% today.</p>
                </div>
             </DropdownMenuItem>
             <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-start gap-3 p-3">
                <PlayCircle className="h-5 w-5 mt-1 text-primary" />
                <div>
                    <p className="font-semibold">New Content</p>
                    <p className="text-xs text-muted-foreground">Check out this new video on risk management strategies.</p>
                </div>
             </DropdownMenuItem>
             <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-start gap-3 p-3">
                <Trophy className="h-5 w-5 mt-1 text-yellow-500" />
                <div>
                    <p className="font-semibold">Leaderboard Change</p>
                    <p className="text-xs text-muted-foreground">You've been overtaken by StockSurfer. Click to see the leaderboard.</p>
                </div>
             </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 border-2 border-primary-foreground">
                <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="@user" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">First-Time Investor</p>
                <p className="text-xs leading-none text-muted-foreground">
                  investor@example.com
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
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
