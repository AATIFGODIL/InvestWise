
'use server';

/**
 * @fileOverview A stock prediction AI agent.
 *
 * - stockPrediction - A function that handles the stock prediction interactions.
 * - StockPredictionInput - The input type for the stockPrediction function.
 * - StockPredictionOutput - The return type for the stockPrediction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const StockPredictionInputSchema = z.object({
  symbol: z.string().describe('The stock symbol to predict.'),
});
export type StockPredictionInput = z.infer<typeof StockPredictionInputSchema>;

export const StockPredictionOutputSchema = z.object({
  prediction: z.string().describe('The AI-generated prediction for the stock.'),
  confidence: z.enum(["High", "Medium", "Low"]).describe('The confidence level of the prediction.'),
});
export type StockPredictionOutput = z.infer<typeof StockPredictionOutputSchema>;

export async function stockPrediction(input: StockPredictionInput): Promise<StockPredictionOutput> {
  return stockPredictionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'stockPredictionPrompt',
  input: {schema: StockPredictionInputSchema},
  output: {schema: StockPredictionOutputSchema},
  prompt: `You are a financial analyst AI. Analyze the provided stock symbol and predict its potential price movement for the next 7 days.

  Stock Symbol: {{{symbol}}}

  Provide a concise prediction and a confidence level (High, Medium, or Low). Base your analysis on general market knowledge and sentiment. Do not use real-time data. This is a simulation.`,
});

const stockPredictionFlow = ai.defineFlow(
  {
    name: 'stockPredictionFlow',
    inputSchema: StockPredictionInputSchema,
    outputSchema: StockPredictionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
