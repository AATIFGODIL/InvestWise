
"use client";

import { useAuth } from "@/hooks/use-auth";
import useUserData from "@/hooks/use-user-data";
import Loading from "@/app/loading";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, hydrating: authHydrating } = useAuth();
  const { loading: userDataLoading } = useUserData(user);

  // Show loading screen if either auth state is resolving or user data is being fetched.
  if (authHydrating || userDataLoading) {
    return <Loading />;
  }

  return <>{children}</>;
}
