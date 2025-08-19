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

interface TradeDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  symbol: string;
  price: number;
  action: "buy" | "sell";
}

// Function to generate a stable, pseudo-random price based on the symbol
const getSimulatedPrice = (symbol: string): number => {
    let hash = 0;
    for (let i = 0; i < symbol.length; i++) {
        const char = symbol.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    const pseudoRandom = (Math.abs(hash) % 100000) / 100; // Price between 0 and 1000
    return parseFloat((pseudoRandom + 50).toFixed(2)); // Ensure a minimum price of 50
};


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
    function getPrice() {
      setIsLoading(true);
      const fetchedPrice = getSimulatedPrice(symbol);
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
            This is a simulated price. The final execution price may vary in a real market.
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
