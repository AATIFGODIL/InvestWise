// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React, { useEffect, useRef, useState } from "react";
import { easeInOut, easeOut, motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StageCapabilities } from "@/components/marketing/use-stage-capabilities";

/**
 * The launch film.
 *
 * It sits between the hero and the dashboard, and on a desktop that can stage
 * it is a pinned viewport like the sections after it:
 *
 * ─ entering     the film rises in as a card under its heading
 * ─ pinned       HOLD on the two together, long enough to read the heading
 * ─ grow         the card grows until it fills the screen, covering the heading
 * ─ full         HOLD, full screen, playing
 * ─ exit         it eases back down to a card as the dashboard comes up
 *
 * The beats are in `BEATS` below, as scroll distances.
 *
 * It plays muted on its own (browsers allow nothing else) and only while it is
 * actually on screen. Sound is one press away, and turning it on starts the
 * film again from the top: it is cut to its music, so joining the track
 * halfway through is the wrong way to hear it.
 *
 * With reduced motion it never starts by itself; a play button waits instead.
 * On a compact or touch viewport it is an ordinary inline player with the
 * browser's own controls, which on a phone is what gets you full screen.
 */

const SRC = "/film/investwise-launch.mp4";
const POSTER = "/film/poster.jpg";
const VIDEO_ID = "investwise-film";

/**
 * The section's height, and every beat in it, as scroll distance in vh,
 * measured from the moment its top edge comes up over the bottom of the screen.
 */
const RUN = 400;
const BEATS = {
  /** Its top reaches the top of the screen and the stage pins. */
  pinned: 100,
  /** The heading has had its moment; the film starts to take over. */
  grow: 180,
  /** Full screen. "Watch the film" lands here. */
  full: 270,
  /** It starts to settle back as the dashboard comes up. */
  exit: 360,
};
const at = (vh: number) => vh / RUN;

/** How large the card starts, as a fraction of its full size. */
const START_SCALE = 0.58;
/** How far it has grown (0–1) by the time it pins and holds under the heading. */
const ARRIVE = 0.2;
/** How far it settles back on the way out. */
const EXIT_SCALE = 0.9;
/** The card's corner radius at its smallest, in on-screen px. */
const CARD_RADIUS = 28;
/** How much of the film has to be on screen for it to play. */
const VISIBLE = 0.6;

/**
 * Starts the film from the top, with sound. The hero's "Watch the film" link
 * calls this from inside its click handler: a browser only lets audio start in
 * direct response to a press, so it can't wait for the scroll to land.
 */
export function playFilmWithSound() {
  const video = document.getElementById(VIDEO_ID);
  if (!(video instanceof HTMLVideoElement)) return;
  video.muted = false;
  video.currentTime = 0;
  void video.play().catch(() => {});
}

function cardScale(grow: number, shrink: number) {
  return (START_SCALE + (1 - START_SCALE) * grow) * (1 - (1 - EXIT_SCALE) * shrink);
}

