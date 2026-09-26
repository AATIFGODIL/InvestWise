// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React, { useEffect, useRef } from "react";

/**
 * The hero's field: the market, moving.
 *
 * A dozen price lines drift across the back of the hero like live charts —
 * new ticks arrive at the right edge and the history slides left, each line
 * at its own depth, so the near ones move faster and glow brighter than the
 * far ones. The pointer adds a few pixels of parallax by depth, which is what
 * makes it read as a space rather than a texture.
 *
 * It replaces the grid-and-blobs backdrop: the motion is the subject matter
 * (prices moving) rather than decoration, and it never gets bright enough to
 * compete with the copy — the left third is masked down so the headline sits
 * on near-black.
 *
 * Canvas, one draw per frame, no React renders. Stops when off screen or when
 * the tab is hidden; draws a single still frame under reduced motion.
 */

type Line = {
  depth: number; // 0 far → 1 near
  y: number; // baseline, as a fraction of height
  points: number[];
  value: number;
  drift: number;
  offset: number;
};

const SPACING = 14;

function makeLine(depth: number, y: number, count: number, seed: number): Line {
  let value = 0;
  const points: number[] = [];
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = 0; i < count; i++) {
    value += (rand() - 0.48) * 10;
    value *= 0.97;
    points.push(value);
  }
  return { depth, y, points, value, drift: 0.52 - rand() * 0.06, offset: 0 };
}

export function HeroBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let lines: Line[] = [];
    let pointerX = 0;
    let pointerY = 0;
    let easedX = 0;
    let easedY = 0;

    const primary = getComputedStyle(canvas).getPropertyValue("--primary").trim() || "251 82% 65%";

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.ceil(width / SPACING) + 4;
      lines = Array.from({ length: 12 }, (_, i) => {
        const depth = (i % 4) / 3;
        return makeLine(depth, 0.14 + (i / 11) * 0.78, count, 97 + i * 131);
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      lines.forEach((line) => {
        const amp = 0.8 + line.depth * 1.6;
        const px = easedX * (6 + line.depth * 22);
        const py = easedY * (4 + line.depth * 14);
        const base = line.y * height + py;

        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        const alpha = 0.05 + line.depth * 0.2;
        gradient.addColorStop(0, `hsl(${primary} / 0)`);
        gradient.addColorStop(0.38, `hsl(${primary} / ${alpha * 0.25})`);
        gradient.addColorStop(1, `hsl(${primary} / ${alpha})`);

        ctx.beginPath();
        line.points.forEach((v, i) => {
          const x = i * SPACING - line.offset + px;
          const y = base - v * amp;
          if (i === 0) ctx.moveTo(x, y);
          else {
            const prevX = (i - 1) * SPACING - line.offset + px;
            const prevY = base - line.points[i - 1] * amp;
            ctx.quadraticCurveTo(prevX, prevY, (prevX + x) / 2, (prevY + y) / 2);
          }
        });
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 0.8 + line.depth * 1.1;
        ctx.stroke();

        // The live end of the nearest lines: a small lit point, as a chart has.
        if (line.depth > 0.9) {
          const last = line.points.length - 1;
          const x = last * SPACING - line.offset + px;
          if (x < width) {
            const y = base - line.points[last] * amp;
            ctx.beginPath();
            ctx.arc(x, y, 2.4, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${primary} / 0.7)`;
            ctx.fill();
          }
        }
      });
    };

    let frame = 0;
    let previous = performance.now();
    let running = true;

    const loop = (now: number) => {
      const dt = Math.min(now - previous, 64);
      previous = now;
      easedX += (pointerX - easedX) * 0.05;
      easedY += (pointerY - easedY) * 0.05;
      lines.forEach((line) => {
        line.offset += dt * (0.008 + line.depth * 0.02);
        while (line.offset >= SPACING) {
          line.offset -= SPACING;
          line.points.shift();
          line.value += (Math.random() - line.drift) * 10;
          line.value *= 0.97;
          line.points.push(line.value);
        }
      });
      draw();
      if (running) frame = requestAnimationFrame(loop);
    };

    const onPointer = (e: PointerEvent) => {
      pointerX = e.clientX / window.innerWidth - 0.5;
      pointerY = e.clientY / window.innerHeight - 0.5;
    };

    const start = () => {
      if (reduced || !running) return;
      cancelAnimationFrame(frame);
      previous = performance.now();
      frame = requestAnimationFrame(loop);
    };

    const visibility = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting && !document.hidden;
      if (running) start();
      else cancelAnimationFrame(frame);
    });
    const onVisibility = () => {
      running = !document.hidden;
      if (running) start();
      else cancelAnimationFrame(frame);
    };

    build();
    draw();
    const resize = new ResizeObserver(() => {
      build();
      draw();
    });
    resize.observe(canvas);
    visibility.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);
    if (!reduced) window.addEventListener("pointermove", onPointer, { passive: true });
    start();

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      resize.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{
          WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,0.25) 0%, #000 55%)",
          maskImage: "linear-gradient(to right, rgba(0,0,0,0.25) 0%, #000 55%)",
        }}
      />
      {/* Floor fade, so the section hands over to the dashboard without a seam. */}
      <div
        className="absolute inset-x-0 bottom-0 h-[30vh]"
        style={{ background: "linear-gradient(to top, hsl(var(--background)), transparent)" }}
      />
    </div>
  );
}
