
'use server';

/**
 * @fileOverview A Genkit tool for fetching stock predictions from an external Python API.
 * This tool acts as a bridge between the Genkit AI flow and the prediction service.
 *
 * - getPredictionFromApi: A Genkit tool that makes a POST request to the prediction API.
 */

import { ai } from '@/ai/genkit';
import { StockPredictionInputSchema, RawStockPredictionOutputSchema } from '@/ai/types/stock-prediction-types';

/**
 * Defines a Genkit tool that communicates with the external Python prediction API.
 * Tools allow Genkit flows to interact with external systems and data sources.
 */
export const getPredictionFromApi = ai.defineTool(
  {
    name: 'getPredictionFromApi',
    description: 'Fetches a stock price prediction from the custom Python API.',
    input: { schema: StockPredictionInputSchema },
    output: { schema: RawStockPredictionOutputSchema },
  },
  async (input) => {
    // Read the API URL from environment variables for better security and flexibility.
    const apiUrl = process.env.PREDICTION_API_URL;
    if (!apiUrl) {
      throw new Error("PREDICTION_API_URL is not defined. Please check the environment variables.");
    }

    try {
      // Make a POST request to the prediction service.
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol: input.symbol }),
      });

      // Handle non-successful HTTP responses.
      if (!response.ok) {
        const errorBody = await response.text();
        let errorMessage = `API request failed with status ${response.status}`;
        
        // Try to parse a JSON error message from the API, but handle plain text errors too.
        try {
            const parsedError = JSON.parse(errorBody);
            errorMessage += `: ${parsedError.error || 'An unknown error occurred in the prediction service.'}`;
        } catch {
            errorMessage += `: ${errorBody}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Validate the received data against the expected Zod schema.
      // This ensures data integrity before it's used elsewhere in the flow.
      const parsedData = RawStockPredictionOutputSchema.parse(data);
      return parsedData;

    } catch (error: any) {
      console.error("Error communicating with the prediction service:", error);
      // Re-throw a more user-friendly error to be caught by the calling flow.
      throw new Error(`An error occurred while fetching the prediction: ${error.message}`);
    }
  }
);
