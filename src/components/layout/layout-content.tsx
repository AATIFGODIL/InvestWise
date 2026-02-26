// InvestWise - A modern stock trading and investment education platform for young investors
"use client";

import { usePathname } from 'next/navigation';
import { useAuth } from "@/hooks/use-auth";
import MainContent from "@/components/layout/main-content";
import MoneyRain from '@/components/shared/money-rain';
import PageSkeleton from '@/components/layout/page-skeleton';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import useUserData from '@/hooks/use-user-data';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useProModeStore } from '@/store/pro-mode-store';
import AppLogoIcon from '@/components/shared/app-logo-icon';
import Chatbot from '@/components/chatbot/chatbot';
import { useIsMobile } from '@/hooks/use-mobile';
import { Navigation } from 'lucide-react';
import { useThemeStore } from '@/store/theme-store';
import { cn } from '@/lib/utils';

// Dynamically import client-heavy components
const Header = dynamic(() => import('@/components/layout/header'), { ssr: false });
const BottomNav = dynamic(() => import('@/components/layout/bottom-nav'), { ssr: false });

const MOBILE_NAV_AUTO_HIDE_MS = 20000; // 20 seconds

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, hydrating } = useAuth();
  const [isRaining, setIsRaining] = useState(false);
  const { isProMode, isNavVisible, setIsNavVisible } = useProModeStore();
  const isMobile = useIsMobile();
  const { primaryColor, sidebarOrientation } = useThemeStore();

  // Desktop header: scroll-based collapse + hover expand
  const [isAtTop, setIsAtTop] = useState(true); // true when scroll is at the top
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const headerCollapseTimer = useRef<NodeJS.Timeout | null>(null);

  // The header is expanded if user is at the top of the page OR hovering the accent line
  const isHeaderExpanded = isAtTop || isHeaderHovered;

  // Mobile-specific nav visibility states
  const [isMobileHeaderVisible, setIsMobileHeaderVisible] = useState(false);
  const [isMobileBottomNavVisible, setIsMobileBottomNavVisible] = useState(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);

  // Floating dot expanded state (mobile bottom nav trigger)
  const [isDotExpanded, setIsDotExpanded] = useState(false);

  // Pro mode sidebar hover (collapse to line, expand on hover)
  const [isSideRailHovered, setIsSideRailHovered] = useState(false);
  const sideRailCollapseTimer = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide timers
  const headerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bottomNavTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Swipe detection
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const SWIPE_THRESHOLD = 50; // Minimum swipe distance in pixels

  useUserData(user);

  const isAuthOrOnboardingRoute = pathname.startsWith('/auth') || pathname.startsWith('/onboarding') || pathname === '/';
  const isSpecialLayoutRoute = pathname.startsWith('/profile') || pathname.startsWith('/settings') || pathname.startsWith('/certificate');

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (headerTimerRef.current) clearTimeout(headerTimerRef.current);
      if (bottomNavTimerRef.current) clearTimeout(bottomNavTimerRef.current);
      if (headerCollapseTimer.current) clearTimeout(headerCollapseTimer.current);
      if (sideRailCollapseTimer.current) clearTimeout(sideRailCollapseTimer.current);
    };
  }, []);

  // Track scroll position to auto-collapse header
  useEffect(() => {
    // Retry finding main-content since it may not be mounted yet
    const tryAttach = () => {
      const mainEl = document.getElementById('main-content');
      if (!mainEl) return null;
      const SCROLL_THRESHOLD = 60; // px before collapsing
      const handleScroll = () => {
        setIsAtTop(mainEl.scrollTop <= SCROLL_THRESHOLD);
      };
      mainEl.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // init
      return () => mainEl.removeEventListener('scroll', handleScroll);
    };

    // Try immediately
    let cleanup = tryAttach();

    // If main-content isn't in DOM yet, retry after a frame
    if (!cleanup) {
      const raf = requestAnimationFrame(() => {
        cleanup = tryAttach();
      });
      return () => {
        cancelAnimationFrame(raf);
        cleanup?.();
      };
    }

    return cleanup;
  }, [user, pathname]);

  // Desktop header hover handlers (for expanding when accent line is visible)
  const expandDesktopHeader = useCallback(() => {
    setIsHeaderHovered(true);
    if (headerCollapseTimer.current) clearTimeout(headerCollapseTimer.current);
  }, []);

  const collapseDesktopHeader = useCallback(() => {
    // Delay collapse slightly so user can interact
    if (headerCollapseTimer.current) clearTimeout(headerCollapseTimer.current);
    headerCollapseTimer.current = setTimeout(() => {
      setIsHeaderHovered(false);
    }, 400);
  }, []);

  // Pro mode side rail hover handlers
  const expandSideRail = useCallback(() => {
    setIsSideRailHovered(true);
    if (sideRailCollapseTimer.current) clearTimeout(sideRailCollapseTimer.current);
  }, []);

  const collapseSideRail = useCallback(() => {
    if (sideRailCollapseTimer.current) clearTimeout(sideRailCollapseTimer.current);
    sideRailCollapseTimer.current = setTimeout(() => {
      setIsSideRailHovered(false);
    }, 400);
  }, []);

  const showMobileHeader = useCallback(() => {
    setIsMobileHeaderVisible(true);
    // Clear existing timer
    if (headerTimerRef.current) clearTimeout(headerTimerRef.current);
    // Only set auto-hide timer if command menu is closed
    if (!isCommandMenuOpen) {
      headerTimerRef.current = setTimeout(() => {
        setIsMobileHeaderVisible(false);
      }, MOBILE_NAV_AUTO_HIDE_MS);
    }
  }, [isCommandMenuOpen]);

  const hideMobileHeader = useCallback(() => {
    setIsMobileHeaderVisible(false);
    if (headerTimerRef.current) clearTimeout(headerTimerRef.current);
  }, []);

  const showMobileBottomNav = useCallback(() => {
    setIsMobileBottomNavVisible(true);
    setIsDotExpanded(false);
    // Clear existing timer
    if (bottomNavTimerRef.current) clearTimeout(bottomNavTimerRef.current);
    // Set auto-hide timer
    bottomNavTimerRef.current = setTimeout(() => {
      setIsMobileBottomNavVisible(false);
    }, MOBILE_NAV_AUTO_HIDE_MS);
  }, []);

  const hideMobileBottomNav = useCallback(() => {
    setIsMobileBottomNavVisible(false);
    if (bottomNavTimerRef.current) clearTimeout(bottomNavTimerRef.current);
  }, []);

  // Handle command menu state changes - pause/resume timers
  const handleCommandMenuChange = useCallback((isOpen: boolean) => {
    setIsCommandMenuOpen(isOpen);
    if (isOpen) {
      // Pause timers when menu is open
      if (headerTimerRef.current) clearTimeout(headerTimerRef.current);
      if (bottomNavTimerRef.current) clearTimeout(bottomNavTimerRef.current);
    } else {
      // Resume timers when menu closes (start 20s countdown)
      if (isMobileHeaderVisible) {
        headerTimerRef.current = setTimeout(() => {
          setIsMobileHeaderVisible(false);
        }, MOBILE_NAV_AUTO_HIDE_MS);
      }
      if (isMobileBottomNavVisible) {
        bottomNavTimerRef.current = setTimeout(() => {
          setIsMobileBottomNavVisible(false);
        }, MOBILE_NAV_AUTO_HIDE_MS);
      }
    }
  }, [isMobileHeaderVisible, isMobileBottomNavVisible]);

  // Combined show/hide functions for swipe
  const showMobileNavs = useCallback(() => {
    showMobileHeader();
    showMobileBottomNav();
  }, [showMobileHeader, showMobileBottomNav]);

  const hideMobileNavs = useCallback(() => {
    hideMobileHeader();
    hideMobileBottomNav();
  }, [hideMobileHeader, hideMobileBottomNav]);

  // Swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = Math.abs(touchEndY - touchStartY.current);

    // Determine which half of the screen the swipe started in
    const screenHeight = window.innerHeight;
    const isTopHalf = touchStartY.current < screenHeight / 2;

    // Only register horizontal swipes (deltaY should be small relative to deltaX)
    if (Math.abs(deltaX) > SWIPE_THRESHOLD && deltaY < Math.abs(deltaX) * 0.5) {
      if (deltaX > 0) {
        // Swipe left-to-right: show bar
        if (isTopHalf) {
          showMobileHeader();
        } else {
          showMobileBottomNav();
        }
      } else {
        // Swipe right-to-left: hide bar
        if (isTopHalf) {
          hideMobileHeader();
        } else {
          hideMobileBottomNav();
        }
      }
    }
  }, [isMobile, showMobileHeader, showMobileBottomNav, hideMobileHeader, hideMobileBottomNav]);

  if (hydrating) {
    return (
      <div className="h-screen w-screen">
        <PageSkeleton />
      </div>
    );
  }

  const handleTriggerRain = () => {
    setIsRaining(true);
    setTimeout(() => setIsRaining(false), 5000);
  };

  // Determine visibility
  const shouldShowHeader = isMobile
    ? isMobileHeaderVisible
    : (!isSpecialLayoutRoute);

  const shouldShowBottomNav = isMobile
    ? isMobileBottomNavVisible
    : (!isSpecialLayoutRoute); // desktop: always show (full or accent line in pro mode)

  // In pro mode, sidebar is expanded only when hovered
  const isSideRailExpanded = !isProMode || isNavVisible || isSideRailHovered;

  // Show triggers when nav is hidden
  const shouldShowHeaderTrigger = isMobile && !isMobileHeaderVisible && !isSpecialLayoutRoute;
  const shouldShowBottomNavTrigger = isMobile && !isMobileBottomNavVisible && !isSpecialLayoutRoute;
  const shouldShowProModeTrigger = false; // replaced by accent line logic

  if (user && !isAuthOrOnboardingRoute) {
    return (
      <div className="flex flex-col h-screen relative" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {/* Desktop: Accent line + expandable header */}
        {!isMobile && !isSpecialLayoutRoute && (
          <div
            className="fixed top-0 left-0 right-0 z-50"
            onMouseEnter={expandDesktopHeader}
            onMouseLeave={collapseDesktopHeader}
          >
            {/* Accent line - always visible */}
            <div
              className="w-full transition-all duration-500 ease-in-out"
              style={{
                height: isHeaderExpanded ? '0px' : '6px',
                background: `hsl(var(--primary))`,
                opacity: isHeaderExpanded ? 0 : 1,
              }}
            />
            {/* Full header - expands on hover */}
            <AnimatePresence>
              {isHeaderExpanded && (
                <motion.div
                  key="desktop-header-expanded"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <Header onTriggerRain={handleTriggerRain} onCommandMenuChange={handleCommandMenuChange} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Mobile: Full header with slide animation */}
        <AnimatePresence>
          {isMobile && shouldShowHeader && (
            <motion.div
              key="header"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="fixed top-0 left-0 right-0 z-50 w-full"
            >
              <Header onTriggerRain={handleTriggerRain} isMobileCompact={isMobile} onHide={hideMobileHeader} onCommandMenuChange={handleCommandMenuChange} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop: Side Rail & Chatbot (with pro mode accent line collapse) */}
        {!isMobile && shouldShowBottomNav && (
          <div
            className={cn(
              "fixed inset-y-0 z-40 flex items-center",
              sidebarOrientation === 'right' ? "right-4" : "left-4"
            )}
            onMouseEnter={isProMode ? expandSideRail : undefined}
            onMouseLeave={isProMode ? collapseSideRail : undefined}
          >
            <div className="relative flex flex-col items-center justify-center gap-4">
              {/* Pro mode: accent line when collapsed */}
              {isProMode && (
                <div
                  className={cn(
                    "absolute inset-y-0 w-[6px] transition-all duration-300 z-50",
                    isSideRailExpanded ? "opacity-0" : "opacity-100 hover:w-[10px]",
                    sidebarOrientation === 'right' ? "-right-4" : "-left-4"
                  )}
                  style={{
                    background: `hsl(var(--primary))`,
                    boxShadow: sidebarOrientation === 'right' ? '-2px 0 8px hsl(var(--primary) / 0.3)' : '2px 0 8px hsl(var(--primary) / 0.3)',
                    borderRadius: sidebarOrientation === 'right' ? '4px 0 0 4px' : '0 4px 4px 0'
                  }}
                />
              )}

              {/* Keep contents mounted to give the container height, but hide them when collapsed */}
              <div
                className={cn(
                  "flex flex-col items-center gap-3 transition-all duration-300",
                  !isSideRailExpanded ? (sidebarOrientation === 'right' ? "translate-x-8 opacity-0 pointer-events-none" : "-translate-x-8 opacity-0 pointer-events-none") : "translate-x-0 opacity-100"
                )}
              >
                <div className="w-[80px] flex justify-center z-50">
                  <Chatbot isMobileCompact={false} />
                </div>
                <BottomNav isMobileCompact={false} noFixedWrapper />
              </div>
            </div>
          </div>
        )}

        <MainContent
          isSpecialLayoutRoute={isSpecialLayoutRoute || (isMobile && !isMobileHeaderVisible)}
          hasSideRail={!isMobile && shouldShowBottomNav && isSideRailExpanded && !isSpecialLayoutRoute}
          hasExpandedHeader={!isMobile && isHeaderExpanded && !isSpecialLayoutRoute}
          sidebarOrientation={sidebarOrientation}
        >
          {children}
        </MainContent>

        {/* Mobile: Bottom Nav */}
        <AnimatePresence>
          {isMobile && shouldShowBottomNav && (
            <motion.div
              key="bottom-nav"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="z-50 w-full fixed bottom-0 left-0"
            >
              <BottomNav isMobileCompact={isMobile} onHide={hideMobileBottomNav} />
            </motion.div>
          )}
        </AnimatePresence>

        <MoneyRain isActive={isRaining} />

        {/* Mobile Header Trigger (Top-Left) - accent line */}
        <AnimatePresence>
          {shouldShowHeaderTrigger && (
            <motion.div
              key="mobile-header-trigger"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed top-0 left-0 right-0 z-[60] cursor-pointer"
              onClick={showMobileHeader}
            >
              <div
                className="w-full h-[6px] transition-all duration-300 hover:h-3 hover:shadow-lg"
                style={{
                  background: `hsl(var(--primary))`,
                  boxShadow: '0 2px 8px hsl(var(--primary) / 0.3)',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Bottom Nav Trigger - Floating Dot */}
        <AnimatePresence>
          {shouldShowBottomNavTrigger && (
            <motion.div
              key="mobile-bottom-trigger"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60]"
            >
              <motion.div
                className="cursor-pointer"
                onHoverStart={() => setIsDotExpanded(true)}
                onHoverEnd={() => setIsDotExpanded(false)}
                onTap={() => {
                  if (isDotExpanded) {
                    showMobileBottomNav();
                  } else {
                    setIsDotExpanded(true);
                  }
                }}
              >
                <motion.div
                  className="flex items-center justify-center rounded-full shadow-lg ring-1 ring-white/30"
                  style={{
                    backgroundColor: 'hsl(var(--primary))',
                    backdropFilter: 'blur(12px)',
                  }}
                  animate={{
                    width: isDotExpanded ? 120 : 12,
                    height: isDotExpanded ? 40 : 12,
                    boxShadow: isDotExpanded
                      ? '0 8px 24px hsl(var(--primary) / 0.4)'
                      : '0 2px 8px hsl(var(--primary) / 0.3)',
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                >
                  <AnimatePresence>
                    {isDotExpanded && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-1.5"
                      >
                        <Navigation className="h-3.5 w-3.5 text-primary-foreground" />
                        <span className="text-[11px] font-semibold text-primary-foreground whitespace-nowrap">
                          Navigate
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pro Mode Trigger - replaced by accent line, no longer needed */}

        {/* Chatbot - mobile only (desktop handled above sidebar) */}
        {isMobile && (!isMobile || isMobileBottomNavVisible) && <Chatbot isMobileCompact={isMobile} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <MainContent disableScroll={true} isSpecialLayoutRoute={true}>{children}</MainContent>
      <MoneyRain isActive={isRaining} />
    </div>
  );
}
