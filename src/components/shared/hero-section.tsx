"use client";

import React, { useEffect, useRef } from "react";
import ReactDOMServer from "react-dom/server";
import {
  Code,
  DollarSign,
  Gavel,
  BarChart,
  BrainCircuit,
  Globe,
  Euro,
  Bitcoin,
} from "lucide-react";

function TennisBallIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="transparent" />
      <path
        d="M6,50a44,44 0 1,0 88,0a44,44 0 1,0 -88,0"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </svg>
  );
}

const icons = [
  { component: TennisBallIcon },
  { component: DollarSign },
  { component: Euro },
  { component: Bitcoin },
  { component: BarChart },
  { component: BrainCircuit },
  { component: Code },
  { component: Gavel },
  { component: Globe },
];

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const iconElements = useRef<any>({});
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || 600);
    const particles: any[] = [];
    const paths: any[] = [];
    const numPathsPerSide = 7;
    const numParticles = 28;

    class PathParticle {
      pathIndex: number;
      progress: number;
      speed: number;
      alpha: number;
      iconIndex: number;

      constructor(pathIndex: number) {
        this.pathIndex = pathIndex;
        this.iconIndex = Math.floor(Math.random() * icons.length);
        this.progress = Math.random();
        this.speed = Math.random() * 0.001 + 0.0005;
        this.alpha = 0;
      }

      update() {
        this.progress += this.speed;
        
        if (this.progress < 0.7) {
            this.alpha = Math.min(1, this.alpha + 0.05);
        } else {
            this.alpha = Math.max(0, 1 - (this.progress - 0.7) / 0.3);
        }

        if (this.progress >= 1) {
          this.progress = 0;
          this.alpha = 0;
          this.iconIndex = Math.floor(Math.random() * icons.length);
        }
      }

      draw() {
        if (!ctx) return;
        const path = paths[this.pathIndex];
        if (!path) return;

        const pos = getPointOnPath(path, this.progress);
        
        const iconCanvas = iconElements.current[this.iconIndex];
        if (iconCanvas) {
            ctx.globalAlpha = this.alpha;
            // Apply a pulsing drop-shadow filter for the glow effect
            const glowAmount = (Math.sin(Date.now() / 500) + 1) * 4 + 4; // Varies between 4 and 12
            ctx.filter = `drop-shadow(0 0 ${glowAmount}px hsl(var(--primary) / 0.7))`;
            ctx.drawImage(iconCanvas, pos.x - 32, pos.y - 32);
            ctx.globalAlpha = 1;
            ctx.filter = 'none'; // Reset filter
        }
      }
    }
    
    function getPointOnPath({ start, cp1, cp2, end }: any, t: number) {
        const x = Math.pow(1 - t, 3) * start.x + 3 * Math.pow(1 - t, 2) * t * cp1.x + 3 * (1 - t) * Math.pow(t, 2) * cp2.x + Math.pow(t, 3) * end.x;
        const y = Math.pow(1 - t, 3) * start.y + 3 * Math.pow(1 - t, 2) * t * cp1.y + 3 * (1 - t) * Math.pow(t, 2) * cp2.y + Math.pow(t, 3) * end.y;
        return { x, y };
    }

    function createPaths() {
        paths.length = 0;
        const center_x = width / 2;
        const center_y = height / 2;

        for(let i=0; i<numPathsPerSide; i++) {
            // Left side
            paths.push({
                start: { x: -100, y: Math.random() * height },
                cp1: { x: center_x * 0.4, y: Math.random() * height },
                cp2: { x: center_x * 0.8, y: center_y + (Math.random() - 0.5) * 200 },
                end: { x: center_x - 150, y: center_y + (Math.random() - 0.5) * 100 },
            });
            // Right side
            paths.push({
                start: { x: width + 100, y: Math.random() * height },
                cp1: { x: width - center_x * 0.4, y: Math.random() * height },
                cp2: { x: width - center_x * 0.8, y: center_y + (Math.random() - 0.5) * 200 },
                end: { x: center_x + 150, y: center_y + (Math.random() - 0.5) * 100 },
            });
        }
    }

    function init() {
      particles.length = 0;
      createPaths();
      for (let i = 0; i < numParticles; i++) {
        particles.push(new PathParticle(i % paths.length));
      }
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId.current = requestAnimationFrame(animate);
    }
    
    const loadIcons = async () => {
      const iconSize = 64;
      const loadPromises = icons.map((iconData, index) => {
        return new Promise((resolve, reject) => {
          const IconComponent = iconData.component;
          const svgString = ReactDOMServer.renderToString(
            <IconComponent
              width={iconSize}
              height={iconSize}
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary) / 0.15)"
              strokeWidth={1.5}
            />
          );

          const img = new Image();
          img.onload = () => {
            const iconCanvas = document.createElement("canvas");
            iconCanvas.width = iconSize;
            iconCanvas.height = iconSize;
            const iconCtx = iconCanvas.getContext("2d");
            if (!iconCtx) return reject(new Error("Could not get icon context"));
            
            iconCtx.drawImage(img, 0, 0, iconSize, iconSize);

            iconElements.current[index] = iconCanvas;
            resolve(true);
          };
          img.onerror = (err) => {
            console.error("Failed to load icon SVG:", err);
            reject(err);
          };
          
          img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
        });
      });

      try {
        await Promise.all(loadPromises);
        init();
        animate();
      } catch (error) {
        console.error("Error loading icons:", error);
      }
    };
    
    const handleResize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = canvas.parentElement?.offsetHeight || 600;
        init();
    }

    window.addEventListener('resize', handleResize);
    
    loadIcons();

    return () => {
        window.removeEventListener('resize', handleResize);
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
    }
  }, []);

  return (
    <section id="hero" className="relative w-full h-[80vh] md:h-screen flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0 opacity-90"></canvas>
      <div className="container px-4 md:px-6 text-center z-10">
        <div className="flex flex-col justify-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl/none font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/60 to-primary">
              Hi, I'm Aatif Godil
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              A passionate developer, financial enthusiast, tennis player, and debater.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
