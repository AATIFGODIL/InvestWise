'use server';

/**
 * @fileOverview A Genkit flow that fetches and summarizes recent news for a given stock symbol.
 * This flow uses the Gemini model to search Google News and provide a structured output.
 *
 * - fetchStockNews: The main function that clients call to get news for a stock.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const StockNewsInputSchema = z.object({
  symbol: z.string().describe("The stock ticker symbol, e.g., 'AAPL' for Apple."),
});

const ArticleSchema = z.object({
  headline: z.string().describe("The headline of the news article."),
  source: z.string().describe("The source of the news article (e.g., 'Reuters')."),
  url: z.string().url().describe("The URL to the full article."),
});

const StockNewsOutputSchema = z.object({
  articles: z.array(ArticleSchema).describe("A list of recent news articles for the stock."),
});

export type StockNewsInput = z.infer<typeof StockNewsInputSchema>;
export type StockNewsOutput = z.infer<typeof StockNewsOutputSchema>;


export async function fetchStockNews(input: StockNewsInput): Promise<StockNewsOutput | null> {
  return fetchStockNewsFlow(input);
}


const prompt = ai.definePrompt({
  name: 'fetchStockNewsPrompt',
  input: { schema: StockNewsInputSchema },
  output: { schema: StockNewsOutputSchema },
  prompt: `You are a financial news aggregator. Your task is to find the 3 most recent, relevant news articles for the stock symbol {{{symbol}}} from Google News.
  
  For each article, provide the headline, the source, and a direct URL. Present the output in the required JSON format. Do not include articles that are not directly related to the company's financial performance, products, or major corporate news.`,
});


const fetchStockNewsFlow = ai.defineFlow(
  {
    name: 'fetchStockNewsFlow',
    inputSchema: StockNewsInputSchema,
    outputSchema: z.nullable(StockNewsOutputSchema),
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      return output;
    } catch (error) {
      console.error("Error in fetchStockNewsFlow:", error);
      return null;
    }
  }
);
