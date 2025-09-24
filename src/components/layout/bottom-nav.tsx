
"use client";

import { Home, Briefcase, BarChart, Users, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, MouseEvent } from "react";

const navItems = [
  { href: "/dashboard", label: "Explore", icon: Home },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/trade", label: "Trade", icon: Repeat },
  { href: "/goals", label: "Goals", icon: BarChart },
  { href: "/community", label: "Community", icon: Users },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  
  const [gliderStyle, setGliderStyle] = useState<React.CSSProperties>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [previousActiveIndex, setPreviousActiveIndex] = useState(0);

  useEffect(() => {
    // Set the initial position of the glider without animation on the first load.
    const activeIndex = navItems.findIndex((item) => pathname.startsWith(item.href));
    if (activeIndex !== -1 && itemRefs.current[activeIndex]) {
      const activeItem = itemRefs.current[activeIndex]!;
      const { offsetWidth, offsetLeft } = activeItem;
      setGliderStyle({
        width: `${offsetWidth}px`,
        transform: `translateX(${offsetLeft}px)`,
        transition: "none", // No transition on initial set
      });
      setPreviousActiveIndex(activeIndex);
      // Use a timeout to enable transitions for subsequent user interactions
      setTimeout(() => setIsInitialLoad(false), 500);
    }
  }, [pathname]);

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, newIndex: number) => {
    if (isInitialLoad || newIndex === previousActiveIndex) return;

    e.preventDefault();
    
    const startItem = itemRefs.current[previousActiveIndex];
    const endItem = itemRefs.current[newIndex];

    if (!startItem || !endItem) return;

    const startRect = startItem.getBoundingClientRect();
    const endRect = endItem.getBoundingClientRect();
    
    // --- Animation Sequence ---
    
    // 1. Rise and Fade
    setGliderStyle({
      ...gliderStyle,
      transform: `translateX(${startRect.left}px) translateY(-20px)`,
      backgroundColor: 'hsla(var(--primary) / 0.3)',
      backdropFilter: 'blur(10px)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease, backdrop-filter 0.3s ease',
    });

    // 2. Slide to new position (while risen)
    setTimeout(() => {
      setGliderStyle(prevStyle => ({
        ...prevStyle,
        width: `${endRect.width}px`,
        transform: `translateX(${endRect.left}px) translateY(-20px)`,
        transition: 'transform 0.5s cubic-bezier(0.65, 0, 0.35, 1), width 0.5s cubic-bezier(0.65, 0, 0.35, 1), background-color 0.3s ease, backdrop-filter 0.3s ease',
      }));
    }, 300); // Wait for rise to complete

    // 3. Descend and solidify
    setTimeout(() => {
      setGliderStyle(prevStyle => ({
        ...prevStyle,
        transform: `translateX(${endRect.left}px) translateY(0px)`,
        backgroundColor: 'hsl(var(--primary))',
        backdropFilter: 'blur(0px)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease, backdrop-filter 0.3s ease',
      }));

      // Navigate after the animation is mostly complete
      router.push(endItem.href);
      setPreviousActiveIndex(newIndex);
    }, 800); // Wait for slide to complete
  };

  const activeIndex = navItems.findIndex((item) => pathname.startsWith(item.href));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2">
      <nav ref={navRef} className="relative flex h-16 items-center justify-around rounded-full bg-background/70 p-1 shadow-lg ring-1 ring-black/5">
        
        {/* The Liquid Glider */}
        <div
          className="absolute top-1 h-[calc(100%-8px)] rounded-full bg-primary shadow-lg border border-primary-foreground/10"
          style={gliderStyle}
        />

        {navItems.map((item, index) => {
          const isActive = activeIndex === index;
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
