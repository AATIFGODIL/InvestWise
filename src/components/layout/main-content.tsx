
"use client";

import { useAuth } from "@/hooks/use-auth";
import useUserData from "@/hooks/use-user-data";
import { Loader2 } from "lucide-react";
import { useUserStore } from "@/store/user-store";

interface MainContentProps {
  children: React.ReactNode;
  isLoading: boolean;
}

export default function MainContent({ children, isLoading: isNavigating }: MainContentProps) {
  const { user, hydrating: authHydrating } = useAuth();
  const { loading: userDataLoading } = useUserData(user);
  const { username } = useUserStore();

  // Show loading indicator if auth is hydrating or it's a fresh load with no username yet.
  const isInitialLoading = authHydrating || (user && !username);

  if (isInitialLoading || isNavigating) {
    return (
       <div className="flex-1 overflow-y-auto pt-20 flex items-center justify-center h-full w-full bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
       </div>
    );
  }

  return <div className="flex-1 overflow-y-auto pt-20">{children}</div>;
}
