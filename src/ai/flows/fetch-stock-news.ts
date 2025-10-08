
'use server';

/**
 * @fileOverview A flow that fetches recent news for a given stock symbol or general market news using the Finnhub API.
 *
 * - fetchStockNews: The main function that clients call to get news.
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';

const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

const ArticleSchema = z.object({
  headline: z.string().describe("The headline of the news article."),
  source: z.string().describe("The source of the news article (e.g., 'Reuters')."),
  url: z.string().url().describe("The URL to the full article."),
  summary: z.string().optional().describe("A brief summary of the article."),
  image: z.string().url().optional().describe("URL for a thumbnail image."),
});

const StockNewsInputSchema = z.object({
  symbol: z.string().optional().describe("The stock ticker symbol, e.g., 'AAPL' for Apple."),
  category: z.string().optional().describe("The news category, e.g., 'general' for market news."),
});

const StockNewsOutputSchema = z.object({
  articles: z.array(ArticleSchema).describe("A list of recent news articles."),
});

export type StockNewsInput = z.infer<typeof StockNewsInputSchema>;
export type StockNewsOutput = z.infer<typeof StockNewsOutputSchema>;

/**
 * Fetches recent news for a stock symbol or general market news using the Finnhub API.
 * @param input An object containing the stock symbol or a category.
 * @returns A promise that resolves to a list of articles or null if an error occurs.
 */
export async function fetchStockNews(input: StockNewsInput): Promise<StockNewsOutput | null> {
  return fetchStockNewsFlow(input);
}

const fetchStockNewsFlow = ai.defineFlow(
  {
    name: 'fetchStockNewsFlow',
    inputSchema: StockNewsInputSchema,
    outputSchema: z.nullable(StockNewsOutputSchema),
  },
  async (input) => {
    if (!API_KEY) {
      console.error("Finnhub API key not configured.");
      return null;
    }
    
    try {
      let url = '';
      if (input.category === 'general') {
        url = `https://finnhub.io/api/v1/news?category=general&token=${API_KEY}`;
      } else if (input.symbol) {
        const to = new Date();
        const from = new Date();
        from.setDate(to.getDate() - 30); // Get news from the last 30 days
        const fromDateStr = from.toISOString().split('T')[0];
        const toDateStr = to.toISOString().split('T')[0];
        url = `https://finnhub.io/api/v1/company-news?symbol=${input.symbol}&from=${fromDateStr}&to=${toDateStr}&token=${API_KEY}`;
      } else {
        throw new Error("Either a stock symbol or a category must be provided.");
      }
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Finnhub API request failed with status ${response.status}`);
      }
      
      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        return { articles: [] };
      }
      
      const sourceCounts: { [key: string]: number } = {};
      const filteredData: any[] = [];
      const articleLimit = input.category === 'general' ? 10 : 5;

      for (const item of data) {
        if (filteredData.length >= articleLimit) break;

        const source = item.source;
        if ((sourceCounts[source] || 0) < 2) {
            filteredData.push(item);
            sourceCounts[source] = (sourceCounts[source] || 0) + 1;
        }
      }

      const articles = filteredData.map((item: any) => ({
        headline: item.headline,
        source: item.source,
        url: item.url,
        summary: item.summary,
        image: item.image,
      }));

      const result = StockNewsOutputSchema.safeParse({ articles });
      if (result.success) {
        return result.data;
      } else {
        console.error("Failed to parse news data from Finnhub:", result.error);
        return null;
      }

    } catch (error) {
      console.error("Error in fetchStockNewsFlow:", error);
      return null;
    }
  }
);
