// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React, { useState } from "react";
import Image from "next/image";
import YouTube from "react-youtube";
import { CheckCircle2, ExternalLink, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useVideoProgressStore from "@/store/video-progress-store";
import { useThemeStore } from "@/store/theme-store";
import { cn } from "@/lib/utils";

interface YouTubePlayerProps {
  youtubeUrl: string;
  videoTitle: string;
  description?: string;
  isChannel?: boolean;
  imageUrl?: string;
  className?: string;
}

/** The 11-character video id, from any of YouTube's URL shapes. */
function getYouTubeId(url: string): string | null {
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return match && match[2].length === 11 ? match[2] : null;
}

/**
 * A video, as a card.
 *
 * Every card has the same shape — a 16:9 picture, a title that can take two
 * lines, a two-line description — and fills its grid cell, so a row of them
 * always lines up. Videos show their thumbnail with a play button and only
 * load YouTube's player when played: a page with four videos no longer loads
 * four iframes up front. Watching one to the end marks it watched (which feeds
 * the "Watch 4 educational videos" quest).
 *
 * Channel links use the channel's artwork and open YouTube in a new tab.
 */
export default function YouTubePlayer({
  youtubeUrl,
  videoTitle,
  description,
  isChannel = false,
  imageUrl,
  className,
}: YouTubePlayerProps) {
  const { watchedVideos, markVideoAsWatched } = useVideoProgressStore();
  const { isClearMode, theme } = useThemeStore();
  const isLightClear = isClearMode && theme === "light";
  const [playing, setPlaying] = useState(false);
  const videoId = getYouTubeId(youtubeUrl);
  const isWatched = watchedVideos.has(videoTitle);

  const media = (() => {
    if (isChannel) {
      return (
        <>
          <Image
            src={imageUrl || "/Investwise.PNG"}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
          <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF0033]" />
            YouTube channel
          </span>
        </>
      );
    }

    if (!videoId) {
      return (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          Video unavailable
        </div>
      );
    }

    if (playing) {
      return (
        <YouTube
          videoId={videoId}
          opts={{ width: "100%", height: "100%", playerVars: { autoplay: 1, rel: 0 } }}
          onEnd={() => !isWatched && markVideoAsWatched(videoTitle)}
          className="absolute inset-0"
          iframeClassName="h-full w-full"
        />
      );
    }

    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        aria-label={`Play ${videoTitle}`}
        className="group absolute inset-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        <span className="absolute inset-0 bg-linear-to-t from-black/55 via-black/5 to-transparent" />
        <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-xl transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
          <Play className="ml-1 h-6 w-6 fill-black text-black" />
        </span>
      </button>
    );
  })();

  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {media}
        {isWatched && !isChannel && (
          <span className="pointer-events-none absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
            Watched
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 font-semibold leading-snug">{videoTitle}</h3>
        {description && <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{description}</p>}
        {isChannel && (
          <div className="mt-auto pt-4">
            <Button
              asChild
              className={cn(
                "w-full ring-1 ring-white/60",
                isClearMode ? (isLightClear ? "bg-card/60 text-foreground" : "bg-white/10 text-white") : ""
              )}
            >
              <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Channel
              </a>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
