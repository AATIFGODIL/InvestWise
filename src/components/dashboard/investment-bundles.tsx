
import Image from "next/image";
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
import { Info } from "lucide-react";
import { type Bundle } from "@/data/bundles";

interface InvestmentBundlesProps {
  bundles: Bundle[];
  title: string;
  description: string;
}

export default function InvestmentBundles({ bundles, title, description }: InvestmentBundlesProps) {
  return (
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
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-full">
                <div className="p-1">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="p-0">
                      <Image
                        src={bundle.image}
                        alt={bundle.title}
                        width={600}
                        height={400}
                        className="rounded-t-lg aspect-video object-cover"
                        data-ai-hint={bundle.hint}
                      />
                    </CardHeader>
                    <CardContent className="flex-1 p-6">
                      <h3 className="text-lg font-semibold">{bundle.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{bundle.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Learn More
                      </Button>
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
       <CardFooter className="pt-4 mt-auto">
         <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="h-3 w-3 shrink-0" />
            <p>Invest at your own risk. AI recommendations are not financial advice.</p>
        </div>
      </CardFooter>
    </Card>
  );
}
