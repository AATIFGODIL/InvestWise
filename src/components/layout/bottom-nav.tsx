// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import { Home, BarChart, Users, Repeat, Target, LineChart } from "lucide-react";
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
  useMemo,
} from "react";
import { useThemeStore } from "@/store/theme-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBottomNavStore } from "@/store/bottom-nav-store";
import { useProModeStore } from "@/store/pro-mode-store";

type AnimationState = "idle" | "rising" | "sliding" | "descending" | "dragging";

export default function BottomNav({
  isMobileCompact = false,
  onHide,
  noFixedWrapper = false,
}: {
  isMobileCompact?: boolean;
  onHide?: () => void;
  /** When true on desktop, renders the nav element without the outer fixed wrapper.
   *  Use this when BottomNav is placed inside a parent fixed container. */
  noFixedWrapper?: boolean;
}) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const animationStateRef = useRef<AnimationState>("idle");
  const dragStartInfo = useRef<{ x: number; y: number; left: number; top: number; width: number; height: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const { isClearMode, theme, primaryColor } = useThemeStore();
  const { activeIndex: externalActiveIndex, targetPath, samePageIndex, clearActiveIndex } = useBottomNavStore();
  const { isProMode } = useProModeStore();
  const isLightClear = isClearMode && theme === "light";
  const isMobile = useIsMobile();

  const isDesktop = !isMobile;

  const navItems = useMemo(() => {
    const items = [
      { href: "/dashboard", label: "Explore", icon: Home },
      { href: "/portfolio", label: "Portfolio", icon: BarChart },
      { href: "/trade", label: "Trade", icon: Repeat },
      isProMode
        ? { href: "/research", label: "Research", icon: LineChart }
        : { href: "/goals", label: "Goals", icon: Target },
      { href: "/community", label: "Community", icon: Users },
    ];
    return items;
  }, [isProMode]);

  const [gliderStyle, setGliderStyle] = useState<CSSProperties>({ opacity: 0 });
  const [hasMounted, setHasMounted] = useState(false);
  const [itemTransforms, setItemTransforms] = useState<Record<number, string>>({});
  const [showGlow, setShowGlow] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem('showGlowEffect') === 'true') {
      setShowGlow(true);
      const timer = setTimeout(() => setShowGlow(false), 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  const MIN_GLIDER_WIDTH = 28;
  const MIN_GLIDER_HEIGHT = 28;

  const activeIndex = navItems.findIndex((item) => pathname.startsWith(item.href));

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

    if (isDesktop) {
      const gliderHeight = itemRect.height + 12;
      const top = itemRect.top - navRect.top - 6;
      const gliderWidth = Math.round(navRect.width * 0.85);
      const left = Math.round((navRect.width - gliderWidth) / 2);
      setGliderStyle({
        width: `${gliderWidth}px`,
        height: `${gliderHeight}px`,
        transform: `translateX(${left}px) translateY(${top}px)`,
        opacity: 1,
        transition: options.immediate ? "none" : "transform 300ms ease, width 300ms ease, height 300ms ease, opacity 200ms ease, background-color 300ms ease",
        backgroundColor: "hsl(var(--primary))",
        top: 0,
        left: 0,
        position: "absolute",
        borderRadius: "9999px",
      });
    } else {
      const gliderWidth = Math.max(Math.round(itemRect.width * 0.95), MIN_GLIDER_WIDTH);
      const left = itemRect.left - navRect.left + (itemRect.width - gliderWidth) / 2;
      setGliderStyle({
        width: `${gliderWidth}px`,
        height: "calc(100% - 12px)",
        transform: `translateX(${left}px) translateY(-50%)`,
        opacity: 1,
        transition: options.immediate ? "none" : "transform 300ms ease, width 300ms ease, opacity 200ms ease, background-color 300ms ease",
        backgroundColor: "hsl(var(--primary))",
        top: "50%",
        left: 0,
        position: "absolute",
      });
    }
    return true;
  }, [isDesktop, MIN_GLIDER_WIDTH]);

  useEffect(() => { setHasMounted(true); }, []);

  const animateItemTransforms = useCallback(() => {
    const gliderEl = navRef.current?.querySelector<HTMLDivElement>('.glider');
    if (!gliderEl || !navRef.current) return;

    const gliderRect = gliderEl.getBoundingClientRect();
    const navRect = navRef.current.getBoundingClientRect();
    const newTransforms: Record<number, string> = {};

    itemRefs.current.forEach((itemEl, index) => {
      if (!itemEl) return;
      const itemRect = itemEl.getBoundingClientRect();

      if (isDesktop) {
        const itemCenter = itemRect.top - navRect.top + itemRect.height / 2;
        const gliderCenter = gliderRect.top - navRect.top + gliderRect.height / 2;
        const distance = Math.abs(itemCenter - gliderCenter);
        const effectRadius = gliderRect.height * 0.8;
        if (distance < effectRadius) {
          const scale = Math.cos((distance / effectRadius) * (Math.PI / 2));
          newTransforms[index] = `translateY(${-4 * scale}px)`;
        } else {
          newTransforms[index] = 'translateY(0px)';
        }
      } else {
        const itemCenter = itemRect.left - navRect.left + itemRect.width / 2;
        const distance = Math.abs(itemCenter - (gliderRect.left - navRect.left + gliderRect.width / 2));
        const effectRadius = gliderRect.width * 0.8;
        if (distance < effectRadius) {
          const scale = Math.cos((distance / effectRadius) * (Math.PI / 2));
          newTransforms[index] = `translateY(${-6 * scale}px)`;
        } else {
          newTransforms[index] = 'translateY(0px)';
        }
      }
    });

    setItemTransforms(newTransforms);
    if (animationStateRef.current === 'sliding' || animationStateRef.current === 'dragging') {
      animationFrameRef.current = requestAnimationFrame(animateItemTransforms);
    }
  }, [isDesktop]);

  const animateTo = useCallback((clickedIndex: number, isSamePage: boolean = false, overridePath?: string | null) => {
    if (animationStateRef.current !== "idle" || clickedIndex === -1) return;
    if (!isSamePage && clickedIndex === activeIndex) return;

    const navEl = navRef.current;
    const startItem = itemRefs.current[activeIndex];
    const endItem = itemRefs.current[clickedIndex];

    if (!navEl || !startItem || !endItem) {
      if (!isSamePage) router.push(overridePath || navItems[clickedIndex].href);
      return;
    }

    setAnimationState("rising");
    const navRect = navEl.getBoundingClientRect();
    const startRect = startItem.getBoundingClientRect();
    const endRect = endItem.getBoundingClientRect();

    if (isDesktop) {
      const startHeight = startRect.height + 12;
      const startTop = startRect.top - navRect.top - 6;
      const endHeight = endRect.height + 12;
      const endTop = endRect.top - navRect.top - 6;
      const gliderWidth = Math.round(navRect.width * 0.85);
      const left = Math.round((navRect.width - gliderWidth) / 2);

      setGliderStyle(prev => ({
        ...prev,
        height: `${startHeight}px`,
        transform: `translateX(${left}px) translateY(${startTop}px)`,
        backgroundColor: isClearMode ? (isLightClear ? "rgba(200, 200, 200, 0.8)" : "hsla(0, 0%, 100%, 0.15)") : "hsl(var(--background))",
        boxShadow: "0 10px 18px -6px rgb(0 0 0 / 0.22)",
        transition: "transform 140ms ease-out, background-color 140ms ease-out, box-shadow 140ms ease-out, height 140ms ease-out, width 140ms ease-out, backdrop-filter 140ms ease-out",
        border: isLightClear ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid hsla(0, 0%, 100%, 0.6)',
        width: `85%`,
        backdropFilter: 'blur(16px)',
        borderRadius: '9999px',
      }));

      if (isSamePage) {
        const settleTimeout = setTimeout(() => {
          setAnimationState("descending");
          setGliderStyle(prev => ({
            ...prev,
            transform: `translateX(${left}px) translateY(${endTop}px)`,
            backgroundColor: "hsl(var(--primary))",
            boxShadow: "0 4px 10px -2px rgb(0 0 0 / 0.12)",
            transition: "transform 160ms ease-in, background-color 160ms ease-in, box-shadow 160ms ease-in, height 160ms ease-in, width 160ms ease-in, backdrop-filter 160ms ease-in",
            border: '1px solid transparent',
            width: `${gliderWidth}px`,
            height: `${endHeight}px`,
            backdropFilter: 'none',
          }));
          const idleTimeout = setTimeout(() => setAnimationState("idle"), 170);
          return () => clearTimeout(idleTimeout);
        }, 150);
        return () => clearTimeout(settleTimeout);
      }

      const slideTimeout = setTimeout(() => {
        setAnimationState("sliding");
        setGliderStyle(prev => ({
          ...prev,
          height: `${endHeight}px`,
          transform: `translateX(${left}px) translateY(${endTop}px)`,
          transition: "transform 500ms cubic-bezier(0.22, 0.9, 0.35, 1), height 500ms cubic-bezier(0.22, 0.9, 0.35, 1), border 320ms ease-out",
        }));
        animationFrameRef.current = requestAnimationFrame(animateItemTransforms);
      }, 150);

      const settleTimeout = setTimeout(() => {
        setAnimationState("descending");
        if (!isSamePage) router.push(overridePath || navItems[clickedIndex].href);
        setGliderStyle(prev => ({
          ...prev,
          transform: `translateX(${left}px) translateY(${endTop}px)`,
          backgroundColor: "hsl(var(--primary))",
          boxShadow: "0 4px 10px -2px rgb(0 0 0 / 0.12)",
          transition: "transform 160ms ease-in, background-color 160ms ease-in, box-shadow 160ms ease-in, height 160ms ease-in, width 160ms ease-in, backdrop-filter 160ms ease-in",
          border: '1px solid transparent',
          width: `${gliderWidth}px`,
          height: `${endHeight}px`,
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
      };
    } else {
      const startWidth = Math.max(Math.round(startRect.width * 0.95), MIN_GLIDER_WIDTH);
      const startLeft = startRect.left - navRect.left + (startRect.width - startWidth) / 2;
      const endWidth = Math.max(Math.round(endRect.width * 0.95), MIN_GLIDER_WIDTH);
      const endLeft = endRect.left - navRect.left + (endRect.width - endWidth) / 2;

      setGliderStyle(prev => ({
        ...prev,
        width: `${startWidth}px`,
        transform: `translateX(${startLeft}px) translateY(-50%)`,
        backgroundColor: isClearMode ? (isLightClear ? "rgba(200, 200, 200, 0.8)" : "hsla(0, 0%, 100%, 0.15)") : "hsl(var(--background))",
        boxShadow: "0 10px 18px -6px rgb(0 0 0 / 0.22), 0 6px 10px -8px rgb(0 0 0 / 0.12)",
        transition: "transform 140ms ease-out, background-color 140ms ease-out, box-shadow 140ms ease-out, border 140ms ease-out, height 140ms ease-out, backdrop-filter 140ms ease-out",
        border: isLightClear ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid hsla(0, 0%, 100%, 0.6)',
        height: 'calc(100% + 16px)',
        backdropFilter: 'blur(16px)',
      }));

      if (isSamePage) {
        const settleTimeout = setTimeout(() => {
          setAnimationState("descending");
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
          const idleTimeout = setTimeout(() => setAnimationState("idle"), 170);
          return () => clearTimeout(idleTimeout);
        }, 150);
        return () => clearTimeout(settleTimeout);
      }

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
        if (!isSamePage) router.push(overridePath || navItems[clickedIndex].href);
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
      };
    }
  }, [activeIndex, isClearMode, router, isDesktop, MIN_GLIDER_WIDTH, animateItemTransforms, navItems]);

  useEffect(() => {
    if (externalActiveIndex !== null) {
      animateTo(externalActiveIndex, false, targetPath);
      clearActiveIndex();
    }
    if (samePageIndex !== null) {
      animateTo(samePageIndex, true);
      clearActiveIndex();
    }
  }, [externalActiveIndex, samePageIndex, animateTo, clearActiveIndex, targetPath]);

  useEffect(() => {
    if (activeIndex !== -1 && animationStateRef.current === 'idle') {
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
      const navEl = navRef.current;
      const targetItem = itemRefs.current[clickedIndex];
      if (!navEl || !targetItem) return;

      const navRect = navEl.getBoundingClientRect();
      const itemRect = targetItem.getBoundingClientRect();

      if (isDesktop) {
        const gliderHeight = itemRect.height + 12;
        const startTop = itemRect.top - navRect.top - 6;
        const gliderWidth = Math.round(navRect.width * 0.85);
        const left = Math.round((navRect.width - gliderWidth) / 2);

        dragStartInfo.current = { x: e.clientX, y: e.clientY, left, top: startTop, width: gliderWidth, height: gliderHeight };
        setAnimationState("dragging");
        window.dispatchEvent(new CustomEvent('bottomNavDragStart'));
        setGliderStyle(prev => ({
          ...prev,
          width: `85%`,
          height: `${gliderHeight}px`,
          transform: `translateX(${left}px) translateY(${startTop}px)`,
          backgroundColor: isClearMode ? (isLightClear ? "rgba(200, 200, 200, 0.8)" : "hsla(0, 0%, 100%, 0.15)") : "hsl(var(--background))",
          boxShadow: "0 10px 18px -6px rgb(0 0 0 / 0.22)",
          transition: "width 200ms ease, background-color 200ms ease, box-shadow 200ms ease, border 200ms ease, backdrop-filter 200ms ease",
          border: isLightClear ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid hsla(0, 0%, 100%, 0.6)',
          backdropFilter: 'blur(16px)',
          borderRadius: '9999px',
        }));
      } else {
        const gliderWidth = Math.max(Math.round(itemRect.width * 0.95), MIN_GLIDER_WIDTH);
        const startLeft = itemRect.left - navRect.left + (itemRect.width - gliderWidth) / 2;

        dragStartInfo.current = { x: e.clientX, y: e.clientY, left: startLeft, top: 0, width: gliderWidth, height: 0 };
        setAnimationState("dragging");
        window.dispatchEvent(new CustomEvent('bottomNavDragStart'));
        setGliderStyle(prev => ({
          ...prev,
          height: 'calc(100% + 16px)',
          transform: `translateX(${startLeft}px) translateY(-50%)`,
          backgroundColor: isClearMode ? (isLightClear ? "rgba(200, 200, 200, 0.8)" : "hsla(0, 0%, 100%, 0.15)") : "hsl(var(--background))",
          boxShadow: "0 10px 18px -6px rgb(0 0 0 / 0.22), 0 6px 10px -8px rgb(0 0 0 / 0.12)",
          transition: "height 200ms ease, background-color 200ms ease, box-shadow 200ms ease, border 200ms ease, backdrop-filter 200ms ease",
          border: isLightClear ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid hsla(0, 0%, 100%, 0.6)',
          backdropFilter: 'blur(16px)',
        }));
      }

      animationFrameRef.current = requestAnimationFrame(animateItemTransforms);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp, { once: true });
    } else {
      animateTo(clickedIndex);
    }
  };

  const handleMouseMove = (e: globalThis.MouseEvent) => {
    if (animationStateRef.current !== "dragging" || !dragStartInfo.current) return;
    if (isDesktop) {
      const dy = e.clientY - dragStartInfo.current.y;
      setGliderStyle(prev => ({
        ...prev,
        transform: `translateX(${dragStartInfo.current!.left}px) translateY(${dragStartInfo.current!.top + dy}px)`,
        transition: "none",
      }));
    } else {
      const dx = e.clientX - dragStartInfo.current.x;
      setGliderStyle(prev => ({
        ...prev,
        transform: `translateX(${dragStartInfo.current!.left + dx}px) translateY(-50%)`,
        transition: "none",
      }));
    }
  };

  const handleMouseUp = (e: globalThis.MouseEvent) => {
    window.removeEventListener("mousemove", handleMouseMove);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (animationStateRef.current !== "dragging" || !dragStartInfo.current) return;

    window.dispatchEvent(new CustomEvent('bottomNavDragEnd'));

    const navEl = navRef.current;
    if (!navEl) return;
    const navRect = navEl.getBoundingClientRect();

    let closestIndex = 0;
    let minDistance = Infinity;

    itemRefs.current.forEach((itemEl, index) => {
      if (itemEl) {
        const itemRect = itemEl.getBoundingClientRect();
        if (isDesktop) {
          const itemCenter = (itemRect.top - navRect.top) + itemRect.height / 2;
          const distance = Math.abs((e.clientY - navRect.top) - itemCenter);
          if (distance < minDistance) { minDistance = distance; closestIndex = index; }
        } else {
          const itemCenter = (itemRect.left - navRect.left) + itemRect.width / 2;
          const distance = Math.abs((e.clientX - navRect.left) - itemCenter);
          if (distance < minDistance) { minDistance = distance; closestIndex = index; }
        }
      }
    });

    const endItem = itemRefs.current[closestIndex];
    if (endItem) {
      const endRect = endItem.getBoundingClientRect();
      setAnimationState("descending");
      setItemTransforms({});

      if (isDesktop) {
        const endHeight = endRect.height + 12;
        const endTop = endRect.top - navRect.top - 6;
        const gliderWidth = Math.round(navRect.width * 0.85);
        const left = Math.round((navRect.width - gliderWidth) / 2);
        setGliderStyle(prev => ({
          ...prev,
          width: `${gliderWidth}px`,
          height: `${endHeight}px`,
          transform: `translateX(${left}px) translateY(${endTop}px)`,
          backgroundColor: "hsl(var(--primary))",
          boxShadow: "0 4px 10px -2px rgb(0 0 0 / 0.12)",
          transition: "transform 350ms cubic-bezier(0.22, 1, 0.36, 1), background-color 200ms ease-in, box-shadow 200ms ease-in, border 200ms ease-in, width 350ms cubic-bezier(0.22, 1, 0.36, 1), height 350ms cubic-bezier(0.22, 1, 0.36, 1), backdrop-filter 200ms ease-in",
          border: '1px solid transparent',
          backdropFilter: 'none',
          borderRadius: '9999px',
        }));
      } else {
        const endWidth = Math.max(Math.round(endRect.width * 0.95), MIN_GLIDER_WIDTH);
        const endLeft = endRect.left - navRect.left + (endRect.width - endWidth) / 2;
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
      }

      const navigationTimeout = setTimeout(() => {
        if (closestIndex !== activeIndex) router.push(navItems[closestIndex].href);
        setAnimationState("idle");
      }, 350);

      return () => clearTimeout(navigationTimeout);
    }

    dragStartInfo.current = null;
    setAnimationState("idle");
  };

  // ============================================================
  // RENDER: Desktop Side Rail
  // ============================================================
  if (isDesktop) {
    const navElement = (
      <nav
        ref={navRef}
        className={cn(
          "relative flex flex-col items-center justify-between gap-4 rounded-full py-6 px-2 shadow-2xl shadow-black/20",
          "w-[80px]",
          isClearMode
            ? isLightClear ? "bg-card/60 ring-1 ring-black/10" : "bg-white/10 ring-1 ring-white/60"
            : "bg-card ring-1 ring-black/40",
          showGlow && "login-glow"
        )}
        style={{ backdropFilter: isClearMode ? "url(#frosted) blur(1px)" : "blur(12px)" }}
      >
        <div
          className="glider absolute pointer-events-none rounded-full"
          style={{
            ...gliderStyle,
            visibility: hasMounted ? "visible" : "hidden",
            willChange: 'transform, width, height, background-color, backdrop-filter',
          }}
        />
        {navItems.map((item, index) => {
          const isActive = index === activeIndex;
          const isHovered = hoveredIndex === index;
          return (
            <Link
              key={item.label}
              href={item.href}
              ref={getRef(index)}
              id={index === 0 ? 'bottom-nav-explore-tutorial' : undefined}
              onMouseDown={(e) => handleMouseDown(e, index)}
              onClick={(e) => e.preventDefault()}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="z-10 flex w-full flex-col items-center justify-center gap-1 rounded-full py-5 px-1.5 relative group"
              prefetch={true}
            >
              <div
                className={cn(
                  "flex flex-col items-center transition-all duration-300",
                  isActive
                    ? "text-primary-foreground"
                    : theme === "light"
                      ? "text-black"
                      : (isClearMode ? "text-slate-100" : "text-muted-foreground")
                )}
                style={{
                  transform: itemTransforms[index] || 'translateY(0px)',
                  transition: 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-[10px] font-medium leading-tight mt-0.5">{item.label}</span>
              </div>
              {
                isHovered && !isActive && (
                  <div
                    className="absolute left-full ml-3 px-2.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap pointer-events-none z-50"
                    style={{
                      backgroundColor: 'hsl(var(--popover))',
                      color: 'hsl(var(--popover-foreground))',
                      boxShadow: '0 4px 12px rgb(0 0 0 / 0.15)',
                    }}
                  >
                    {item.label}
                  </div>
                )
              }
            </Link>
          );
        })
        }
      </nav >
    );

    // When noFixedWrapper=true, return just the nav (for use inside a parent container)
    if (noFixedWrapper) {
      return navElement;
    }

    // Default: wrap in fixed positioning container
    return (
      <div className="fixed top-0 left-0 bottom-0 z-40 flex items-center p-2">
        {navElement}
      </div>
    );
  }

  // ============================================================
  // RENDER: Mobile Bottom Nav
  // ============================================================
  return (
    <div id="bottom-nav-tutorial" className="fixed bottom-0 left-0 right-0 z-50 p-2">
      <nav
        ref={navRef}
        className={cn(
          "relative flex items-center justify-around rounded-full p-1 px-2 shadow-2xl shadow-black/20",
          isMobileCompact ? "h-10" : "h-16",
          isClearMode
            ? isLightClear ? "bg-card/60 ring-1 ring-black/10" : "bg-white/10 ring-1 ring-white/60"
            : "bg-card ring-1 ring-black/40",
          showGlow && "login-glow"
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
              id={index === 0 ? 'bottom-nav-explore-tutorial' : undefined}
              onMouseDown={(e) => handleMouseDown(e, index)}
              onClick={(e) => e.preventDefault()}
              className="z-10 flex-1 flex h-auto w-full flex-col items-center justify-center gap-1 rounded-full p-2"
              prefetch={true}
            >
              <div
                className={cn(
                  "flex flex-col items-center transition-all duration-300",
                  isActive
                    ? "text-primary-foreground"
                    : theme === "light"
                      ? "text-black"
                      : (isClearMode ? "text-slate-100" : "text-muted-foreground")
                )}
                style={{
                  transform: itemTransforms[index] || 'translateY(0px)',
                  transition: 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                <item.icon className={cn(isMobileCompact ? "h-3 w-3" : "h-6 w-6")} />
                <span className={cn(isMobileCompact ? "text-[8px]" : "text-xs", "font-medium")}>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
 