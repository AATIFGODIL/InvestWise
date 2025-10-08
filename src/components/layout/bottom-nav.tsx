
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
import { useThemeStore } from "@/store/theme-store";

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
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const timeouts = useRef<number[]>([]);
  
  const { isClearMode, theme } = useThemeStore();
  const isLightClear = isClearMode && theme === 'light';

  const [gliderStyle, setGliderStyle] = useState<CSSProperties>({
    opacity: 0,
  });
  const [animationState, setAnimationState] = useState<AnimationState>("idle");
  const [hasMounted, setHasMounted] = useState(false);

  // make the glider narrower horizontally
  const WIDTH_FACTOR = 0.55;   // try 0.45; lower -> smaller
  const MIN_GLIDER_WIDTH = 28; // minimum width in px so it doesn't collapse

  const activeIndex = navItems.findIndex((item) =>
    pathname.startsWith(item.href)
  );

  const clearAllTimeouts = () => {
    timeouts.current.forEach((t) => clearTimeout(t));
    timeouts.current = [];
  };

  const getRef = (index: number) => (el: HTMLAnchorElement | null) => {
    itemRefs.current[index] = el;
  };

  const setGliderTo = useCallback((index: number, options: { immediate?: boolean } = {}) => {
    const navEl = navRef.current;
    const target = itemRefs.current[index];

    if (!navEl || !target) return false;

    const navRect = navEl.getBoundingClientRect();
    const itemRect = target.getBoundingClientRect();

    const gliderWidth = Math.max(Math.round(itemRect.width * WIDTH_FACTOR), MIN_GLIDER_WIDTH);
    const left = itemRect.left - navRect.left + (itemRect.width - gliderWidth) / 2;

    setGliderStyle({
      width: `${gliderWidth}px`,
      transform: `translateX(${left}px) translateY(-50%)`,
      opacity: 1,
      transition: options.immediate ? "none" : "transform 300ms ease, width 300ms ease, opacity 200ms ease",
      backgroundColor: "hsl(var(--primary))",
      height: gliderStyle.height ?? "calc(100% - 12px)",
      top: "50%",
      left: 0,
      position: "absolute",
    });
    return true;
  }, [gliderStyle.height]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if(activeIndex !== -1) {
      setGliderTo(activeIndex, { immediate: !hasMounted });
    }
    window.addEventListener("resize", () => setGliderTo(activeIndex, {immediate: true}));
    return () => window.removeEventListener("resize", () => setGliderTo(activeIndex, {immediate: true}));
  }, [pathname, activeIndex, hasMounted, setGliderTo]);

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

    const startWidth = Math.max(Math.round(startRect.width * WIDTH_FACTOR), MIN_GLIDER_WIDTH);
    const startLeft = startRect.left - navRect.left + (startRect.width - startWidth) / 2;

    const endWidth = Math.max(Math.round(endRect.width * WIDTH_FACTOR), MIN_GLIDER_WIDTH);
    const endLeft = endRect.left - navRect.left + (endRect.width - endWidth) / 2;
    

    // 1. Rise
    setGliderStyle(prev => ({
      ...prev,
      width: `${startWidth}px`,
      transform: `translateX(${startLeft}px) translateY(-50%) scale(1.08)`,
      backgroundColor: "hsl(var(--background) / 0.1)",
      boxShadow: "0 10px 18px -6px rgb(0 0 0 / 0.22), 0 6px 10px -8px rgb(0 0 0 / 0.12)",
      opacity: 1,
      transition: "transform 140ms ease-out, background-color 140ms ease-out, box-shadow 140ms ease-out, border 140ms ease-out",
      border: '1px solid hsla(0, 0%, 100%, 0.6)',
    }));

    // 2. Slide
    timeouts.current.push(
      window.setTimeout(() => {
        setAnimationState("sliding");
        setGliderStyle((prev) => ({
          ...prev,
          width: `${endWidth}px`,
          transform: `translateX(${endLeft}px) translateY(-50%) scale(1.08)`,
          transition:
            "transform 500ms cubic-bezier(0.22, 0.9, 0.35, 1), width 500ms cubic-bezier(0.22, 0.9, 0.35, 1), border 320ms ease-out",
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
          transform: `translateX(${endLeft}px) translateY(-50%) scale(1)`,
          backgroundColor: "hsl(var(--primary))",
          boxShadow: "0 4px 10px -2px rgb(0 0 0 / 0.12), 0 2px 6px -3px rgb(0 0 0 / 0.08)",
          transition: "transform 160ms ease-in, background-color 160ms ease-in, box-shadow 160ms ease-in, border 160ms ease-in",
          border: '1px solid transparent',
        }));
      }, 650)
    );

    // 4. Finish
    timeouts.current.push(
      window.setTimeout(() => {
        setAnimationState("idle");
        clearAllTimeouts();
      }, 820)
    );
  };

  useEffect(() => {
    return () => clearAllTimeouts();
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2">
      <nav
        ref={navRef}
        className={cn(
            "relative flex h-16 items-center justify-around rounded-full p-1 shadow-2xl shadow-black/20 ring-1 ring-white/60",
            isClearMode 
                ? isLightClear 
                    ? "bg-card/60" // Light Clear
                    : "bg-white/10" // Dark Clear
                : "bg-card" // Solid
        )}
        style={{ backdropFilter: isClearMode ? "url(#frosted) blur(1px)" : "none" }}
      >
        <div
          className="absolute rounded-full pointer-events-none"
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
              ref={getRef(index)}
              onClick={(e) => handleNavClick(e, index)}
              className="z-10 flex-1 flex h-auto w-full flex-col items-center justify-center gap-1 rounded-full p-2 transition-colors duration-300"
              prefetch={true}
            >
              <div
                className={cn(
                  "flex flex-col items-center",
                   isClearMode 
                    ? (isActive ? "text-primary-foreground" : "text-slate-100 hover:text-white")
                    : (isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")
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
