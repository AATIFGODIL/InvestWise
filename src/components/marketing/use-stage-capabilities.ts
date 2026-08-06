// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import { useEffect, useState } from "react";

/**
 * What the landing page is allowed to stage on this device.
 *
 * The cinematic sections are pinned viewports several thousand `vh` tall that
 * hold a 3D-transformed device and four blurred glass layers on top of it.
 * That is the right experience on a desktop with a real GPU and completely the
 * wrong one on a phone: a pinned section on a touch device fights the browser's
 * own address-bar collapse, and the blur stack costs more than the effect is
 * worth. So the same content is available two ways, and this decides which.
 *
 * `checked` matters as much as the flags. Everything here is a client-only
 * measurement, so the first render has to be honest about not knowing yet —
 * sections gate their layout on `checked` rather than rendering the desktop
 * take and then yanking it away once the media query resolves.
 */
export type StageCapabilities = {
  /** Viewport is narrow enough that pinned scroll choreography is the wrong call. */
  isCompact: boolean;
  /** The user asked for less motion. Ambient loops off, reveals resolve instantly. */
  prefersReducedMotion: boolean;
  /** Enough cores and a fine pointer to carry the stacked-blur stage. */
  canStage: boolean;
  /** True once the above have actually been measured in the browser. */
  checked: boolean;
};

const COMPACT_BREAKPOINT = 1024;

export function useStageCapabilities(): StageCapabilities {
  const [caps, setCaps] = useState<StageCapabilities>({
    isCompact: false,
    prefersReducedMotion: false,
    canStage: true,
    checked: false,
  });

  useEffect(() => {
    const compactQuery = window.matchMedia(`(max-width: ${COMPACT_BREAKPOINT - 1}px)`);
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    // A coarse pointer is the most reliable "this is a touch device" signal
    // available — far better than a user-agent string, and it is exactly the
    // property that makes a pinned section feel wrong.
    const pointerQuery = window.matchMedia("(pointer: coarse)");

    const measure = () => {
      const isCompact = compactQuery.matches;
      const prefersReducedMotion = motionQuery.matches;
      const cores = navigator.hardwareConcurrency ?? 8;

      setCaps({
        isCompact,
        prefersReducedMotion,
        canStage: !isCompact && !pointerQuery.matches && cores >= 4,
        checked: true,
      });
    };

    measure();
    compactQuery.addEventListener("change", measure);
    motionQuery.addEventListener("change", measure);
    pointerQuery.addEventListener("change", measure);

    return () => {
      compactQuery.removeEventListener("change", measure);
      motionQuery.removeEventListener("change", measure);
      pointerQuery.removeEventListener("change", measure);
    };
  }, []);

  return caps;
}
