import type { Point } from "./burgee-shape.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **What THE BURGEE's receipts are drawn as**, off the numbers `burgee-fx.ts`
 * keeps: a freeze's snap, a ring thrown wide off the mark it landed on; a
 * catch's crack, short white strokes flung off the hoist as the canvas goes
 * taut; and the spindle's flash on a hit, laid round the spindle's own
 * middle, the draw moving the canvas there. The flag's flap, flutter and
 * pull taut are the canvas laid differently, so they stay in
 * `burgee-pose.ts`.
 */

/** The snap's ring as it is thrown, and how far wider it goes, in tiles. */
const SNAP_R = 0.46;
const SNAP_WIDE = 0.7;
/** The crack's strokes off the hoist: their angles off the flag's line, and how far they fly, in tiles. */
const CRACK = [-2.2, -1.4, 1.4, 2.2] as const;
const CRACK_FLY = 0.55;

/** A freeze's snap: a ring thrown off `at`, wider and fainter as `snap` runs down. */
export function drawBurgeeSnap(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  snap: number,
): void {
  if (snap <= 0) return;
  const ring = new Path2D();
  ring.arc(at.x, at.y, (SNAP_R + SNAP_WIDE * (1 - snap)) * l.tile, 0, Math.PI * 2);
  strokeGlow(ctx, ring, PALETTE.hullRim, STROKE.outline * snap, snap, 1);
}

/** A catch's crack: strokes flung off the hoist at `tip`, out and gone as `taut` runs down. */
export function drawBurgeeCrack(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  tip: Point,
  angle: number,
  taut: number,
): void {
  if (taut <= 0) return;
  const near = (0.15 + CRACK_FLY * (1 - taut)) * l.tile;
  const far = near + 0.22 * l.tile * taut;
  const crack = new Path2D();
  for (const off of CRACK) {
    // Along the flag's line is `angle` off straight down; each stroke is `off` round from it.
    const dx = Math.sin(angle + off);
    const dy = Math.cos(angle + off);
    crack.moveTo(tip.x + dx * near, tip.y + dy * near);
    crack.lineTo(tip.x + dx * far, tip.y + dy * far);
  }
  ctx.lineCap = "round";
  strokeGlow(ctx, crack, PALETTE.hullRim, STROKE.inner, taut, 1);
}

/**
 * The spindle's flash on a hit, round its middle: the body washed white
 * and a ring thrown off it, wider for every hit the spindle has taken.
 */
export function drawBurgeeFlash(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  tall: number,
  flash: { now: number; hits: number },
): void {
  if (flash.now <= 0) return;
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.6 * flash.now);
  ctx.fill(body);
  const ring = new Path2D();
  ring.arc(0, 0, tall * (1 + (0.4 + 0.25 * flash.hits) * (1 - flash.now)), 0, Math.PI * 2);
  strokeGlow(ctx, ring, PALETTE.hullRim, STROKE.outline, flash.now, 1);
}
