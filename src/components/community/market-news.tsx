
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useThemeStore } from "@/store/theme-store";
import { cn } from "@/lib/utils";

const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

export interface Article {
  headline: string;
  source: string;
  url: string;
  summary?: string;
  image?: string;
  datetime: number;
}

export async function fetchNewsOnClient(symbol?: string): Promise<Article[]> {
  if (!API_KEY) {
    throw new Error('Finnhub API key not configured.');
  }

  const companyNewsLimit = 5;
  const generalNewsLimit = 15;

  const fetchGeneralNews = async () => {
    const categories = ['general', 'forex', 'crypto'];
    const requests = categories.map(category => 
      fetch(`https://finnhub.io/api/v1/news?category=${'${category}'}&token=${API_KEY}`)
        .then(res => res.json())
    );
    const nestedArticles = await Promise.all(requests);
    return nestedArticles.flat();
  };
  
  let rawArticles = [];

  if (symbol) {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 30);
    const fromDateStr = from.toLocaleDateString('sv-SE');
    const toDateStr = to.toLocaleDateString('sv-SE');

    const url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromDateStr}&to=${toDateStr}&token=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch company news');
    
    const companyArticles = await response.json();

    if (companyArticles.length > 0) {
      rawArticles = companyArticles.slice(0, companyNewsLimit);
    } else {
      rawArticles = await fetchGeneralNews();
    }
  } else {
    rawArticles = await fetchGeneralNews();
  }

  const uniqueArticles = Array.from(new Map(rawArticles.map(item => [item.url, item])).values());
  const sortedArticles = uniqueArticles.sort((a, b) => b.datetime - a.datetime);
  
  return sortedArticles.slice(0, symbol ? companyNewsLimit : generalNewsLimit);
}


interface MarketNewsProps {
  limit?: number;
}

export default function MarketNews({ limit }: MarketNewsProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isClearMode, theme } = useThemeStore();
  const isLightClear = isClearMode && theme === 'light';

  useEffect(() => {
    async function getNews() {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedArticles = await fetchNewsOnClient();
        setArticles(fetchedArticles);
      } catch (err) {
        setError('Could not fetch news. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    getNews();
  }, []);

  const articlesToDisplay = limit ? articles.slice(0, limit) : articles;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            Market News
        </CardTitle>
        <CardDescription>
            The latest headlines from across the financial world.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
            <div className="flex flex-col items-center justify-center p-8 text-destructive">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p>{error}</p>
            </div>
        ) : articlesToDisplay?.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            <p>No recent news found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {articlesToDisplay?.map((article) => (
                <Link key={article.headline} href={article.url} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {article.image && (
                            <div className="relative w-full sm:w-32 h-32 sm:h-auto flex-shrink-0">
                                <Image
                                    src={article.image}
                                    alt={article.headline}
                                    fill
                                    className="rounded-md object-cover"
                                />
                            </div>
                        )}
                        <div className="flex-grow">
                             <p className="font-semibold text-md leading-tight">{article.headline}</p>
                             <p className="text-xs text-muted-foreground mt-1">{article.source}</p>
                             <p className="text-sm mt-2 line-clamp-2">{article.summary}</p>
                        </div>
                    </div>
                </Link>
            ))}
          </div>
        )}
      </CardContent>
      {limit && (articles.length ?? 0) > limit && (
        <CardFooter>
          <Button asChild variant="outline" className={cn(
                  "w-full ring-1 ring-white/60",
                   isClearMode
                      ? isLightClear
                          ? "bg-card/60 text-foreground"
                          : "bg-white/10 text-white"
                      : ""
                )}>
            <Link href="/community">View All News</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
