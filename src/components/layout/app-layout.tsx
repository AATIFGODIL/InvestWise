
"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import useUserData from "@/hooks/use-user-data";
import Loading from "@/app/loading";
import { usePortfolioStore } from "@/store/portfolio-store";
import { useMarketStore } from "@/store/market-store";
import { usePathname } from "next/navigation";
import { useNavigationStore, navItems } from "@/store/navigation-store";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, hydrating: authHydrating } = useAuth();
  const { loading: userDataLoading } = useUserData(user);
  const { isLoading: portfolioLoading } = usePortfolioStore();
  const { fetchMarketStatus, isLoading: marketStatusLoading } = useMarketStore();
  const pathname = usePathname();
  const { previousPathIndex, currentPathIndex } = useNavigationStore();
  
  const [animationClass, setAnimationClass] = useState("");

  useEffect(() => {
    if (user) {
      fetchMarketStatus();
    }
  }, [user, fetchMarketStatus]);

  useEffect(() => {
    if (previousPathIndex !== null && currentPathIndex !== null) {
      if (currentPathIndex > previousPathIndex) {
        setAnimationClass("animate-slide-in-from-right");
      } else if (currentPathIndex < previousPathIndex) {
        setAnimationClass("animate-slide-in-from-left");
      } else {
        setAnimationClass("");
      }
    }
  }, [currentPathIndex, previousPathIndex, pathname]);

  if (authHydrating || userDataLoading || portfolioLoading || marketStatusLoading) {
    return <Loading />;
  }

  return <div className={cn("transition-transform duration-300 ease-in-out", animationClass)}>{children}</div>;
}
