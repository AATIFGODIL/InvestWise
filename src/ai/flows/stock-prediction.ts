
'use server';

/**
 * @fileOverview A stock prediction AI agent that uses a Genkit prompt.
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
    input: { schema: StockPredictionInputSchema },
    output: { schema: StockPredictionOutputSchema },
    prompt: `You are a financial analyst AI. Analyze the stock with the ticker symbol '{{{symbol}}}'. 
    
    Provide a brief, one-paragraph prediction for its potential performance over the next 7 days. 
    
    Assign a confidence level of High, Medium, or Low based on your analysis. Do not include any financial disclaimers.`,
});


const stockPredictionFlow = ai.defineFlow(
  {
    name: 'stockPredictionFlow',
    inputSchema: StockPredictionInputSchema,
    outputSchema: StockPredictionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("Failed to generate a prediction from the AI model.");
    }
    return output;
  }
);
