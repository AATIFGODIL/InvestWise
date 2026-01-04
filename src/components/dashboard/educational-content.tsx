
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import YouTubePlayer from '../shared/youtube-player';
import { useThemeStore } from '@/store/theme-store';
import { cn } from '@/lib/utils';

interface EducationalContentItem {
  title: string;
  description: string;
  filePath?: string;
  youtubeUrl?: string;
  type: 'image' | 'pdf' | 'video';
}

interface EducationalContentProps {
  content: EducationalContentItem[];
  title?: string;
  description?: string;
  className?: string;
}

const EducationalContent: React.FC<EducationalContentProps> = ({ content, title, description, className }) => {
  const { isClearMode, theme } = useThemeStore();
  const isLightClear = isClearMode && theme === 'light';

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <CardHeader>
        <CardTitle className="text-xl">{title || "Educational Content"}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow">
        <Carousel opts={{ align: "start" }} className="w-full">
          <CarouselContent>
            {content.map((item, index) => (
              <CarouselItem key={index} className="md:basis-1/2">
                <div className="p-1 h-full">
                  <Card className="h-full flex flex-col justify-between overflow-hidden">
                    {item.type === 'video' && item.youtubeUrl ? (
                      <YouTubePlayer videoTitle={item.title} youtubeUrl={item.youtubeUrl} />
                    ) : (
                      item.filePath && (
                        <>
                          <CardHeader className="p-0">
                            <div className="relative h-48 w-full">
                              <Image
                                src={item.filePath}
                                alt={item.title}
                                fill
                                className="object-cover"
                                style={{
                                  objectPosition: item.title.includes("Market Structures") ? 'top' : 'center 10%'
                                }}
                              />
                            </div>
                          </CardHeader>
                          <CardContent className="p-4">
                            <h2 className="font-bold text-lg mb-1">{item.title}</h2>
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                          </CardContent>
                        </>
                      )
                    )}
                    {item.type !== 'video' && item.filePath && (
                      <CardFooter className='p-4 pt-0 mt-auto'>
                        <Button asChild className={cn(
                          "w-full ring-1 ring-white/60",
                          isClearMode
                            ? isLightClear
                              ? "bg-card/60 text-foreground"
                              : "bg-white/10 text-white"
                            : ""
                        )}>
                          <Link href={item.filePath} target="_blank" rel="noopener noreferrer">
                            Read Document
                            <ArrowUpRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </CardContent>
    </Card>
  );
};

export default EducationalContent;
