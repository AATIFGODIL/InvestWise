// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import Link from "next/link";

interface CongratulationsBannerProps {
  show: boolean;
  userProfile: string;
}

export default function CongratulationsBanner({ show, userProfile }: CongratulationsBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasViewedCertificate = localStorage.getItem('hasViewedCertificate');
    if (show && !hasViewedCertificate) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [show]);

  if (!isVisible || userProfile === "Experienced Investor" || userProfile === "New Investor") {
    return null;
  }

  return (
    <Card className="bg-primary border-none text-primary-foreground shadow-lg overflow-hidden">
      <div className="relative p-4 flex items-center gap-4">
        <div className="absolute top-2 right-20 w-3 h-3 bg-yellow-300/70 rounded-full animate-pulse"></div>
        <div className="absolute bottom-2 left-40 w-2 h-2 bg-pink-300/70 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-8 left-1/3 w-4 h-4 bg-blue-300/70 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-4 w-2 h-2 bg-green-300/70 rounded-full animate-pulse delay-700"></div>

        <Trophy className="h-10 w-10 text-accent flex-shrink-0" />
        <div className="flex-grow">
          <h3 className="font-bold text-lg">Congratulations!</h3>
          <p className="text-sm opacity-90">
            You've completed all 3 beginner lessons.
          </p>
        </div>
        <Button
          asChild
          className="bg-accent hover:bg-accent/90 text-accent-foreground shrink-0 rounded-lg"
        >
          <Link href="/certificate">View Certificate</Link>
        </Button>
      </div>
    </Card>
  );
}
