// InvestWise - A modern stock trading and investment education platform for young investors
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTopFinancialNewsAction } from "@/app/actions";
import { type NewsArticle } from "@/lib/gnews";
import { Newspaper, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface TopNewsProps {
  limit?: number;
}

export default function TopNews({ limit = 5 }: TopNewsProps) {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopFinancialNewsAction(limit).then(data => {
      setNews(data);
      setLoading(false);
    });
  }, [limit]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          Top News
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : news.length > 0 ? (
            news.map((item, index) => (
              <Link
                key={index}
                href={item.url}
                target="_blank"
                className="block group"
              >
                <div className="flex gap-4">
                  {item.image && (
                    <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-sm font-medium leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.source.name}</span>
                      <span>•</span>
                      <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              No top news available at the moment.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
