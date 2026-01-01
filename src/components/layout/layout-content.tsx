"use client";

import { usePathname } from 'next/navigation';
import { useAuth } from "@/hooks/use-auth";
import MainContent from "@/components/layout/main-content";
import MoneyRain from '@/components/shared/money-rain';
import PageSkeleton from '@/components/layout/page-skeleton';
import React from 'react';
import useUserData from '@/hooks/use-user-data';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useProModeStore } from '@/store/pro-mode-store';

// Dynamically import client-heavy components
const Header = dynamic(() => import('@/components/layout/header'), { ssr: false });
const BottomNav = dynamic(() => import('@/components/layout/bottom-nav'), { ssr: false });


export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, hydrating } = useAuth();
  const [isRaining, setIsRaining] = React.useState(false);
  const { isProMode } = useProModeStore();
  const [tempNavVisible, setTempNavVisible] = React.useState(false);

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
          {(!isSpecialLayoutRoute && (!isProMode || tempNavVisible)) && (
            <motion.div
              key="header"
              initial={{ x: -100, opacity: 0, filter: "blur(10px)" }}
              animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ x: -100, opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="z-50 w-full"
            >
              <Header onTriggerRain={handleTriggerRain} />
            </motion.div>
          )}
        </AnimatePresence>

        <MainContent isSpecialLayoutRoute={isSpecialLayoutRoute || isProMode}>
          {children}
        </MainContent>

        <AnimatePresence>
          {(!isSpecialLayoutRoute && (!isProMode || tempNavVisible)) && (
            <motion.div
              key="bottom-nav"
              initial={{ x: -100, opacity: 0, filter: "blur(10px)" }}
              animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ x: -100, opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="z-50 w-full fixed bottom-0 left-0"
            >
              <BottomNav />
            </motion.div>
          )}
        </AnimatePresence>

        <MoneyRain isActive={isRaining} />

        {/* Pro Mode Triggers */}
        {isProMode && (
          <>
            <div
              className="fixed top-0 left-0 w-16 h-16 z-[60] cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => setTempNavVisible(!tempNavVisible)}
              title="Toggle Navigation"
            />
            <div
              className="fixed bottom-0 right-0 w-16 h-16 z-[60] cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => setTempNavVisible(!tempNavVisible)}
              title="Toggle Navigation"
            />
          </>
        )}
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
