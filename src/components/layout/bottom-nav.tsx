
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

type AnimationState = "idle" | "rising" | "sliding" | "descending" | "dragging";

export default function BottomNav() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const animationStateRef = useRef<AnimationState>("idle");
  const dragStartInfo = useRef<{ x: number; left: number; width: number } | null>(null);
  const animationFrameRef = useRef<number>();

  const { isClearMode, theme } = useThemeStore();
  const isLightClear = isClearMode && theme === "light";

  const [gliderStyle, setGliderStyle] = useState<CSSProperties>({
    opacity: 0,
  });
  const [hasMounted, setHasMounted] = useState(false);
  const [itemTransforms, setItemTransforms] = useState<Record<number, string>>({});


  const WIDTH_FACTOR = 0.55;
  const MIN_GLIDER_WIDTH = 28;

  const activeIndex = navItems.findIndex((item) =>
    pathname.startsWith(item.href)
  );

  const getRef = (index: number) => (el: HTMLAnchorElement | null) => {
    itemRefs.current[index] = el;
  };
  
  const setAnimationState = (state: AnimationState) => {
    animationStateRef.current = state;
  };

  const setGliderTo = useCallback((index: number, options: { immediate?: boolean } = {}) => {
    const navEl = navRef.current;
    const target = itemRefs.current[index];

    if (!navEl || !target || index === -1) return false;

    const navRect = navEl.getBoundingClientRect();
    const itemRect = target.getBoundingClientRect();

    const gliderWidth = Math.max(Math.round(itemRect.width * WIDTH_FACTOR), MIN_GLIDER_WIDTH);
    const left = itemRect.left - navRect.left + (itemRect.width - gliderWidth) / 2;

    setGliderStyle({
      width: `${gliderWidth}px`,
      height: "calc(100% - 12px)",
      transform: `translateX(${left}px) translateY(-50%)`,
      opacity: 1,
      transition: options.immediate ? "none" : "transform 300ms ease, width 300ms ease, opacity 200ms ease",
      backgroundColor: "hsl(var(--primary))",
      top: "50%",
      left: 0,
      position: "absolute",
    });
    return true;
  }, []);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Animate the "rise up" effect for items under the glider
  const animateItemTransforms = useCallback(() => {
    const gliderEl = navRef.current?.querySelector<HTMLDivElement>('.glider');
    if (!gliderEl || !navRef.current) return;

    const gliderRect = gliderEl.getBoundingClientRect();
    const navRect = navRef.current.getBoundingClientRect();

    const newTransforms: Record<number, string> = {};

    itemRefs.current.forEach((itemEl, index) => {
      if (!itemEl) return;

      const itemRect = itemEl.getBoundingClientRect();
      const itemCenter = itemRect.left - navRect.left + itemRect.width / 2;
      
      const distance = Math.abs(itemCenter - (gliderRect.left - navRect.left + gliderRect.width / 2));
      const effectRadius = gliderRect.width * 0.8;

      if (distance < effectRadius) {
        const scale = Math.cos((distance / effectRadius) * (Math.PI / 2));
        const rise = -6 * scale; // Max rise of -6px
        newTransforms[index] = `translateY(${rise}px)`;
      } else {
        newTransforms[index] = 'translateY(0px)';
      }
    });

    setItemTransforms(newTransforms);

    if (animationStateRef.current === 'sliding' || animationStateRef.current === 'dragging') {
        animationFrameRef.current = requestAnimationFrame(animateItemTransforms);
    }
  }, []);


  useEffect(() => {
    if(activeIndex !== -1) {
      setGliderTo(activeIndex, { immediate: !hasMounted });
    }
    const handleResize = () => setGliderTo(activeIndex, { immediate: true });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [pathname, activeIndex, hasMounted, setGliderTo]);


  const handleMouseDown = (e: MouseEvent<HTMLAnchorElement>, clickedIndex: number) => {
    e.preventDefault();
    if (animationStateRef.current !== "idle") return;

    if (clickedIndex === activeIndex) {
      // Start drag interaction
      const navEl = navRef.current;
      const targetItem = itemRefs.current[clickedIndex];
      if (!navEl || !targetItem) return;

      const navRect = navEl.getBoundingClientRect();
      const itemRect = targetItem.getBoundingClientRect();
      
      const gliderWidth = Math.max(Math.round(itemRect.width * WIDTH_FACTOR), MIN_GLIDER_WIDTH);
      const startLeft = itemRect.left - navRect.left + (itemRect.width - gliderWidth) / 2;

      dragStartInfo.current = {
        x: e.clientX,
        left: startLeft,
        width: gliderWidth,
      };

      // Instantly lift up and change style
      setAnimationState("dragging");
      setGliderStyle(prev => ({
        ...prev,
        height: 'calc(100% + 16px)',
        transform: `translateX(${startLeft}px) translateY(-50%)`,
        backgroundColor: isClearMode ? "hsla(0, 0%, 100%, 0.15)" : "hsl(var(--background))",
        boxShadow: "0 10px 18px -6px rgb(0 0 0 / 0.22), 0 6px 10px -8px rgb(0 0 0 / 0.12)",
        transition: "height 200ms ease, background-color 200ms ease, box-shadow 200ms ease, border 200ms ease, backdrop-filter 200ms ease",
        border: '1px solid hsla(0, 0%, 100%, 0.6)',
        backdropFilter: 'blur(16px)',
      }));

      animationFrameRef.current = requestAnimationFrame(animateItemTransforms);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp, { once: true });

    } else {
      // Perform the original "rise, glide, settle" animation
      const navEl = navRef.current;
      const startItem = itemRefs.current[activeIndex];
      const endItem = itemRefs.current[clickedIndex];

      if (!navEl || !startItem || !endItem) {
        router.push(navItems[clickedIndex].href);
        return;
      }
      
      setAnimationState("rising");
      const navRect = navEl.getBoundingClientRect();
      const startRect = startItem.getBoundingClientRect();
      const endRect = endItem.getBoundingClientRect();

      const startWidth = Math.max(Math.round(startRect.width * WIDTH_FACTOR), MIN_GLIDER_WIDTH);
      const startLeft = startRect.left - navRect.left + (startRect.width - startWidth) / 2;
      const endWidth = Math.max(Math.round(endRect.width * WIDTH_FACTOR), MIN_GLIDER_WIDTH);
      const endLeft = endRect.left - navRect.left + (endRect.width - endWidth) / 2;

      setGliderStyle(prev => ({
        ...prev,
        width: `${startWidth}px`,
        transform: `translateX(${startLeft}px) translateY(-50%)`,
        backgroundColor: isClearMode ? "hsla(0, 0%, 100%, 0.15)" : "hsl(var(--background))",
        boxShadow: "0 10px 18px -6px rgb(0 0 0 / 0.22), 0 6px 10px -8px rgb(0 0 0 / 0.12)",
        transition: "transform 140ms ease-out, background-color 140ms ease-out, box-shadow 140ms ease-out, border 140ms ease-out, height 140ms ease-out, backdrop-filter 140ms ease-out",
        border: '1px solid hsla(0, 0%, 100%, 0.6)',
        height: 'calc(100% + 16px)',
        backdropFilter: 'blur(16px)',
      }));

      const slideTimeout = setTimeout(() => {
        setAnimationState("sliding");
        setGliderStyle(prev => ({
          ...prev,
          width: `${endWidth}px`,
          transform: `translateX(${endLeft}px) translateY(-50%)`,
          transition: "transform 500ms cubic-bezier(0.22, 0.9, 0.35, 1), width 500ms cubic-bezier(0.22, 0.9, 0.35, 1), border 320ms ease-out",
        }));
        animationFrameRef.current = requestAnimationFrame(animateItemTransforms);
      }, 150);

      const settleTimeout = setTimeout(() => {
        setAnimationState("descending");
        router.push(navItems[clickedIndex].href);
        setGliderStyle(prev => ({
          ...prev,
          transform: `translateX(${endLeft}px) translateY(-50%)`,
          backgroundColor: "hsl(var(--primary))",
          boxShadow: "0 4px 10px -2px rgb(0 0 0 / 0.12), 0 2px 6px -3px rgb(0 0 0 / 0.08)",
          transition: "transform 160ms ease-in, background-color 160ms ease-in, box-shadow 160ms ease-in, border 160ms ease-in, height 160ms ease-in, backdrop-filter 160ms ease-in",
          border: '1px solid transparent',
          height: 'calc(100% - 12px)',
          backdropFilter: 'none',
        }));
      }, 650);

      const idleTimeout = setTimeout(() => {
        setAnimationState("idle");
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        setItemTransforms({});
      }, 820);
      
      return () => {
          clearTimeout(slideTimeout);
          clearTimeout(settleTimeout);
          clearTimeout(idleTimeout);
      }
    }
  };

  const handleMouseMove = (e: globalThis.MouseEvent) => {
    if (animationStateRef.current !== "dragging" || !dragStartInfo.current) return;
    
    const dx = e.clientX - dragStartInfo.current.x;
    const newLeft = dragStartInfo.current.left + dx;

    setGliderStyle(prev => ({
      ...prev,
      transform: `translateX(${newLeft}px) translateY(-50%)`,
      transition: "none", // No transition while dragging
    }));
  };

  const handleMouseUp = (e: globalThis.MouseEvent) => {
    window.removeEventListener("mousemove", handleMouseMove);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    if (animationStateRef.current !== "dragging" || !dragStartInfo.current) return;
    
    const navEl = navRef.current;
    if (!navEl) return;
    const navRect = navEl.getBoundingClientRect();
    const dropX = e.clientX - navRect.left;

    let closestIndex = 0;
    let minDistance = Infinity;

    itemRefs.current.forEach((itemEl, index) => {
      if (itemEl) {
        const itemRect = itemEl.getBoundingClientRect();
        const itemCenter = (itemRect.left - navRect.left) + itemRect.width / 2;
        const distance = Math.abs(dropX - itemCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      }
    });

    const endItem = itemRefs.current[closestIndex];
    if (endItem) {
        const endRect = endItem.getBoundingClientRect();
        const endWidth = Math.max(Math.round(endRect.width * WIDTH_FACTOR), MIN_GLIDER_WIDTH);
        const endLeft = endRect.left - navRect.left + (endRect.width - endWidth) / 2;
        
        setAnimationState("descending");
        setItemTransforms({}); // Reset transforms on drop

        setGliderStyle(prev => ({
            ...prev,
            width: `${endWidth}px`,
            transform: `translateX(${endLeft}px) translateY(-50%)`,
            backgroundColor: "hsl(var(--primary))",
            boxShadow: "0 4px 10px -2px rgb(0 0 0 / 0.12), 0 2px 6px -3px rgb(0 0 0 / 0.08)",
            transition: "transform 350ms cubic-bezier(0.22, 1, 0.36, 1), background-color 200ms ease-in, box-shadow 200ms ease-in, border 200ms ease-in, height 200ms ease-in, width 350ms cubic-bezier(0.22, 1, 0.36, 1), backdrop-filter 200ms ease-in",
            border: '1px solid transparent',
            height: 'calc(100% - 12px)',
            backdropFilter: 'none',
        }));
        
        const navigationTimeout = setTimeout(() => {
            if(closestIndex !== activeIndex) {
                router.push(navItems[closestIndex].href);
            }
             setAnimationState("idle");
        }, 350)

        return () => clearTimeout(navigationTimeout);
    }
    
    dragStartInfo.current = null;
    if (animationStateRef.current !== "descending") {
       setAnimationState("idle");
    }
  };


  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2">
      <nav
        ref={navRef}
        className={cn(
            "relative flex h-16 items-center justify-around rounded-full p-1 shadow-2xl shadow-black/20 ring-1 ring-white/60",
            isClearMode 
                ? isLightClear 
                    ? "bg-card/60"
                    : "bg-white/10"
                : "bg-card"
        )}
        style={{ backdropFilter: isClearMode ? "url(#frosted) blur(1px)" : "none" }}
      >
        <div
          className="glider absolute rounded-full pointer-events-none"
          style={{
            ...gliderStyle,
            visibility: hasMounted ? "visible" : "hidden",
            willChange: 'transform, width, height, background-color, backdrop-filter',
          }}
        />

        {navItems.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <Link
              key={item.label}
              href={item.href}
              ref={getRef(index)}
              onMouseDown={(e) => handleMouseDown(e, index)}
              onClick={(e) => e.preventDefault()} // Prevent default navigation
              className="z-10 flex-1 flex h-auto w-full flex-col items-center justify-center gap-1 rounded-full p-2"
              prefetch={true}
            >
              <div
                className={cn(
                  "flex flex-col items-center transition-all duration-300",
                   isClearMode 
                    ? (isActive ? "text-primary-foreground" : "text-slate-100")
                    : (isActive ? "text-primary-foreground" : "text-muted-foreground")
                )}
                 style={{ 
                    transform: itemTransforms[index] || 'translateY(0px)',
                    transition: 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)',
                 }}
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
