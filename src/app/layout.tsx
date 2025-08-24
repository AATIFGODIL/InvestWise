
"use client";

import { usePathname } from 'next/navigation';
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import ThemeProvider from "@/components/layout/theme-provider";
import BottomNav from "@/components/layout/bottom-nav";
import MainContent from "@/components/layout/main-content";
import "./globals.css";
import Script from "next/script";
import { AuthProvider } from "@/hooks/use-auth";


// This import will initialize Firebase on the client side.
// The config file itself ensures client-only features run only in the browser.
import '../lib/firebase/config';


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const showBottomNav = !pathname.startsWith('/auth') && !pathname.startsWith('/onboarding') && pathname !== '/certificate';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>InvestWise</title>
        <Script src="https://s3.tradingview.com/tv.js" strategy="beforeInteractive" />
      </head>
      <body className={`${poppins.variable} font-body antialiased`}>
        <ThemeProvider>
          <div className="flex flex-col h-screen">
            <AuthProvider>
              <MainContent>
                {children}
              </MainContent>
            </AuthProvider>
            {showBottomNav && <BottomNav />}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
