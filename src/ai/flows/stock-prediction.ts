
'use server';

/**
 * @fileOverview A stock prediction AI agent that uses a custom tool to call a Python API.
 *
 * - stockPrediction - A function that handles the stock prediction interactions.
 */

import {ai} from '@/ai/genkit';
import { StockPredictionInputSchema, StockPredictionOutputSchema, type StockPredictionInput, type StockPredictionOutput } from '@/ai/types/stock-prediction-types';
import { getPredictionFromApi } from '../tools/prediction-api-tool';

export async function stockPrediction(input: StockPredictionInput): Promise<StockPredictionOutput> {
  return stockPredictionFlow(input);
}

const stockPredictionFlow = ai.defineFlow(
  {
    name: 'stockPredictionFlow',
    inputSchema: StockPredictionInputSchema,
    outputSchema: StockPredictionOutputSchema,
    tools: [getPredictionFromApi],
  },
  async (input) => {
    
    const predictionResult = await getPredictionFromApi(input);

    if (!predictionResult) {
        throw new Error("Failed to get a prediction from the external service.");
    }
    
    // The tool itself now returns data in the correct format.
    return predictionResult;
  }
);
