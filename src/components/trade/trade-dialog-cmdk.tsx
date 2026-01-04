
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

interface TradeDialogCMDKProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  symbol: string;
  price: number;
  action: "buy" | "sell";
}

// This is a specific version of the TradeDialog for the Command Menu (CMDK).
// It avoids using the Finnhub API hooks directly to prevent re-renders and state issues
// when opened from within another complex component like the Command Menu.
// It receives the price as a prop.
export default function TradeDialogCMDK({
  isOpen,
  onOpenChange,
  symbol,
  price,
  action,
}: TradeDialogCMDKProps) {

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="capitalize">{`${action} ${symbol}`}</DialogTitle>
          <DialogDescription>
            Price is updated in real-time. The final execution price may vary in a real market.
          </DialogDescription>
        </DialogHeader>
        <TradeForm
          selectedSymbol={symbol}
          selectedPrice={price}
          loadingPrice={!price}
          initialAction={action}
          onTradeSuccess={() => onOpenChange(false)} // Close dialog on successful trade
        />
      </DialogContent>
    </Dialog>
  );
}
