
"use client";

import { useAuth } from "@/hooks/use-auth";
import useUserData from "@/hooks/use-user-data";
import Loading from "@/app/loading";
import { usePortfolioStore } from "@/store/portfolio-store";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, hydrating: authHydrating } = useAuth();
  const { loading: userDataLoading } = useUserData(user);
  const { isLoading: portfolioLoading } = usePortfolioStore();

  // Show loading screen if auth state is resolving, user data is being fetched,
  // or the portfolio data (including the chart) is still being processed.
  if (authHydrating || userDataLoading || portfolioLoading) {
    return <Loading />;
  }

  return <>{children}</>;
}
