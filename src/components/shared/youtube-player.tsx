// InvestWise - A modern stock trading and investment education platform for young investors

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
import { useThemeStore } from '@/store/theme-store';
import { cn } from '@/lib/utils';

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

const YouTubePlayer: React.FC<YouTubePlayerProps & { variant?: 'card' | 'minimal', aspectRatio?: 'video' | 'auto' }> = ({
  youtubeUrl, videoTitle, description, isChannel = false, imageUrl, variant = 'card', aspectRatio = 'video'
}) => {
  const { watchedVideos, markVideoAsWatched } = useVideoProgressStore();
  const isWatched = watchedVideos.has(videoTitle);
  const videoId = getYouTubeId(youtubeUrl);
  const { isClearMode, theme } = useThemeStore();
  const isLightClear = isClearMode && theme === 'light';

  const Container = variant === 'card' ? Card : 'div';
  const containerClasses = variant === 'card' ? "h-full flex flex-col" : "h-full flex flex-col bg-background/50 rounded-lg border overflow-hidden";
  const contentClasses = aspectRatio === 'video' ? "p-0 relative aspect-video w-full" : "p-0 relative flex-1 w-full min-h-[200px]";

  if (isChannel) {
    return (
      <Container className={containerClasses}>
        <div className={variant === 'card' ? "p-0" : ""}>
          <div className={cn("relative w-full bg-muted/20", aspectRatio === 'video' ? "aspect-video" : "flex-1")}>
            <Image
              src={imageUrl || "https://placehold.co/600x400.png"}
              alt={videoTitle}
              fill
              className="rounded-t-lg object-contain p-2"
              data-ai-hint="youtube channel"
            />
          </div>
        </div>
        <div className={variant === 'card' ? "flex-1 p-4" : "p-3"}>
          <h3 className="font-semibold">{videoTitle}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div className={variant === 'card' ? "p-4 pt-0" : "p-3 pt-0"}>
          <Button asChild className={cn(
            "w-full ring-1 ring-white/60",
            isClearMode
              ? isLightClear
                ? "bg-card/60 text-foreground"
                : "bg-white/10 text-white"
              : ""
          )}>
            <Link href={youtubeUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Visit Channel
            </Link>
          </Button>
        </div>
      </Container>
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
    <Container className={containerClasses}>
      <div className={contentClasses}>
        <YouTube
          key={videoId}
          videoId={videoId}
          opts={opts}
          onEnd={handleVideoEnd}
          className="absolute top-0 left-0 w-full h-full"
        />
        {isWatched && (
          <Badge variant="secondary" className="absolute bottom-2 right-2 z-10 flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Watched
          </Badge>
        )}
      </div>
      <div className={variant === 'card' ? "p-4 flex-grow flex flex-col items-start" : "p-3 flex flex-col items-start bg-background/40 flex-shrink-0"}>
        <h3 className="font-semibold text-sm line-clamp-2">{videoTitle}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
      </div>
    </Container>
  );
};

export default YouTubePlayer;
