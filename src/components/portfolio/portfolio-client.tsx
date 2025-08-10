
"use client";

import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import HoldingsTable from "@/components/portfolio/holdings-table";
import { Clock, PlusCircle } from "lucide-react";
import Chatbot from "@/components/chatbot/chatbot";
import PortfolioValue from "@/components/portfolio/portfolio-value";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PaymentForm from "@/components/settings/payment-form";
import { useState } from "react";

export default function PortfolioClient() {
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);

  return (
    <div className="w-full bg-background font-body">
      <Header />
      <main className="p-4 space-y-6 pb-40">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Portfolio</h1>
            <Dialog open={isAddFundsOpen} onOpenChange={setIsAddFundsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Funds
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Funds to Your Account</DialogTitle>
                  <DialogDescription>
                    Add a payment method to fund your account. Your card details are securely handled by Stripe.
                  </DialogDescription>
                </DialogHeader>
                <PaymentForm onPaymentSuccess={() => setIsAddFundsOpen(false)} />
              </DialogContent>
            </Dialog>
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
      </main>
      <Chatbot />
      <BottomNav />
    </div>
  );
}
