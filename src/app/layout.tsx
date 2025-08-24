
"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
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
  
  const isAuthOrOnboardingRoute = pathname.startsWith('/auth') || pathname.startsWith('/onboarding');

  useEffect(() => {
    // If we're done loading, there's no user, and we are on a protected route, redirect to signin.
    if (!loading && !user && !isAuthOrOnboardingRoute) {
        router.push('/auth/signin');
    }
  }, [user, loading, isAuthOrOnboardingRoute, router]);
  
  // While loading, show a full-screen loader to prevent flashing of protected content
  if (loading) {
    return (
       <div className="flex items-center justify-center h-screen w-full bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
       </div>
    );
  }

  // If not authenticated and on a public route (like signin), or if authenticated, show content
  if ((!loading && !user && isAuthOrOnboardingRoute) || user) {
      return (
        <div className="flex flex-col h-screen">
          <MainContent>
            {children}
          </MainContent>
          {!isAuthOrOnboardingRoute && <BottomNav />}
        </div>
      );
  }
  
  // If not authenticated and trying to access a protected route, the useEffect will redirect.
  // In the meantime, show a loader to prevent rendering anything.
  return (
       <div className="flex items-center justify-center h-screen w-full bg-background">
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
