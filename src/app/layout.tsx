
"use client";

import { usePathname } from 'next/navigation';
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import ThemeProvider from "@/components/layout/theme-provider";
import BottomNav from "@/components/layout/bottom-nav";
import MainContent from "@/components/layout/main-content";
import "./globals.css";
import Script from "next/script";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import '../lib/firebase/config';
import Header from '@/components/layout/header';
import MoneyRain from '@/components/shared/money-rain';
import RotateDevicePrompt from '@/components/shared/rotate-device-prompt';
import React from 'react';
import PageSkeleton from '@/components/layout/page-skeleton';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
});

// Inner component to safely use hooks
function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, hydrating } = useAuth();
  const [isRaining, setIsRaining] = React.useState(false);

  const isAuthRoute = pathname.startsWith('/auth') || pathname === '/';
  const isSpecialLayoutRoute = pathname.startsWith('/profile') || pathname.startsWith('/settings') || pathname.startsWith('/certificate');
  
  if (hydrating) {
    return <PageSkeleton />;
  }
  
  const handleTriggerRain = () => {
    setIsRaining(true);
    setTimeout(() => setIsRaining(false), 5000); // Let it rain for 5 seconds
  };
  
  // Render layout based on user auth state and route
  if (user && !isAuthRoute) {
       return (
        <div className="flex flex-col h-screen">
          {!isSpecialLayoutRoute && <Header onTriggerRain={handleTriggerRain} />}
          <MainContent isSpecialLayoutRoute={isSpecialLayoutRoute}>{children}</MainContent>
          {!isSpecialLayoutRoute && <BottomNav />}
          <MoneyRain isActive={isRaining} />
        </div>
      );
  }
  
  // This handles all unauthenticated routes
  return (
      <div className="flex flex-col h-screen">
          <MainContent>{children}</MainContent>
          <MoneyRain isActive={isRaining} />
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
