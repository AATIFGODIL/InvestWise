
'use server';

/**
 * @fileOverview A stock prediction AI agent.
 *
 * - stockPrediction - A function that handles the stock prediction interactions.
 */

import {ai} from '@/ai/genkit';
import { StockPredictionInputSchema, StockPredictionOutputSchema, type StockPredictionInput, type StockPredictionOutput } from '@/ai/types/stock-prediction-types';


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
