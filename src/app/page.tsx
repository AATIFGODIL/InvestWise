import Header from "@/components/layout/header";
import PortfolioSummary from "@/components/dashboard/portfolio-summary";
import InvestmentBundles from "@/components/dashboard/investment-bundles";
import RiskAssessor from "@/components/dashboard/risk-assessor";
import CommunityTrends from "@/components/dashboard/community-trends";
import Chatbot from "@/components/chatbot/chatbot";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <PortfolioSummary />
          </div>
          <div className="flex flex-col gap-4 md:gap-8">
            <RiskAssessor />
            <CommunityTrends />
          </div>
        </div>
        <div>
          <InvestmentBundles />
        </div>
      </main>
      <Chatbot />
    </div>
  );
}
