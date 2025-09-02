
'use server';

/**
 * @fileOverview Defines an AI-powered stock prediction flow.
 * This flow uses a custom tool to fetch raw forecast data from an external API,
 * then uses a language model to interpret that data into a human-readable prediction.
 *
 * - stockPrediction: The main function that clients call to get a stock prediction.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { StockPredictionInputSchema, type StockPredictionInput, StockPredictionOutputSchema, type StockPredictionOutput } from '@/ai/types/stock-prediction-types';
import { getPredictionFromApi } from '../tools/prediction-api-tool';

/**
 * An asynchronous function that serves as the entry point for the stock prediction flow.
 *
 * @param {StockPredictionInput} input - An object containing the stock symbol to be predicted.
 * @returns {Promise<StockPredictionOutput | null>} A promise that resolves to the interpreted prediction, or null if an error occurs.
 */
export async function stockPrediction(input: StockPredictionInput): Promise<StockPredictionOutput | null> {
  return stockPredictionFlow(input);
}

/**
 * Zod schema for the input required by the interpretation prompt.
 * This is internal to the flow and combines data from the external API call.
 */
const InterpretationPromptSchema = z.object({
    symbol: z.string().describe("The stock ticker symbol, e.g., 'AAPL' for Apple."),
    forecast: z.string().describe("A JSON string representing an array of forecasted prices for the next 5 months."),
    accuracy: z.number().describe("A score from 0 to 1 indicating the prediction model's accuracy."),
});

/**
 * Defines the AI prompt for interpreting the raw forecast data.
 * This prompt instructs the AI to act as a financial analyst and provide a clear, beginner-friendly summary.
 */
const prompt = ai.definePrompt({
    name: 'interpretStockPredictionPrompt',
    input: { schema: InterpretationPromptSchema },
    output: { schema: StockPredictionOutputSchema },
    prompt: `You are a financial analyst AI. Your task is to interpret raw stock forecast data and present a clear, concise, and easy-to-understand prediction for a beginner investor.
    Use a friendly and informative tone. Start the prediction with an engaging sentence.

    Here is the data for the stock symbol {{{symbol}}}:
    - 5-month price forecast (as a JSON array): {{{forecast}}}
    - Prediction model accuracy score: {{{accuracy}}}

    Based on this data, please provide the following analysis:
    1.  **prediction**: Write a human-readable summary of the 5-month forecast. Explain the overall trend (e.g., "appears to be trending upwards," "is expected to dip slightly," "might remain volatile"). Mention potential highs and lows based on the forecast data. Calculate the percentage change between the first and second month, and the first and third month, and include it in your summary to give a clearer picture of the short-term movement.
    2.  **confidence**: Assign a confidence level based on the model's accuracy score. Use these specific mappings:
        - accuracy > 0.85 should be "High"
        - accuracy > 0.70 should be "Medium"
        - otherwise, it should be "Low"
    `,
});

/**
 * Defines the main Genkit flow for stock prediction.
 * This flow chains together a tool call (to an external API) and a prompt call (to an LLM).
 */
const stockPredictionFlow = ai.defineFlow(
  {
    name: 'stockPredictionFlow',
    inputSchema: StockPredictionInputSchema,
    outputSchema: z.nullable(StockPredictionOutputSchema),
    // The 'tools' array makes the getPredictionFromApi tool available to this flow.
    tools: [getPredictionFromApi],
  },
  async (input) => {
    try {
        // Step 1: Call the external prediction API via the Genkit tool.
        const predictionResult = await getPredictionFromApi(input);

        // Gracefully handle cases where the API might not return a valid forecast.
        if (!predictionResult || !predictionResult.forecast || predictionResult.forecast.length === 0) {
            console.error("Prediction API returned no forecast data.");
            return null;
        }
        
        // Step 2: Use the LLM to interpret the raw data from the API.
        const { output } = await prompt({
            symbol: predictionResult.symbol,
            forecast: JSON.stringify(predictionResult.forecast), // Convert array to JSON string for the prompt
            accuracy: predictionResult.accuracy,
        });
        
        return output || null;

    } catch (error) {
        // Log the error for debugging purposes and return null to the client.
        console.error("An error occurred during the stock prediction flow:", error);
        return null; // Return null to indicate an error, which can be handled gracefully by the calling function.
    }
  }
);
