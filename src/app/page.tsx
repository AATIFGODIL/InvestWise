import Header from "@/components/layout/header";
import CongratulationsBanner from "@/components/dashboard/congratulations-banner";
import PortfolioSummary from "@/components/dashboard/portfolio-summary";
import GoalProgress from "@/components/dashboard/goal-progress";
import CommunityLeaderboard from "@/components/dashboard/community-leaderboard";
import PopularAmong from "@/components/dashboard/popular-among";
import Chatbot from "@/components/chatbot/chatbot";
import BottomNav from "@/components/layout/bottom-nav";
import TopInvestmentBundle from "@/components/dashboard/top-investment-bundle";

export default function Home() {
  return (
    <div className="w-full bg-background font-body">
      <Header />
      <main className="p-4 space-y-4 pb-40">
        <CongratulationsBanner />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PortfolioSummary />
          <TopInvestmentBundle />
        </div>
        <GoalProgress />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CommunityLeaderboard />
          <PopularAmong />
        </div>
      </main>
      <Chatbot />
      <BottomNav />
    </div>
  );
}
