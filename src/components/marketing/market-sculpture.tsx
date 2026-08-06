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
 * Up close, once the page has settled, you can grab it — drag it around the
 * hero and it spins with the throw, then swings back to its place carrying
 * whatever momentum you gave it.
 *
 * Rendering notes:
 *  - No HDR file. The environment is a small procedurally-painted canvas turned
 *    into a cube map, which gives the chrome something to reflect for a few
 *    kilobytes instead of a few megabytes.
 *  - Every input is a ref, never a prop the loop depends on: the render loop
 *    reads them each frame, and a state update per frame would mean a React
 *    render per frame for something no React output depends on. The drag lives
 *    here too, for the same reason — it writes a transform straight onto the
 *    host element rather than round-tripping through state.
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
   * The CSS scale the host is displayed at, inverted. A drag is measured in
   * screen pixels but applied inside a scaled box, so without this the glyph
   * lags behind the pointer by exactly that factor.
   */
  dragScale?: number;
  className?: string;
};

/** Angular velocity while the loader is running, radians/ms. ~1.7 turns/sec. */
const SPIN_SPEED = 0.0105;
/** How hard the spin is braked once the gates clear. Per-ms decay. */
const BRAKE = 0.99;
/** Per-ms decay of a spin the reader threw. Long enough to watch it run down. */
const FREE_DECAY = 0.9986;
/** How eagerly a spun-out glyph drifts back to facing you, once it is slow. */
const REFACE = 0.02;
/** Pointer distance, in px, beyond which the glyph stops caring. */
const PROXIMITY_RADIUS = 620;
/** Extrusion depth, so the silhouette reads as a solid rather than a cut-out. */
const DEPTH = 0.34;

/** Pointer speed (px/ms) → spin (rad/ms) while dragging. */
const DRAG_SPIN_GAIN = 0.0055;
/** The same for the vertical axis, softer: a tumble is easier to overdo. */
const DRAG_TUMBLE_GAIN = 0.003;
/** Ceiling on both, so a flicked trackpad can't turn it into a strobe. */
const MAX_DRAG_SPIN = 0.022;
/** Per-ms decay of the drag's own reading of pointer speed, so pausing
 *  mid-drag lets the spin fall away rather than holding at the last flick. */
const DRAG_SPIN_FADE = 0.994;

