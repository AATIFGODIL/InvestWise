
'use server';

/**
 * @fileOverview A stock prediction AI agent.
 *
 * - stockPrediction - A function that handles the stock prediction interactions.
 */

import {ai} from '@/ai/genkit';
import { StockPredictionInputSchema, StockPredictionOutputSchema, type StockPredictionInput, type StockPredictionOutput } from '@/ai/types/stock-prediction-types';
import { getStockData } from '../tools/stock-data-tool';


export async function stockPrediction(input: StockPredictionInput): Promise<StockPredictionOutput> {
  return stockPredictionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'stockPredictionPrompt',
  input: {schema: StockPredictionInputSchema},
  output: {schema: StockPredictionOutputSchema},
  tools: [getStockData],
  prompt: `You are an expert financial analyst AI. Your task is to predict the potential price movement for a given stock symbol for the next 7 days.

  Stock Symbol: {{{symbol}}}

  1.  First, call the getStockData tool to retrieve the recent historical data for the provided stock symbol.
  2.  Analyze the retrieved data, looking for trends, volatility, and recent performance.
  3.  Based on your analysis of the historical data and general market knowledge, provide a concise prediction for the stock's likely movement.
  4.  Provide a confidence level (High, Medium, or Low) for your prediction. Do not use real-time data beyond what the tool provides. This is a simulation based on recent history.`,
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
