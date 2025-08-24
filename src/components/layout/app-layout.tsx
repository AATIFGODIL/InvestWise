
"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import useUserData from "@/hooks/use-user-data";
import Loading from "@/app/loading";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import useLoadingStore from "@/store/loading-store";
import PageSkeleton from "./page-skeleton";
import { usePathname, useSearchParams } from "next/navigation";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, hydrating: authHydrating } = useAuth();
  const { loading: userDataLoading } = useUserData(user);
  const { isLoading, hideLoading } = useLoadingStore();

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // This effect runs when the page component has mounted,
    // so we can safely hide the loading indicator.
    hideLoading();
  }, [pathname, searchParams, hideLoading]);
  
  if (authHydrating || userDataLoading) {
    // This is the initial, full-screen load for auth and user data.
    // We can't show the app layout yet.
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="w-full bg-background font-body">
      <Header />
      <main className="pb-20">
        {isLoading ? <PageSkeleton /> : children}
      </main>
      <BottomNav />
    </div>
  );
}
