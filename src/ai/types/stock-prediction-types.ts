/**
 * @fileOverview Types and schemas for the stock prediction AI agent.
 *
 * - StockPredictionInputSchema - The Zod schema for the stock prediction input.
 * - StockPredictionInput - The TypeScript type for the stock prediction input.
 * - StockPredictionOutputSchema - The Zod schema for the stock prediction output.
 * - StockPredictionOutput - The TypeScript type for the stock prediction output.
 */

import { z } from 'genkit';

export const StockPredictionInputSchema = z.object({
  symbol: z.string().describe('The stock symbol to predict.'),
});
export type StockPredictionInput = z.infer<typeof StockPredictionInputSchema>;

export const StockPredictionOutputSchema = z.object({
  prediction: z.string().describe('The AI-generated prediction for the stock.'),
  confidence: z.enum(["High", "Medium", "Low"]).describe('The confidence level of the prediction.'),
});
export type StockPredictionOutput = z.infer<typeof StockPredictionOutputSchema>;
