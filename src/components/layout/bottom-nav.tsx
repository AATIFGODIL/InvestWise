
"use client";

import { Home, Briefcase, BarChart, Users, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useLoadingStore from "@/store/loading-store";
import { useNavigationStore, navItems } from "@/store/navigation-store";

export default function BottomNav() {
  const pathname = usePathname();
  const { showLoading } = useLoadingStore();
  const { setPath } = useNavigationStore();
  
  const handleNavClick = (href: string, index: number) => {
    if (pathname !== href) {
      setPath(href, index);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm">
      <nav className="flex h-16 items-center justify-around px-2">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              href={item.href} 
              key={item.label} 
              className="flex-1"
              onClick={() => handleNavClick(item.href, index)}
              prefetch={true}
            >
              <Button
                variant="ghost"
                className={cn(
                  "flex h-auto w-full flex-col items-center justify-center gap-1 p-2",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
