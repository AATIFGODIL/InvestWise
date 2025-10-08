
"use client";

import { Home, Briefcase, BarChart, Users, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";

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
  const router = useRouter();
  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const timeouts = useRef<NodeJS.Timeout[]>([]);

  const [gliderStyle, setGliderStyle] = useState<CSSProperties>({ opacity: 0 });
  const [animationState, setAnimationState] = useState<AnimationState>("idle");
  
  // Find the initial active index based on the current URL path
  const initialActiveIndex = navItems.findIndex((item) => pathname.startsWith(item.href));
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  
  // This state ensures we only run the positioning logic after the component has mounted
  const [hasMounted, setHasMounted] = useState(false);

  // Helper to clear all scheduled timeouts
  const clearAllTimeouts = () => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  };

  // Function to calculate and set glider position
  const setGliderTo = (index: number, options: { immediate?: boolean } = {}) => {
    const navEl = navRef.current;
    const targetItem = itemRefs.current[index];

    if (!navEl || !targetItem) return;

    const navRect = navEl.getBoundingClientRect();
    const itemRect = targetItem.getBoundingClientRect();
    const left = itemRect.left - navRect.left;

    setGliderStyle({
      width: `${itemRect.width}px`,
      transform: `translateX(${left}px)`,
      opacity: 1,
      transition: options.immediate ? 'none' : 'transform 300ms ease, opacity 200ms ease',
      backgroundColor: 'hsl(var(--primary))',
    });
  };
  
  // This effect runs ONCE after the component has mounted to set the initial glider position correctly.
  useEffect(() => {
    const currentPathIndex = navItems.findIndex((item) => pathname.startsWith(item.href));
    if (currentPathIndex !== -1) {
      setActiveIndex(currentPathIndex);
      setGliderTo(currentPathIndex, { immediate: true });
    } else {
      setGliderStyle({ opacity: 0 });
    }
    setHasMounted(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // Rerun if the path changes (e.g., browser back/forward)


  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, newIndex: number) => {
    e.preventDefault();
    if (animationState !== "idle" || newIndex === activeIndex) return;

    const navEl = navRef.current;
    const startItem = itemRefs.current[activeIndex];
    const endItem = itemRefs.current[newIndex];

    if (!endItem || !startItem || !navEl) {
      router.push(navItems[newIndex].href);
      return;
    }

    const navRect = navEl.getBoundingClientRect();
    const startRect = startItem.getBoundingClientRect();
    const endRect = endItem.getBoundingClientRect();
    const startLeft = startRect.left - navRect.left;
    const endLeft = endRect.left - navRect.left;
    
    // 1. Rise up
    setAnimationState("rising");
    setGliderStyle({
      width: `${startRect.width}px`,
      transform: `translateX(${startLeft}px) scale(1.1)`,
      backgroundColor: "hsl(var(--primary) / 0.8)",
      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      opacity: 1,
      transition: "transform 150ms ease-out, background-color 150ms ease-out, box-shadow 150ms ease-out",
    });

    // 2. Slide across
    timeouts.current.push(
      setTimeout(() => {
        setAnimationState("sliding");
        setGliderStyle(prev => ({
          ...prev,
          width: `${endRect.width}px`,
          transform: `translateX(${endLeft}px) scale(1.1)`,
          transition: "transform 300ms cubic-bezier(0.65, 0, 0.35, 1), width 300ms cubic-bezier(0.65, 0, 0.35, 1)",
        }));
      }, 150)
    );

    // 3. Drop down and navigate
    timeouts.current.push(
      setTimeout(() => {
        setAnimationState("descending");
        router.push(navItems[newIndex].href);
        setGliderStyle(prev => ({
          ...prev,
          transform: `translateX(${endLeft}px) scale(1)`,
          backgroundColor: "hsl(var(--primary))",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          transition: "transform 150ms ease-in, background-color 150ms ease-in, box-shadow 150ms ease-in",
        }));
      }, 450)
    );

    // 4. Return to idle state
    timeouts.current.push(
      setTimeout(() => {
        setAnimationState("idle");
        setActiveIndex(newIndex);
        clearAllTimeouts();
      }, 600)
    );
  };

  // Cleanup timeouts on component unmount
  useEffect(() => {
    return () => clearAllTimeouts();
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2">
      <nav
        ref={navRef}
        className="relative flex h-16 items-center justify-around rounded-full bg-white/10 p-1 shadow-2xl shadow-black/20 ring-1 ring-white/60"
        style={{ backdropFilter: "url(#frosted) blur(1px)" }}
      >
        <div
          className="absolute top-1 h-[calc(100%-8px)] rounded-full border-primary-foreground/10"
          style={{ ...gliderStyle, visibility: hasMounted ? 'visible' : 'hidden' }}
        />
        
        {navItems.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <Link
              key={item.label}
              href={item.href}
              ref={(el) => (itemRefs.current[index] = el)}
              onClick={(e) => handleNavClick(e, index)}
              className="z-10 flex-1"
              prefetch={true}
            >
              <div
                className={cn(
                  "flex h-auto w-full flex-col items-center justify-center gap-1 rounded-full p-2 transition-colors duration-300",
                  "text-slate-100",
                  isActive ? "!text-primary-foreground" : "hover:text-white"
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
