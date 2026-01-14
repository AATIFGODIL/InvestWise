// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import { usePendingTradeStore } from "@/store/pending-trade-store";
import { usePortfolioStore } from "@/store/portfolio-store";
import { useAutoInvestStore } from "@/store/auto-invest-store";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AutoTradeApprovalDialog() {
  const { pendingTrade, clearPendingTrade } = usePendingTradeStore();
  const { executeTrade } = usePortfolioStore();
  const { toast } = useToast();

  const handleConfirm = () => {
    if (!pendingTrade) return;

    const result = executeTrade({
      symbol: pendingTrade.symbol,
      qty: pendingTrade.quantity,
      price: pendingTrade.price,
      description: "Auto-Invest Trade",
    });

    if (result.success) {
      toast({
        title: "Auto-Invest Executed!",
        description: `Successfully bought ${pendingTrade.quantity} shares of ${pendingTrade.symbol}.`,
      });
      useAutoInvestStore.getState().advanceNextDate(pendingTrade.id);
    } else {
      toast({
        variant: "destructive",
        title: "Auto-Invest Failed",
        description: result.error,
      });
    }
    clearPendingTrade();
  };

  const handleCancel = () => {
    if (!pendingTrade) return;
    toast({
      variant: "destructive",
      title: "Auto-Invest Canceled",
      description: `The scheduled trade for ${pendingTrade.symbol} was canceled.`,
    });
    clearPendingTrade();
  };

  return (
    <AlertDialog open={!!pendingTrade} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve Auto-Investment</AlertDialogTitle>
          <AlertDialogDescription>
            You have a scheduled auto-investment ready to be executed. Please review and confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {pendingTrade && (
          <div className="space-y-2 text-sm my-4 p-4 bg-muted rounded-lg">
            <div className="flex justify-between"><strong>Symbol:</strong> <span>{pendingTrade.symbol}</span></div>
            <div className="flex justify-between"><strong>Quantity:</strong> <span>{pendingTrade.quantity}</span></div>
            <div className="flex justify-between"><strong>Estimated Price:</strong> <span>${pendingTrade.price.toFixed(2)}</span></div>
            <div className="flex justify-between pt-2 border-t mt-2">
              <strong>Estimated Total:</strong>
              <strong className="text-primary">${(pendingTrade.quantity * pendingTrade.price).toFixed(2)}</strong>
            </div>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Confirm & Buy</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
