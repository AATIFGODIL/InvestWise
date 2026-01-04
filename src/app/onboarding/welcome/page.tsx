
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useThemeStore } from "@/store/theme-store";
import { AppleHelloEnglishEffect } from "@/components/ui/apple-hello-effect";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function OnboardingWelcomePage() {
  const router = useRouter();
  const { isClearMode, theme } = useThemeStore();
  const isLightClear = isClearMode && theme === 'light';


  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 5000); // Redirect after 5 seconds

    return () => clearTimeout(timer);
  }, [router]);

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
          <CardTitle className="text-3xl">Welcome to InvestWise.</CardTitle>
          <p className="text-muted-foreground">
            You're all set up. Let's start your investment journey together.
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
