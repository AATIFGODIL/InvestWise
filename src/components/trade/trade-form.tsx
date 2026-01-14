// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Search, DollarSign, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";
import { usePortfolioStore } from "@/store/portfolio-store";


const tradeSchema = z.object({
  symbol: z.string().min(1, "Symbol is required."),
  action: z.enum(["buy", "sell"]),
  quantity: z.coerce.number().positive("Quantity must be positive."),
  orderType: z.enum(["market", "limit"]),
  limitPrice: z.coerce.number().optional(),
  duration: z.enum(["day-only", "gtc"]),
}).refine(data => data.orderType !== 'limit' || (data.limitPrice !== undefined && data.limitPrice > 0), {
  message: "Limit price is required for limit orders.",
  path: ["limitPrice"],
});

type TradeFormValues = z.infer<typeof tradeSchema>;

interface TradeFormProps {
  selectedSymbol: string | null;
  selectedPrice: number | null;
  loadingPrice: boolean;
  initialAction?: "buy" | "sell";
  onTradeSuccess?: () => void;
}

export default function TradeForm({ selectedSymbol, selectedPrice, loadingPrice, initialAction, onTradeSuccess }: TradeFormProps) {
  const { toast } = useToast();
  const { executeTrade } = usePortfolioStore();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<TradeFormValues | null>(null);

  const { register, handleSubmit, control, watch, formState: { errors, isValid }, setValue, reset } = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema),
    mode: "onChange",
    defaultValues: {
      symbol: selectedSymbol || "",
      action: initialAction || "buy",
      quantity: 0,
      orderType: "market",
      duration: "day-only",
    },
  });

  useEffect(() => {
    if (selectedSymbol) {
      setValue("symbol", selectedSymbol, { shouldValidate: true });
    }
  }, [selectedSymbol, setValue]);

  useEffect(() => {
    if (selectedPrice) {
      // Set limitPrice when orderType is 'limit', or when it's market to have a price for cost estimation
      setValue("limitPrice", selectedPrice, { shouldValidate: true });
    }
  }, [selectedPrice, setValue]);

  useEffect(() => {
    if (initialAction) {
      setValue("action", initialAction, { shouldValidate: true });
    }
  }, [initialAction, setValue]);


  const orderType = watch("orderType");
  const quantity = watch("quantity");
  const limitPrice = watch("limitPrice");

  const estimatedCost = (orderType === 'limit' ? limitPrice : selectedPrice) && quantity > 0
    ? (orderType === 'limit' ? limitPrice! : selectedPrice!) * quantity
    : 0;

  const handlePreview = (data: TradeFormValues) => {
    setPreviewData(data);
    setIsPreviewOpen(true);
  };

  const handleConfirmTrade = () => {
    if (!previewData || !selectedPrice) return;

    const tradePrice = previewData.orderType === 'limit' && previewData.limitPrice ? previewData.limitPrice : selectedPrice;

    const tradeResult = executeTrade({
      symbol: previewData.symbol.toUpperCase(),
      qty: previewData.action === 'buy' ? previewData.quantity : -previewData.quantity,
      price: tradePrice,
      description: "Selected Stock" // Placeholder description
    });

    if (tradeResult.success) {
      toast({
        title: "Trade Executed!",
        description: `Successfully ${previewData.action === 'buy' ? 'bought' : 'sold'} ${previewData.quantity} shares of ${previewData.symbol.toUpperCase()}.`,
      });
      if (onTradeSuccess) {
        onTradeSuccess();
      }
    } else {
      toast({
        variant: "destructive",
        title: "Trade Failed",
        description: tradeResult.error,
      });
    }

    setIsPreviewOpen(false);
    setPreviewData(null);
    reset({
      symbol: selectedSymbol || "",
      action: initialAction || "buy",
      quantity: 0,
      orderType: "market",
      duration: "day-only",
    });
  };

  return (
    <TooltipProvider>
      <Card>
        <form onSubmit={handleSubmit(handlePreview)}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Place an Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol</Label>
                <div className="relative">
                  <Input
                    id="symbol"
                    placeholder="Select a symbol"
                    className="focus-visible:ring-primary"
                    {...register("symbol")}
                    readOnly
                  />
                </div>
                {errors.symbol && <p className="text-sm text-destructive">{errors.symbol.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="market-price">Market Price</Label>
                <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm">
                  {loadingPrice ? (
                    <div className="flex items-center text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Fetching...
                    </div>
                  ) : selectedPrice ? (
                    <span className="font-mono">${selectedPrice.toFixed(2)}</span>
                  ) : (
                    <span className="text-muted-foreground">Unavailable</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-2">
                <Label htmlFor="action">Action</Label>
                <Controller
                  name="action"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="action">
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">Buy</SelectItem>
                        <SelectItem value="sell">Sell</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="number" step="any" {...register("quantity")} className="focus-visible:ring-primary" />
                {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="order-type">
                  Order Type
                </Label>
                <Controller
                  name="orderType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="order-type">
                        <SelectValue placeholder="Select order type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market">Market</SelectItem>
                        <SelectItem value="limit">Limit</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {orderType === "limit" && (
                <div className="space-y-2">
                  <Label htmlFor="limitPrice">Limit Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="limitPrice" type="number" step="any" className="pl-8" {...register("limitPrice")} />
                  </div>
                  {errors.limitPrice && <p className="text-sm text-destructive">{errors.limitPrice.message}</p>}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">
                Duration
              </Label>
              <Controller
                name="duration"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="duration">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day-only">Day Only</SelectItem>
                      <SelectItem value="gtc">Good &apos;til Canceled (GTC)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {selectedSymbol && estimatedCost > 0 && (
              <div className="p-4 bg-muted rounded-lg text-sm">
                <h4 className="font-semibold mb-2">Order Summary</h4>
                <div className="flex justify-between">
                  <span>Estimated Cost:</span>
                  <span className="font-medium">${estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{quantity} shares x ${(orderType === 'limit' ? limitPrice : selectedPrice)?.toFixed(2)}/share</span>
                </div>
              </div>
            )}

          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => reset()}>Clear</Button>
            <Button type="submit" disabled={!isValid || !selectedSymbol || loadingPrice}>
              {loadingPrice ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Preview Order
            </Button>
          </CardFooter>
        </form>
      </Card>

      <AlertDialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Order</AlertDialogTitle>
            <AlertDialogDescription>
              Please review your order details before confirming. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {previewData && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><strong>Action:</strong> <span className="capitalize">{previewData.action}</span></div>
              <div className="flex justify-between"><strong>Symbol:</strong> <span>{previewData.symbol.toUpperCase()}</span></div>
              <div className="flex justify-between"><strong>Quantity:</strong> <span>{previewData.quantity}</span></div>
              <div className="flex justify-between"><strong>Order Type:</strong> <span className="capitalize">{previewData.orderType}</span></div>
              {previewData.orderType === 'limit' && (
                <div className="flex justify-between"><strong>Limit Price:</strong> <span>${previewData.limitPrice?.toFixed(2)}</span></div>
              )}
              <div className="flex justify-between"><strong>Duration:</strong> <span>{previewData.duration === 'gtc' ? "Good 'til Canceled" : "Day Only"}</span></div>
              <div className="flex justify-between pt-2 border-t mt-2">
                <strong>Estimated Total:</strong>
                <strong className="text-primary">${(previewData.orderType === 'limit' ? previewData.limitPrice! * previewData.quantity : selectedPrice! * previewData.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmTrade}>Confirm Trade</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </TooltipProvider>
  );
}

