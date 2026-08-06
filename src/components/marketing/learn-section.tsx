// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Award,
  BookOpen,
  LineChart,
  Repeat,
  Target,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EditorialTitle } from "@/components/marketing/editorial-title";

/**
 * Everything the cinema didn't have room for.
 *
 * The four staged features are the ones worth two hundred vh each; these are
 * the rest of the product, in a bento grid. The tiles tilt very slightly toward
 * the pointer — a few degrees, cheap, and enough to make a static grid feel
 * like it's made of objects rather than rectangles.
 */

const TILES = [
  {
    icon: Target,
    title: "Goals that do the maths",
    body: "Name the thing you're saving for. InvestWise works backwards to the monthly number and tells you honestly whether the date is realistic.",
    span: "sm:col-span-2",
  },
  {
    icon: Repeat,
    title: "Auto-invest",
    body: "Set it once, and a recurring buy runs on schedule — the habit that matters most, made boring on purpose.",
    span: "",
  },
  {
    icon: BookOpen,
    title: "Lessons where you need them",
    body: "Short explainers attached to the screen that raised the question, not buried in a separate academy tab.",
    span: "",
  },
  {
    icon: Trophy,
    title: "A leaderboard worth being on",
    body: "Ranked on returns against everyone else learning at the same time. Nobody's real money is on the line, so the bragging is free.",
    span: "sm:col-span-2",
  },
  {
    icon: Award,
    title: "A certificate at the end",
    body: "Finish the track and there's something to show for it.",
    span: "",
  },
  {
    icon: LineChart,
    title: "Forecasts that admit what they don't know",
    body: "Ask for a five-month outlook on any symbol and you get one — with the model's own confidence attached. A low-confidence call says so, because a projection without its uncertainty is exactly the number that gets people into trouble.",
    span: "sm:col-span-2",
  },
];

export function LearnSection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.25 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="learn"
      ref={ref}
      className={cn("lp-panel relative z-20 bg-background px-5 py-24 sm:px-8", visible && "is-active")}
    >
      <div className="mx-auto max-w-5xl">
        <p className="lp-fade lp-eyebrow mb-3.5 text-foreground/50">And the rest</p>
        <EditorialTitle
          text="The parts that keep you here."
          active={visible}
          as="h2"
          className="lp-headline max-w-[16ch] text-[clamp(1.9rem,5vw,3.1rem)] text-foreground"
        />

        <div className="mt-14 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          {TILES.map((tile, i) => (
            <Tile key={tile.title} tile={tile} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Tile({ tile, index }: { tile: (typeof TILES)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const Icon = tile.icon;

  // Pointer tilt, written straight to custom properties. Going through React
  // state here would mean a render per `pointermove`, which is a lot of work
  // for two numbers that only ever reach CSS.
  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    node.style.setProperty("--lp-tilt-y", `${px * 7}deg`);
    node.style.setProperty("--lp-tilt-x", `${-py * 7}deg`);
    node.style.setProperty("--lp-glow-x", `${(px + 0.5) * 100}%`);
    node.style.setProperty("--lp-glow-y", `${(py + 0.5) * 100}%`);
  };

  const handleLeave = () => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--lp-tilt-y", "0deg");
    node.style.setProperty("--lp-tilt-x", "0deg");
  };

  return (
    <div
      className={cn("lp-fade", tile.span)}
      data-stagger={Math.min(index + 1, 3)}
      style={{ perspective: "900px" }}
    >
      <div
        ref={ref}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        className="lp-glass group relative h-full overflow-hidden rounded-[calc(var(--radius)*1.2)] p-6"
        style={{
          transform:
            "rotateX(var(--lp-tilt-x, 0deg)) rotateY(var(--lp-tilt-y, 0deg)) translateZ(0)",
          transformStyle: "preserve-3d",
          transition: "transform 320ms cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {/* Specular highlight that follows the pointer across the surface. */}
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(320px circle at var(--lp-glow-x, 50%) var(--lp-glow-y, 50%), hsl(var(--primary) / 0.16), transparent 70%)",
          }}
          aria-hidden
        />

        <span
          className="relative flex h-10 w-10 items-center justify-center rounded-[calc(var(--radius)/1.3)]"
          style={{
            background: "hsl(var(--primary) / 0.16)",
            boxShadow: "inset 0 0 0 1px hsl(var(--primary) / 0.32)",
          }}
        >
          <Icon className="h-[18px] w-[18px]" style={{ color: "hsl(var(--primary))" }} />
        </span>

        <h3 className="relative mt-5 text-[16px] font-bold tracking-tight text-foreground">
          {tile.title}
        </h3>
        <p className="lp-body-glass relative mt-2 text-[13.5px]">{tile.body}</p>
      </div>
    </div>
  );
}
