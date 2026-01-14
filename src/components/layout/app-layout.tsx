// InvestWise - A modern stock trading and investment education platform for young investors

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
export default function AppLayout({ children, variant }: { children: React.ReactNode; variant?: 'default' | 'lightweight' }) {
  const { user } = useAuth();
  
  // This hook fetches all user data and populates the Zustand stores.
  // It no longer blocks rendering. Components will reactively update as the stores are filled.
  useUserData(user);

  return <>{children}</>;
}
