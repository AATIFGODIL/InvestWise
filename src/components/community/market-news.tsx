"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useThemeStore } from "@/store/theme-store";
import { cn } from "@/lib/utils";

export default function MarketNews() {
  const { isClearMode, theme } = useThemeStore();
  const isLightClear = isClearMode && theme === 'light';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
            <Newspaper className="h-5 w-5 text-primary" />
            Market News
        </CardTitle>
        <CardDescription>
            See the latest headlines from across the financial world on TradingView.
        </CardDescription>
      </CardHeader>
      <CardContent>
          <Button asChild className={cn(
              "w-full ring-1 ring-white/60",
              isClearMode
                  ? isLightClear
                      ? "bg-card/60 text-foreground"
                      : "bg-white/10 text-white"
                  : ""
          )}>
              <Link href="https://in.tradingview.com/news/" target="_blank" rel="noopener noreferrer">
                  Go to TradingView News
                  <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
          </Button>
      </CardContent>
    </Card>
  );
}
