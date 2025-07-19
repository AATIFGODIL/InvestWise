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

const bundles = [
  {
    title: "Tech Starter Pack",
    description: "Invest in leading tech companies with this diversified bundle. Ideal for growth-oriented beginners.",
    image: "https://placehold.co/600x400.png",
    hint: "tech computer",
  },
  {
    title: "Green Energy Fund",
    description: "Support a sustainable future by investing in renewable energy and clean technology companies.",
    image: "https://placehold.co/600x400.png",
    hint: "solar panels",
  },
  {
    title: "Global Giants",
    description: "A stable collection of well-established international corporations with a history of solid returns.",
    image: "https://placehold.co/600x400.png",
    hint: "city skyline",
  },
  {
    title: "Healthcare Innovators",
    description: "Focus on the future of health with companies in biotechnology and medical research.",
    image: "https://placehold.co/600x400.png",
    hint: "science laboratory",
  },
];

export default function InvestmentBundles() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Explore Investment Bundles</CardTitle>
        <CardDescription>
          Recommended for you
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
