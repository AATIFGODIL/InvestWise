
"use client";

import { useAuth } from "@/hooks/use-auth";
import Loading from "@/app/loading";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { hydrating } = useAuth();

  if (hydrating) {
    return <Loading />;
  }

  return <>{children}</>;
}
