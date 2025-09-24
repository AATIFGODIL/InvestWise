"use client";

import { Home, Briefcase, BarChart, Users, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  }, [pathname]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2">
      <nav ref={navRef} className="relative flex h-16 items-center justify-around rounded-full bg-background/70 p-1 shadow-lg ring-1 ring-black/5 backdrop-blur-lg">
        {/* The Liquid Glass Glider */}
        <div
          className="absolute top-1 h-[calc(100%-8px)] rounded-full bg-primary/80 shadow transition-all duration-500 ease-[cubic-bezier(0.45,0,0.2,1)]"
          style={indicatorStyle}
        />
        
        {navItems.map((item, index) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              ref={(el) => (itemRefs.current[index] = el)}
              className="flex-1 z-10"
              prefetch={true}
            >
              <div
                className={cn(
                  "flex h-auto w-full flex-col items-center justify-center gap-1 p-2 transition-colors duration-300",
                  isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
