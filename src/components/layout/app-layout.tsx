
"use client";

import { useAuth } from "@/hooks/use-auth";
import Loading from "@/app/loading";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { hydrating } = useAuth();

  // Only show the full-screen loader during the initial auth check.
  // Page-specific skeletons will handle the data-loading state.
  if (hydrating) {
    return <Loading />;
  }

  return <>{children}</>;
}
