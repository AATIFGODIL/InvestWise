// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrainCircuit, Loader2 } from "lucide-react";
import { handleDanelfinPrediction } from "@/app/actions";
import type { DanelfinPrediction } from "@/lib/danelfin";
import { DanelfinPredictionView, PoweredByDanelfin } from "@/components/ai/danelfin-prediction";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/theme-store";

export default function AiPrediction() {
  const [symbol, setSymbol] = useState<string>("");
  const [prediction, setPrediction] = useState<DanelfinPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isClearMode, theme } = useThemeStore();
  const isLightClear = isClearMode && theme === 'light';

  const handleGetPrediction = async () => {
    if (!symbol) return;
    setIsLoading(true);
    setError(null);
    setPrediction(null);

    const result = await handleDanelfinPrediction(symbol);

    if (result.success && result.prediction) {
      setPrediction(result.prediction);
    } else {
      setError(result.error || "An unknown error occurred.");
    }
    setIsLoading(false);
  };


  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold">
          <BrainCircuit className="h-5 w-5 text-primary" />
          AI Stock Prediction
        </CardTitle>
        <CardDescription>
          How likely a stock is to beat the market over the next 3 months, with a price forecast. For learning, not financial advice.
        </CardDescription>
        <PoweredByDanelfin className="self-start" />
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="grow space-y-2">
            <Label htmlFor="stock-symbol-portfolio">Stock Symbol</Label>
            <Input
              id="stock-symbol-portfolio"
              placeholder="e.g. AAPL"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="focus-visible:ring-primary"
            />
          </div>
          <div className="self-end">
            <Button onClick={handleGetPrediction} disabled={isLoading || !symbol} className={cn(
              "w-full ring-1 ring-white/60",
              isClearMode
                ? isLightClear
                  ? "bg-card/60 text-foreground"
                  : "bg-white/10 text-white"
                : ""
            )}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <BrainCircuit className="mr-2 h-4 w-4" />
              )}
              Get Prediction
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {prediction && (
          <div className="rounded-3xl bg-muted/30 p-4">
            <DanelfinPredictionView prediction={prediction} showAttribution={false} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
