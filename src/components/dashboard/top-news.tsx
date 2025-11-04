
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Newspaper } from "lucide-react";

// Placeholder data
const newsItems = [
  {
    source: "Bloomberg",
    headline: "Global Markets Rally as Inflation Fears Subside",
    time: "2h ago",
  },
  {
    source: "Reuters",
    headline: "Tech Giants Announce Major AI Collaboration",
    time: "4h ago",
  },
  {
    source: "Wall Street Journal",
    headline: "Federal Reserve Holds Interest Rates Steady",
    time: "5h ago",
  },
];

export default function TopNews() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
            <Newspaper className="h-5 w-5"/>
            Top News
        </CardTitle>
        <CardDescription>
            The latest headlines impacting the market.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {newsItems.map((item, index) => (
          <div key={index}>
            <p className="text-xs text-muted-foreground">{item.source} • {item.time}</p>
            <p className="font-semibold leading-tight text-foreground">{item.headline}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
