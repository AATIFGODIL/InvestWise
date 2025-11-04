
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
import dynamic from 'next/dynamic';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
});

// Dynamically import the main layout content to ensure it's client-side only
const LayoutContent = dynamic(() => import('@/components/layout/layout-content'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen">
      <PageSkeleton />
    </div>
  ),
});


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
