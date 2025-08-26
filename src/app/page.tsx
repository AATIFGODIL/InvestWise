
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import Loading from "./loading";

// Redirect to the sign-in page by default.
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
  
  return <Loading />;
}
