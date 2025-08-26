
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import YouTubePlayer from '../shared/youtube-player';

interface EducationalContentItem {
  title: string;
  description: string;
  filePath: string;
  type: 'image' | 'pdf' | 'video';
}

interface EducationalContentProps {
  content: EducationalContentItem[];
}

const EducationalContent: React.FC<EducationalContentProps> = ({ content }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {content.map((item, index) => (
        <Card 
            key={index} 
            className="flex flex-col justify-between"
        >
          {item.type === 'video' ? (
             <YouTubePlayer videoTitle={item.title} youtubeUrl={item.filePath} />
          ) : (
            <div className="relative h-48 w-full">
              <Image
                  src={item.filePath}
                  alt={item.title}
                  fill
                  className="object-cover rounded-t-lg"
              />
            </div>
          )}
          <CardContent className="pt-4 flex-grow">
            <h2 className="font-bold mb-2">{item.title}</h2>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </CardContent>
          {item.type !== 'video' && (
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={item.filePath} target="_blank" rel="noopener noreferrer">
                  Read Document
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
};

export default EducationalContent;
