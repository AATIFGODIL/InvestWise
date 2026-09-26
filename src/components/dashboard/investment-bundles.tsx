// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "../ui/button";
import { Info, ExternalLink, DollarSign, Loader2, ShoppingCart, Cpu, Globe, Leaf, HeartPulse, Rocket, Coins, Layers } from "lucide-react";
import TickerLogo from "@/components/shared/ticker-logo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { type Bundle } from "@/data/bundles";
import useLoadingStore from "@/store/loading-store";
import { useThemeStore } from "@/store/theme-store";
import { cn } from "@/lib/utils";
import { usePortfolioStore } from "@/store/portfolio-store";
import { useToast } from "@/hooks/use-toast";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
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

const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY as string;

/** Each bundle's motif — the one object that says what's inside it. */
const BUNDLE_ICONS: Record<string, React.ElementType> = {
  "Tech Starter Pack": Cpu,
  "Global Giants": Globe,
  "Green Energy Bundle": Leaf,
  "Healthcare Innovators": HeartPulse,
  "Disruptive Tech": Rocket,
  "Dividend Champions": Coins,
};

/**
 * A bundle's cover: its name set large and bold on a tile in its own hue, with
 * its motif drawn big and faint behind it. No stock photography — the name is
 * the picture, the way an album cover or a Wallet pass works.
 */
function BundleCover({ bundle }: { bundle: Bundle }) {
  const Icon = BUNDLE_ICONS[bundle.title] ?? Layers;
  const h = bundle.hue;
  const name = bundle.title.replace(/ Bundle$/, "");
  return (
    <div
      className="relative h-44 overflow-hidden rounded-t-3xl p-5 text-white"
      style={{
        background: `radial-gradient(120% 100% at 0% 0%, hsl(${h} 85% 62% / 0.55), transparent 60%), linear-gradient(140deg, hsl(${h} 65% 24%), hsl(${(h + 32) % 360} 55% 9%))`,
      }}
    >
      <Icon
        aria-hidden
        strokeWidth={1.1}
        className="pointer-events-none absolute -bottom-8 -right-6 h-40 w-40 -rotate-12 text-white/[0.14]"
      />
      <div className="relative flex items-center justify-between">
        <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold tracking-wide backdrop-blur-sm">
          {bundle.tag}
        </span>
        <span className="text-[11px] font-medium text-white/70">{bundle.stocks.length} stocks</span>
      </div>
      <h3 className="absolute bottom-4 left-5 right-14 text-[28px] font-extrabold leading-[1.02] tracking-[-0.035em]">
        {name}
      </h3>
    </div>
  );
}

interface InvestmentBundlesProps {
  bundles: Bundle[];
  title: string;
  description: string;
  showDisclaimer?: boolean;
}

interface StockPrice {
  symbol: string;
  price: number | null;
}

