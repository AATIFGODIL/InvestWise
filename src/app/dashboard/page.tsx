
"use client";

import { useEffect, useState } from 'react';
import Header from "@/components/layout/header";
import CongratulationsBanner from "@/components/dashboard/congratulations-banner";
import PortfolioSummary from "@/components/dashboard/portfolio-summary";
import TopInvestmentBundle from "@/components/dashboard/top-investment-bundle";
import GoalProgress from "@/components/dashboard/goal-progress";
import CommunityLeaderboard from "@/components/dashboard/community-leaderboard";
import PopularAmong from "@/components/dashboard/popular-among";
import BottomNav from "@/components/layout/bottom-nav";
import Chatbot from "@/components/chatbot/chatbot";
import InvestmentBundles from "@/components/dashboard/investment-bundles";
import RiskManagement from "@/components/dashboard/risk-management";
import CommunityTrends from "@/components/dashboard/community-trends";
import EducationalVideo from '@/components/shared/educational-video';
import AutoInvest from '@/components/dashboard/auto-invest';

const beginnerVideos = [
    {
        title: "Understanding Your Dashboard",
        description: "A quick tour of the key features on your homescreen.",
        image: "https://placehold.co/600x400.png",
        hint: "dashboard analytics"
    },
    {
        title: "What is Diversification?",
        description: "Learn why not putting all your eggs in one basket is a core investment principle.",
        image: "https://placehold.co/600x400.png",
        hint: "different assets"
    }
];

const riskManagementVideos = [
    {
        title: "What is Market Risk?",
        description: "Learn about the risks inherent to the entire market and how to think about them.",
        image: "https://placehold.co/600x400.png",
        hint: "stock chart down"
    },
    {
        title: "The Power of Diversification",
        description: "A deep dive into how spreading your investments can reduce risk.",
        image: "https://placehold.co/600x400.png",
        hint: "assets variety"
    }
]

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<string | null>(null);

  useEffect(() => {
    const profile = localStorage.getItem('userProfile');
    setUserProfile(profile);
  }, []);

  const showBeginnerContent = userProfile === 'Beginner' || userProfile === 'Amateur';

  return (
    <div className="w-full bg-background font-body">
      <Header />
      <main className="p-4 space-y-4 pb-40">
        {showBeginnerContent && <CongratulationsBanner />}
        
        <div className="lg:col-span-2">
            <PortfolioSummary />
        </div>
        
        <AutoInvest />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TopInvestmentBundle />
          <GoalProgress />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <CommunityTrends />
            </div>
            <div className="space-y-4">
              <CommunityLeaderboard />
              <PopularAmong />
            </div>
        </div>
        {showBeginnerContent && (
             <div className="space-y-4 pt-4">
                <h2 className="text-xl font-bold">New to Investing? Start Here!</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {beginnerVideos.map((video) => (
                        <EducationalVideo key={video.title} {...video} />
                    ))}
                </div>
            </div>
        )}
        <InvestmentBundles />
        <RiskManagement videos={riskManagementVideos} />
      </main>
      <Chatbot />
      <BottomNav />
    </div>
  );
}
