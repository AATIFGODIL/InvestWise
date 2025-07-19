
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
import RiskAssessor from "@/components/dashboard/risk-assessor";
import CommunityTrends from "@/components/dashboard/community-trends";

export default function DashboardPage() {
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <CommunityTrends />
            </div>
            <div className="space-y-4">
              <CommunityLeaderboard />
              <PopularAmong />
            </div>
        </div>
        <InvestmentBundles />
        <RiskAssessor />
      </main>
      <Chatbot />
      <BottomNav />
    </div>
  );
}
