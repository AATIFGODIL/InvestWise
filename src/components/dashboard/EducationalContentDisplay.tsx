import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface EducationalContentItem {
  title: string;
  description: string;
  filePath: string;
  type: 'image' | 'pdf';
}

interface EducationalContentDisplayProps {
  content: EducationalContentItem[];
}

const defaultContent: EducationalContentItem[] = [
  {
    title: "The Power of Compound Interest",
    description: "Learn how your money can grow exponentially over time.",
    filePath: "/src/app/Elijah Dailey Week 6 Deliverable_page-0001.jpg",
    type: "image",
  },
  {
    title: "Week 6 Infographic",
    description: "A visual summary of key concepts from week 6.",
    filePath: "/src/app/Week 6 Infographic.png",
    type: "image",
  },
  // Add other default educational content items here if any
];


const EducationalContentDisplay: React.FC<EducationalContentDisplayProps> = ({ content = defaultContent }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {content.map((item, index) => (
        <Card 
            key={index} 
            className="flex flex-col justify-between"
        >
          <div 
            className={cn(
                "h-48 flex flex-col justify-end p-4 rounded-t-lg text-primary-foreground",
                item.type === 'image' ? "bg-cover bg-center" : "bg-primary"
            )}
            style={item.type === 'image' ? { 
                backgroundImage: `url(${item.filePath})`,
                textShadow: '1px 1px 3px rgba(0,0,0,0.7)'
            } : {}}
          >
            <h2 className="text-xl font-bold">{item.title}</h2>
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
