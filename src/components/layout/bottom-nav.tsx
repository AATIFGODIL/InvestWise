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

  const [gliderStyle, setGliderStyle] = useState<CSSProperties>({ opacity: 0 });
  const [animationState, setAnimationState] = useState<AnimationState>("idle");
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const currentPathIndex = navItems.findIndex((item) => pathname.startsWith(item.href));
    
    if (currentPathIndex !== -1 && itemRefs.current[currentPathIndex]) {
      const activeItem = itemRefs.current[currentPathIndex]!;
      const navRect = navRef.current!.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      
      if (itemRect.width === 0) return;

      const left = itemRect.left - navRect.left;

      setGliderStyle({
        width: `${itemRect.width}px`,
        transform: `translateX(${left}px) scale(1)`,
        backgroundColor: 'hsl(var(--primary))',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        opacity: 1, 
        transition: 'opacity 150ms ease-in-out', 
      });
      setActiveIndex(currentPathIndex);
    }
  }, [pathname]);

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, newIndex: number) => {
    e.preventDefault();
    if (newIndex === activeIndex || animationState !== "idle" || activeIndex === -1) return;

    const startItem = itemRefs.current[activeIndex];
    const endItem = itemRefs.current[newIndex];
    if (!startItem || !endItem || !navRef.current) return;

    const navRect = navRef.current.getBoundingClientRect();
    const startRect = startItem.getBoundingClientRect();
    const endRect = endItem.getBoundingClientRect();
    const startLeft = startRect.left - navRect.left;
    const endLeft = endRect.left - navRect.left;
    
    setAnimationState("rising");
    setGliderStyle({ ...gliderStyle, transition: 'transform 150ms ease-out, background-color 150ms ease-out, box-shadow 150ms ease-out', transform: `translateX(${startLeft}px) scale(1.1)`, backgroundColor: 'hsl(var(--primary) / 0.5)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.1)', });
    
    setTimeout(() => {
      setAnimationState("sliding");
      setGliderStyle({ width: `${endRect.width}px`, transition: 'transform 300ms cubic-bezier(0.65, 0, 0.35, 1)', transform: `translateX(${endLeft}px) scale(1.1)`, backgroundColor: 'hsl(var(--primary) / 0.5)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.1)', });
    }, 150);

    setTimeout(() => {
      setAnimationState("descending");
      setGliderStyle({ width: `${endRect.width}px`, transition: 'transform 150ms ease-in, background-color 150ms ease-in, box-shadow 150ms ease-in', transform: `translateX(${endLeft}px) scale(1)`, backgroundColor: 'hsl(var(--primary))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', });
    }, 450);

    setTimeout(() => {
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