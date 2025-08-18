
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { recommendedBundles, specializedBundles } from "@/data/bundles";
import CongratulationsBanner from "@/components/dashboard/congratulations-banner";
import Chatbot from "@/components/chatbot/chatbot";
import AppLayout from "@/components/layout/app-layout";

const PortfolioSummary = dynamic(() => import("@/components/dashboard/portfolio-summary"), { 
    ssr: false,
});
const CommunityLeaderboard = dynamic(() => import("@/components/dashboard/community-leaderboard"), { 
    ssr: false,
});
const CommunityTrends = dynamic(() => import("@/components/dashboard/community-trends"), { 
    ssr: false,
});
const RiskManagement = dynamic(() => import("@/components/dashboard/risk-management"), { 
    ssr: false,
});
const AutoInvest = dynamic(() => import("@/components/dashboard/auto-invest"), {
    ssr: false,
});
const GoalProgress = dynamic(() => import("@/components/dashboard/goal-progress"), {
    ssr: false,
});
const InvestmentBundles = dynamic(() => import("@/components/dashboard/investment-bundles"), {
    ssr: false,
});


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

function DashboardClientContent() {
  const [userProfile, setUserProfile] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const profile = localStorage.getItem('userProfile');
      setUserProfile(profile);
    }
  }, []);

  const getBundlesForProfile = (profile: string | null) => {
    switch(profile) {
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
  
  const getVideosForProfile = (profile: string | null) => {
    switch(profile) {
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

  const bundleProps = useMemo(() => getBundlesForProfile(userProfile), [userProfile]);
  const videoProps = useMemo(() => getVideosForProfile(userProfile), [userProfile]);

  const showCongrats = userProfile === "Student" || userProfile === "Beginner" || userProfile === "Amateur";

  return (
    <div className="w-full bg-background font-body">
        <Header />
        <main className="p-4 space-y-6 pb-40">
          <CongratulationsBanner show={showCongrats} userProfile={userProfile || ""} />
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

export default function DashboardClient() {
  return (
    <AppLayout>
      <DashboardClientContent />
    </AppLayout>
  )
}
