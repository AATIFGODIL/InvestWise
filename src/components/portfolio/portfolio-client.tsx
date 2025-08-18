
"use client";

import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import HoldingsTable from "@/components/portfolio/holdings-table";
import { Clock, PlusCircle } from "lucide-react";
import Chatbot from "@/components/chatbot/chatbot";
import PortfolioValue from "@/components/portfolio/portfolio-value";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AiPrediction from "../ai/ai-prediction";

export default function PortfolioClient() {
  const { toast } = useToast();

  const handleAddFunds = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Adding funds directly is not yet enabled.",
    });
  }

  return (
    <div className="w-full bg-background font-body">
      <Header />
      <main className="p-4 space-y-6 pb-40">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Portfolio</h1>
            <Button onClick={handleAddFunds}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Funds
            </Button>
        </div>
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
         <AiPrediction />
      </main>
      <Chatbot />
      <BottomNav />
    </div>
  );
}
