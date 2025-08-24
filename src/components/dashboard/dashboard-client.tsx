
"use client";

import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { recommendedBundles, specializedBundles } from "@/data/bundles";
import CongratulationsBanner from "@/components/dashboard/congratulations-banner";
import Chatbot from "@/components/chatbot/chatbot";
import AiPrediction from "@/components/ai/ai-prediction";
import AutoInvest from "@/components/dashboard/auto-invest";
import { useMarketStore } from "@/store/market-store";
import { Clock } from "lucide-react";
import Watchlist from "@/components/dashboard/watchlist";
import EducationalContentDisplay from "@/components/dashboard/EducationalContentDisplay";

const PortfolioSummary = dynamic(() => import("@/components/dashboard/portfolio-summary"), { 
    ssr: false,
});
const CommunityLeaderboard = dynamic(() => import("@/components/dashboard/community-leaderboard"), { 
    ssr: false,
});
const CommunityTrends = dynamic(() => import("@/components/dashboard/community-trends"), { 
    ssr: false,
});
const GoalProgress = dynamic(() => import("@/components/dashboard/goal-progress"), {
    ssr: false,
});
const InvestmentBundles = dynamic(() => import("@/components/dashboard/investment-bundles"), {
    ssr: false,
});

const educationalContent = [
    {
        title: "Week 6 Infographic",
        description: "A visual summary of key concepts from Week 6.",
        filePath: "/src/app/Week 6 Infographic.png",
        type: "image"
    },
    {
        title: "Elijah Dailey Week 6 Deliverable",
        description: "The Week 6 deliverable document by Elijah Dailey.",
        filePath: "/src/app/Elijah Dailey Week 6 Deliverable.pdf",
        type: "pdf"
    }
]

export default function DashboardClient() {
  const [userProfile, setUserProfile] = useState<string | null>(null);
  const { isMarketOpen, fetchMarketStatus } = useMarketStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const profile = localStorage.getItem('userProfile');
      setUserProfile(profile);
    }
    fetchMarketStatus();
  }, [fetchMarketStatus]);

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
        default: return educationalContent;
    }
  }

  const bundleProps = useMemo(() => getBundlesForProfile(userProfile), [userProfile]);

  const showCongrats = userProfile === "Student" || userProfile === "Beginger" || userProfile === "Amateur";

  return (
    <div className="p-4 space-y-6 pb-40">
    <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Explore</h1>
        <div className="flex items-center gap-2 text-sm text-primary">
            <Clock className="h-4 w-4" />
            <span>Market is {isMarketOpen ? 'open' : 'closed'}.</span>
        </div>
    </div>
    <EducationalContentDisplay content={educationalContent} />
    <CongratulationsBanner show={showCongrats} userProfile={userProfile || ""} />
    <PortfolioSummary />
    <Watchlist />
    <AutoInvest />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GoalProgress />
        <CommunityLeaderboard />
    </div>
    <InvestmentBundles {...bundleProps} />
    <CommunityTrends limit={5} />
    <AiPrediction />
    <Chatbot />
    </div>
  );
}
