
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
      if (itemRect.width === 0) return;

      const left = itemRect.left - navRect.left;
      setGliderStyle({
        width: `${itemRect.width}px`,
        transform: `translateX(${left}px) scale(1)`,
        backgroundColor: "hsl(var(--primary))",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        opacity: 1,
        transition: "opacity 150ms ease-in-out, transform 200ms ease",
        backdropFilter: "blur(0px)",
      });
      setActiveIndex(currentPathIndex);
    };

    attemptSet();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, newIndex: number) => {
    e.preventDefault();
    if (animationState !== "idle") return; // prevent spamming while animating

    const navEl = navRef.current;
    const endItem = itemRefs.current[newIndex];
    if (!endItem || !navEl) {
      // fallback navigation
      router.push(navItems[newIndex].href);
      return;
    }

    const navRect = navEl.getBoundingClientRect();
    const endRect = endItem.getBoundingClientRect();
    const endLeft = endRect.left - navRect.left;

    // determine start position: if we have an activeIndex use it, else start at end (so animation still plays)
    let startLeft = endLeft;
    if (activeIndex !== -1) {
      const startItem = itemRefs.current[activeIndex];
      if (startItem) {
        const startRect = startItem.getBoundingClientRect();
        startLeft = startRect.left - navRect.left;
      }
    }

    // rising
    setAnimationState("rising");
    setGliderStyle((prev) => ({
      ...prev,
      width: `${endRect.width}px`,
      transition: "transform 150ms ease-out, background-color 150ms ease-out, box-shadow 150ms ease-out, backdrop-filter 150ms ease-out",
      transform: `translateX(${startLeft}px) scale(1.1)`,
      backgroundColor: "hsl(var(--primary) / 0.5)",
      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      backdropFilter: "blur(4px)",
      opacity: 1,
    }));

    // sliding
    timeouts.current.push(
      window.setTimeout(() => {
        setAnimationState("sliding");
        setGliderStyle((prev) => ({
          ...prev,
          width: `${endRect.width}px`,
          transition: "transform 300ms cubic-bezier(0.65, 0, 0.35, 1), backdrop-filter 300ms ease-out",
          transform: `translateX(${endLeft}px) scale(1.1)`,
          backgroundColor: "hsl(var(--primary) / 0.5)",
        }));
      }, 150)
    );

    // descending + finalize & navigate
    timeouts.current.push(
      window.setTimeout(() => {
        setAnimationState("descending");
        setGliderStyle((prev) => ({
          ...prev,
          width: `${endRect.width}px`,
          transition: "transform 150ms ease-in, background-color 150ms ease-in, box-shadow 150ms ease-in, backdrop-filter 150ms ease-in",
          transform: `translateX(${endLeft}px) scale(1)`,
          backgroundColor: "hsl(var(--primary))",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          backdropFilter: "blur(0px)",
        }));
      }, 450)
    );

    timeouts.current.push(
      window.setTimeout(() => {
        setAnimationState("idle");
        clearAllTimeouts();
        // update activeIndex and navigate
        setActiveIndex(newIndex);
        router.push(navItems[newIndex].href);
      }, 600)
    );
  };

  // cleanup on unmount
  useLayoutEffect(() => {
    return () => {
      clearAllTimeouts();
    };
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
                  isActive ? "text-primary-foreground" : "text-slate-100 hover:text-white"
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
