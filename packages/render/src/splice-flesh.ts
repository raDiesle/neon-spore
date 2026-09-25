import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { SpliceCurve } from "./splice-straws.js";

/**
 * **What THE SPLICE's straws are made of**: gut, not wire
 * (`new-boss-more` §6.3).
 *
 * A straw is a gut — a dark casing, a pink translucent wall with a paler core,
 * a wet line of light down its upper-left side — creased across at uneven
 * steps, so it reads as grown rather than made from end to end (the owner,
 * 25 September 2026: *more living and not mechanical*). Each one ends in the
 * top of its mouth's trunk (`splice-pipe.ts`).
 *
 * **What the navigator traces is unchanged.** Each straw is drawn whole
 * before the next, so a crossing is still one hose passing behind another,
 * and nothing on a tube moves: a pulse down a straw would be a second thing
 * travelling down it, and the number in flight is the only one there is.
 * **Every width is off the tile.**
 */

/** Feelers round the lip. */
const FEELERS = 7;

/** How far apart a straw's creases are on average, in tiles. */
const RING_STEP = 0.42;

/** A point and the unit direction of travel, `t` along the curve. */
function along(c: SpliceCurve, t: number): { x: number; y: number; dx: number; dy: number } {
  const u = 1 - t;
  const x = u * u * c.x0 + 2 * u * t * c.cx + t * t * c.x1;
  const y = u * u * c.y0 + 2 * u * t * c.cy + t * t * c.y1;
  const dx = 2 * u * (c.cx - c.x0) + 2 * t * (c.x1 - c.cx);
  const dy = 2 * u * (c.cy - c.y0) + 2 * t * (c.y1 - c.cy);
  const n = Math.hypot(dx, dy) || 1;
  return { x, y, dx: dx / n, dy: dy / n };
}

function curve(ctx: CanvasRenderingContext2D, c: SpliceCurve): void {
  ctx.beginPath();
  ctx.moveTo(c.x0, c.y0);
  ctx.quadraticCurveTo(c.cx, c.cy, c.x1, c.y1);
  ctx.stroke();
}

/** One straw, whole: casing, wall, rings, the wet line. `wide` is the
 * casing's width. */
export function drawTube(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: SpliceCurve,
  wide: number,
): void {
  ctx.lineCap = "round";
  ctx.strokeStyle = PALETTE.sheenDeep;
  ctx.lineWidth = wide;
  curve(ctx, c);
  ctx.strokeStyle = rgba(PALETTE.sheenWarm, 0.5);
  ctx.lineWidth = wide * 0.68;
  curve(ctx, c);
  ctx.strokeStyle = rgba(PALETTE.sheenRim, 0.4);
  ctx.lineWidth = wide * 0.34;
  curve(ctx, c);

  // Creases, bowed and unevenly spaced, the way a gut folds where it bends.
  const length = Math.hypot(c.cx - c.x0, c.cy - c.y0) + Math.hypot(c.x1 - c.cx, c.y1 - c.cy);
  const rings = Math.max(2, Math.floor(length / (l.tile * RING_STEP)));
  const half = wide * 0.34;
  ctx.strokeStyle = rgba(PALETTE.sheenDeep, 0.45);
  ctx.lineWidth = Math.max(0.7, wide * 0.1);
  ctx.beginPath();
  for (let i = 1; i < rings; i++) {
    const p = along(c, (i + 0.3 * Math.sin(i * 2.7)) / rings);
    const bow = wide * 0.12;
    ctx.moveTo(p.x - p.dy * half, p.y + p.dx * half);
    ctx.quadraticCurveTo(p.x + p.dx * bow, p.y + p.dy * bow, p.x + p.dy * half, p.y - p.dx * half);
  }
  ctx.stroke();

  // The wet line, a third of the way from the middle to the left-hand wall,
  // where a light from the upper left runs down a round thing.
  const off = wide * 0.16;
  const n = along(c, 0.5);
  const side = n.dy >= 0 ? 1 : -1;
  ctx.save();
  ctx.translate(-n.dy * off * side, n.dx * off * side);
  ctx.strokeStyle = rgba(PALETTE.sheenRim, 0.55);
  ctx.lineWidth = Math.max(0.7, wide * 0.12);
  curve(ctx, c);
  ctx.restore();
}

/** A straw's stub on the seat holding the cannon: the same tube, fading in
 * from nothing a hand's width over its mouth. `topY` is where it is gone. */
export function drawTubeStub(
  ctx: CanvasRenderingContext2D,
  c: SpliceCurve,
  wide: number,
  topY: number,
): void {
  const fade = (hex: string, a: number): CanvasGradient => {
    const g = ctx.createLinearGradient(0, topY, 0, c.y1);
    g.addColorStop(0, rgba(hex, 0));
    g.addColorStop(1, rgba(hex, a));
    return g;
  };
  ctx.lineCap = "round";
  ctx.strokeStyle = fade(PALETTE.sheenDeep, 1);
  ctx.lineWidth = wide;
  curve(ctx, c);
  ctx.strokeStyle = fade(PALETTE.sheenWarm, 0.55);
  ctx.lineWidth = wide * 0.55;
  curve(ctx, c);
}

/**
 * The feelers round a mouth's lip (`splice-pipe.ts`), waving on their own and
 * curled in under the throat while it pulls (`curl` 1).
 */
export function drawFeelers(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  t: number,
  b: number,
  seed: number,
  curl: number,
): void {
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(PALETTE.sheenWarm, 0.8);
  ctx.lineWidth = Math.max(1, t * 0.07);
  const tips: { x: number; y: number }[] = [];
  ctx.beginPath();
  for (let i = 0; i < FEELERS; i++) {
    const u = (i + 0.5) / FEELERS;
    const bx = x - rx + u * rx * 2;
    const by = y + Math.sin(u * Math.PI) * t * 0.1;
    const out = (u - 0.5) * 2;
    const wave = Math.sin(b * Math.PI * 1.5 + i * 1.7 + seed) * t * 0.06;
    const len = t * (0.26 + 0.08 * Math.sin(i * 2.3 + seed));
    // Out and down while idle; drawn in under the throat while it pulls.
    const tx = bx + out * len * (0.6 - curl * 1.2) + wave;
    const ty = by + len * (1 - curl * 0.5);
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(bx + out * len * 0.5 + wave, by + len * 0.6, tx, ty);
    tips.push({ x: tx, y: ty });
  }
  ctx.stroke();
  // A bead on each tip, lit while it pulls.
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.55 + 0.4 * curl);
  for (const p of tips) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, t * 0.045, 0, Math.PI * 2);
    ctx.fill();
  }
}
