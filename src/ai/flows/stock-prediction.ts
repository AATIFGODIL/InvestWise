
'use server';

/**
 * @fileOverview A stock prediction AI agent that uses a custom tool to call a Python API
 * and then interprets the results into a human-readable forecast.
 *
 * - stockPrediction - A function that handles the stock prediction interactions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { StockPredictionInputSchema, type StockPredictionInput, StockPredictionOutputSchema, type StockPredictionOutput } from '@/ai/types/stock-prediction-types';
import { getPredictionFromApi } from '../tools/prediction-api-tool';

export async function stockPrediction(input: StockPredictionInput): Promise<StockPredictionOutput> {
  return stockPredictionFlow(input);
}

const InterpretationPromptSchema = z.object({
    symbol: z.string(),
    forecast: z.string(),
    accuracy: z.number(),
});

const prompt = ai.definePrompt({
    name: 'interpretStockPredictionPrompt',
    input: { schema: InterpretationPromptSchema },
    output: { schema: StockPredictionOutputSchema },
    prompt: `You are a financial analyst. Your task is to interpret raw stock forecast data and present a clear, concise, and easy-to-understand prediction for a beginner investor.

    Here is the data for the stock symbol {{{symbol}}}:
    - 5-day price forecast: {{{forecast}}}
    - Model accuracy: {{{accuracy}}}

    Based on this data, provide the following:
    1.  **prediction**: A human-readable summary of the forecast. Explain the overall trend (e.g., "trending upwards," "expected to dip slightly," "remain volatile"). Mention the potential highs and lows based on the forecast data. Calculate the percentage change between the first and second day, and the first and third day, and mention it in the summary.
    2.  **confidence**: A confidence level based on the model's accuracy score. Use these mappings:
        - accuracy > 0.85: "High"
        - accuracy > 0.70: "Medium"
        - otherwise: "Low"
    `,
});


const stockPredictionFlow = ai.defineFlow(
  {
    name: 'stockPredictionFlow',
    inputSchema: StockPredictionInputSchema,
    outputSchema: StockPredictionOutputSchema,
    tools: [getPredictionFromApi],
  },
  async (input) => {
    // 1. Call the external API via the tool
    const predictionResult = await getPredictionFromApi(input);

    if (!predictionResult || !predictionResult.forecast || predictionResult.forecast.length === 0) {
        throw new Error("Failed to get a valid prediction from the external service.");
    }
    
    // 2. Interpret the raw data using an LLM
    const { output } = await prompt({
        symbol: predictionResult.symbol,
        forecast: JSON.stringify(predictionResult.forecast),
        accuracy: predictionResult.accuracy,
    });

    if (!output) {
        throw new Error("Failed to interpret the prediction data.");
    }

    return output;
  }
);
