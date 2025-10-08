
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrainCircuit, Loader2 } from "lucide-react";
import { handleStockPrediction } from "@/app/actions";
import { type StockPredictionOutput } from "@/ai/types/stock-prediction-types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/theme-store";

interface AiPredictionTradeProps {
    initialSymbol: string;
}

export default function AiPredictionTrade({ initialSymbol }: AiPredictionTradeProps) {
  const [symbol, setSymbol] = useState<string>(initialSymbol);
  const [prediction, setPrediction] = useState<StockPredictionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isClearMode, theme } = useThemeStore();
  const isLightClear = isClearMode && theme === 'light';

  useEffect(() => {
    setSymbol(initialSymbol);
    setPrediction(null);
    setError(null);
  }, [initialSymbol]);

  const handleGetPrediction = async () => {
    if (!symbol) return;
    setIsLoading(true);
    setError(null);
    setPrediction(null);

    const result = await handleStockPrediction(symbol);

    if (result.success && result.prediction) {
      setPrediction(result.prediction);
    } else {
      setError(result.error || "An unknown error occurred.");
    }
    setIsLoading(false);
  };

  const getConfidenceColor = (confidence: "High" | "Medium" | "Low") => {
    switch(confidence) {
        case "High": return "bg-green-500";
        case "Medium": return "bg-yellow-500";
        case "Low": return "bg-red-500";
        default: return "bg-gray-500";
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            AI Stock Prediction
        </CardTitle>
        <CardDescription>
          Enter a stock symbol to get an AI-powered prediction. This is a simulation and not financial advice.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-grow space-y-2">
            <Label htmlFor="stock-symbol">Stock Symbol</Label>
            <Input 
                id="stock-symbol" 
                placeholder="e.g. AAPL"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
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
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-lg">Prediction for {symbol}</h4>
                <Badge className={cn("text-white", getConfidenceColor(prediction.confidence))}>{prediction.confidence} Confidence</Badge>
              </div>
              <p className="text-sm mt-2">{prediction.prediction}</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
