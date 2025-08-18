'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import yahooFinance from 'yahoo-finance2';

export const getStockData = ai.defineTool(
  {
    name: 'getStockData',
    description: 'Returns recent historical stock data for a given ticker symbol.',
    inputSchema: z.object({
      symbol: z.string().describe('The ticker symbol of the stock.'),
    }),
    outputSchema: z.any(),
  },
  async (input) => {
    console.log(`Fetching stock data for ${input.symbol}`);
    try {
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(today.getMonth() - 1);

      const queryOptions = {
        period1: oneMonthAgo.toISOString().split('T')[0],
        period2: today.toISOString().split('T')[0],
        interval: '1d' as const,
      };

      const results = await yahooFinance.historical(input.symbol, queryOptions);
      
      // Limit to the last 10 trading days to keep the data concise for the prompt
      const recentResults = results.slice(-10);

      console.log(`Successfully fetched ${recentResults.length} data points for ${input.symbol}`);
      return recentResults;
    } catch (error) {
      console.error(`Failed to fetch data for ${input.symbol}:`, error);
      return {
        error: `Could not retrieve stock data for ${input.symbol}. It may be an invalid symbol.`,
      };
    }
  }
);
