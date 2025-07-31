
"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

const stocks = [
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    logo: "https://placehold.co/40x40.png",
    hint: "nvidia logo",
    price: 179.27,
    change: 2.14,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    logo: "https://placehold.co/40x40.png",
    hint: "microsoft logo",
    price: 513.24,
    change: 0.13,
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    logo: "https://placehold.co/40x40.png",
    hint: "apple logo",
    price: 209.05,
    change: -1.05,
  },
  {
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    logo: "https://placehold.co/40x40.png",
    hint: "amazon logo",
    price: 230.19,
    change: -0.35,
  },
  {
    symbol: "GOOG",
    name: "Alphabet Inc.",
    logo: "https://placehold.co/40x40.png",
    hint: "google logo",
    price: 197.44,
    change: 0.51,
  },
  {
    symbol: "META",
    name: "Meta Platforms, Inc.",
    logo: "https://placehold.co/40x40.png",
    hint: "meta logo",
    price: 695.21,
    change: -0.68,
  },
  {
    symbol: "AVGO",
    name: "Broadcom Inc.",
    logo: "https://placehold.co/40x40.png",
    hint: "broadcom logo",
    price: 302.62,
    change: 1.75,
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    logo: "https://placehold.co/40x40.png",
    hint: "tesla logo",
    price: 319.04,
    change: -0.67,
  },
  {
    symbol: "BRK.A",
    name: "Berkshire Hathaway Inc.",
    logo: "https://placehold.co/40x40.png",
    hint: "berkshire hathaway logo",
    price: 714175.00,
    change: 0.07,
  },
];

export default function StockList() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableBody>
              {stocks.map((stock) => {
                const isPositive = stock.change >= 0;
                return (
                  <TableRow key={stock.symbol}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Image src={stock.logo} alt={stock.name} width={40} height={40} className="rounded-full" data-ai-hint={stock.hint} />
                        <div>
                          <p className="font-bold">{stock.symbol}</p>
                          <p className="text-sm text-muted-foreground truncate">{stock.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <p className="font-medium">${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p className={cn("text-sm", isPositive ? "text-green-500" : "text-red-500")}>
                        {isPositive ? "+" : ""}{stock.change.toFixed(2)}%
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button>Trade</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
