
"use client";

import React from 'react';
import YouTube from 'react-youtube';
import useVideoProgressStore from '@/store/video-progress-store';
import { Button } from '../ui/button';
import { RotateCcw } from 'lucide-react';

interface YouTubePlayerProps {
  youtubeUrl: string;
  videoTitle: string;
}

// Function to extract video ID from various YouTube URL formats
const getYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ youtubeUrl, videoTitle }) => {
  const { watchedVideos, toggleWatchedVideo } = useVideoProgressStore();
  const isWatched = watchedVideos.has(videoTitle);
  const videoId = getYouTubeId(youtubeUrl);

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
    // Only mark as watched, don't un-watch on end
    if (!isWatched) {
      toggleWatchedVideo(videoTitle);
    }
  };

  return (
    <div className="relative aspect-video w-full">
      <YouTube 
        videoId={videoId} 
        opts={opts} 
        onEnd={handleVideoEnd}
        className="absolute top-0 left-0 w-full h-full rounded-t-lg overflow-hidden"
      />
      {isWatched && (
        <div className="absolute bottom-2 right-2">
            <Button size="sm" variant="secondary" onClick={() => toggleWatchedVideo(videoTitle)}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Mark as Unwatched
            </Button>
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer;
