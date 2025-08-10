
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
import { Info, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { type Bundle } from "@/data/bundles";

interface InvestmentBundlesProps {
  bundles: Bundle[];
  title: string;
  description: string;
  showDisclaimer?: boolean;
}

export default function InvestmentBundles({ bundles, title, description, showDisclaimer = false }: InvestmentBundlesProps) {
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);

  return (
    <Dialog>
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent>
              {bundles.map((bundle, index) => (
                <CarouselItem key={index} className="md:basis-1/2">
                  <div className="p-1 h-full">
                    <Card className="h-full flex flex-col">
                      <CardHeader className="p-0">
                        <Image
                          src={bundle.image}
                          alt={bundle.title}
                          width={600}
                          height={400}
                          className="rounded-t-lg aspect-[16/9] object-cover"
                          data-ai-hint={bundle.hint}
                        />
                      </CardHeader>
                      <CardContent className="flex-1 p-4">
                        <h3 className="text-md font-semibold">{bundle.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{bundle.description}</p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                         <DialogTrigger asChild>
                           <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedBundle(bundle)}>
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
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{selectedBundle?.title}</DialogTitle>
          <DialogDescription>
            {selectedBundle?.description}
          </DialogDescription>
        </DialogHeader>
        <div>
          <h4 className="font-semibold mb-2">Constituent Stocks</h4>
          <div className="space-y-2">
            {selectedBundle?.stocks.map((stock) => (
              <DialogClose asChild key={stock.symbol}>
                <Link
                  href={`/trade?symbol=${stock.symbol}`}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-accent"
                  onClick={() => setSelectedBundle(null)}
                >
                  <div>
                    <p className="font-medium">{stock.name}</p>
                    <p className="text-sm text-muted-foreground">{stock.symbol}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </Link>
              </DialogClose>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
