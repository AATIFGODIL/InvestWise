
"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import ThemeProvider from "@/components/layout/theme-provider";
import BottomNav from "@/components/layout/bottom-nav";
import MainContent from "@/components/layout/main-content";
import "./globals.css";
import Script from "next/script";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import '../lib/firebase/config';
import { Loader2 } from 'lucide-react';
import useLoadingStore from '@/store/loading-store';
import Header from '@/components/layout/header';
import MoneyRain from '@/components/shared/money-rain';
import { useBottomNavStore } from '@/store/bottom-nav-store';
import RotateDevicePrompt from '@/components/shared/rotate-device-prompt';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
});

// Inner component to safely use hooks
function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, hydrating } = useAuth();
  const { hideLoading } = useLoadingStore();
  const [isRaining, setIsRaining] = useState(false);
  const samePageIndex = useBottomNavStore(state => state.samePageIndex);

  // This state will track if we are doing an "in-page" navigation on /trade
  const [isTradePageNavigation, setIsTradePageNavigation] = useState(false);

  const isAuthOrOnboardingRoute = pathname.startsWith('/auth') || pathname.startsWith('/onboarding');
  const isSpecialLayoutRoute = pathname.startsWith('/profile') || pathname.startsWith('/settings') || pathname.startsWith('/certificate');
  
  // A combined loading state for the main content area
  const isContentLoading = useLoadingStore(state => state.isLoading) || isTradePageNavigation;

  useEffect(() => {
    // If we receive a same-page navigation trigger, show the trade page loader
    if (samePageIndex !== null && pathname === '/trade') {
        setIsTradePageNavigation(true);
        // The main content area will now show a loader.
        // We'll reset this when the navigation is complete.
        // The `TradeClient` component's own useEffect will handle fetching new data.
        // We just need to hide the loader.
    }
  }, [samePageIndex, pathname]);

  useEffect(() => {
    // Standard loading hide effect
    hideLoading();

    // Reset trade page navigation flag after a short delay to allow UI to update
    if (isTradePageNavigation) {
        // This timer ensures that the loading state is visible for at least a moment,
        // even if the new data loads almost instantly.
        const timer = setTimeout(() => setIsTradePageNavigation(false), 50); 
        return () => clearTimeout(timer);
    }
  }, [pathname, searchParams, hideLoading, isTradePageNavigation]);

  useEffect(() => {
    if (!hydrating && !user && !isAuthOrOnboardingRoute) {
        router.push('/auth/signin');
    }
  }, [user, hydrating, isAuthOrOnboardingRoute, router]);

  const handleTriggerRain = () => {
    setIsRaining(true);
    setTimeout(() => setIsRaining(false), 5000); // Let it rain for 5 seconds
  };
  
  if (hydrating) {
    return (
       <div className="flex items-center justify-center h-screen w-full bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
       </div>
    );
  }
  
  // This layout is now simplified. The MainContent wrapper handles the loading state internally.
  if (user && pathname !== '/auth/welcome-back') {
       return (
        <div className="flex flex-col h-screen">
          {!isSpecialLayoutRoute && <Header onTriggerRain={handleTriggerRain} />}
          <MainContent isLoading={isContentLoading} isSpecialLayoutRoute={isSpecialLayoutRoute}>{children}</MainContent>
          {!isSpecialLayoutRoute && <BottomNav />}
          <MoneyRain isActive={isRaining} />
        </div>
      );
  }
  
  // This will handle the auth and onboarding routes which don't need the main layout
  if (isAuthOrOnboardingRoute || (user && pathname === '/auth/welcome-back')) {
      return (
          <div className="flex flex-col h-screen">
              <MainContent isLoading={false}>{children}</MainContent>
              <MoneyRain isActive={isRaining} />
          </div>
      );
  }
  
  return (
       <div className="flex items-center justify-center h-screen w-full">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
       </div>
    );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>InvestWise</title>
        <Script src="https://s3.tradingview.com/tv.js" strategy="beforeInteractive" />
      </head>
      <body className={`${poppins.variable} font-body antialiased`}>
        <svg className="absolute -z-10 h-0 w-0">
          <defs>
            <filter id="frosted">
              <feTurbulence type="fractalNoise" baseFrequency="0.02 0.08" numOctaves="4" seed="0" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" />
            </filter>
          </defs>
        </svg>
        <RotateDevicePrompt />
        <div id="root-container">
          <ThemeProvider>
            <AuthProvider>
              <LayoutContent>{children}</LayoutContent>
            </AuthProvider>
            <Toaster />
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
