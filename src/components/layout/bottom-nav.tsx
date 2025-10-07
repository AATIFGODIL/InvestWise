
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

type AnimationState = "idle" | "animating";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const gliderEl = useRef<HTMLDivElement | null>(null);

  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const [gliderStyle, setGliderStyle] = useState<CSSProperties>({ opacity: 0 });
  const [activeIndex, setActiveIndex] = useState(-1);
  const animState = useRef<AnimationState>("idle");

  // helper to clear rAF/timeouts
  const clearScheduled = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Utility: compute placement for a given item rect given a target width (maxWidth).
  const computeOffsets = (navRect: DOMRect, itemRect: DOMRect, maxWidth: number) => {
    // we keep the glider width as `maxWidth` and center the scaled element above the item
    const left = itemRect.left - navRect.left + (itemRect.width - maxWidth) / 2;
    return left;
  };

  // Sync glider when pathname changes. This uses a snap (no width transition) so there's no "gap".
  useLayoutEffect(() => {
    const currentPathIndex = navItems.findIndex((item) => pathname.startsWith(item.href));
    if (currentPathIndex === -1) {
      setGliderStyle((prev) => ({ ...prev, opacity: 0 }));
      setActiveIndex(-1);
      return;
    }

    const activeItem = itemRefs.current[currentPathIndex];
    const navEl = navRef.current;
    if (!activeItem || !navEl) {
      // try again a few frames if refs aren't ready
      let tries = 0;
      const tryAgain = () => {
        const a = itemRefs.current[currentPathIndex];
        const n = navRef.current;
        if (a && n) {
          const navRect = n.getBoundingClientRect();
          const itemRect = a.getBoundingClientRect();
          setGliderStyle({
            width: `${itemRect.width}px`,
            transform: `translateX(${itemRect.left - navRect.left}px) scaleX(1)`,
            backgroundColor: "hsl(var(--primary))",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
            opacity: 1,
            transition: "transform 220ms ease, opacity 150ms ease",
            backdropFilter: "blur(0px)",
          });
          setActiveIndex(currentPathIndex);
          return;
        }
        tries += 1;
        if (tries < 6) requestAnimationFrame(tryAgain);
      };
      requestAnimationFrame(tryAgain);
      return;
    }

    const navRect = navEl.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();

    // snap to exact width & position
    setGliderStyle({
      width: `${itemRect.width}px`,
      transform: `translateX(${itemRect.left - navRect.left}px) scaleX(1)`,
      backgroundColor: "hsl(var(--primary))",
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      opacity: 1,
      transition: "transform 220ms ease, opacity 150ms ease",
      backdropFilter: "blur(0px)",
    });

    setActiveIndex(currentPathIndex);
    // ensure any scheduled frames/timeouts cleared
    clearScheduled();

    return () => {
      clearScheduled();
    };
  }, [pathname]);

  // handle click: navigate immediately, but animate glider using transform + scaleX to avoid width-transition gaps
  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, newIndex: number) => {
    e.preventDefault();
    if (animState.current === "animating") return; // prevent spamming

    const navEl = navRef.current;
    const endItem = itemRefs.current[newIndex];
    if (!navEl || !endItem) {
      // fallback: immediate navigation
      router.push(navItems[newIndex].href);
      return;
    }

    const navRect = navEl.getBoundingClientRect();
    const endRect = endItem.getBoundingClientRect();

    // determine start rect (if we have one), otherwise use endRect
    let startRect = endRect;
    if (activeIndex !== -1) {
      const s = itemRefs.current[activeIndex];
      if (s) startRect = s.getBoundingClientRect();
    }

    // compute a stable "container" width so we animate scaleX rather than width
    const maxWidth = Math.max(startRect.width, endRect.width);
    const startScale = startRect.width / maxWidth;
    const endScale = endRect.width / maxWidth;

    const startLeft = computeOffsets(navRect, startRect, maxWidth);
    const endLeft = computeOffsets(navRect, endRect, maxWidth);

    // place the glider at the start position with NO transition
    setGliderStyle({
      width: `${maxWidth}px`,
      transform: `translateX(${startLeft}px) scaleX(${startScale})`,
      backgroundColor: "hsl(var(--primary) / 0.95)",
      boxShadow: "0 10px 20px -6px rgb(0 0 0 / 0.25)",
      opacity: 1,
      transition: "none",
      backdropFilter: "blur(2px)",
    });

    // navigate immediately (per request)
    router.push(navItems[newIndex].href);

    // schedule the animated transform on the next frame so the browser picks up the initial state
    animState.current = "animating";
    setActiveIndex(newIndex); // optimistically set active for visual state

    rafRef.current = requestAnimationFrame(() => {
      // apply transition & final transform
      setGliderStyle((prev) => ({
        ...prev,
        transition: "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
        transform: `translateX(${endLeft}px) scaleX(${endScale})`,
        backdropFilter: "blur(0px)",
        backgroundColor: "hsl(var(--primary))",
      }));

      // clear anim state after transition duration
      timeoutRef.current = window.setTimeout(() => {
        animState.current = "idle";
        timeoutRef.current = null;
      }, 360);
    });
  };

  // cleanup on unmount
  useLayoutEffect(() => {
    return () => {
      clearScheduled();
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
          ref={gliderEl}
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
