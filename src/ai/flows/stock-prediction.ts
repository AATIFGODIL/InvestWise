// InvestWise - A modern stock trading and investment education platform for young investors

'use server';

/**
 * @fileOverview Defines an AI-powered stock prediction flow.
 * This flow uses a custom tool to fetch raw forecast data from an external API,
 * then uses a language model to interpret that data into a human-readable prediction.
 *
 * - stockPrediction: The main function that clients call to get a stock prediction.
 */

import { getAi } from '@/ai/genkit';
import { getEnvVar } from '@/lib/env';
import { z } from 'zod';
import { StockPredictionInputSchema, type StockPredictionInput, StockPredictionOutputSchema, type StockPredictionOutput, RawStockPredictionOutputSchema } from '@/ai/types/stock-prediction-types';

/**
 * An asynchronous function that serves as the entry point for the stock prediction flow.
 */
export async function stockPrediction(input: StockPredictionInput): Promise<StockPredictionOutput | null> {
  const ai = getAi();

  // Define tool at runtime
  const getPredictionFromApi = ai.defineTool(
    {
      name: 'getPredictionFromApi',
      description: 'Fetches a stock price prediction from the custom Python API.',
      inputSchema: StockPredictionInputSchema,
      outputSchema: RawStockPredictionOutputSchema,
    },
    async (toolInput) => {
      const apiUrl = getEnvVar('PREDICTION_API_URL');
      if (!apiUrl) {
        throw new Error("PREDICTION_API_URL is not defined.");
      }
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: toolInput.symbol }),
      });
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      return RawStockPredictionOutputSchema.parse(await response.json());
    }
  );

  // Define prompt at runtime
  const interpretStockPredictionPrompt = ai.definePrompt({
    name: 'interpretStockPredictionPrompt',
    input: { schema: StockPredictionInputSchema },
    output: { schema: StockPredictionOutputSchema },
    tools: [getPredictionFromApi],
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

  try {
    const { output } = await interpretStockPredictionPrompt(input);
    return output || null;
  } catch (error) {
    console.error("An error occurred during the stock prediction flow:", error);
    throw error;
  }
}
