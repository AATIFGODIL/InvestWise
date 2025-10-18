
"use client";

import HoldingsTable from "@/components/portfolio/holdings-table";
import { Clock, PlusCircle } from "lucide-react";
import Chatbot from "@/components/chatbot/chatbot";
import PortfolioValue from "@/components/portfolio/portfolio-value";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AiPrediction from "../ai/ai-prediction";
import { useUserStore } from "@/store/user-store";
import { useRouter } from "next/navigation";
import { createTransaction } from "@/app/actions";
import { useAuth } from "@/hooks/use-auth";
import { useMarketStore } from "@/store/market-store";
import Watchlist from "../dashboard/watchlist";
import { cn } from "@/lib/utils";

export default function PortfolioClient() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const { paymentMethodToken } = useUserStore();
  const { isMarketOpen } = useMarketStore();


  const handleAddFunds = async () => {
    if (!paymentMethodToken) {
      toast({
        variant: "destructive",
        title: "No Payment Method",
        description: "Please add a payment method in your profile before adding funds.",
      });
      router.push('/profile');
      return;
    }
    
    if (!user) {
       toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "You must be logged in to add funds.",
      });
      return;
    }

    try {
      // For demonstration, we'll charge a fixed amount.
      // In a real app, you'd have a dialog to ask for the amount.
      await createTransaction({ userId: user.uid, amount: "100.00" });
       toast({
        title: "Funds Added!",
        description: "$100.00 has been added to your account. It may take a few moments to reflect in your balance.",
      });
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Failed to Add Funds",
        description: error.message || "An unexpected error occurred.",
      });
    }
  }

  return (
      <main>
        <div className="p-4 space-y-6 pb-24">
          <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Portfolio</h1>
              <Button onClick={handleAddFunds} className={cn("ring-1 ring-white/60")}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add $100 (Demo)
              </Button>
          </div>
          <PortfolioValue />
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Holdings</h2>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Clock className="h-4 w-4" />
                  <span>Market is {isMarketOpen ? 'open' : 'closed'}.</span>
              </div>
            </div>
            <HoldingsTable />
          </div>
          <Watchlist />
            <AiPrediction />
          <Chatbot />
        </div>
      </main>
  );
}
