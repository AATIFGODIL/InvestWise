
"use client";

import { useAuth } from "@/hooks/use-auth";
import useUserData from "@/hooks/use-user-data";
import { Loader2 } from "lucide-react";

interface MainContentProps {
  children: React.ReactNode;
}

export default function MainContent({ children }: MainContentProps) {
  const { user, hydrating: authHydrating } = useAuth();
  const { loading: userDataLoading } = useUserData(user);

  const isLoading = authHydrating || userDataLoading;

  if (isLoading) {
    return (
       <div className="flex items-center justify-center h-full w-full bg-background pt-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
       </div>
    );
  }

  return <div className="flex-1 overflow-y-auto pt-20">{children}</div>;
}
