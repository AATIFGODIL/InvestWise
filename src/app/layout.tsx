
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import ThemeProvider from "@/components/layout/theme-provider";
import BottomNav from "@/components/layout/bottom-nav";
import MainContent from "@/components/layout/main-content";
import "./globals.css";
import Script from "next/script";

// This import will initialize Firebase on the client side.
// The config file itself ensures client-only features run only in the browser.
import '../lib/firebase/config';


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "InvestWise",
  description: "InvestWise - Your friendly guide to investing.",
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
        <ThemeProvider>
          <MainContent>
            {children}
          </MainContent>
          <Toaster />
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
