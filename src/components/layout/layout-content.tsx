"use client";

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from "@/hooks/use-auth";
import MainContent from "@/components/layout/main-content";
import MoneyRain from '@/components/shared/money-rain';
import PageSkeleton from '@/components/layout/page-skeleton';
import React from 'react';
import useUserData from '@/hooks/use-user-data';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useProModeStore } from '@/store/pro-mode-store';
import AppLogoIcon from '@/components/shared/app-logo-icon';

// Dynamically import client-heavy components
const Header = dynamic(() => import('@/components/layout/header'), { ssr: false });
const BottomNav = dynamic(() => import('@/components/layout/bottom-nav'), { ssr: false });


export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, hydrating } = useAuth();
  const [isRaining, setIsRaining] = React.useState(false);
  const { isProMode, isNavVisible, setIsNavVisible } = useProModeStore();

  useUserData(user);

  const isAuthOrOnboardingRoute = pathname.startsWith('/auth') || pathname.startsWith('/onboarding') || pathname === '/';

  const isSpecialLayoutRoute = pathname.startsWith('/profile') || pathname.startsWith('/settings') || pathname.startsWith('/certificate');

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

  if (user && !isAuthOrOnboardingRoute) {
    return (
      <div className="flex flex-col h-screen relative">
        <AnimatePresence>
          {(!isSpecialLayoutRoute && (!isProMode || isNavVisible)) && (
            <motion.div
              key="header"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="fixed top-0 left-0 right-0 z-50 w-full"
            >
              <Header onTriggerRain={handleTriggerRain} />
            </motion.div>
          )}
        </AnimatePresence>

        <MainContent isSpecialLayoutRoute={isSpecialLayoutRoute || (isProMode && !isNavVisible)}>
          {children}
        </MainContent>

        <AnimatePresence>
          {(!isSpecialLayoutRoute && (!isProMode || isNavVisible)) && (
            <motion.div
              key="bottom-nav"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="z-50 w-full fixed bottom-0 left-0"
            >
              <BottomNav />
            </motion.div>
          )}
        </AnimatePresence>

        <MoneyRain isActive={isRaining} />

        {/* Pro Mode Triggers */}
        <AnimatePresence>
          {(isProMode && !isNavVisible) && (
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
