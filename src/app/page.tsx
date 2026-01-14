// InvestWise - A modern stock trading and investment education platform for young investors

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import PageSkeleton from "@/components/layout/page-skeleton";

// This is the root page, which handles redirection based on auth state.
export default function Home() {
  const router = useRouter();
  const { user, hydrating } = useAuth();

  useEffect(() => {
    if (!hydrating) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/auth/signin');
      }
    }
  }, [user, hydrating, router]);
  
  // Display a minimal loading state while the redirection logic runs.
  return (
    <div className="h-screen w-screen">
      <PageSkeleton />
    </div>
  );
}
