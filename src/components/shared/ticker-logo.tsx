// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/** A company's logo, from the same source the command menu uses, falling back to its initial. */
export function tickerLogoUrl(symbol: string) {
  return `https://img.logokit.com/ticker/${symbol}?token=pk_fr7a1b76952087586937fa`;
}

export default function TickerLogo({ symbol, name, className }: { symbol: string; name?: string; className?: string }) {
  return (
    <Avatar className={cn("h-9 w-9 bg-muted", className)}>
      <AvatarImage src={tickerLogoUrl(symbol)} alt={name ?? symbol} />
      <AvatarFallback className="text-xs font-semibold">{symbol.charAt(0)}</AvatarFallback>
    </Avatar>
  );
}
