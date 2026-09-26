// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLYPH_OUTLINE } from "@/components/marketing/glyph-outline";

/**
 * The sculpture: the InvestWise glyph, extruded.
 *
 * The outline is traced straight out of `public/Investwise.PNG` (see
 * `glyph-outline.ts`), so this is the real mark rather than an approximation of
 * it — the horns, the shoulders and the gap between the legs are the artwork's
 * own. Extruded, bevelled and given a chrome material, it resolves into the
 * logo when it faces you and breaks into abstract geometry as it turns.
 *
 * Two ways in. At a distance it is proximity: the closer the pointer gets, the
 * further the glyph leans to follow it, easing back when the pointer leaves.
 * Up close, once the page has settled, you can pick it up — but only to turn
 * it. It never leaves its place: drag spins and tips it, a flick throws it,
 * and it always winds down facing you.
 *
 * Rendering notes:
 *  - No HDR file. The environment is a small procedurally-painted canvas turned
 *    into a cube map, which gives the chrome something to reflect for a few
 *    kilobytes instead of a few megabytes.
 *  - Every input is a ref, never a prop the loop depends on: the render loop
 *    reads them each frame, and a state update per frame would mean a React
 *    render per frame for something no React output depends on.
 *  - The canvas is never scaled *up* by CSS. Its host is sized to the largest
 *    pose the page ever puts it in and scaled down from there, so the buffer is
 *    oversampled at rest instead of interpolated during the loader.
 */

export type SculpturePhase = "spinning" | "halting" | "settled";

type Props = {
  /** Read every frame. Drives the loader choreography. */
  phaseRef: React.MutableRefObject<SculpturePhase>;
  /** 0→1 scroll position, read every frame. */
  progressRef?: React.MutableRefObject<number>;
  /** Full turns across the whole of `progress`, once settled. */
  turns?: number;
  /**
   * Written every frame with the glyph's spin velocity (rad/ms), so something
   * outside the canvas — the hero's ring of quotes — can move with it.
   */
  velocityRef?: React.MutableRefObject<number>;
  /** Fired once, the first time the reader picks the glyph up. */
  onGrab?: () => void;
  className?: string;
};

/** Angular velocity while the loader is running, radians/ms. ~1.7 turns/sec. */
const SPIN_SPEED = 0.0105;
/** How hard the spin is braked once the gates clear. Per-ms decay. */
const BRAKE = 0.99;
/** Pointer distance, in px, beyond which the glyph stops caring. */
const PROXIMITY_RADIUS = 620;
/** Extrusion depth, so the silhouette reads as a solid rather than a cut-out. */
const DEPTH = 0.34;

/** Radians of turn per px of drag: a full turn across ~560px, 1:1 under the hand. */
const DRAG_GAIN = (Math.PI * 2) / 560;
/** How far it may be tipped toward or away from you before it resists. */
const PITCH_LIMIT = 0.55;
/**
 * Apple's projection: where a flick would come to rest under scroll-style
 * deceleration. `(v/1000)·d/(1−d)` with v in rad/s is `v·d/(1−d)` in rad/ms.
 */
const DECELERATION = 0.997;
/** Yaw spring after release: critically damped, slow enough to watch it wind down. */
const YAW_SPRING = { damping: 1, response: 1.1 };
/** Pitch spring: Apple's rotation values — a little bounce, because it was thrown. */
const PITCH_SPRING = { damping: 0.8, response: 0.4 };

const clamp = (v: number, limit: number) => Math.max(-limit, Math.min(limit, v));

/** Progressive resistance past a bound, rather than a hard stop. */
function rubberband(value: number, limit: number) {
  const over = Math.abs(value) - limit;
  if (over <= 0) return value;
  const eased = (over * limit * 0.55) / (limit + 0.55 * over);
  return Math.sign(value) * (limit + eased);
}

/**
 * One step of a damped spring in Apple's terms. Returns [position, velocity];
 * velocity is per second.
 */
function stepSpring(
  x: number,
  v: number,
  target: number,
  { damping, response }: { damping: number; response: number },
  dt: number
): [number, number] {
  const omega = (2 * Math.PI) / response;
  const k = omega * omega;
  const c = 2 * damping * omega;
  // Sub-step so a dropped frame can't make a stiff spring explode.
  const steps = Math.max(1, Math.ceil(dt / 0.008));
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    const a = -k * (x - target) - c * v;
    v += a * h;
    x += v * h;
  }
  return [x, v];
}

