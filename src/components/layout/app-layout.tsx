
"use client";

import { useAuth } from "@/hooks/use-auth";
import useUserData from "@/hooks/use-user-data";
import { Loader2 } from "lucide-react";
import { useUserStore } from "@/store/user-store";

interface AppLayoutProps {
  children: React.ReactNode;
  variant?: 'default' | 'lightweight';
}

/**
 * A lightweight hook that only checks for the essential user auth state.
 * It does NOT trigger the full data hydration.
 */
function useLightweightAuth() {
    const { user, hydrating: authHydrating } = useAuth();
    const { username } = useUserStore();
    const isLoading = authHydrating || (user && !username);
    return { isLoading };
}

/**
 * A hook for the default, data-heavy layout that hydrates all stores.
 */
function useDefaultAuth() {
    const { user, hydrating: authHydrating } = useAuth();
    const { loading: userDataLoading } = useUserData(user);
    const { username } = useUserStore();
    const isInitialLoading = authHydrating || (user && !username);
    const isLoading = isInitialLoading || userDataLoading;
    return { isLoading };
}


/**
 * Main application layout component.
 * It handles the loading state for user data hydration.
 *
 * It has two variants:
 * - 'default': The standard layout that hydrates all user data for the main dashboard experience.
 * - 'lightweight': A faster layout that only hydrates essential user profile info,
 *   ideal for simpler pages like Profile or Settings.
 */
export default function AppLayout({ children, variant = 'default' }: AppLayoutProps) {
  const { isLoading } = variant === 'lightweight' ? useLightweightAuth() : useDefaultAuth();
  
  if (isLoading) {
    return (
       <div className="flex-1 pt-20 flex items-center justify-center h-full w-full bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
       </div>
    );
  }

  return <>{children}</>;
}
