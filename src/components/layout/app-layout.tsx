
"use client";

import { useAuth } from "@/hooks/use-auth";
import useUserData from "@/hooks/use-user-data";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import useLoadingStore from "@/store/loading-store";
import PageSkeleton from "./page-skeleton";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, hydrating: authHydrating } = useAuth();
  const { loading: userDataLoading } = useUserData(user);
  const { isLoading } = useLoadingStore();

  const showSkeleton = authHydrating || userDataLoading || isLoading;

  return (
    <div className="w-full bg-background font-body">
      <Header />
      <main className="pb-20">
        {showSkeleton ? <PageSkeleton /> : children}
      </main>
      <BottomNav />
    </div>
  );
}