/** A tiny painted cube map — enough for the chrome to have highlights. */
function buildEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, "#170e36");
  gradient.addColorStop(0.4, "#5442f1");
  gradient.addColorStop(0.62, "#b6a2ff");
  gradient.addColorStop(1, "#05030f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  // Two blown-out spots, to read as a key and a rim light in the reflection.
  const key = ctx.createRadialGradient(72, 58, 4, 72, 58, 70);
  key.addColorStop(0, "rgba(255,255,255,0.98)");
  key.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = key;
  ctx.fillRect(0, 0, 256, 256);

  const rim = ctx.createRadialGradient(198, 180, 3, 198, 180, 58);
  rim.addColorStop(0, "rgba(214,198,255,0.8)");
  rim.addColorStop(1, "rgba(214,198,255,0)");
  ctx.fillStyle = rim;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromEquirectangular(texture).texture;
  pmrem.dispose();
  texture.dispose();
  return envMap;
}

/** The traced outline, extruded into a solid with softened edges. */
function buildGlyphGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  GLYPH_OUTLINE.forEach(([x, y], i) => {
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: DEPTH,
    bevelEnabled: true,
    bevelThickness: 0.045,
    bevelSize: 0.045,
    bevelOffset: 0,
    bevelSegments: 5,
    curveSegments: 8,
  });
  // Centre on the extrusion's own bounds, so it turns about its middle rather
  // than about wherever the traced coordinates happened to put the origin.
  geometry.center();
  return geometry;
}

