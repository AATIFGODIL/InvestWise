
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const getPredictionFromApi = ai.defineTool(
  {
    name: 'getPredictionFromApi',
    description: 'Gets a stock price prediction from the custom Python API.',
    inputSchema: z.object({
      symbol: z.string().describe('The ticker symbol of the stock.'),
    }),
    outputSchema: z.any(),
  },
  async (input) => {
    const apiUrl = process.env.NEXT_PUBLIC_PREDICTION_API_URL;

    if (!apiUrl) {
      console.error("Prediction API URL is not configured. Please set NEXT_PUBLIC_PREDICTION_API_URL in your .env file.");
      return { error: 'The prediction service is not configured. Please contact support.' };
    }
    
    console.log(`Calling prediction API for symbol: ${input.symbol} at ${apiUrl}`);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ symbol: input.symbol }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`API call failed with status ${response.status}:`, errorBody);
        return { error: `The prediction API returned an error: ${response.statusText}` };
      }

      const data = await response.json();
      console.log(`Received prediction from API:`, data);
      
      // Assuming the API returns a structure like { prediction: "...", confidence: "..." }
      return data;

    } catch (error: any) {
      console.error(`Failed to call prediction API for "${input.symbol}":`, error);
      // Provide a more specific error message back to the flow.
      return { error: `An error occurred while communicating with the prediction service: ${error.message}` };
    }
  }
);
