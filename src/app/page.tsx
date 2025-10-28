
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

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
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
