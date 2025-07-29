
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import { Skeleton } from "@/components/ui/skeleton";
import PortfolioSummary from "@/components/dashboard/portfolio-summary";
import InvestmentBundles from "@/components/dashboard/investment-bundles";
import { recommendedBundles, specializedBundles } from "@/data/bundles";
import AutoInvest from "@/components/dashboard/auto-invest";
import GoalProgress from "@/components/dashboard/goal-progress";
import CommunityLeaderboard from "@/components/dashboard/community-leaderboard";
import CommunityTrends from "@/components/dashboard/community-trends";
import RiskManagement from "@/components/dashboard/risk-management";
import CongratulationsBanner from "@/components/dashboard/congratulations-banner";
import Chatbot from "@/components/chatbot/chatbot";

const beginnerVideos = [
    {
        title: "What is Risk?",
        description: "A simple explanation of investment risk and why it matters for your financial journey.",
        image: "https://placehold.co/600x400.png",
        hint: "question mark"
    },
    {
        title: "Diversification 101",
        description: "Learn how spreading your investments can help manage risk and improve stability.",
        image: "https://placehold.co/600x400.png",
        hint: "spreading chart"
    }
];

const studentVideos = [
    {
        title: "Saving vs. Investing",
        description: "Understand the key differences and why both are important for your financial future.",
        image: "https://placehold.co/600x400.png",
        hint: "piggy bank"
    },
    {
        title: "Starting with Small Investments",
        description: "You don't need a lot of money to start. Learn how to begin your journey with just a little.",
        image: "https://placehold.co/600x400.png",
        hint: "small plant"
    }
];

const experiencedVideos = [
     {
        title: "Advanced Risk Metrics",
        description: "An introduction to concepts like Sharpe Ratio and Beta for analyzing portfolio risk.",
        image: "https://placehold.co/600x400.png",
        hint: "data analytics"
    },
    {
        title: "Hedging Strategies",
        description: "Explore basic options and strategies that can be used to protect your portfolio from downturns.",
        image: "https://placehold.co/600x400.png",
        hint: "financial strategy"
    }
]

export default function DashboardPage() {
  const { user, hydrating: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const profile = localStorage.getItem('userProfile');
      setUserProfile(profile);
    }
    setIsLoadingProfile(false);
  }, []);

  const getBundlesForProfile = () => {
    switch(userProfile) {
        case "Student":
        case "Beginner":
            return {
                title: "Recommended For You",
                description: "Start with these popular, diversified bundles.",
                bundles: recommendedBundles,
            };
        case "Amateur":
        case "New Investor":
        case "Experienced Investor":
             return {
                title: "Explore Specialized Bundles",
                description: "Discover themed collections for more focused strategies.",
                bundles: specializedBundles,
            };
        default:
             return {
                title: "Investment Bundles",
                description: "Collections of assets to help you diversify your portfolio.",
                bundles: [...recommendedBundles, ...specializedBundles],
            };
    }
  }
  
  const getVideosForProfile = () => {
    switch(userProfile) {
        case "Student":
            return studentVideos;
        case "Beginner":
             return beginnerVideos;
        case "Experienced Investor":
        case "Amateur":
        case "New Investor":
            return experiencedVideos;
        default:
            return beginnerVideos;
    }
  }
  
  const PageSkeleton = () => (
     <div className="w-full bg-background font-body">
      <Header />
      <main className="p-4 space-y-6 pb-40">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
      </main>
      <BottomNav />
    </div>
  )

  if (authLoading || isLoadingProfile) {
    return <PageSkeleton />;
  }

  const bundleProps = getBundlesForProfile();
  const videoProps = getVideosForProfile();
  const showCongrats = userProfile === "Student" || userProfile === "Beginner" || userProfile === "Amateur";

  return (
    <div className="w-full bg-background font-body">
        <Header />
        <main className="p-4 space-y-6 pb-40">
          <CongratulationsBanner show={showCongrats} />
          <PortfolioSummary />
          <AutoInvest />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GoalProgress />
            <CommunityLeaderboard />
          </div>
          <InvestmentBundles {...bundleProps} />
          <CommunityTrends />
          <RiskManagement videos={videoProps} />
        </main>
        <Chatbot />
        <BottomNav />
    </div>
  );
}
