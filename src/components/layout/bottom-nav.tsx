
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

  const [gliderStyle, setGliderStyle] = useState<CSSProperties>({});
  const [animationState, setAnimationState] = useState<AnimationState>("idle");
  
  const [initialActiveIndex, setInitialActiveIndex] = useState(() => 
    navItems.findIndex((item) => pathname.startsWith(item.href))
  );
  const [previousActiveIndex, setPreviousActiveIndex] = useState(initialActiveIndex);

  useEffect(() => {
    // This effect sets the initial position of the glider when the component mounts.
    // It runs only once and does not interfere with click-driven animations.
    const activeIndex = navItems.findIndex((item) => pathname.startsWith(item.href));
    if (activeIndex !== -1 && itemRefs.current[activeIndex]) {
      const activeItem = itemRefs.current[activeIndex]!;
      const navRect = navRef.current!.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      const left = itemRect.left - navRect.left;

      setGliderStyle({
        width: `${itemRect.width}px`,
        transform: `translateX(${left}px) scale(1)`,
        backgroundColor: 'hsl(var(--primary))',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      });
      setInitialActiveIndex(activeIndex);
      setPreviousActiveIndex(activeIndex);
    }
  }, [pathname]); // Depend on pathname to correctly set the bar on page reload/direct navigation

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, newIndex: number) => {
    e.preventDefault();
    if (newIndex === previousActiveIndex || animationState !== "idle") {
      return;
    }

    const startItem = itemRefs.current[previousActiveIndex];
    const endItem = itemRefs.current[newIndex];
    if (!startItem || !endItem || !navRef.current) return;

    const navRect = navRef.current.getBoundingClientRect();
    const startRect = startItem.getBoundingClientRect();
    const endRect = endItem.getBoundingClientRect();

    const startLeft = startRect.left - navRect.left;
    const endLeft = endRect.left - navRect.left;
    
    // 1. Rise Animation
    setAnimationState("rising");
    setGliderStyle({
      ...gliderStyle,
      transition: 'transform 150ms ease-out, background-color 150ms ease-out, box-shadow 150ms ease-out',
      transform: `translateX(${startLeft}px) scale(1.1)`,
      backgroundColor: 'hsl(var(--primary) / 0.5)',
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    });

    // 2. Slide Animation
    setTimeout(() => {
      setAnimationState("sliding");
      setGliderStyle({
        ...gliderStyle,
        width: `${endRect.width}px`,
        transition: 'transform 300ms cubic-bezier(0.65, 0, 0.35, 1)',
        transform: `translateX(${endLeft}px) scale(1.1)`,
        backgroundColor: 'hsl(var(--primary) / 0.5)',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      });
    }, 150); // Wait for rise to complete

    // 3. Descend Animation
    setTimeout(() => {
      setAnimationState("descending");
      setGliderStyle({
        ...gliderStyle,
        width: `${endRect.width}px`,
        transition: 'transform 150ms ease-in, background-color 150ms ease-in, box-shadow 150ms ease-in',
        transform: `translateX(${endLeft}px) scale(1)`,
        backgroundColor: 'hsl(var(--primary))',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      });
    }, 450); // Wait for slide to complete

    // 4. Reset state and navigate
    setTimeout(() => {
      setAnimationState("idle");
      router.push(endItem.href);
      setPreviousActiveIndex(newIndex);
    }, 600); // Wait for descend to complete
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2">
      <nav 
        ref={navRef} 
        className="relative flex h-16 items-center justify-around rounded-full bg-background/70 p-1 shadow-lg ring-1 ring-black/5"
      >
        <div
          className="absolute top-1 h-[calc(100%-8px)] rounded-full border-primary-foreground/10"
          style={{
            ...gliderStyle,
            backdropFilter: 'blur(4px)',
          }}
        />

        {navItems.map((item, index) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              ref={(el) => (itemRefs.current[index] = el)}
              onClick={(e) => handleNavClick(e, index)}
              className="flex-1 z-10"
              prefetch={true}
            >
              <div
                className={cn(
                  "flex h-auto w-full flex-col items-center justify-center gap-1 p-2 rounded-full transition-all duration-300 ease-in-out",
                   isActive && animationState === "idle"
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

    