const clamp = (v: number, limit: number) => Math.max(-limit, Math.min(limit, v));

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
  dragScale = 1,
  className,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  // The effect below must run exactly once — it owns a WebGL context — so the
  // one genuinely changeable input is read through a ref instead of closed over.
  const dragScaleRef = useRef(dragScale);
  dragScaleRef.current = dragScale;

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
    // Target lean, in radians, updated on pointer move and eased toward in the
    // loop. Reading the host's rect here rather than caching it keeps this
    // correct through scrolling and resizing without a second listener.
    let leanX = 0;
    let leanY = 0;
    /** Declared up here only because the lean has to defer to it. */
    let dragging = false;

    const onPointerMove = (event: PointerEvent) => {
      // A hand on the object outranks a hand near it — otherwise the lean and
      // the drag are two answers to the same pointer, pulling opposite ways.
      if (dragging) {
        leanX = 0;
        leanY = 0;
        return;
      }

      const rect = host.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);

      // Falls off to nothing at the radius, so a pointer on the far side of the
      // page has no effect at all.
      const strength = Math.max(0, 1 - Math.hypot(dx, dy) / PROXIMITY_RADIUS);
      leanY = (dx / PROXIMITY_RADIUS) * strength * 1.5;
      leanX = (dy / PROXIMITY_RADIUS) * strength * 1.1;
    };

    const onPointerLeave = () => {
      leanX = 0;
      leanY = 0;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);

    // ── Drag ───────────────────────────────────────────────────────────────
    // `drag*` is where the pointer has put it; `pos*`/`vel*` is where the glyph
    // actually is, chasing that on a spring. The gap between the two is the
    // whole feel of it: it trails the pointer under the hand, and when the hand
    // lets go the target snaps back to zero while the velocity carries on, so
    // it overshoots home and swings in rather than sliding there.
    let pointerId = -1;
    let lastX = 0;
    let lastY = 0;
    let lastMoveAt = 0;
    let dragX = 0;
    let dragY = 0;
    let posX = 0;
    let posY = 0;
    let velX = 0;
    let velY = 0;
    /** The drag's live reading of pointer speed, in rad/ms of spin. */
    let thrownSpin = 0;
    let thrownTumble = 0;

    const onPointerDown = (event: PointerEvent) => {
      // Nothing to grab until the page has assembled — during the loader this
      // object is choreography, and it belongs to the loader.
      if (phaseRef.current !== "settled" || event.button !== 0) return;
      dragging = true;
      pointerId = event.pointerId;
      lastX = event.clientX;
      lastY = event.clientY;
      lastMoveAt = event.timeStamp;
      leanX = 0;
      leanY = 0;
      host.setPointerCapture(event.pointerId);
      host.style.cursor = "grabbing";
      event.preventDefault();
    };

    const onDragMove = (event: PointerEvent) => {
      if (!dragging || event.pointerId !== pointerId) return;

      const gap = Math.max(event.timeStamp - lastMoveAt, 8);
      lastMoveAt = event.timeStamp;

      const scale = dragScaleRef.current;
      const dx = (event.clientX - lastX) * scale;
      const dy = (event.clientY - lastY) * scale;
      lastX = event.clientX;
      lastY = event.clientY;

      dragX += dx;
      dragY += dy;

      // Sideways travel turns it about its own axis; vertical travel tumbles
      // it. Speed, not distance — a slow drag across the hero shouldn't wind it
      // up like a top.
      thrownSpin = clamp((dx / gap) * DRAG_SPIN_GAIN, MAX_DRAG_SPIN);
      thrownTumble = clamp((dy / gap) * DRAG_TUMBLE_GAIN, MAX_DRAG_SPIN);
    };

    const endDrag = (event: PointerEvent) => {
      if (!dragging || event.pointerId !== pointerId) return;
      dragging = false;
      pointerId = -1;
      // The target goes home immediately; `velX/velY` do not, which is what
      // makes a throw read as a throw.
      dragX = 0;
      dragY = 0;
      host.style.cursor = "";
    };

    host.addEventListener("pointerdown", onPointerDown);
    host.addEventListener("pointermove", onDragMove);
    host.addEventListener("pointerup", endDrag);
    host.addEventListener("pointercancel", endDrag);

    // ── Loop ───────────────────────────────────────────────────────────────
    let frame = 0;
    let previous = performance.now();
    /** Free rotation, carried by the loader spin, the brake and any throw. */
    let spin = 0;
    let spinVelocity = SPIN_SPEED;
    let tumble = 0;
    let tumbleVelocity = 0;
    let easedLeanX = 0;
    let easedLeanY = 0;

    const render = (now: number) => {
      const dt = Math.min(now - previous, 64);
      previous = now;
      // Spring maths below is written per 60fps frame; this is what keeps it
      // honest on a 120Hz display or after a dropped frame.
      const step = dt / 16.667;
      const phase = phaseRef.current;

      if (phase === "spinning") {
        spinVelocity = SPIN_SPEED;
        spin += spinVelocity * dt;
      } else if (phase === "halting") {
        // Brake to a stop, then ease the remainder onto a whole turn, so it
        // comes to rest facing forward rather than wherever it happened to be.
        spinVelocity *= Math.pow(BRAKE, dt);
        spin += spinVelocity * dt;
        if (spinVelocity < 0.00016) {
          spin += (Math.round(spin / (Math.PI * 2)) * Math.PI * 2 - spin) * 0.12;
          spinVelocity = 0;
        }
      } else {
        // Settled: the object is handed over to the reader. Under the hand its
        // spin *is* the pointer's speed; off it, that momentum runs down, and
        // only once it is nearly spent does it drift back to facing you — so a
        // throw is never cut short by the glyph tidying itself up.
        thrownSpin *= Math.pow(DRAG_SPIN_FADE, dt);
        thrownTumble *= Math.pow(DRAG_SPIN_FADE, dt);

        if (dragging) {
          spinVelocity = thrownSpin;
          tumbleVelocity = thrownTumble;
        } else {
          spinVelocity *= Math.pow(FREE_DECAY, dt);
          tumbleVelocity *= Math.pow(FREE_DECAY, dt);
        }

        spin += spinVelocity * dt;
        tumble += tumbleVelocity * dt;

        if (!dragging && Math.abs(spinVelocity) < 0.00035) {
          spin += (Math.round(spin / (Math.PI * 2)) * Math.PI * 2 - spin) * REFACE;
          tumble += -tumble * REFACE;
        }
      }

      // Stiff and heavily damped under the hand so it tracks; slack and springy
      // off it so the return has some life in it.
      const stiffness = dragging ? 0.3 : 0.055;
      const damping = dragging ? 0.55 : 0.83;
      velX += (dragX - posX) * stiffness * step;
      velY += (dragY - posY) * stiffness * step;
      velX *= Math.pow(damping, step);
      velY *= Math.pow(damping, step);
      posX += velX * step;
      posY += velY * step;
      host.style.transform = `translate3d(${posX.toFixed(2)}px, ${posY.toFixed(2)}px, 0)`;

      easedLeanX += (leanX - easedLeanX) * 0.07;
      easedLeanY += (leanY - easedLeanY) * 0.07;

      const progress = progressRef?.current ?? 0;
      pivot.rotation.y = spin + easedLeanY + progress * Math.PI * 2 * turns;
      pivot.rotation.x = tumble + easedLeanX + Math.sin(now / 3600) * 0.05;
      // A touch of roll off the horizontal lean and off the throw, so it banks
      // rather than merely turning — the difference between a hinge and an
      // object.
      pivot.rotation.z = -easedLeanY * 0.12 - clamp(velX * 0.004, 0.3);

      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    // One frame straight away, so the canvas has the glyph on it the moment it
    // is in the document rather than one animation frame later.
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
  }, [phaseRef, progressRef, turns]);

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
