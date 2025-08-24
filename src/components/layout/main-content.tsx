
"use client";

import { useAuth } from "@/hooks/use-auth";
import useUserData from "@/hooks/use-user-data";
import useLoadingStore from "@/store/loading-store";
import PageSkeleton from "./page-skeleton";
import { AuthProvider } from "@/hooks/use-auth";

interface MainContentProps {
  children: React.ReactNode;
}

function Content({ children }: MainContentProps) {
  const { user, hydrating: authHydrating } = useAuth();
  const { loading: userDataLoading } = useUserData(user);
  const { isLoading: isPageNavigating } = useLoadingStore();

  const showSkeleton = authHydrating || userDataLoading || isPageNavigating;

  if (showSkeleton) {
    return <PageSkeleton />;
  }

  return <>{children}</>;
}


export default function MainContent({ children }: MainContentProps) {
    return (
        <AuthProvider>
            <Content>{children}</Content>
        </AuthProvider>
    )
}
