'use server';

/**
 * @fileOverview A Genkit tool to communicate with the external Python prediction API.
 * 
 * - getPredictionFromApi - A tool that fetches stock predictions.
 */

import { ai } from '@/ai/genkit';
import { StockPredictionInputSchema, StockPredictionOutputSchema } from '@/ai/types/stock-prediction-types';
import { z } from 'zod';

// This is the tool that Genkit will use.
export const getPredictionFromApi = ai.defineTool(
  {
    name: 'getPredictionFromApi',
    description: 'Fetches a stock prediction from the custom Python API.',
    input: { schema: StockPredictionInputSchema },
    output: { schema: StockPredictionOutputSchema },
  },
  async (input) => {
    // Read the API URL from environment variables for flexibility.
    const apiUrl = process.env.PREDICTION_API_URL;
    if (!apiUrl) {
      throw new Error("PREDICTION_API_URL is not defined in the environment variables.");
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol: input.symbol }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`API request failed with status ${response.status}: ${errorBody.error || 'Unknown error'}`);
      }

      const data = await response.json();

      // Validate the data against our expected output schema.
      const parsedData = StockPredictionOutputSchema.parse(data);
      return parsedData;

    } catch (error: any) {
      console.error("Error communicating with the prediction service:", error);
      // Re-throw a more user-friendly error message.
      // Include original error details for better debugging in the server logs.
      throw new Error(`An error occurred while communicating with the prediction service: ${error.message}`);
    }
  }
);
