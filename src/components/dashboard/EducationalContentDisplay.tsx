
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface EducationalContentItem {
  title: string;
  description: string;
  filePath: string;
  type: 'image' | 'pdf';
}

interface EducationalContentDisplayProps {
  content: EducationalContentItem[];
}

const EducationalContentDisplay: React.FC<EducationalContentDisplayProps> = ({ content }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {content.map((item, index) => (
        <Card 
            key={index} 
            className="flex flex-col justify-between"
        >
          <div 
            className={cn(
                "h-48 flex flex-col justify-end p-4 rounded-t-lg text-primary-foreground relative",
                item.type === 'pdf' && "bg-primary"
            )}
          >
            {item.type === 'image' && (
                <Image
                    src={item.filePath}
                    alt={item.title}
                    fill
                    className="object-cover rounded-t-lg"
                />
            )}
            <div className="relative z-10" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>
                <h2 className="text-xl font-bold">{item.title}</h2>
            </div>
          </div>
          <CardContent className="pt-4 flex-grow">
            <p className="text-muted-foreground">{item.description}</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={item.filePath} target="_blank" rel="noopener noreferrer">
                Read Document
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default EducationalContentDisplay;
