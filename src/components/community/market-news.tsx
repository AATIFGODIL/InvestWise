
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useThemeStore } from "@/store/theme-store";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

export interface Article {
  headline: string;
  source: string;
  url: string;
  summary?: string;
  image?: string;
  datetime: number;
}

// Function to get a high-contrast, visually distinct color based on the source name
const getSourceColor = (sourceName: string) => {
    let hash = 0;
    for (let i = 0; i < sourceName.length; i++) {
        hash = sourceName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    // Use a fixed saturation and lightness for good contrast and vibrancy
    return `hsl(${h}, 70%, 80%)`;
};


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

  const NewsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {[...Array(limit || 6)].map((_, i) => (
            <div key={i} className="space-y-2">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
            </div>
        ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
            <Newspaper className="h-5 w-5 text-primary" />
            Market News
        </CardTitle>
        <CardDescription>
            The latest headlines from across the financial world.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <NewsSkeleton />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {articlesToDisplay?.map((article) => (
                <Link key={article.url} href={article.url} target="_blank" rel="noopener noreferrer" className="block group">
                    <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-5 w-5">
                            <AvatarFallback
                                className="text-xs font-bold text-black"
                                style={{ backgroundColor: getSourceColor(article.source) }}
                            >
                                {article.source.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-muted-foreground">{article.source}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(article.datetime * 1000), { addSuffix: true })}
                        </span>
                    </div>
                     <p className="font-semibold text-md leading-tight group-hover:underline">{article.headline}</p>
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
