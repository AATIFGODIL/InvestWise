
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
  const [gliderStyle, setGliderStyle] = useState({});
  const [animationState, setAnimationState] = useState<AnimationState>("idle");
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getActiveIndex = useCallback(() => {
    return navItems.findIndex((item) => pathname.startsWith(item.href));
  }, [pathname]);

  // Set initial position without animation on page load
  useEffect(() => {
    const activeIndex = getActiveIndex();
    if (activeIndex !== -1 && itemRefs.current[activeIndex]) {
      const activeItem = itemRefs.current[activeIndex]!;
      setGliderStyle({
        width: `${activeItem.offsetWidth}px`,
        transform: `translateX(${activeItem.offsetLeft}px) translateY(0px)`,
        transition: "none", // No transition on initial load
      });
    }
  }, []); // Run only once on mount

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    newHref: string
  ) => {
    // Prevent navigation if the animation is already running or if it's the active tab
    if (animationState !== "idle" || pathname.startsWith(newHref)) {
      e.preventDefault();
      return;
    }
    
    // Clear any pending animations
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    
    const activeIndex = getActiveIndex();
    const newIndex = navItems.findIndex(item => item.href === newHref);
    
    if (newIndex === -1 || activeIndex === -1 || !itemRefs.current[newIndex]) {
        return;
    }

    const newActiveItem = itemRefs.current[newIndex]!;
    const newWidth = newActiveItem.offsetWidth;
    const newPosition = newActiveItem.offsetLeft;

    // Start Animation Sequence
    setAnimationState("rising");

    // 1. Rise up and fade to transparent
    setGliderStyle({
        ...gliderStyle,
        transform: `translateY(-50px)`, // Rise up
        transition: 'transform 0.3s cubic-bezier(0.3, 0, 0.5, 1), background-color 0.3s ease-out',
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Transparent glass effect
        backdropFilter: 'blur(10px)',
    });

    animationTimeoutRef.current = setTimeout(() => {
      // 2. Slide to new position while risen
      setAnimationState("sliding");
      setGliderStyle(prev => ({
        ...prev,
        width: `${newWidth}px`,
        transform: `translateX(${newPosition}px) translateY(-50px)`,
        transition: 'transform 0.5s cubic-bezier(0.65, 0, 0.35, 1), width 0.5s cubic-bezier(0.65, 0, 0.35, 1), background-color 0.3s ease-out',
      }));

      animationTimeoutRef.current = setTimeout(() => {
        // 3. Descend and fade back to purple
        setAnimationState("descending");
        setGliderStyle(prev => ({
          ...prev,
          transform: `translateX(${newPosition}px) translateY(0px)`,
          transition: 'transform 0.35s cubic-bezier(0.5, 0, 0.7, 1), background-color 0.4s ease-in',
          backgroundColor: 'hsl(var(--primary) / 0.8)', // Back to purple
          backdropFilter: 'blur(0px)',
        }));

        animationTimeoutRef.current = setTimeout(() => {
            setAnimationState("idle");
        }, 350);

      }, 500);

    }, 300);
  };
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
        if (animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current);
        }
    }
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2">
      <nav
        ref={navRef}
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
