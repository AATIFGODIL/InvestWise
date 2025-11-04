"use client";

import { usePathname } from 'next/navigation';
import { useAuth } from "@/hooks/use-auth";
import MainContent from "@/components/layout/main-content";
import MoneyRain from '@/components/shared/money-rain';
import PageSkeleton from '@/components/layout/page-skeleton';
import React from 'react';
import useUserData from '@/hooks/use-user-data';
import dynamic from 'next/dynamic';

// Dynamically import client-heavy components
const Header = dynamic(() => import('@/components/layout/header'), { ssr: false });
const BottomNav = dynamic(() => import('@/components/layout/bottom-nav'), { ssr: false });


export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, hydrating } = useAuth();
  const [isRaining, setIsRaining] = React.useState(false);
  
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
