
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
    console.log(`Calling prediction API for symbol: ${input.symbol}`);
    const url = 'http://localhost:8000/predict'; // The user-provided API endpoint

    try {
      const response = await fetch(url, {
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
        throw new Error(`The prediction API returned an error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Received prediction from API:`, data);
      
      // Assuming the API returns a structure like { prediction: "...", confidence: "..." }
      // We will return the whole object to be formatted by the main AI
      return data;

    } catch (error: any) {
      console.error(`Failed to call prediction API for "${input.symbol}":`, error.message);
      return { error: 'An error occurred while communicating with the prediction service.' };
    }
  }
);
