// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History, Loader2, AlertCircle } from "lucide-react";
import { type Transaction } from "@/store/transaction-store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/theme-store";
import { useTransactionStore } from "@/store/transaction-store";

export default function TradeHistory() {
  const { toast } = useToast();
  const { transactions } = useTransactionStore();
  const [isOpen, setIsOpen] = useState(false);
  const [tutorialMode, setTutorialMode] = useState(false);

  // Listen for tutorial events to enable tutorial mode
  useEffect(() => {
    const handleTutorialDialogStep = () => {
      setTutorialMode(true);
    };
    const handleTutorialEnd = () => {
      setTutorialMode(false);
    };

    window.addEventListener('tradeHistoryOpened', handleTutorialDialogStep);
    window.addEventListener('tradeHistoryClosed', handleTutorialEnd);

    return () => {
      window.removeEventListener('tradeHistoryOpened', handleTutorialDialogStep);
      window.removeEventListener('tradeHistoryClosed', handleTutorialEnd);
    };
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Emit custom events for the tutorial
    if (open) {
      window.dispatchEvent(new CustomEvent('tradeHistoryOpened'));
    } else {
      window.dispatchEvent(new CustomEvent('tradeHistoryClosed'));
      setTutorialMode(false);
    }
  };

  const handleButtonClick = () => {
    // Emit event for tutorial before opening
    window.dispatchEvent(new CustomEvent('tradeHistoryButtonClicked'));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          id="trade-history-button-tutorial"
          variant="default"
          className={cn("w-full sm:w-auto ring-1 ring-white/60")}
          onClick={handleButtonClick}
        >
          <History className="h-4 w-4 mr-2" />
          Trade History
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-4xl"
        id="trade-history-dialog-tutorial"
        closeButtonId="trade-history-close-button-tutorial"
        tutorialMode={tutorialMode}
      >
        <DialogHeader>
          <DialogTitle>Trade History</DialogTitle>
          <DialogDescription>
            A record of all your buy and sell transactions.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <p>You haven't made any trades yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx, index) => (
                  <TableRow key={`${tx.timestamp}-${index}`}>
                    <TableCell>
                      <div className="text-sm font-medium">{new Date(tx.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div className="text-xs text-muted-foreground">{new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </TableCell>
                    <TableCell className="font-bold">{tx.symbol}</TableCell>
                    <TableCell>
                      <span
                        className={cn("capitalize font-semibold", {
                          "text-green-500": tx.action === "buy",
                          "text-red-500": tx.action === "sell",
                        })}
                      >
                        {tx.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{tx.quantity}</TableCell>
                    <TableCell className="text-right">${tx.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${(tx.quantity * tx.price).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