export default function InvestmentBundles({ bundles, title, description, showDisclaimer = false }: InvestmentBundlesProps) {
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  const [bundlePrices, setBundlePrices] = useState<StockPrice[]>([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState("market");
  const [duration, setDuration] = useState("day-only");
  const { showLoading } = useLoadingStore();
  const { isClearMode, theme } = useThemeStore();
  const { executeTrade } = usePortfolioStore();
  const { toast } = useToast();

  const isLightClear = isClearMode && theme === 'light';

  useEffect(() => {
    if (!selectedBundle || !isBuyDialogOpen) return;

    const fetchPrices = async () => {
      setIsLoadingPrices(true);
      const prices = await Promise.all(
        selectedBundle.stocks.map(async (stock) => {
          try {
            const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${API_KEY}`);
            if (!res.ok) return { symbol: stock.symbol, price: null };
            const data = await res.json();
            return { symbol: stock.symbol, price: data.c || null };
          } catch {
            return { symbol: stock.symbol, price: null };
          }
        })
      );
      setBundlePrices(prices);
      setIsLoadingPrices(false);
    };

    fetchPrices();
  }, [selectedBundle, isBuyDialogOpen]);

  const handleStockLinkClick = (symbol: string) => {
    showLoading();
    window.location.href = `/trade?symbol=${symbol}`;
  };

  const handleBuyBundle = () => {
    if (!selectedBundle || bundlePrices.some(p => p.price === null)) {
      toast({ variant: "destructive", title: "Error", description: "Cannot buy bundle, price information is missing." });
      return;
    }

    let totalCost = 0;
    bundlePrices.forEach(p => {
      if (p.price) {
        totalCost += p.price * quantity;
      }
    });

    selectedBundle.stocks.forEach(stock => {
      const priceInfo = bundlePrices.find(p => p.symbol === stock.symbol);
      if (priceInfo && priceInfo.price) {
        const tradeResult = executeTrade({
          symbol: stock.symbol,
          qty: quantity,
          price: priceInfo.price,
          description: `${selectedBundle.title} Bundle`
        });
        if (!tradeResult.success) {
          toast({ variant: "destructive", title: `Trade Failed for ${stock.symbol}`, description: tradeResult.error });
        }
      }
    });

    toast({ title: "Bundle Purchase Executed!", description: `Your order to buy ${quantity} unit(s) of the ${selectedBundle.title} has been placed.` });
    setIsBuyDialogOpen(false);
    setSelectedBundle(null);
  }

  const totalBundlePrice = bundlePrices.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const estimatedTotal = totalBundlePrice * quantity;

  return (
    <>
      <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedBundle(null)}>
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <Carousel opts={{ align: "start" }} className="w-full">
              <CarouselContent>
                {bundles.map((bundle, index) => (
                  <CarouselItem key={index} className="md:basis-1/2">
                    <div className="p-1 h-full">
                      <Card className="h-full flex flex-col">
                        <BundleCover bundle={bundle} />
                        <CardContent className="flex flex-1 flex-col gap-4 p-5">
                          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">{bundle.description}</p>
                          <div className="mt-auto flex items-center gap-3">
                            <div className="flex -space-x-2">
                              {bundle.stocks.map((stock) => (
                                <TickerLogo
                                  key={stock.symbol}
                                  symbol={stock.symbol}
                                  name={stock.name}
                                  className="h-9 w-9 ring-2 ring-background"
                                />
                              ))}
                            </div>
                            <p className="truncate text-xs font-semibold tracking-wide text-muted-foreground">
                              {bundle.stocks.map((stock) => stock.symbol).join(" · ")}
                            </p>
                          </div>
                        </CardContent>
                        <CardFooter className="p-5 pt-0">
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className={cn(
                              "w-full ring-1 ring-white/60 hover:bg-primary/10",
                              isClearMode
                                ? isLightClear
                                  ? "bg-card/60 text-foreground"
                                  : "bg-white/10 text-white"
                                : ""
                            )} onClick={() => setSelectedBundle(bundle)}>
                              Learn More
                            </Button>
                          </DialogTrigger>
                        </CardFooter>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </CardContent>
          {showDisclaimer && (
            <CardFooter className="pt-4 mt-auto">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3 shrink-0" />
                <p>Invest at your own risk. AI recommendations are not financial advice.</p>
              </div>
            </CardFooter>
          )}
        </Card>

        {/* Learn More Dialog */}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedBundle?.title}</DialogTitle>
            <DialogDescription>{selectedBundle?.description}</DialogDescription>
          </DialogHeader>
          <div>
            <h4 className="font-semibold mb-2">Constituent Stocks</h4>
            <div className="space-y-2">
              {selectedBundle?.stocks.map((stock) => (
                <DialogClose asChild key={stock.symbol}>
                  <button
                    className="flex items-center justify-between p-2 rounded-md hover:bg-primary/10 w-full text-left"
                    onClick={() => handleStockLinkClick(stock.symbol)}
                  >
                    <div className="flex items-center gap-3">
                      <TickerLogo symbol={stock.symbol} name={stock.name} />
                      <div>
                        <p className="font-medium">{stock.name}</p>
                        <p className="text-sm text-muted-foreground">{stock.symbol}</p>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DialogClose>
              ))}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button className="w-full" onClick={() => setIsBuyDialogOpen(true)}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Buy Bundle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Buy Bundle Dialog */}
      <AlertDialog open={isBuyDialogOpen} onOpenChange={setIsBuyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Buy {selectedBundle?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              Review and confirm your bundle purchase. This will execute multiple trades.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {isLoadingPrices ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Bundle Contents (1 Unit)</h4>
                <div className="space-y-1 p-3 bg-muted rounded-md text-sm">
                  {bundlePrices.map(stock => (
                    <div key={stock.symbol} className="flex justify-between">
                      <span>{stock.symbol}</span>
                      <span>{stock.price ? `$${stock.price.toFixed(2)}` : 'N/A'}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold border-t pt-1 mt-1">
                    <span>Total Price / Unit</span>
                    <span>${totalBundlePrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min="1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order-type">Order Type</Label>
                  <Select value={orderType} onValueChange={setOrderType}>
                    <SelectTrigger id="order-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market">Market</SelectItem>
                      <SelectItem value="limit">Limit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger id="duration"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day-only">Day Only</SelectItem>
                    <SelectItem value="gtc">Good 'til Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 bg-muted rounded-lg text-sm font-semibold">
                <div className="flex justify-between">
                  <span>Estimated Total:</span>
                  <span className="text-primary">${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBuyBundle} disabled={isLoadingPrices || bundlePrices.some(p => p.price === null)}>
              Confirm Purchase
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
