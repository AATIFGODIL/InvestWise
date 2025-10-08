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
  const resizeObservers = useRef<ResizeObserver | null>(null);

  const [gliderStyle, setGliderStyle] = useState<CSSProperties>({
    opacity: 0,
  });
  const [animationState, setAnimationState] = useState<AnimationState>("idle");

  const currentPathIndex = navItems.findIndex((item) =>
    pathname.startsWith(item.href)
  );
  const [activeIndex, setActiveIndex] = useState<number>(
    currentPathIndex === -1 ? 0 : currentPathIndex
  );

  const [hasMounted, setHasMounted] = useState(false);

  const clearAllTimeouts = () => {
    timeouts.current.forEach((t) => clearTimeout(t));
    timeouts.current = [];
  };

  // Measure & set glider position for index
  const setGliderTo = (index: number, options: { immediate?: boolean } = {}) => {
    const navEl = navRef.current;
    const target = itemRefs.current[index];

    if (!navEl || !target) return false;

    const navRect = navEl.getBoundingClientRect();
    const itemRect = target.getBoundingClientRect();
    const left = itemRect.left - navRect.left;

    setGliderStyle({
      width: `${itemRect.width}px`,
      transform: `translateX(${left}px)`,
      opacity: 1,
      transition: options.immediate ? "none" : "transform 300ms ease, opacity 200ms ease",
      backgroundColor: "hsl(var(--primary))",
    });
    return true;
  };

  // Robust initial positioning: try RAF until items exist (but stop after a few tries)
  useEffect(() => {
    let tries = 0;
    let rafId = 0;

    const tryPosition = () => {
      tries += 1;
      const ok = setGliderTo(activeIndex, { immediate: true });
      if (!ok && tries < 10) {
        rafId = requestAnimationFrame(tryPosition);
      } else {
        setHasMounted(true);
      }
    };

    tryPosition();
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
    // intentionally only on mount/pathname change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [/* mount only; we do separate effects for resize and pathname */]);

  // Update activeIndex when pathname changes (handles browser back/forward)
  useEffect(() => {
    const idx = navItems.findIndex((item) => pathname.startsWith(item.href));
    setActiveIndex(idx === -1 ? 0 : idx);
    // After updating active index, attempt to move glider (use RAF to wait for layout)
    requestAnimationFrame(() => setGliderTo(idx === -1 ? 0 : idx, { immediate: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Use ResizeObserver to recompute whenever nav or any item size changes
  useEffect(() => {
    if (!navRef.current) return;
    // create one observer that watches nav and items
    const ro = new ResizeObserver(() => {
      // recompute glider position on resize/DOM size changes
      setGliderTo(activeIndex, { immediate: false });
    });
    resizeObservers.current = ro;

    ro.observe(navRef.current);
    itemRefs.current.forEach((el) => {
      if (el) ro.observe(el);
    });

    const onWindowResize = () => setGliderTo(activeIndex, { immediate: false });
    window.addEventListener("orientationchange", onWindowResize);
    window.addEventListener("resize", onWindowResize);

    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", onWindowResize);
      window.removeEventListener("resize", onWindowResize);
      resizeObservers.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMounted, activeIndex]);

  // Logging for deterministic console filtering
  useEffect(() => {
    const refsSnapshot = itemRefs.current.map((r) =>
      r ? (r.tagName?.toLowerCase() || r.nodeName || "node") : null
    );
    console.log("Current pathname:", pathname);
    console.log("Active index:", activeIndex);
    console.log("Refs array:", refsSnapshot);
    console.log(JSON.stringify({ pathname, activeIndex, refs: refsSnapshot }));
  }, [pathname, activeIndex]);

  // Click handler with animated glider sequence
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
    const startLeft = startRect.left - navRect.left;
    const endLeft = endRect.left - navRect.left;

    // 1. Rise
    setGliderStyle({
      width: `${startRect.width}px`,
      transform: `translateX(${startLeft}px) scale(1.08)`,
      backgroundColor: "rgba(255, 255, 255, 0.1)", // Match the frosted glass theme
      boxShadow: "0 10px 18px -6px rgb(0 0 0 / 0.22), 0 6px 10px -8px rgb(0 0 0 / 0.12)",
      opacity: 1,
      transition: "transform 140ms ease-out, background-color 140ms ease-out, box-shadow 140ms ease-out",
    });

    // 2. Slide
    timeouts.current.push(
      window.setTimeout(() => {
        setAnimationState("sliding");
        setGliderStyle((prev) => ({
          ...prev,
          width: `${endRect.width}px`,
          transform: `translateX(${endLeft}px) scale(1.08)`,
          transition:
            "transform 320ms cubic-bezier(0.22, 0.9, 0.35, 1), width 320ms cubic-bezier(0.22, 0.9, 0.35, 1)",
        }));
      }, 150)
    );

    // 3. Drop & navigate
    timeouts.current.push(
      window.setTimeout(() => {
        setAnimationState("descending");
        // push to route — do this before final style so route change can render new page
        router.push(navItems[newIndex].href);
        setGliderStyle((prev) => ({
          ...prev,
          transform: `translateX(${endLeft}px) scale(1)`,
          backgroundColor: "hsl(var(--primary))", // Return to solid primary color
          boxShadow: "0 4px 10px -2px rgb(0 0 0 / 0.12), 0 2px 6px -3px rgb(0 0 0 / 0.08)",
          transition: "transform 160ms ease-in, background-color 160ms ease-in, box-shadow 160ms ease-in",
        }));
      }, 470)
    );

    // 4. Finish
    timeouts.current.push(
      window.setTimeout(() => {
        setAnimationState("idle");
        setActiveIndex(newIndex);
        clearAllTimeouts();
      }, 640)
    );
  };

  // cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
      if (resizeObservers.current) resizeObservers.current.disconnect();
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
          className="absolute top-1 h-[calc(100%-8px)] rounded-full"
          style={{
            ...gliderStyle,
            visibility: hasMounted ? "visible" : "hidden",
          }}
        />

        {navItems.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <Link key={item.label} href={item.href} legacyBehavior prefetch={true}>
              <a
                onClick={(e) => handleNavClick(e as unknown as MouseEvent<HTMLAnchorElement>, index)}
                ref={(el) => {
                  itemRefs.current[index] = el as HTMLDivElement | null;
                }}
                className="z-10 flex-1"
                aria-current={isActive ? "page" : undefined}
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
              </a>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
