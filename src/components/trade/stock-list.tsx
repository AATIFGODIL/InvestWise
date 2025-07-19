
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
    symbol: "AAPL",
    name: "Apple Inc.",
    logo: "https://placehold.co/40x40.png",
    hint: "apple logo",
    price: 214.29,
    change: -1.16,
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    logo: "https://placehold.co/40x40.png",
    hint: "tesla logo",
    price: 183.01,
    change: 2.51,
  },
  {
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    logo: "https://placehold.co/40x40.png",
    hint: "amazon logo",
    price: 185.57,
    change: -1.86,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    logo: "https://placehold.co/40x40.png",
    hint: "google logo",
    price: 179.22,
    change: 0.99,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    logo: "https://placehold.co/40x40.png",
    hint: "microsoft logo",
    price: 447.67,
    change: 1.23,
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
                      <p className="font-medium">${stock.price.toFixed(2)}</p>
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
