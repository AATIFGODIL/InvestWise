"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { DollarSign, Info } from "lucide-react";
import {
  Tooltip as ShadTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const chartData = [
  { month: "January", value: 10000 },
  { month: "February", value: 10500 },
  { month: "March", value: 11500 },
  { month: "April", value: 11250 },
  { month: "May", value: 12200 },
  { month: "June", value: 12750 },
];

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--primary))",
  },
};

export default function PortfolioSummary() {
  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
              <CardTitle>Portfolio</CardTitle>
              <ShadTooltip>
                  <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>
                      <p>Your total investment value.</p>
                  </TooltipContent>
              </ShadTooltip>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-3xl font-bold tracking-tighter">R12,750</div>
          <div className="text-sm text-green-500 font-semibold">+200 Today</div>
          <div className="h-40 mt-4 -ml-4">
              <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                      <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                  </defs>
                  <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent
                      formatter={(value) => `R${Number(value).toLocaleString()}`}
                      hideLabel
                      hideIndicator
                  />}
                  />
                  <Line
                      dataKey="value"
                      type="monotone"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={false}
                      fill="url(#fillGradient)"
                  />
              </LineChart>
              </ResponsiveContainer>
          </div>
          <div className="absolute bottom-4 right-4 bg-yellow-400 p-3 rounded-full shadow-lg">
              <DollarSign className="h-6 w-6 text-yellow-900" />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-primary hover:bg-primary/90">Auto-Invest</Button>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
