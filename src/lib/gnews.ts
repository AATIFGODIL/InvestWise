const API_KEY = process.env.GNEWS_API_KEY || "87edc86f21dc0bf5eff4a0fa1ad845ff";
const BASE_URL = "https://gnews.io/api/v4";

export interface NewsArticle {
    title: string;
    description: string;
    content: string;
    url: string;
    image: string;
    publishedAt: string;
    source: {
        name: string;
        url: string;
    };
}

interface NewsResponse {
    totalArticles: number;
    articles: NewsArticle[];
}

async function fetchNews(endpoint: string, params: Record<string, string>): Promise<NewsArticle[]> {
    try {
        const url = new URL(`${BASE_URL}${endpoint}`);
        url.searchParams.append("apikey", API_KEY);
        Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

        const response = await fetch(url.toString(), {
            next: { revalidate: 900 }, // Cache for 15 minutes
        });

        if (!response.ok) {
            console.warn(`GNews API error: ${response.status} ${response.statusText}`);
            return [];
        }

        const data: NewsResponse = await response.json();
        return data.articles || [];
    } catch (error) {
        console.error("Failed to fetch news:", error);
        return [];
    }
}

export async function getMarketNews(limit = 10): Promise<NewsArticle[]> {
    return fetchNews("/search", {
        q: "stock market OR economy OR finance",
        lang: "en",
        sortby: "relevance", // 'relevance' is the correct param for GNews, not 'relevancy'
        max: limit.toString(),
    });
}

export async function getTopFinancialNews(limit = 5): Promise<NewsArticle[]> {
    return fetchNews("/top-headlines", {
        category: "business",
        lang: "en",
        max: limit.toString(),
    });
}

export async function getStockNews(symbol: string, limit = 3): Promise<NewsArticle[]> {
    return fetchNews("/search", {
        q: `${symbol} stock`,
        lang: "en",
        sortby: "publishedAt",
        max: limit.toString(),
    });
}
