// InvestWise - A modern stock trading and investment education platform for young investors
import type { Metadata } from 'next';
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import ThemeProvider from "@/components/layout/theme-provider";
import "./globals.css";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

import React from 'react';
import { AuthProvider } from '@/hooks/use-auth';
import LayoutContent from '@/components/layout/layout-content';

// 500/600/800 are for the marketing landing page, which builds its hierarchy
// from weight as much as from size. The app itself still only reaches for
// 400 and 700.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: 'InvestWise',
  description: 'Your personal investment journey.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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

        <div id="root-container">
          <ThemeProvider>
            <AuthProvider>
              <LayoutContent>{children}</LayoutContent>
            </AuthProvider>
            <Toaster />
          </ThemeProvider>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
