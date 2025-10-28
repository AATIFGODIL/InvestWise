
"use client";

import useUserData from "@/hooks/use-user-data";
import { useAuth } from "@/hooks/use-auth";

/**
 * Main application layout component.
 * It handles the user data hydration for all authenticated pages.
 * The actual loading state (skeletons) is handled by individual components
 * checking if their required store data is available. This component
 * simply triggers the data fetching process.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // This hook fetches all user data and populates the Zustand stores.
  // It doesn't return a loading state anymore, as we are no longer blocking rendering.
  // Components will reactively update as the stores are filled.
  useUserData(user);

  return <>{children}</>;
}
