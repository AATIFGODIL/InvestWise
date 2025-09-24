
"use client";

import { Home, Briefcase, BarChart, Users, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";

const navItems = [
  { href: "/dashboard", label: "Explore", icon: Home },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/trade", label: "Trade", icon: Repeat },
  { href: "/goals", label: "Goals", icon: BarChart },
  { href: "/community", label: "Community", icon: Users },
];

type AnimationState = "idle" | "rising" | "sliding" | "descending";

export default function BottomNav() {
  const pathname = usePathname();
  const [gliderStyle, setGliderStyle] = useState<React.CSSProperties>({});
  const [animationState, setAnimationState] = useState<AnimationState>("idle");
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [previousPathname, setPreviousPathname] = useState('/dashboard');
  const isInitialMount = useRef(true);

  const getIndexFromHref = useCallback((href: string) => {
    return navItems.findIndex((item) => href.startsWith(item.href));
  }, []);

  // This useEffect is ONLY for setting the initial position or handling direct URL changes.
  // The `isInitialMount` and `animationState` checks prevent it from interfering with the click animation.
  useEffect(() => {
    if (animationState !== "idle" && !isInitialMount.current) {
        return;
    }

    const activeIndex = getIndexFromHref(pathname);
    if (activeIndex !== -1 && itemRefs.current[activeIndex]) {
      const activeItem = itemRefs.current[activeIndex]!;
      setGliderStyle({
        width: `${activeItem.offsetWidth}px`,
        transform: `translateX(${activeItem.offsetLeft}px)`,
        transition: isInitialMount.current ? "none" : "transform 0.4s ease, width 0.4s ease",
      });
    }
    
    if (pathname !== previousPathname) {
        setPreviousPathname(pathname);
    }
    isInitialMount.current = false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, getIndexFromHref]);


  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    newHref: string
  ) => {
    if (animationState !== "idle" || pathname.startsWith(newHref)) {
      e.preventDefault();
      return;
    }
    
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    
    const oldIndex = getIndexFromHref(previousPathname);
    const newIndex = getIndexFromHref(newHref);
    
    if (newIndex === -1 || oldIndex === -1 || !itemRefs.current[newIndex] || !itemRefs.current[oldIndex]) {
        return;
    }

    const newActiveItem = itemRefs.current[newIndex]!;
    const newWidth = newActiveItem.offsetWidth;
    const newPosition = newActiveItem.offsetLeft;

    setAnimationState("rising");

    animationTimeoutRef.current = setTimeout(() => {
      setAnimationState("sliding");
      setGliderStyle({
        width: `${newWidth}px`,
        transform: `translateX(${newPosition}px)`,
        transition: 'transform 0.5s cubic-bezier(0.65, 0, 0.35, 1), width 0.5s cubic-bezier(0.65, 0, 0.35, 1)',
      });

      animationTimeoutRef.current = setTimeout(() => {
        setAnimationState("descending");
        animationTimeoutRef.current = setTimeout(() => {
            setAnimationState("idle");
        }, 350);
      }, 500);
    }, 300);
  };
  
  useEffect(() => {
    return () => {
        if (animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current);
        }
    }
  }, []);

  const navStyles: React.CSSProperties = {
    transition: 'transform 0.3s cubic-bezier(0.3, 0, 0.5, 1), background-color 0.3s ease-out',
  };

  if (animationState === 'rising' || animationState === 'sliding') {
    navStyles.transform = 'translateY(-10px)';
    navStyles.backgroundColor = 'rgba(var(--background-rgb), 0.5)'; 
    navStyles.backdropFilter = 'blur(10px)';
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2">
      <nav
        ref={navRef}
        style={navStyles}
        className="relative flex h-16 items-center justify-around rounded-full bg-background/70 p-1 shadow-lg ring-1 ring-black/5"
      >
        <div
          className="absolute top-1 h-[calc(100%-8px)] rounded-full bg-primary/80 shadow"
          style={gliderStyle}
        />
        
        {navItems.map((item, index) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              ref={(el) => (itemRefs.current[index] = el)}
              onClick={(e) => handleNavClick(e, item.href)}
              className="flex-1 z-10"
              prefetch={true}
            >
              <div
                className={cn(
                  "flex h-auto w-full flex-col items-center justify-center gap-1 p-2 transition-colors duration-300",
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
