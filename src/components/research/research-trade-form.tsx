// InvestWise - A modern stock trading and investment education platform for young investors
"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePortfolioStore } from "@/store/portfolio-store";
import { motion } from "framer-motion";

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

interface ResearchTradeFormProps {
    selectedSymbol: string;
    selectedPrice: number | null;
    loadingPrice: boolean;
    onClose: () => void;
    onTradeSuccess: () => void;
}

export default function ResearchTradeForm({ selectedSymbol, selectedPrice, loadingPrice, onClose, onTradeSuccess }: ResearchTradeFormProps) {
    const { toast } = useToast();
    const { executeTrade } = usePortfolioStore();

    const { register, handleSubmit, control, watch, formState: { errors, isValid }, setValue, reset } = useForm<TradeFormValues>({
        resolver: zodResolver(tradeSchema),
        mode: "onChange",
        defaultValues: {
            symbol: selectedSymbol,
            action: "buy",
            quantity: 0,
            orderType: "market",
            duration: "day-only",
        },
    });

    useEffect(() => {
        setValue("symbol", selectedSymbol);
    }, [selectedSymbol, setValue]);

    useEffect(() => {
        if (selectedPrice) {
            setValue("limitPrice", selectedPrice);
        }
    }, [selectedPrice, setValue]);

    const orderType = watch("orderType");
    const quantity = watch("quantity");
    const limitPrice = watch("limitPrice");

    const estimatedCost = (orderType === 'limit' ? limitPrice : selectedPrice) && quantity > 0
        ? (orderType === 'limit' ? limitPrice! : selectedPrice!) * quantity
        : 0;

    const onSubmit = (data: TradeFormValues) => {
        if (!selectedPrice) return;

        const tradePrice = data.orderType === 'limit' && data.limitPrice ? data.limitPrice : selectedPrice;

        const tradeResult = executeTrade({
            symbol: data.symbol.toUpperCase(),
            qty: data.action === 'buy' ? data.quantity : -data.quantity,
            price: tradePrice,
            description: "Pro Mode Trade"
        });

        if (tradeResult.success) {
            toast({
                title: "Order Executed",
                description: `Successfully ${data.action === 'buy' ? 'bought' : 'sold'} ${data.quantity} shares of ${data.symbol}.`,
            });
            onTradeSuccess();
            onClose();
        } else {
            toast({
                variant: "destructive",
                title: "Trade Failed",
                description: tradeResult.error,
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full"
        >
            <Card className="border-none shadow-none ring-0 bg-card/50 backdrop-blur-sm">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-2xl font-bold">Place Pro Order: {selectedSymbol}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={onClose} type="button">
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Horizontal Layout Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                            {/* 1. Action & Quantity */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Action</Label>
                                    <Controller
                                        name="action"
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Action" />
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
                                    <Label>Quantity</Label>
                                    <Input type="number" step="any" {...register("quantity")} placeholder="Qty" />
                                    {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
                                </div>
                            </div>

                            {/* 2. Order Type & Price */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Order Type</Label>
                                    <Controller
                                        name="orderType"
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="market">Market</SelectItem>
                                                    <SelectItem value="limit">Limit</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                {orderType === "limit" ? (
                                    <div className="space-y-2">
                                        <Label>Limit Price</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                            <Input type="number" step="any" className="pl-8" {...register("limitPrice")} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label>Market Price</Label>
                                        <div className="flex h-10 w-full items-center px-3 text-sm font-mono border rounded-md bg-muted/50">
                                            {loadingPrice ? <Loader2 className="h-3 w-3 animate-spin" /> : `$${selectedPrice?.toFixed(2) ?? '---'}`}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 3. Duration & Summary */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Duration</Label>
                                    <Controller
                                        name="duration"
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Duration" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="day-only">Day Only</SelectItem>
                                                    <SelectItem value="gtc">GTC</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div className="pt-8">
                                    <div className="text-sm flex justify-between font-medium">
                                        <span>Est. Cost:</span>
                                        <span className="text-primary">${estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Action Button */}
                            <div className="flex items-end h-full pb-1">
                                <Button type="submit" className="w-full h-12 text-lg" disabled={!isValid || loadingPrice}>
                                    {loadingPrice ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Submit Order
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </motion.div>
    );
}
