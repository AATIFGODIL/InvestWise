
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import PortfolioValue from "@/components/portfolio/portfolio-value";
import HoldingsTable from "@/components/portfolio/holdings-table";
import { Clock } from "lucide-react";

export default function PortfolioPage() {
  return (
    <div className="w-full bg-background font-body">
      <Header />
      <main className="p-4 space-y-6 pb-40">
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <PortfolioValue />
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Holdings</h2>
             <div className="flex items-center gap-2 text-sm text-primary">
                <Clock className="h-4 w-4" />
                <span>Market is open.</span>
            </div>
          </div>
          <HoldingsTable />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
