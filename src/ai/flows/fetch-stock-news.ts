
'use server';

/**
 * @fileOverview A flow that fetches recent news for a given stock symbol or general market news using the Finnhub API.
 * If no news is found for a specific symbol, it falls back to general market news.
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
 * Fetches recent news. If a symbol is provided and has no news, it fetches general market news.
 * @param input An object containing the stock symbol or a category.
 * @returns A promise that resolves to a list of articles or null if an error occurs.
 */
export async function fetchStockNews(input: StockNewsInput): Promise<StockNewsOutput | null> {
  return fetchStockNewsFlow(input);
}

// Helper function to process and filter raw news data from the API.
const processNewsData = (data: any[], limit: number): z.infer<typeof StockNewsOutputSchema> | null => {
    if (!Array.isArray(data)) return null;

    const articles = data.slice(0, limit).map((item: any) => ({
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
};

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
      const generalNewsLimit = 10;
      const companyNewsLimit = 5;

      // Function to fetch general news
      const fetchGeneralNews = async () => {
        const url = `https://finnhub.io/api/v1/news?category=general&token=${API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Finnhub API request failed with status ${response.status}`);
        const articles = await response.json();
        return processNewsData(articles, generalNewsLimit);
      };

      if (input.category === 'general') {
        return await fetchGeneralNews();
      } 
      
      if (input.symbol) {
        const to = new Date();
        const from = new Date();
        from.setDate(to.getDate() - 30); // Get news from the last 30 days
        const fromDateStr = from.toISOString().split('T')[0];
        const toDateStr = to.toISOString().split('T')[0];
        
        // Fetch company-specific news
        const companyNewsUrl = `https://finnhub.io/api/v1/company-news?symbol=${input.symbol}&from=${fromDateStr}&to=${toDateStr}&token=${API_KEY}`;
        const companyResponse = await fetch(companyNewsUrl);
        if (!companyResponse.ok) throw new Error(`Finnhub API request failed with status ${companyResponse.status}`);
        
        const companyArticles = await companyResponse.json();

        // If no company articles are found, fall back to general news
        if (companyArticles.length === 0) {
            return await fetchGeneralNews();
        }

        return processNewsData(companyArticles, companyNewsLimit);

      } else {
        // If no symbol and no category is provided, default to general news
        return await fetchGeneralNews();
      }

    } catch (error) {
      console.error("Error in fetchStockNewsFlow:", error);
      return null;
    }
  }
);
