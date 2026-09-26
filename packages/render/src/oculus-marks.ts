import type { Color } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { oculusLeafEdge, oculusRadius, oculusSocketRadius } from "./oculus-shape.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE OCULUS's marks**: the two things that say what a step asks — the lit
 * pair, which is *both hold now*, and the lit core, which is *shoot here, in
 * this colour*. Cut from `oculus-draw.ts` the day it was written, along the
 * line its second half grew on: the flashes `oculus-fx.ts` times are drawn
 * here. The words over the marks are the cue's, every boss's way
 * (`boss-cue-read-ze.ts`).
 */

/** A step's colour on the canvas: its cannon's, or white for a step either answers (§27, *Colour*). */
export function oculusColour(color: Color | "either"): { body: string; rim: string } {
  if (color === "either") return { body: PALETTE.hullRim, rim: PALETTE.hullRim };
  return { body: PALETTE[color], rim: color === "red" ? PALETTE.redRim : PALETTE.cyanRim };
}

/**
 * The lit pair: both leaves' leading edges glowing white, since a hold asks
 * both seats at once and neither colour is the answer.
 */
export function drawOculusLitPair(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  leaves: readonly number[],
  shut: readonly number[],
  beatPhase: number,
): void {
  const pulse = 0.8 + 0.2 * Math.cos(beatPhase * Math.PI * 2);
  for (const k of leaves) {
    strokeGlow(ctx, oculusLeafEdge(l, k, shut[k] ?? 0), PALETTE.hullRim, STROKE.outline, pulse);
  }
}

/**
 * The core in its socket: a bare round thing, smaller for every hit it has
 * taken — the health read off the body. Dark between fire steps; lit in the
 * step's colour while one is owed, with a ring round it closing as the step's
 * beats run out. `scale` is how wide it stands: wider while it glares.
 */
export function drawOculusCore(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  open: number,
  hits: number,
  lit: { color: Color | "either"; left: number } | null,
  beatPhase: number,
  scale = 1,
): void {
  if (open <= 0) return;
  const r = oculusSocketRadius(l) * open * 0.72 * Math.max(0.3, 1 - 0.2 * hits) * scale;
  const core = new Path2D();
  core.arc(0, 0, Math.max(0.5, r), 0, Math.PI * 2);
  if (lit === null) {
    ctx.fillStyle = rgba(PALETTE.rockDark, 0.95);
    ctx.fill(core);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.rock, 0.5);
    ctx.stroke(core);
    return;
  }
  const { body, rim } = oculusColour(lit.color);
  ctx.fillStyle = rgba(body, 0.65 + 0.25 * Math.cos(beatPhase * Math.PI * 2));
  ctx.fill(core);
  strokeGlow(ctx, core, rim, STROKE.inner, 1.3);
  const ring = new Path2D();
  const rr = oculusSocketRadius(l) * 1.25;
  ring.arc(0, 0, rr, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lit.left);
  strokeGlow(ctx, ring, body, STROKE.outline, 1);
}

/**
 * A core hit's flash and the shatter's (§27, *Presentation*): white over the
 * socket, the first hit a thin flare, the second fuller, the third filling the
 * socket; the shatter's the whole lens at once. `flash.hits` is the hit it was.
 */
export function drawOculusFlash(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  flash: { now: number; hits: number },
  shatter: number,
): void {
  if (flash.now > 0 && flash.hits > 0) {
    const hits = Math.min(3, flash.hits);
    const r = oculusSocketRadius(l) * (0.15 + 0.35 * hits) * (1.4 - 0.4 * flash.now);
    const p = new Path2D();
    p.arc(0, 0, Math.max(0.5, r), 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.hullRim, flash.now * (0.35 + 0.2 * hits));
    ctx.fill(p);
    strokeGlow(ctx, p, PALETTE.hullRim, STROKE.inner, flash.now * (0.6 + 0.4 * hits));
  }
  if (shatter > 0) {
    const p = new Path2D();
    p.arc(0, 0, oculusRadius(l).rim * (1.1 - 0.3 * shatter), 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.hullRim, 0.5 * shatter);
    ctx.fill(p);
  }
}
