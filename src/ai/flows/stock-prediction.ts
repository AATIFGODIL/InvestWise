
'use server';

/**
 * @fileOverview A stock prediction AI agent that uses a custom Python API.
 *
 * - stockPrediction - A function that handles the stock prediction interactions.
 */

import {ai} from '@/ai/genkit';
import { StockPredictionInputSchema, StockPredictionOutputSchema, type StockPredictionInput, type StockPredictionOutput } from '@/ai/types/stock-prediction-types';
import { getPredictionFromApi } from '../tools/prediction-api-tool';


export async function stockPrediction(input: StockPredictionInput): Promise<StockPredictionOutput> {
  return stockPredictionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'stockPredictionPrompt',
  input: {schema: StockPredictionInputSchema},
  output: {schema: StockPredictionOutputSchema},
  tools: [getPredictionFromApi],
  prompt: `You are an expert financial analyst AI. Your task is to provide a stock price prediction using the provided tool.

  User Input: {{{symbol}}}

  1. You MUST use the getPredictionFromApi tool to get a prediction for the user's symbol.
  2. The tool will return a JSON object with the prediction and confidence.
  3. Present the prediction and confidence level from the tool's response to the user in a clear and concise way.
  4. Do NOT use any general knowledge. Rely solely on the output from the getPredictionFromApi tool.
  5. If the tool returns an error, inform the user that the prediction could not be retrieved from the custom model.`,
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
