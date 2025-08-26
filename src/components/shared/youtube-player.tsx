
"use client";

import React from 'react';
import YouTube from 'react-youtube';
import useVideoProgressStore from '@/store/video-progress-store';
import { Button } from '../ui/button';
import { ExternalLink, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '../ui/badge';

interface YouTubePlayerProps {
  youtubeUrl: string;
  videoTitle: string;
  description?: string;
  isChannel?: boolean;
  imageUrl?: string;
}

// Function to extract video ID from various YouTube URL formats
const getYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ youtubeUrl, videoTitle, description, isChannel = false, imageUrl }) => {
  const { watchedVideos, markVideoAsWatched } = useVideoProgressStore();
  const isWatched = watchedVideos.has(videoTitle);
  const videoId = getYouTubeId(youtubeUrl);

  if (isChannel) {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="p-0">
              <div className="relative aspect-video w-full bg-muted/20">
                <Image
                    src={imageUrl || "https://placehold.co/600x400.png"}
                    alt={videoTitle}
                    fill
                    className="rounded-t-lg object-contain p-2"
                    data-ai-hint="youtube channel"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-4">
                <h3 className="font-semibold">{videoTitle}</h3>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button asChild variant="outline" className="w-full">
                    <Link href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Visit Channel
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
  }

  if (!videoId) {
    return <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center"><p>Invalid YouTube URL</p></div>;
  }

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
    },
  };

  const handleVideoEnd = () => {
    // Only mark as watched on end
    if (!isWatched) {
      markVideoAsWatched(videoTitle);
    }
  };

  return (
    <Card className="h-full flex flex-col">
        <CardContent className="p-0 relative aspect-video w-full">
            <YouTube 
                key={videoId}
                videoId={videoId} 
                opts={opts} 
                onEnd={handleVideoEnd}
                className="absolute top-0 left-0 w-full h-full rounded-t-lg overflow-hidden"
            />
            {isWatched && (
                <Badge variant="secondary" className="absolute bottom-2 right-2 z-10 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Watched
                </Badge>
            )}
        </CardContent>
        <CardFooter className="p-4 flex-grow flex flex-col items-start">
             <h3 className="font-semibold">{videoTitle}</h3>
             <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </CardFooter>
    </Card>
  );
};

export default YouTubePlayer;
