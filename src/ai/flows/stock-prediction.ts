
'use server';

/**
 * @fileOverview A stock prediction AI agent.
 *
 * - stockPrediction - A function that handles the stock prediction interactions.
 */

import {ai} from '@/ai/genkit';
import { StockPredictionInputSchema, StockPredictionOutputSchema, type StockPredictionInput, type StockPredictionOutput } from '@/ai/types/stock-prediction-types';
import { getStockData, searchSymbol } from '../tools/stock-data-tool';


export async function stockPrediction(input: StockPredictionInput): Promise<StockPredictionOutput> {
  return stockPredictionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'stockPredictionPrompt',
  input: {schema: StockPredictionInputSchema},
  output: {schema: StockPredictionOutputSchema},
  tools: [getStockData, searchSymbol],
  prompt: `You are an expert financial analyst AI. Your task is to predict the potential price movement for a given stock symbol for the next 7 days.

  User Input: {{{symbol}}}

  1.  First, determine if the user provided a ticker symbol or a company name.
  2.  If it looks like a company name (e.g., "Apple", "Microsoft"), use the searchSymbol tool to find the most likely ticker symbol.
  3.  If you find a ticker symbol, use that symbol to call the getStockData tool to retrieve the recent historical data.
  4.  If the user provides a ticker symbol directly, use the getStockData tool.
  5.  Analyze the retrieved data, looking for trends, volatility, and recent performance.
  6.  Based on your analysis of the historical data and general market knowledge, provide a concise prediction for the stock's likely movement.
  7.  Provide a confidence level (High, Medium, or Low) for your prediction. Do not use real-time data beyond what the tool provides. This is a simulation based on recent history.
  8.  If you cannot find a symbol or retrieve data, inform the user clearly.`,
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
