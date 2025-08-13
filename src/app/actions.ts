
"use server";

import { investmentChatbot } from "@/ai/flows/investment-chatbot";
import { stockPrediction, type StockPredictionOutput } from "@/ai/flows/stock-prediction";

type ActionResult = {
  success: boolean;
  response: string;
  error?: string;
};

type StockPredictionResult = {
    success: boolean;
    prediction?: StockPredictionOutput;
    error?: string;
}

export async function handleInvestmentQuery(query: string): Promise<ActionResult> {
  if (!query) {
    return { success: false, response: "", error: "Query cannot be empty." };
  }

  try {
    const result = await investmentChatbot({ query });
    return { success: true, response: result.response };
  } catch (error) {
    console.error("Error calling investment chatbot flow:", error);
    return {
      success: false,
      response: "",
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

export async function handleStockPrediction(symbol: string): Promise<StockPredictionResult> {
    if (!symbol) {
        return { success: false, error: "Symbol cannot be empty." };
    }

    try {
        const result = await stockPrediction({ symbol });
        return { success: true, prediction: result };
    } catch (error) {
        console.error("Error calling stock prediction flow:", error);
        return {
            success: false,
            error: "An unexpected error occurred while generating the prediction.",
        };
    }
}
