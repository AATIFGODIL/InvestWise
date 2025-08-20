
"use client";

import { useState } from "react";
import { getTradeHistory } from "@/app/actions";
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

export default function TradeHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [history, setHistory] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleFetchHistory = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    const result = await getTradeHistory(user.uid);

    if (result.success && result.data) {
      // Sort by most recent first
      const sortedData = result.data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setHistory(sortedData);
    } else {
      setError(result.error || "An unknown error occurred.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch your trade history.",
      });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full sm:w-auto"
          onClick={handleFetchHistory}
        >
          <History className="h-4 w-4 mr-2" />
          Trade History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Trade History</DialogTitle>
          <DialogDescription>
            A record of all your buy and sell transactions.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-8 text-destructive">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p>{error}</p>
            </div>
          ) : history.length === 0 ? (
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
                {history.map((tx) => (
                  <TableRow key={tx.timestamp}>
                    <TableCell>
                        <div className="text-sm font-medium">{new Date(tx.timestamp).toLocaleDateString()}</div>
                        <div className="text-xs text-muted-foreground">{new Date(tx.timestamp).toLocaleTimeString()}</div>
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
