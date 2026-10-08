import type { SimConfig } from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { gallLobes, gallSpent } from "./gall-pose.js";
import { gallNodulePath, gallPointAt, gallRipple } from "./gall-shape.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **What THE GALL's receipts are drawn as**, off the numbers `gall-fx.ts`
 * keeps: the ghost a leap leaves on the point it jumped off, and the flash on
 * a hit, laid round the body's own middle, the draw moving the canvas there.
 * Its own flare, shudder and bulge are its body drawn differently, so they
 * stay in `gall-draw.ts`.
 */

/** How far a leap's ghost rises off the point it left, in tiles, and how much it spreads. */
const PUFF_RISE = 0.7;
const PUFF_SPREAD = 0.5;

/**
 * A hit: a white flash over it, wider for every hit, and the red of the blow
 * every boss takes over its face while `hurt` lasts.
 */
export function drawGallFlash(
  ctx: CanvasRenderingContext2D,
  r: number,
  flash: { now: number; hits: number },
  hurt: number,
): void {
  if (hurt > 0) {
    const face = new Path2D();
    face.arc(0, 0, r, 0, Math.PI * 2);
    drawHurt(ctx, face, hurt);
  }
  if (flash.now <= 0 || flash.hits <= 0) return;
  const hits = Math.min(3, flash.hits);
  const p = new Path2D();
  p.arc(0, 0, Math.max(0.5, r * (0.8 + 0.5 * hits) * (1.4 - 0.4 * flash.now)), 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.hullRim, flash.now * (0.35 + 0.2 * hits));
  ctx.fill(p);
  strokeGlow(ctx, p, PALETTE.hullRim, STROKE.inner, flash.now * (0.6 + 0.4 * hits));
}

/**
 * The ghost a leap leaves on the point it jumped off: the body as it was,
 * rising off the seam, spreading and fading — a moment of *it was here*.
 */
export function drawGallPuff(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  puff: { now: number; point: number; hits: number },
  time: number,
  ripple: number,
): void {
  if (puff.now <= 0) return;
  const at = gallPointAt(l, cfg, puff.point);
  const gone = 1 - puff.now;
  const was = { hits: puff.hits };
  ctx.save();
  ctx.translate(at.x, at.y + gallRipple(l, at.x, time, ripple) - PUFF_RISE * l.tile * gone);
  const ghost = gallNodulePath(l, {
    lobes: gallLobes(was),
    time,
    bearing: 0,
    heel: 0,
    size: gallSpent(was) * (1 + PUFF_SPREAD * gone),
    press: 0,
    sunk: 0,
  });
  ctx.fillStyle = rgba(PALETTE.gallFlesh, 0.45 * puff.now);
  ctx.fill(ghost);
  ctx.restore();
}
