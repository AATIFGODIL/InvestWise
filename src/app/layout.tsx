
"use client";

import { usePathname, useRouter } from 'next/navigation';
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

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
});

// Inner component to safely use hooks
function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hydrating } = useAuth();
  const { isLoading, hideLoading } = useLoadingStore();
  const [isRaining, setIsRaining] = useState(false);

  const isAuthOrOnboardingRoute = pathname.startsWith('/auth') || pathname.startsWith('/onboarding');
  const isSpecialLayoutRoute = pathname.startsWith('/profile') || pathname.startsWith('/settings') || pathname.startsWith('/certificate');
  
  // Hide loading overlay once navigation is complete
  useEffect(() => {
    hideLoading();
  }, [pathname, hideLoading]);

  useEffect(() => {
    if (!hydrating && !user && !isAuthOrOnboardingRoute) {
        router.push('/auth/signin');
    }
  }, [user, hydrating, isAuthOrOnboardingRoute, router]);

  const handleTriggerRain = () => {
    setIsRaining(true);
    setTimeout(() => setIsRaining(false), 5000); // Let it rain for 5 seconds
  };
  
  if (hydrating || isLoading) {
    return (
       <div className="flex items-center justify-center h-screen w-full bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
       </div>
    );
  }
  
  if ((user && isSpecialLayoutRoute) || isAuthOrOnboardingRoute) {
      return (
        <div className="flex flex-col h-screen">
          <MainContent>{children}</MainContent>
          <MoneyRain isActive={isRaining} />
        </div>
      );
  }
  
  if (user) {
       return (
        <div className="flex flex-col h-screen">
          <Header onTriggerRain={handleTriggerRain} />
          <MainContent>{children}</MainContent>
          <BottomNav />
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
        <ThemeProvider>
          <AuthProvider>
            <LayoutContent>{children}</LayoutContent>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
