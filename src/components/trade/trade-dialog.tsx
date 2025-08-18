"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TradeForm from "./trade-form";
import { fetchPrice } from "@/lib/alphaVantage";

interface TradeDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  symbol: string;
  price: number;
  action: "buy" | "sell";
}

export default function TradeDialog({
  isOpen,
  onOpenChange,
  symbol,
  price,
  action,
}: TradeDialogProps) {
  const [currentPrice, setCurrentPrice] = useState<number | null>(price);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Re-fetch the latest price when the dialog opens for a different symbol
    async function getPrice() {
      setIsLoading(true);
      const fetchedPrice = await fetchPrice(symbol);
      setCurrentPrice(fetchedPrice);
      setIsLoading(false);
    }
    if (isOpen && symbol) {
      getPrice();
    }
  }, [symbol, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="capitalize">{`${action} ${symbol}`}</DialogTitle>
          <DialogDescription>
            The market is constantly changing. The final price may vary.
          </DialogDescription>
        </DialogHeader>
        <TradeForm
          selectedSymbol={symbol}
          selectedPrice={currentPrice}
          loadingPrice={isLoading}
          initialAction={action}
          onTradeSuccess={() => onOpenChange(false)} // Close dialog on successful trade
        />
      </DialogContent>
    </Dialog>
  );
}
