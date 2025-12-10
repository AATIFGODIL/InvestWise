
'use server';

/**
 * @fileOverview Server Actions for the application.
 * This file contains asynchronous functions that can be called directly from client components
 * to handle server-side logic like AI interactions and secure payment processing.
 */

import { investmentChatbot } from "@/ai/flows/investment-chatbot";
import type { InvestmentChatbotOutput } from "@/ai/types/investment-chatbot-types";
import { stockPrediction } from "@/ai/flows/stock-prediction";
import type { StockPredictionOutput } from "@/ai/types/stock-prediction-types";
import { createAvatar } from "@/ai/flows/create-avatar-flow";
import type { CreateAvatarInput, CreateAvatarOutput } from "@/ai/types/create-avatar-types";
import { getBraintreeGateway } from "@/lib/braintree";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";


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
      // Result is null if the flow failed/threw an exception
      return { success: false, error: "Failed to generate prediction. Please check the stock symbol or try again later." };
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
export async function handleAvatarCreation(input: CreateAvatarInput): Promise<{ success: boolean, avatar?: CreateAvatarOutput, error?: string }> {
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

/**
 * Generates a Braintree client token to initialize the Drop-in UI.
 * @returns {Promise<string>} The Braintree client token.
 * @throws {Error} If the token generation fails.
 */
export async function getClientToken(): Promise<string> {
  const gateway = getBraintreeGateway();
  const response = await gateway.clientToken.generate({});
  if (!response.success) {
    throw new Error("Failed to generate Braintree client token.");
  }
  return response.clientToken;
}

interface VaultPaymentMethodArgs {
  nonce: string;
  userId: string;
}

/**
 * Creates a payment method in the Braintree vault and associates the token with the user's Firebase document.
 * @param {VaultPaymentMethodArgs} args - The payment nonce and user ID.
 * @returns {Promise<{success: boolean, error?: string}>} An object indicating success or failure.
 */
export async function vaultPaymentMethod({ nonce, userId }: VaultPaymentMethodArgs): Promise<{ success: boolean, error?: string }> {
  const gateway = getBraintreeGateway();
  try {
    const result = await gateway.paymentMethod.create({
      paymentMethodNonce: nonce,
      customerId: userId, // Use Firebase UID as Braintree Customer ID
      options: {
        makeDefault: true,
        failOnDuplicatePaymentMethod: true,
      },
    });

    if (!result.success) {
      console.error("Braintree error:", result.message);
      return { success: false, error: result.message };
    }

    // The token for the vaulted payment method
    const token = result.paymentMethod.token;

    // Save the payment method token to the user's document in Firestore
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { paymentMethodToken: token });

    return { success: true };
  } catch (error: any) {
    console.error("Error vaulting payment method:", error);
    return { success: false, error: error.message || 'An unknown error occurred.' };
  }
}

import { getTopFinancialNews, getMarketNews } from "@/lib/gnews";

export async function fetchTopFinancialNewsAction(limit?: number) {
  return await getTopFinancialNews(limit);
}

export async function fetchMarketNewsAction(limit?: number) {
  return await getMarketNews(limit);
}

/**
 * Fetches historical stock data from Yahoo Finance as a fallback for Finnhub.
 * @param {string} symbol - The stock symbol.
 * @param {string} range - The time range (1d, 5d, 1mo, 6mo, 1y, 5y).
 * @param {string} interval - The interval (1m, 5m, 15m, 1d, 1wk, 1mo).
 */
export async function fetchStockHistory(symbol: string, range: string = '1mo', interval: string = '1d'): Promise<{ t: number[], c: number[] } | null> {
  try {
    // Yahoo Finance Chart API
    // Note: This is an unofficial endpoint but widely used.
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      console.error(`Yahoo Finance fetch failed for ${symbol}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const result = data.chart.result?.[0];

    if (!result || !result.timestamp || !result.indicators.quote?.[0]?.close) {
      return null;
    }

    const timestamps = result.timestamp;
    const closes = result.indicators.quote[0].close;

    // Filter out nulls (Yahoo sometimes returns nulls for market closes/opens in the middle of data)
    const validData = timestamps.reduce((acc: any, t: number, i: number) => {
      if (closes[i] !== null) {
        acc.t.push(t);
        acc.c.push(closes[i]);
      }
      return acc;
    }, { t: [], c: [] });

    return validData;
  } catch (error) {
    console.error(`Error in fetchStockHistory for ${symbol}:`, error);
    return null;
  }
}
