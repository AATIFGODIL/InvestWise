import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export default function TopInvestmentBundle() {
  return (
    <TooltipProvider>
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Top Investment Bundles</CardTitle>
                        <CardDescription>Recommended for you</CardDescription>
                    </div>
                    <Badge variant="outline" className="font-bold">W</Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
                <div className="bg-secondary p-4 rounded-lg flex items-center gap-4">
                    <div className="relative w-24 h-24">
                         <Image
                            src="https://placehold.co/100x100.png"
                            alt="Tech Starter Pack"
                            width={100}
                            height={100}
                            className="rounded-lg aspect-square object-cover"
                            data-ai-hint="laptop computer"
                        />
                         <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.41 1.41L16.17 10H4v4h12.17l-5.58 5.59L12 21l8-8-8-8z"/></svg>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold">Tech Starter Pack</h4>
                        <div className="flex items-center gap-1 mt-1">
                            {[...Array(4)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)}
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span className="text-xs text-muted-foreground ml-2">+23.5% all</span>
                        </div>
                    </div>
                </div>
                <div className="mt-auto pt-4 text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3 shrink-0" />
                    <p>Invest at your own risk. AI recommendations are not financial advice.</p>
                </div>
            </CardContent>
        </Card>
    </TooltipProvider>
  );
}
