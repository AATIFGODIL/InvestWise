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
  const { primaryColor } = useThemeStore();

  // Mobile-specific nav visibility states
  const [isMobileHeaderVisible, setIsMobileHeaderVisible] = useState(false);
  const [isMobileBottomNavVisible, setIsMobileBottomNavVisible] = useState(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);

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
    };
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
  // On mobile: bars are hidden by default, shown via triggers
  // On desktop: bars shown unless Pro Mode is active and nav is hidden
  const shouldShowHeader = isMobile
    ? isMobileHeaderVisible
    : (!isSpecialLayoutRoute && (!isProMode || isNavVisible));

  const shouldShowBottomNav = isMobile
    ? isMobileBottomNavVisible
    : (!isSpecialLayoutRoute && (!isProMode || isNavVisible));

  // Show triggers when nav is hidden
  const shouldShowHeaderTrigger = isMobile && !isMobileHeaderVisible && !isSpecialLayoutRoute;
  const shouldShowBottomNavTrigger = isMobile && !isMobileBottomNavVisible && !isSpecialLayoutRoute;
  const shouldShowProModeTrigger = !isMobile && isProMode && !isNavVisible;

  if (user && !isAuthOrOnboardingRoute) {
    return (
      <div className="flex flex-col h-screen relative" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {/* Header */}
        <AnimatePresence>
          {shouldShowHeader && (
            <motion.div
              key="header"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="fixed top-0 left-0 right-0 z-50 w-full"
            >
              <Header onTriggerRain={handleTriggerRain} isMobileCompact={isMobile} onHide={isMobile ? hideMobileHeader : undefined} onCommandMenuChange={isMobile ? handleCommandMenuChange : undefined} />
            </motion.div>
          )}
        </AnimatePresence>

        <MainContent isSpecialLayoutRoute={isSpecialLayoutRoute || (isProMode && !isNavVisible) || (isMobile && !isMobileHeaderVisible)}>
          {children}
        </MainContent>

        {/* Bottom Nav */}
        <AnimatePresence>
          {shouldShowBottomNav && (
            <motion.div
              key="bottom-nav"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="z-50 w-full fixed bottom-0 left-0"
            >
              <BottomNav isMobileCompact={isMobile} onHide={isMobile ? hideMobileBottomNav : undefined} />
            </motion.div>
          )}
        </AnimatePresence>

        <MoneyRain isActive={isRaining} />

        {/* Mobile Header Trigger (Top-Left) */}
        <AnimatePresence>
          {shouldShowHeaderTrigger && (
            <motion.div
              key="mobile-header-trigger"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed top-4 left-4 z-[60] cursor-pointer group"
              onClick={showMobileHeader}
            >
              <div className="relative h-8 w-8 overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-110 shadow-lg shadow-purple-500/20 bg-white/10 backdrop-blur-sm p-1.5">
                <AppLogoIcon className="h-full w-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Bottom Nav + AI Trigger (Bottom-Left) */}
        <AnimatePresence>
          {shouldShowBottomNavTrigger && (
            <motion.div
              key="mobile-bottom-trigger"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed bottom-4 left-4 z-[60] cursor-pointer group"
              onClick={showMobileBottomNav}
            >
              {/* Outer ring matching bottom nav style */}
              <div
                className="relative h-10 w-10 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg ring-1 ring-white/60"
                style={{
                  backgroundColor: 'hsl(var(--card) / 0.6)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                {/* Inner circle with primary/secondary color */}
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `hsl(var(--primary))` }}
                >
                  <Navigation className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pro Mode Trigger (Desktop only) */}
        <AnimatePresence>
          {shouldShowProModeTrigger && (
            <motion.div
              key="pro-trigger"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed top-4 left-4 z-[60] cursor-pointer group"
              onClick={() => setIsNavVisible(true)}
            >
              <div className="relative h-10 w-10 overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-110 shadow-lg shadow-purple-500/20 bg-white/10 backdrop-blur-sm p-2">
                <AppLogoIcon className="h-full w-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chatbot - Only show when bottom nav is visible on mobile */}
        {(!isMobile || isMobileBottomNavVisible) && <Chatbot isMobileCompact={isMobile} />}
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
