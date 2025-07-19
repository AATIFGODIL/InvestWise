
"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info, Eye, Search } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function TradeForm() {
  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>Place an Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="symbol"
                placeholder="Look up Symbol/Company Name"
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="action" className="flex items-center gap-1">
                Action
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Choose to buy or sell the asset.</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Select defaultValue="buy">
                <SelectTrigger id="action">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <div className="flex items-center gap-2">
                <Input id="quantity" type="number" defaultValue="0" />
                <Button variant="ghost" size="sm" className="text-primary whitespace-nowrap">
                  <Eye className="h-4 w-4 mr-1"/>
                  Show Max
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="order-type" className="flex items-center gap-1">
                Order Type
                 <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Market orders execute immediately at the current price. Limit orders execute only at your specified price or better.</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Select defaultValue="market">
                <SelectTrigger id="order-type">
                  <SelectValue placeholder="Select order type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="limit">Limit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-1">
                Duration
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>&quot;Day Only&quot; orders are canceled if not filled by the end of the trading day. &quot;Good &apos;til Canceled&quot; orders remain active until filled or canceled.</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Select defaultValue="day-only">
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day-only">Day Only</SelectItem>
                  <SelectItem value="gtc">Good &apos;til Canceled (GTC)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline">Clear</Button>
          <Button disabled>Preview Order</Button>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
