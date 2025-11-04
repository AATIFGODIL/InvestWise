
'use server';

/**
 * @fileOverview Server Actions for the application.
 * This file contains asynchronous functions that can be called directly from client components
 * to handle server-side logic like AI interactions.
 */

import { investmentChatbot } from "@/ai/flows/investment-chatbot";
import type { InvestmentChatbotOutput } from "@/ai/types/investment-chatbot-types";
import { stockPrediction } from "@/ai/flows/stock-prediction";
import type { StockPredictionOutput } from "@/ai/types/stock-prediction-types";
import { createAvatar } from "@/ai/flows/create-avatar-flow";
import type { CreateAvatarInput, CreateAvatarOutput } from "@/ai/types/create-avatar-types";


/**
 * A standardized result type for server actions to ensure consistent responses.
 */
type ActionResult = {
  success: boolean;
  response: string;
  error?: string;
};

/**
 * A standardized result type for the stock prediction action.
 */
type StockPredictionResult = {
    success: boolean;
    prediction?: StockPredictionOutput;
    error?: string;
}

/**
 * Calls the investment chatbot AI flow to answer a user's query.
 * @param {string} query - The user's question about an investment term.
 * @param {string} [fileDataUri] - Optional file data as a data URI string.
 * @returns {Promise<ActionResult>} An object with the chatbot's response or an error.
 */
export async function handleInvestmentQuery(query: string, fileDataUri?: string): Promise<ActionResult> {
  if (!query && !fileDataUri) {
    return { success: false, response: "", error: "Your question cannot be empty." };
  }

  try {
    const result = await investmentChatbot({ query, fileDataUri });
    return { success: true, response: result.response };
  } catch (error) {
    console.error("Error calling investment chatbot flow:", error);
    return {
      success: false,
      response: "",
      error: "I'm sorry, but I encountered an unexpected issue. Please try asking again later.",
    };
  }
}

/**
 * Calls the stock prediction AI flow to generate a forecast for a given stock symbol.
 * @param {string} symbol - The stock symbol (e.g., AAPL).
 * @returns {Promise<StockPredictionResult>} An object with the prediction data or an error.
 */
export async function handleStockPrediction(symbol: string): Promise<StockPredictionResult> {
    if (!symbol) {
        return { success: false, error: "Stock symbol cannot be empty." };
    }

    try {
        const result = await stockPrediction({ symbol });
        if (!result) {
             return { success: false, error: "You have reached the daily limit for predictions. Please try again tomorrow." };
        }
        return { success: true, prediction: result };
    } catch (error: any) {
        console.error("Error calling stock prediction flow:", error);
        return {
            success: false,
            error: error.message || "An unexpected error occurred while generating the prediction.",
        };
    }
}

/**
 * Calls the AI avatar creation flow.
 * @param {CreateAvatarInput} input - The user's prompt and/or photo.
 * @returns {Promise<{success: boolean, avatar?: CreateAvatarOutput, error?: string}>} The generated avatar or an error.
 */
export async function handleAvatarCreation(input: CreateAvatarInput): Promise<{success: boolean, avatar?: CreateAvatarOutput, error?: string}> {
  if (!input.prompt && !input.photoDataUri) {
    return { success: false, error: "Please provide a prompt or a photo." };
  }

  try {
    const result = await createAvatar(input);
    if (!result || !result.avatarDataUri) {
      throw new Error("The AI model did not return an image. Please try a different prompt or image.");
    }
    return { success: true, avatar: result };
  } catch (error: any) {
    console.error("Error calling avatar creation flow:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred while creating your avatar.",
    };
  }
}
