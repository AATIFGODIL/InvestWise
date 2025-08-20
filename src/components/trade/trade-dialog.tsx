
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

const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY as string;

export default function TradeDialog({
  isOpen,
  onOpenChange,
  symbol,
  price,
  action,
}: TradeDialogProps) {
  const [currentPrice, setCurrentPrice] = useState<number | null>(price);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrice() {
      if (!isOpen || !symbol || !API_KEY) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`);
        if (!res.ok) throw new Error(`Failed to fetch quote: ${res.statusText}`);
        const data = await res.json();
        if (data && typeof data.c !== 'undefined' && data.c !== 0) {
            setCurrentPrice(data.c);
        } else {
            setError("Could not fetch a valid price for this stock.");
            setCurrentPrice(null);
        }
      } catch (err) {
        console.error("Error fetching price in dialog:", err);
        setError("Could not fetch the latest price.");
        setCurrentPrice(null);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPrice();
  }, [symbol, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="capitalize">{`${action} ${symbol}`}</DialogTitle>
          <DialogDescription>
            {error ? error : "Price is updated in real-time. The final execution price may vary in a real market."}
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
