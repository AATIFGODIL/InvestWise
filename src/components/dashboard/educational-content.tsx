import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import YouTubePlayer from '../shared/youtube-player';

interface EducationalContentItem {
  title: string;
  description: string;
  filePath?: string;
  youtubeUrl?: string;
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
            className="flex flex-col justify-between overflow-hidden"
        >
          {item.type === 'video' && item.youtubeUrl ? (
             <YouTubePlayer videoTitle={item.title} youtubeUrl={item.youtubeUrl} />
          ) : (
            item.filePath && (
              <div className="relative h-48 w-full">
                <Image
                    src={item.filePath}
                    alt={item.title}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                    <h2 className="font-bold text-lg text-white mb-1">{item.title}</h2>
                    <p className="text-sm text-white/90 line-clamp-2">{item.description}</p>
                </div>
              </div>
            )
          )}
          {item.type !== 'video' && item.filePath && (
            <CardFooter className='p-4'>
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