export function FilmSection({ caps }: { caps: StageCapabilities }) {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const compact = caps.checked && !caps.canStage;
  const autoplay = !compact && !caps.prefersReducedMotion;

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  // Paused by a press, as opposed to by scrolling away. A film the visitor
  // stopped stays stopped when it comes back on screen.
  const [held, setHeld] = useState(false);
  const heldRef = useRef(false);
  const hold = (next: boolean) => {
    heldRef.current = next;
    setHeld(next);
  };

  // Play while on screen, pause when not. Without autoplay it only resumes what
  // scrolling away interrupted.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = autoplay;
    let pausedByScroll = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= VISIBLE) {
          if (video.paused && !heldRef.current && (autoplay || pausedByScroll)) {
            pausedByScroll = false;
            // Low Power Mode and some browser settings refuse even muted
            // autoplay. Show the play button rather than a frozen poster.
            void video.play().catch(() => hold(true));
          }
        } else if (!video.paused) {
          pausedByScroll = true;
          video.pause();
        }
      },
      { threshold: [0, VISIBLE] }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [autoplay, compact]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => {});
    } else {
      hold(true);
      video.pause();
    }
  };

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.muted) {
      video.muted = false;
      video.currentTime = 0;
      void video.play().catch(() => {});
    } else {
      video.muted = true;
    }
  };

  const { scrollYProgress: run } = useScroll({ target: ref, offset: ["start end", "end end"] });

  const grow = useTransform(
    run,
    [at(10), at(BEATS.pinned), at(BEATS.grow), at(BEATS.full)],
    [0, ARRIVE, ARRIVE, 1],
    { ease: [easeOut, (t: number) => t, easeInOut] }
  );
  const shrink = useTransform(run, [at(BEATS.exit), 1], [0, 1], { ease: easeOut });
  const scale = useTransform([grow, shrink], ([g, s]: number[]) => cardScale(g, s));
  // The radius is set before the scale is applied, so it is divided back out to
  // keep the corner the same on-screen size as the card grows.
  const radius = useTransform([grow, shrink], ([g, s]: number[]) => (CARD_RADIUS * Math.max(1 - g, s)) / cardScale(g, s));
  const edge = useTransform([grow, shrink], ([g, s]: number[]) => Math.max(1 - g, s));
  // A function rather than a range: given a range, framer hands opacity to the
  // browser as a native scroll animation, and the keyframes it builds have no
  // hold after the last stop, so the heading faded back in under the film.
  const headingOpacity = useTransform(run, (p) => Math.min(1, Math.max(0, 1 - (p - at(BEATS.grow)) / at(40))));
  const headingY = useTransform(run, [at(30), at(BEATS.pinned)], ["0vh", "-6vh"]);
  const controlsOpacity = useTransform(grow, [0.75, 1], [0, 1]);

  const heading = (
    <div className="text-center">
      <p className="lp-eyebrow mb-3 text-foreground/50">The film</p>
      <h2 className="lp-headline text-[clamp(1.9rem,3.4vw,3rem)] text-foreground">InvestWise, in motion.</h2>
    </div>
  );

  if (compact) {
    return (
      <section id="film" className="relative px-5 py-20">
        {heading}
        <div className="mx-auto mt-10 max-w-xl overflow-hidden rounded-[22px] shadow-[0_30px_80px_-30px_hsl(0_0%_0%/0.9)] ring-1 ring-white/10">
          <video
            id={VIDEO_ID}
            ref={videoRef}
            src={SRC}
            poster={POSTER}
            controls
            playsInline
            preload="metadata"
            onPlay={() => hold(false)}
            className="block aspect-video w-full bg-background"
          />
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative z-20" style={{ height: `${RUN}vh` }}>
      {/* The `#film` anchor sits at the full-screen beat rather than the
          section's top, so "Watch the film" lands on the film, not its title.
          Scrolled to the top of the screen it puts the section's top edge
          `full - pinned` vh above it. */}
      <div
        id="film"
        className="pointer-events-none absolute inset-x-0"
        style={{ top: `${BEATS.full - BEATS.pinned}vh` }}
        aria-hidden
      />
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <motion.div
          style={{ opacity: headingOpacity, y: headingY }}
          className="pointer-events-none absolute inset-x-0 top-[9vh] px-6"
        >
          {heading}
        </motion.div>

        <motion.div
          style={{
            scale,
            borderRadius: radius,
            // The largest 16:9 box the screen holds.
            width: "min(100%, calc(100svh * 16 / 9))",
            willChange: "transform",
            boxShadow: "0 50px 140px -40px hsl(0 0% 0% / 0.9)",
          }}
          // `isolate` keeps Safari clipping the video to the rounded corners
          // while the card is transformed.
          className="relative isolate aspect-video overflow-hidden bg-background"
        >
          <video
            id={VIDEO_ID}
            ref={videoRef}
            src={SRC}
            poster={POSTER}
            muted
            loop
            playsInline
            preload="metadata"
            onClick={togglePlay}
            onPlay={() => {
              hold(false);
              setPlaying(true);
            }}
            onPause={() => setPlaying(false)}
            onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
            aria-label="The InvestWise launch film"
            className="block h-full w-full cursor-pointer object-cover"
          />

          {/* The card's edge, only while it is a card. */}
          <motion.div
            style={{ opacity: edge, borderRadius: radius }}
            className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_hsl(0_0%_100%/0.12)]"
            aria-hidden
          />

          {!playing && (held || !autoplay) && (
            <button
              type="button"
              onClick={togglePlay}
              aria-label="Play the film"
              className="lp-cta lp-focus lp-glass absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-foreground"
            >
              <Play className="ml-1 h-7 w-7 fill-current" />
            </button>
          )}

          <Controls
            opacity={controlsOpacity}
            playing={playing}
            muted={muted}
            onTogglePlay={togglePlay}
            onToggleSound={toggleSound}
          />
        </motion.div>
      </div>
    </section>
  );
}

function Controls({
  opacity,
  playing,
  muted,
  onTogglePlay,
  onToggleSound,
}: {
  opacity: MotionValue<number>;
  playing: boolean;
  muted: boolean;
  onTogglePlay: () => void;
  onToggleSound: () => void;
}) {
  return (
    <motion.div style={{ opacity }} className="absolute bottom-5 right-5 flex items-center gap-2">
      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={playing ? "Pause the film" : "Play the film"}
        className="lp-cta lp-focus lp-glass flex h-10 w-10 items-center justify-center rounded-full text-foreground/85 hover:text-foreground"
      >
        {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
      </button>
      <button
        type="button"
        onClick={onToggleSound}
        className={cn(
          "lp-cta lp-focus lp-glass flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-semibold",
          muted ? "text-foreground" : "text-foreground/85 hover:text-foreground"
        )}
      >
        {muted ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        {muted ? "Play with sound" : "Mute"}
      </button>
    </motion.div>
  );
}
