
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

const stockPredictionFlow = ai.defineFlow(
  {
    name: 'stockPredictionFlow',
    inputSchema: StockPredictionInputSchema,
    outputSchema: StockPredictionOutputSchema,
  },
  async (input) => {
    const result = await getPredictionFromApi(input);

    if (result.error) {
      throw new Error(result.error);
    }
    
    if (!result.prediction || !result.confidence) {
        throw new Error("Invalid response from prediction API.");
    }

    return {
      prediction: result.prediction,
      confidence: result.confidence,
    };
  }
);
