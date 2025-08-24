
"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import useUserData from "@/hooks/use-user-data";
import Loading from "@/app/loading";
import { usePortfolioStore } from "@/store/portfolio-store";
import { useMarketStore } from "@/store/market-store";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, hydrating: authHydrating } = useAuth();
  const { loading: userDataLoading } = useUserData(user);
  
  // No longer need portfolioLoading or marketStatusLoading here
  
  useEffect(() => {
    // Market status can be fetched inside the dashboard/portfolio components
    // if needed, or remain in useUserData hook.
  }, [user]);

  if (authHydrating || userDataLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full bg-background font-body">
      <Header />
      <main className="pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
