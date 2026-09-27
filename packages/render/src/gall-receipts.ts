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
 * keeps: the ghost a close leaves on the point it jumped off, the fibres
 * across the split as the root is bared, and the root's flash on a hit. The
 * tear and the flash are laid round the root's own middle, the draw moving
 * the canvas there. The nodule's own flare, shudder and bulge are its body
 * drawn differently, so they stay in `gall-draw.ts`.
 */

/** How far a close's ghost rises off the point it left, in tiles, and how much it spreads. */
const PUFF_RISE = 0.7;
const PUFF_SPREAD = 0.5;

/** Fibres across the split: their heights on the seam, in tiles, and how far toward the middle each reaches before it snapped. */
const FIBRES = [
  { y: -0.16, reach: 0.8 },
  { y: -0.05, reach: 0.65 },
  { y: 0.06, reach: 0.9 },
  { y: 0.14, reach: 0.72 },
];

/**
 * The seam's lips tearing apart: fibres of its flesh strung from each lip
 * `gap` pixels out toward the middle, nearly meeting as the lips part and
 * snapping back to the lips as `tear` runs down to nought.
 */
export function drawGallTear(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  gap: number,
  tear: number,
): void {
  if (tear <= 0 || gap <= 0) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.gallFleshDark, 0.9 * Math.min(1, tear * 2));
  // Each fibre snapped at its own place, so the torn ends never line up.
  for (const f of FIBRES) {
    const y = f.y * l.tile;
    const reach = gap * tear * f.reach;
    for (const side of [-1, 1] as const) {
      const lip = side * gap;
      ctx.beginPath();
      ctx.moveTo(lip, y);
      ctx.quadraticCurveTo(lip - side * reach * 0.5, y + 0.06 * l.tile, lip - side * reach, y);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/**
 * The root hit: a white flash over it, wider for every hit, and the red of
 * the blow every boss takes over its face while `hurt` lasts.
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
 * The ghost a close leaves on the point the gall jumped off: the nodule as it
 * was, rising off the seam, spreading and fading — a moment of *it was here*
 * against the single frame the jump itself is.
 */
export function drawGallPuff(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  puff: { now: number; point: number; closes: number },
  time: number,
  ripple: number,
): void {
  if (puff.now <= 0) return;
  const at = gallPointAt(l, cfg, puff.point);
  const gone = 1 - puff.now;
  const was = { closes: puff.closes };
  ctx.save();
  ctx.translate(at.x, at.y + gallRipple(l, at.x, time, ripple) - PUFF_RISE * l.tile * gone);
  const ghost = gallNodulePath(l, {
    lobes: gallLobes(was),
    time,
    bearing: 0,
    heel: 0,
    size: gallSpent(was) * (1 + PUFF_SPREAD * gone),
    pinch: 0,
    sunk: 0,
  });
  ctx.fillStyle = rgba(PALETTE.gallFlesh, 0.45 * puff.now);
  ctx.fill(ghost);
  ctx.restore();
}
