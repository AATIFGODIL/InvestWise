
/**
 * @fileOverview Types and schemas for the stock prediction AI agent.
 */

import { z } from 'genkit';

// Input from the user to the main flow
export const StockPredictionInputSchema = z.object({
  symbol: z.string().describe('The stock symbol to predict.'),
});
export type StockPredictionInput = z.infer<typeof StockPredictionInputSchema>;


// The raw output from the external prediction API tool
export const RawStockPredictionOutputSchema = z.object({
    symbol: z.string(),
    forecast: z.array(z.number()),
    accuracy: z.number(),
});
export type RawStockPredictionOutput = z.infer<typeof RawStockPredictionOutputSchema>;


// The final, interpreted output that is sent to the UI
export const StockPredictionOutputSchema = z.object({
  prediction: z.string().describe('The AI-generated human-readable summary of the stock forecast.'),
  confidence: z.enum(["High", "Medium", "Low"]).describe('The confidence level of the prediction.'),
});
export type StockPredictionOutput = z.infer<typeof StockPredictionOutputSchema>;
