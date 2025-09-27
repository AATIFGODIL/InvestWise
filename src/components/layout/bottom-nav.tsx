
"use client";

import { Home, Briefcase, BarChart, Users, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";

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
  const timeouts = useRef<number[]>([]);

  const [gliderStyle, setGliderStyle] = useState<CSSProperties>({ opacity: 0 });
  const [animationState, setAnimationState] = useState<AnimationState>("idle");
  const [activeIndex, setActiveIndex] = useState(-1);

  // helper to clear scheduled timeouts
  const clearAllTimeouts = () => {
    timeouts.current.forEach((id) => window.clearTimeout(id));
    timeouts.current = [];
  };

  // Measure & set glider to match pathname active item.
  useLayoutEffect(() => {
    let cancelled = false;

    const attemptSet = (tries = 0) => {
      if (cancelled) return;
      const currentPathIndex = navItems.findIndex((item) => pathname.startsWith(item.href));
      if (currentPathIndex === -1) {
        // hide glider if path doesn't match any item
        setGliderStyle((prev) => ({ ...prev, opacity: 0 }));
        setActiveIndex(-1);
        return;
      }

      const activeItem = itemRefs.current[currentPathIndex];
      const navEl = navRef.current;
      if (!activeItem || !navEl) {
        // retry for up to a few frames until refs are populated
        if (tries < 6) {
          requestAnimationFrame(() => attemptSet(tries + 1));
        } else {
          // fallback: set activeIndex and make glider visible with default width
          setActiveIndex(currentPathIndex);
          setGliderStyle((prev) => ({ ...prev, opacity: 1 }));
        }
        return;
      }

      const navRect = navEl.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      
      if (itemRect.width === 0 && tries < 6) {
        requestAnimationFrame(() => attemptSet(tries + 1));
        return;
      }

      const left = itemRect.left - navRect.left;
      
      clearAllTimeouts();
      setAnimationState("idle");
      setGliderStyle({
        width: `${itemRect.width}px`,
        transform: `translateX(${left}px)`,
        opacity: 1,
        transition: 'opacity 300ms ease',
      });
      setActiveIndex(currentPathIndex);
    };

    attemptSet();

    return () => {
      cancelled = true;
      clearAllTimeouts();
    };
  }, [pathname]);

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, newIndex: number) => {
    e.preventDefault();
    if (newIndex === activeIndex || animationState !== "idle") return;

    const startItem = itemRefs.current[activeIndex];
    const endItem = itemRefs.current[newIndex];
    if (!startItem || !endItem || !navRef.current) return;
    
    clearAllTimeouts();

    const navRect = navRef.current.getBoundingClientRect();
    const startRect = startItem.getBoundingClientRect();
    const endRect = endItem.getBoundingClientRect();
    const startLeft = startRect.left - navRect.left;
    const endLeft = endRect.left - navRect.left;

    const t = (fn: () => void, delay: number) => timeouts.current.push(window.setTimeout(fn, delay));

    setAnimationState("rising");
    setGliderStyle({
      ...gliderStyle,
      transform: `translateX(${startLeft}px) scale(1.1)`,
      backgroundColor: 'hsl(var(--primary) / 0.5)',
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      backdropFilter: 'blur(4px)',
      transition: 'transform 150ms ease-out, background-color 150ms ease-out, box-shadow 150ms ease-out, backdrop-filter 150ms ease-out',
    });

    t(() => {
      setAnimationState("sliding");
      setGliderStyle({
        width: `${endRect.width}px`,
        transform: `translateX(${endLeft}px) scale(1.1)`,
        backgroundColor: 'hsl(var(--primary) / 0.5)',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        backdropFilter: 'blur(4px)',
        transition: 'transform 300ms cubic-bezier(0.65, 0, 0.35, 1), width 300ms cubic-bezier(0.65, 0, 0.35, 1), backdrop-filter 300ms ease-out',
      });
    }, 150);

    t(() => {
      setAnimationState("descending");
      setGliderStyle({
        width: `${endRect.width}px`,
        transform: `translateX(${endLeft}px) scale(1)`,
        backgroundColor: 'hsl(var(--primary))',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        backdropFilter: 'blur(0px)',
        transition: 'transform 150ms ease-in, background-color 150ms ease-in, box-shadow 150ms ease-in, backdrop-filter 150ms ease-in',
      });
    }, 450);

    t(() => {
      setAnimationState("idle");
      router.push(endItem.href);
    }, 600);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2">
      <nav 
        ref={navRef} 
        className="relative flex h-16 items-center justify-around rounded-full bg-background/70 p-1 shadow-lg ring-1 ring-black/5 backdrop-blur-sm"
      >
        <div
          className="absolute top-1 h-[calc(100%-8px)] rounded-full border-primary-foreground/10"
          style={gliderStyle}
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
