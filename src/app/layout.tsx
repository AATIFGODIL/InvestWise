
"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import ThemeProvider from "@/components/layout/theme-provider";
import BottomNav from "@/components/layout/bottom-nav";
import MainContent from "@/components/layout/main-content";
import "./globals.css";
import Script from "next/script";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import '../lib/firebase/config';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
});

// Inner component to safely use the useAuth hook
function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect logic based on authentication status and path
  if (!loading && !user && !pathname.startsWith('/auth') && !pathname.startsWith('/onboarding')) {
      router.push('/auth/signin');
  } else if (!loading && user && (pathname === '/auth/signin' || pathname === '/auth/signup')) {
      router.push('/dashboard');
  }

  const showBottomNav = !pathname.startsWith('/auth') && !pathname.startsWith('/onboarding');

  return (
    <div className="flex flex-col h-screen">
      <MainContent>
        {children}
      </MainContent>
      {showBottomNav && <BottomNav />}
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
