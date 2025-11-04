
"use client";

import { usePathname } from 'next/navigation';
import { useAuth } from "@/hooks/use-auth";
import Header from '@/components/layout/header';
import BottomNav from "@/components/layout/bottom-nav";
import MainContent from "@/components/layout/main-content";
import MoneyRain from '@/components/shared/money-rain';
import PageSkeleton from '@/components/layout/page-skeleton';
import React from 'react';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, hydrating } = useAuth();
  const [isRaining, setIsRaining] = React.useState(false);

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
    setTimeout(() => setIsRaining(false), 5000); // Let it rain for 5 seconds
  };
  
  if (user && !isAuthOrOnboardingRoute) {
       return (
        <div className="flex flex-col h-screen">
          {!isSpecialLayoutRoute && <Header onTriggerRain={handleTriggerRain} />}
          <MainContent isSpecialLayoutRoute={isSpecialLayoutRoute}>{children}</MainContent>
          {!isSpecialLayoutRoute && <BottomNav />}
          <MoneyRain isActive={isRaining} />
        </div>
      );
  }
  
  return (
      <div className="flex flex-col h-screen">
          <MainContent disableScroll={true}>{children}</MainContent>
          <MoneyRain isActive={isRaining} />
      </div>
  );
}
