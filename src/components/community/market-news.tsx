
"use client";

import { useState, useEffect } from "react";
import { handleMarketNews } from "@/app/actions";
import type { StockNewsOutput } from "@/ai/flows/fetch-stock-news";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useThemeStore } from "@/store/theme-store";
import { cn } from "@/lib/utils";

interface MarketNewsProps {
  limit?: number;
}

export default function MarketNews({ limit }: MarketNewsProps) {
  const [news, setNews] = useState<StockNewsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isClearMode, theme } = useThemeStore();
  const isLightClear = isClearMode && theme === 'light';

  useEffect(() => {
    async function fetchNews() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await handleMarketNews();
        if (result.success && result.news) {
          setNews(result.news);
        } else {
          setError(result.error || "An unknown error occurred.");
        }
      } catch (e: any) {
        setError(e.message || "Failed to fetch market news.");
      }
      setIsLoading(false);
    }

    fetchNews();
  }, []);

  const articlesToDisplay = limit ? news?.articles.slice(0, limit) : news?.articles;

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
      {limit && (news?.articles.length ?? 0) > limit && (
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
