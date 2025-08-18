'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
    console.log(`Fetching stock data for ${input.symbol} from Alpha Vantage`);
    const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY;
    if (!apiKey) {
        console.error("Alpha Vantage API key is not set.");
        return { error: "API key for financial data is not configured." };
    }
    
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${input.symbol}&apikey=${apiKey}&outputsize=compact`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }
      
      const timeSeries = data['Time Series (Daily)'];
      if (!timeSeries) {
          throw new Error('No time series data found for the symbol.');
      }

      // Get the last 10 trading days
      const recentDates = Object.keys(timeSeries).slice(0, 10);
      const recentResults = recentDates.map(date => {
        return {
          date: date,
          open: parseFloat(timeSeries[date]['1. open']),
          high: parseFloat(timeSeries[date]['2. high']),
          low: parseFloat(timeSeries[date]['3. low']),
          close: parseFloat(timeSeries[date]['4. close']),
          volume: parseInt(timeSeries[date]['5. volume']),
        };
      });

      console.log(`Successfully fetched ${recentResults.length} data points for ${input.symbol}`);
      return recentResults;
    } catch (error: any) {
      console.error(`Failed to fetch data for ${input.symbol} from Alpha Vantage:`, error.message);
      return {
        error: `Could not retrieve stock data for ${input.symbol}. It may be an invalid symbol or an API issue.`,
      };
    }
  }
);
