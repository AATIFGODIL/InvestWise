// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useThemeStore } from "@/store/theme-store";
import { AppleHelloEnglishEffect } from "@/components/ui/apple-hello-effect";
import { cn } from "@/lib/utils";
import useUserData from "@/hooks/use-user-data";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function WelcomeBackPage() {
  const router = useRouter();
  const { user } = useAuth();
  useUserData(user); // This hook now just triggers data hydration
  const [isReady, setIsReady] = useState(false);
  const { isClearMode, theme } = useThemeStore();
  const isLightClear = isClearMode && theme === 'light';

  useEffect(() => {
    // Wait for user object and stores to hydrate before redirecting
    if (user) {
      setIsReady(true);
      // Set a session flag to trigger the glow effect on the next page
      sessionStorage.setItem('showGlowEffect', 'true');

      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 5000); // Redirect after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [router, user]);

  if (!isReady) {
    return (
       <div className="flex items-center justify-center h-screen w-full bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
       </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
       <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md text-center"
      >
        <CardHeader>
           <div 
             className={cn(
                "flex justify-center",
                isClearMode 
                    ? isLightClear 
                        ? "text-black/60"
                        : "text-white/80"
                    : "text-primary"
            )}
           >
            <AppleHelloEnglishEffect speed={1.1} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardTitle className="text-3xl">Welcome Back.</CardTitle>
          <p className="text-muted-foreground">
            We're getting things ready for you.
          </p>
          <Button asChild className="w-full">
            <Link href="/dashboard" prefetch={false}>Go to Dashboard</Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            You will be redirected automatically.
          </p>
        </CardContent>
      </motion.div>
    </div>
  );
}