export function MarketSculpture({
  phaseRef,
  progressRef,
  turns = 0.6,
  velocityRef,
  onGrab,
  className,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  // The effect below must run exactly once — it owns a WebGL context — so the
  // callback is read through a ref instead of closed over.
  const onGrabRef = useRef(onGrab);
  onGrabRef.current = onGrab;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // A lost context, a blocked GPU, anything — the page must survive it. The
    // sculpture is decoration and is never allowed to take the hero down.
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, host.clientWidth / host.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 6.4);

    const envMap = buildEnvironment(renderer);
    scene.environment = envMap;

    const geometry = buildGlyphGeometry();
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#9c8bff"),
      metalness: 0.96,
      roughness: 0.14,
      envMapIntensity: 1.7,
    });

    const glyph = new THREE.Mesh(geometry, material);
    const pivot = new THREE.Group();
    pivot.add(glyph);
    scene.add(pivot);

    const key = new THREE.DirectionalLight(0xffffff, 2.3);
    key.position.set(3, 4, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x7c5cff, 1.5);
    fill.position.set(-4, -2, -3);
    scene.add(fill);
    scene.add(new THREE.AmbientLight(0x2b1f5e, 1.2));

    // ── Proximity ──────────────────────────────────────────────────────────
    // A pointer nearby makes the glyph lean toward it, easing back when it
    // leaves. Deferred to the drag whenever there is one.
    let leanX = 0;
    let leanY = 0;
    let dragging = false;

    const onPointerMove = (event: PointerEvent) => {
      if (dragging) return;
      const rect = host.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const strength = Math.max(0, 1 - Math.hypot(dx, dy) / PROXIMITY_RADIUS);
      leanY = (dx / PROXIMITY_RADIUS) * strength * 0.9;
      leanX = (dy / PROXIMITY_RADIUS) * strength * 0.6;
    };
    const onPointerLeave = () => {
      leanX = 0;
      leanY = 0;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);

    // ── Rotation ───────────────────────────────────────────────────────────
    // The glyph never leaves its place: a drag only turns it. Sideways travel
    // spins it about its vertical axis, 1:1 with the pointer; vertical travel
    // tips it, with rubber-band resistance past PITCH_LIMIT. On release the
    // yaw is thrown — Apple's momentum projection picks where it would come to
    // rest, that is rounded to the nearest whole turn so it always ends facing
    // you, and a spring carries it there from the finger's own velocity.
    let yaw = 0;
    let yawVel = 0; // rad/s
    let yawTarget = 0;
    let pitch = 0;
    let pitchVel = 0; // rad/s
    let grabYaw = 0;
    let grabPitch = 0;
    let grabX = 0;
    let grabY = 0;
    let pointerId = -1;
    let grabbedOnce = false;
    /** Recent samples, for release velocity. */
    let history: { t: number; yaw: number; pitch: number }[] = [];

    const onPointerDown = (event: PointerEvent) => {
      if (phaseRef.current !== "settled" || event.button !== 0) return;
      dragging = true;
      pointerId = event.pointerId;
      grabX = event.clientX;
      grabY = event.clientY;
      // Start from the presentation value, so grabbing it mid-spin never jumps.
      grabYaw = yaw;
      grabPitch = pitch;
      yawVel = 0;
      pitchVel = 0;
      history = [{ t: event.timeStamp, yaw, pitch }];
      leanX = 0;
      leanY = 0;
      host.setPointerCapture(event.pointerId);
      host.style.cursor = "grabbing";
      event.preventDefault();
      if (!grabbedOnce) {
        grabbedOnce = true;
        onGrabRef.current?.();
      }
    };

    const onDragMove = (event: PointerEvent) => {
      if (!dragging || event.pointerId !== pointerId) return;
      yaw = grabYaw + (event.clientX - grabX) * DRAG_GAIN;
      pitch = rubberband(grabPitch + (event.clientY - grabY) * DRAG_GAIN, PITCH_LIMIT);
      history.push({ t: event.timeStamp, yaw, pitch });
      // Only the last ~100ms matter for the throw.
      while (history.length > 2 && event.timeStamp - history[0].t > 100) history.shift();
    };

    const endDrag = (event: PointerEvent) => {
      if (!dragging || event.pointerId !== pointerId) return;
      dragging = false;
      pointerId = -1;
      host.style.cursor = "";

      const first = history[0];
      const last = history[history.length - 1];
      const span = Math.max(last.t - first.t, 16);
      // A pause before letting go means no throw — the samples are stale.
      const stale = event.timeStamp - last.t > 80;
      const vYawMs = stale ? 0 : (last.yaw - first.yaw) / span;
      const vPitchMs = stale ? 0 : (last.pitch - first.pitch) / span;

      yawVel = vYawMs * 1000;
      pitchVel = vPitchMs * 1000;
      const projected = yaw + (vYawMs * DECELERATION) / (1 - DECELERATION);
      yawTarget = Math.round(projected / (Math.PI * 2)) * Math.PI * 2;
    };

    host.addEventListener("pointerdown", onPointerDown);
    host.addEventListener("pointermove", onDragMove);
    host.addEventListener("pointerup", endDrag);
    host.addEventListener("pointercancel", endDrag);

    // ── Loop ───────────────────────────────────────────────────────────────
    let frame = 0;
    let previous = performance.now();
    let loaderVelocity = SPIN_SPEED;
    let easedLeanX = 0;
    let easedLeanY = 0;
    let lastYaw = 0;

    const render = (now: number) => {
      const dtMs = Math.min(now - previous, 64);
      previous = now;
      const dt = dtMs / 1000;
      const phase = phaseRef.current;

      if (phase === "spinning") {
        loaderVelocity = SPIN_SPEED;
        yaw += loaderVelocity * dtMs;
      } else if (phase === "halting") {
        // Brake to a stop, then ease the remainder onto a whole turn, so it
        // comes to rest facing forward rather than wherever it happened to be.
        loaderVelocity *= Math.pow(BRAKE, dtMs);
        yaw += loaderVelocity * dtMs;
        if (loaderVelocity < 0.00016) {
          yaw += (Math.round(yaw / (Math.PI * 2)) * Math.PI * 2 - yaw) * 0.12;
          loaderVelocity = 0;
        }
        yawTarget = Math.round(yaw / (Math.PI * 2)) * Math.PI * 2;
      } else if (!dragging) {
        [yaw, yawVel] = stepSpring(yaw, yawVel, yawTarget, YAW_SPRING, dt);
        [pitch, pitchVel] = stepSpring(pitch, pitchVel, 0, PITCH_SPRING, dt);
      }

      if (velocityRef) velocityRef.current = dtMs > 0 ? (yaw - lastYaw) / dtMs : 0;
      lastYaw = yaw;

      easedLeanX += (leanX - easedLeanX) * 0.07;
      easedLeanY += (leanY - easedLeanY) * 0.07;

      const progress = progressRef?.current ?? 0;
      // A slow idle sway (a ~26s cycle, far from the 0.2 Hz band) keeps it
      // alive at rest without ever turning it far enough to lose the mark.
      const sway = phase === "settled" && !dragging ? Math.sin(now / 4200) * 0.22 : 0;
      pivot.rotation.y = yaw + easedLeanY + sway + progress * Math.PI * 2 * turns;
      pivot.rotation.x = pitch + easedLeanX + Math.sin(now / 3600) * 0.05;
      pivot.rotation.z = -easedLeanY * 0.12 - clamp(yawVel * 0.004, 0.2);

      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    render(previous);

    const resize = new ResizeObserver(() => {
      const { clientWidth, clientHeight } = host;
      if (!clientWidth || !clientHeight) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    });
    resize.observe(host);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      host.removeEventListener("pointerdown", onPointerDown);
      host.removeEventListener("pointermove", onDragMove);
      host.removeEventListener("pointerup", endDrag);
      host.removeEventListener("pointercancel", endDrag);
      geometry.dispose();
      material.dispose();
      envMap.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [phaseRef, progressRef, turns, velocityRef]);

  return (
    // `touch-action: none` so a drag is a drag rather than the browser deciding
    // it was the start of a scroll and taking the pointer away mid-gesture.
    <div
      ref={hostRef}
      className={className}
      style={{ touchAction: "none", userSelect: "none" }}
      aria-hidden
    />
  );
}
