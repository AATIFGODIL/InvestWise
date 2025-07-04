"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { ArrowUp, Goal } from "lucide-react";

const chartData = [
  { month: "January", value: 834 },
  { month: "February", value: 921 },
  { month: "March", value: 1050 },
  { month: "April", value: 1180 },
  { month: "May", value: 1245 },
  { month: "June", value: 1420 },
];

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--primary))",
  },
};

export default function PortfolioSummary() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>My Portfolio</CardTitle>
        <CardDescription>
          Here's a look at your investment growth over the last 6 months.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="flex flex-col">
             <div className="text-4xl font-bold tracking-tighter">$1,420.00</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1 text-green-600">
                <ArrowUp className="h-4 w-4" />
                <span>+6.8%</span>
              </div>
              <span>this month</span>
            </div>
          </div>
          <div className="h-40 flex-1">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Line
                    dataKey="value"
                    type="natural"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
       <CardFooter>
        <Button>
          <Goal className="mr-2 h-4 w-4" /> Set a New Goal
        </Button>
      </CardFooter>
    </Card>
  );
}
