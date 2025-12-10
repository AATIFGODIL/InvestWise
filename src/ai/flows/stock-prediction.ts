
'use server';

/**
 * @fileOverview Defines an AI-powered stock prediction flow.
 * This flow uses a custom tool to fetch raw forecast data from an external API,
 * then uses a language model to interpret that data into a human-readable prediction.
 *
 * - stockPrediction: The main function that clients call to get a stock prediction.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { StockPredictionInputSchema, type StockPredictionInput, StockPredictionOutputSchema, type StockPredictionOutput } from '@/ai/types/stock-prediction-types';
import { getPredictionFromApi } from '../tools/prediction-api-tool';

/**
 * An asynchronous function that serves as the entry point for the stock prediction flow.
 *
 * @param {StockPredictionInput} input - An object containing the stock symbol to be predicted.
 * @returns {Promise<StockPredictionOutput | null>} A promise that resolves to the interpreted prediction, or null if an error occurs.
 */
export async function stockPrediction(input: StockPredictionInput): Promise<StockPredictionOutput | null> {
  return stockPredictionFlow(input);
}

// This prompt instructs the AI to act as a financial analyst. Its role is to translate
// raw, numerical forecast data into a clear, beginner-friendly summary.
// The prompt specifies the exact structure of the output (prediction and confidence)
// to ensure consistent and parseable results.
const interpretStockPredictionPrompt = ai.definePrompt({
  name: 'interpretStockPredictionPrompt',
  input: { schema: StockPredictionInputSchema },
  output: { schema: StockPredictionOutputSchema },
  tools: [getPredictionFromApi], // Make the tool available to the LLM
  prompt: `You are a financial analyst AI. Your task is to provide a clear, concise, and easy-to-understand stock prediction for a beginner investor.
    
    1. First, use the getPredictionFromApi tool to fetch the raw forecast data for the given stock symbol: {{{symbol}}}.
    2. Then, analyze the raw forecast data, which consists of an array of 5 predicted prices for the next 5 months.
    
    In your summary (the 'prediction' field), provide a human-readable analysis of these 5 monthly price points. Explain the overall trend (e.g., "appears to be trending upwards," "is expected to dip slightly," "might remain volatile"). Mention potential highs and lows based on the forecast data to give a clear picture of the expected short-term movement over the next five months.

    Finally, assign a confidence level ('confidence' field) based on the model's accuracy score from the API response. Use these specific mappings:
    - accuracy > 0.85 should be "High"
    - accuracy > 0.70 should be "Medium"
    - otherwise, it should be "Low"
    `,
});

// This flow executes the prompt, which in turn will use the provided tool to get the data it needs.
const stockPredictionFlow = ai.defineFlow(
  {
    name: 'stockPredictionFlow',
    inputSchema: StockPredictionInputSchema,
    outputSchema: z.nullable(StockPredictionOutputSchema),
  },
  async (input) => {
    try {
      const { output } = await interpretStockPredictionPrompt(input);
      return output || null;
    } catch (error) {
      // Log errors for debugging and throw to the client for proper error handling.
      console.error("An error occurred during the stock prediction flow:", error);
      throw error;
    }
  }
);
