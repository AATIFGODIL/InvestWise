
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BrainCircuit, Loader2 } from "lucide-react";
import { handleStockPrediction } from "@/app/actions";
import { type StockPredictionOutput } from "@/ai/flows/stock-prediction";
import usePortfolioStore from "@/store/portfolio-store";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AiPrediction() {
  const { holdings } = usePortfolioStore();
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [prediction, setPrediction] = useState<StockPredictionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetPrediction = async () => {
    if (!selectedSymbol) return;
    setIsLoading(true);
    setError(null);
    setPrediction(null);

    const result = await handleStockPrediction(selectedSymbol);

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
          Select a stock from your portfolio to get an AI-powered prediction for the next 7 days. This is a simulation and not financial advice.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-grow space-y-2">
            <Label htmlFor="stock-select">Select a Stock</Label>
            <Select onValueChange={setSelectedSymbol} value={selectedSymbol}>
              <SelectTrigger id="stock-select">
                <SelectValue placeholder="Choose a stock..." />
              </SelectTrigger>
              <SelectContent>
                {holdings.map((h) => (
                  <SelectItem key={h.symbol} value={h.symbol}>
                    {h.symbol} - {h.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGetPrediction} disabled={!selectedSymbol || isLoading} className="self-end">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BrainCircuit className="mr-2 h-4 w-4" />
            )}
            Get Prediction
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {prediction && (
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-lg">Prediction for {selectedSymbol}</h4>
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
