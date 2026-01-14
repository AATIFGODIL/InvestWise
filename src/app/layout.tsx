// InvestWise - A modern stock trading and investment education platform for young investors
import type { Metadata } from 'next';
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import ThemeProvider from "@/components/layout/theme-provider";
import "./globals.css";
import Script from "next/script";

import React from 'react';
import { AuthProvider } from '@/hooks/use-auth';
import LayoutContent from '@/components/layout/layout-content';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
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
      </body>
    </html>
  );
}
