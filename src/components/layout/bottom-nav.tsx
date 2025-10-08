"use client";

import { Home, Briefcase, BarChart, Users, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  useCallback,
} from "react";

const navItems = [
  { href: "/dashboard", label: "Explore", icon: Home },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/trade", label: "Trade", icon: Repeat },
  { href: "/goals", label: "Goals", icon: BarChart },
  { href: "/community", label: "Community", icon: Users },
];

type AnimationState = "idle" | "rising" | "sliding" | "descending";

export default function BottomNav() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timeouts = useRef<number[]>([]); // browser setTimeout returns number

  const [gliderStyle, setGliderStyle] = useState<CSSProperties>({
    opacity: 0,
  });
  const [animationState, setAnimationState] = useState<AnimationState>("idle");
  const [hasMounted, setHasMounted] = useState(false);

  const activeIndex = navItems.findIndex((item) =>
    pathname.startsWith(item.href)
  );

  const clearAllTimeouts = () => {
    timeouts.current.forEach((t) => clearTimeout(t));
    timeouts.current = [];
  };

  const getRef = (index: number) => (el: HTMLDivElement | null) => {
    itemRefs.current[index] = el;
  };
  
  const updateHighlight = useCallback(() => {
    if (activeIndex === -1 || !navRef.current) {
      setGliderStyle({ width: 0, left: 0, opacity: 0 });
      return;
    }

    const activeItem = itemRefs.current[activeIndex];
    if (!activeItem) {
      requestAnimationFrame(updateHighlight);
      return;
    }

    const navRect = navRef.current.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    const horizontalPadding = 24; // Increased padding for a shorter highlight
    const left = itemRect.left - navRect.left + horizontalPadding / 2;
    const width = itemRect.width - horizontalPadding;

    setGliderStyle({
      width: `${width}px`,
      transform: `translateX(${left}px)`,
      opacity: 1,
      transition: hasMounted ? "transform 300ms ease, width 300ms ease, opacity 200ms ease" : "none",
      backgroundColor: "hsl(var(--primary))",
    });
  }, [activeIndex, hasMounted]);


  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    updateHighlight();
    window.addEventListener("resize", updateHighlight);
    return () => window.removeEventListener("resize", updateHighlight);
  }, [pathname, updateHighlight]);


  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, newIndex: number) => {
    e.preventDefault();
    if (animationState !== "idle" || newIndex === activeIndex) return;

    const navEl = navRef.current;
    const startItem = itemRefs.current[activeIndex];
    const endItem = itemRefs.current[newIndex];

    if (!navEl || !startItem || !endItem) {
      clearAllTimeouts();
      router.push(navItems[newIndex].href);
      return;
    }

    clearAllTimeouts();
    setAnimationState("rising");

    const navRect = navEl.getBoundingClientRect();
    const startRect = startItem.getBoundingClientRect();
    const endRect = endItem.getBoundingClientRect();
    
    const horizontalPadding = 24;

    const startLeft = startRect.left - navRect.left + horizontalPadding / 2;
    const startWidth = startRect.width - horizontalPadding;
    const endLeft = endRect.left - navRect.left + horizontalPadding / 2;
    const endWidth = endRect.width - horizontalPadding;

    // 1. Rise
    setGliderStyle({
      width: `${startWidth}px`,
      transform: `translateX(${startLeft}px) scale(1.08)`,
      backgroundColor: "hsl(var(--background) / 0.1)",
      boxShadow: "0 10px 18px -6px rgb(0 0 0 / 0.22), 0 6px 10px -8px rgb(0 0 0 / 0.12)",
      opacity: 1,
      transition: "transform 140ms ease-out, background-color 140ms ease-out, box-shadow 140ms ease-out, border 140ms ease-out",
      border: '1px solid hsla(0, 0%, 100%, 0.6)',
    });

    // 2. Slide
    timeouts.current.push(
      window.setTimeout(() => {
        setAnimationState("sliding");
        setGliderStyle((prev) => ({
          ...prev,
          width: `${endWidth}px`,
          transform: `translateX(${endLeft}px) scale(1.08)`,
          transition:
            "transform 320ms cubic-bezier(0.22, 0.9, 0.35, 1), width 320ms cubic-bezier(0.22, 0.9, 0.35, 1), border 320ms ease-out",
        }));
      }, 150)
    );

    // 3. Drop & navigate
    timeouts.current.push(
      window.setTimeout(() => {
        setAnimationState("descending");
        router.push(navItems[newIndex].href);
        setGliderStyle((prev) => ({
          ...prev,
          transform: `translateX(${endLeft}px) scale(1)`,
          backgroundColor: "hsl(var(--primary))",
          boxShadow: "0 4px 10px -2px rgb(0 0 0 / 0.12), 0 2px 6px -3px rgb(0 0 0 / 0.08)",
          transition: "transform 160ms ease-in, background-color 160ms ease-in, box-shadow 160ms ease-in, border 160ms ease-in",
          border: '1px solid transparent',
        }));
      }, 470)
    );

    // 4. Finish
    timeouts.current.push(
      window.setTimeout(() => {
        setAnimationState("idle");
        clearAllTimeouts();
      }, 640)
    );
  };

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
          className="absolute top-1 h-[calc(100%-8px)] rounded-full"
          style={{
            ...gliderStyle,
            visibility: hasMounted ? "visible" : "hidden",
          }}
        />

        {navItems.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, index)}
              className="z-10 flex-1"
              prefetch={true}
            >
              <div
                ref={getRef(index)}
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
