
"use client";

import { Home, Briefcase, BarChart, Users, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useLoadingStore from "@/store/loading-store";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Explore", icon: Home },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/trade", label: "Trade", icon: Repeat },
  { href: "/goals", label: "Goals", icon: BarChart },
  { href: "/community", label: "Community", icon: Users },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { showLoading, hideLoading } = useLoadingStore();
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const activeIndex = navItems.findIndex((item) => pathname.startsWith(item.href));
    if (activeIndex !== -1 && itemRefs.current[activeIndex]) {
      const activeItem = itemRefs.current[activeIndex]!;
      setIndicatorStyle({
        width: `${activeItem.offsetWidth}px`,
        transform: `translateX(${activeItem.offsetLeft}px)`,
      });
    }
    // Hide loading when navigation is complete
    hideLoading();
  }, [pathname, hideLoading]);

  const handleNavClick = (href: string) => {
    if (!pathname.startsWith(href)) {
      showLoading();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm">
      <nav ref={navRef} className="relative flex h-16 items-center justify-around px-2">
        {navItems.map((item, index) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link 
              href={item.href} 
              key={item.label} 
              className="flex-1 z-10"
              onClick={() => handleNavClick(item.href)}
              prefetch={true}
              ref={el => itemRefs.current[index] = el}
            >
              <Button
                variant="ghost"
                className={cn(
                  "flex h-auto w-full flex-col items-center justify-center gap-1 p-2 transition-colors duration-300",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            </Link>
          );
        })}
         <div
          className="absolute bottom-0 left-0 h-1 bg-primary rounded-full transition-all duration-300 ease-in-out"
          style={indicatorStyle}
        />
      </nav>
    </div>
  );
}
