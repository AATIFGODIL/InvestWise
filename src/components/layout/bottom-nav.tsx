
"use client";

import { Home, Briefcase, BarChart, Users, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const navItems = [
  { href: "/dashboard", label: "Explore", icon: Home },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/trade", label: "Trade", icon: Repeat },
  { href: "/goals", label: "Goals", icon: BarChart },
  { href: "/community", label: "Community", icon: Users },
];

export default function BottomNav() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [gliderStyle, setGliderStyle] = useState<CSSProperties>({});
  
  // Find the index of the currently active navigation item.
  // This is the single source of truth for the glider's position.
  const activeIndex = navItems.findIndex((item) => pathname.startsWith(item.href));

  useEffect(() => {
    // This effect runs whenever the active tab changes.
    if (activeIndex !== -1 && itemRefs.current[activeIndex]) {
      const activeItem = itemRefs.current[activeIndex]!;
      const navRect = navRef.current!.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      
      // Calculate the position relative to the nav container.
      const left = itemRect.left - navRect.left;

      setGliderStyle({
        width: `${itemRect.width}px`,
        transform: `translateX(${left}px)`,
      });
    }
  }, [activeIndex, pathname]); // Rerun whenever the active page changes.


  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2">
      <nav 
        ref={navRef} 
        className="relative flex h-16 items-center justify-around rounded-full bg-background/70 p-1 shadow-lg ring-1 ring-black/5"
      >
        
        {/* The Glider: The moving highlight element */}
        <div
          className="absolute top-1 h-[calc(100%-8px)] rounded-full border border-primary-foreground/10"
          style={{
            ...gliderStyle,
            // Fast, fluid transition for movement and watery color effect.
            transition: 'transform 150ms cubic-bezier(0.65, 0, 0.35, 1), width 150ms cubic-bezier(0.65, 0, 0.35, 1), background-color 250ms ease-in-out',
            // The "watery" glass effect: semi-transparent with a blur.
            backgroundColor: 'hsl(var(--primary) / 0.85)',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          }}
        />

        {navItems.map((item, index) => {
          const isActive = activeIndex === index;
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
                  "flex h-auto w-full flex-col items-center justify-center gap-1 p-2 rounded-full transition-all duration-300 ease-in-out",
                   isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
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
