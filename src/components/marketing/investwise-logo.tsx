// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The official InvestWise logo — the glowing glass pill from `public/`.
 *
 * The source file is a 1536×1024 render with a lot of empty space around the
 * pill, which is right for a splash and wrong everywhere else: dropped into a
 * 40px-tall nav it would render the wordmark at about six pixels. So the art is
 * cropped to the pill's actual bounds by nesting it in a clipping box and
 * over-sizing it inside — the numbers below are that crop, expressed as
 * percentages so it holds at any size.
 *
 * Some of the transparent margin is kept on purpose: the pill's glow bleeds
 * past its own edge, and cropping to the hard edge would clip the light off it.
 */

/** The pill's bounds within the 1536×1024 source, including its glow. */
const ART = { x: 90, y: 170, w: 1370, h: 630, srcW: 1536, srcH: 1024 };

// Work in multiples of the clipping box's width, then convert at the end.
// `left` resolves against the box's width but `top` resolves against its
// *height*, so the two percentages are not on the same scale — which is the
// one thing that makes this crop easy to get subtly wrong.
const BOX_H = ART.h / ART.w;
const INNER_W = ART.srcW / ART.w;
const INNER_H = INNER_W * (ART.srcH / ART.srcW);

const INNER_W_PCT = INNER_W * 100;
const INNER_LEFT_PCT = -(ART.x / ART.srcW) * INNER_W * 100;
const INNER_TOP_PCT = (-(ART.y / ART.srcH) * INNER_H * 100) / BOX_H;

export function InvestWiseLogo({
  className,
  priority = false,
  sizes = "320px",
}: {
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    // `w-full` is the default on purpose. The only child is absolutely
    // positioned, so with `width: auto` this box shrink-to-fits to *zero* and
    // the logo silently disappears — the caller must always be the one setting
    // the width, and filling the parent is the safe way to require that.
    <span
      className={cn("relative block w-full overflow-hidden", className)}
      style={{ aspectRatio: `${ART.w} / ${ART.h}` }}
    >
      <span
        className="absolute block"
        style={{
          width: `${INNER_W_PCT}%`,
          left: `${INNER_LEFT_PCT}%`,
          top: `${INNER_TOP_PCT}%`,
          aspectRatio: `${ART.srcW} / ${ART.srcH}`,
        }}
      >
        <Image
          src="/Investwise.PNG"
          alt="InvestWise"
          fill
          sizes={sizes}
          priority={priority}
          className="select-none object-contain"
          draggable={false}
        />
      </span>
    </span>
  );
}
