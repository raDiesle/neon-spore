import { halo } from "./glow.js";
import { sinHash } from "./hash.js";
import { PALETTE } from "./palette.js";

/**
 * The three pictures a burning thread is made of (`strand-fuse.ts`): a front
 * eating its way along the line, a raisin popping off it, and the blast where
 * the two fronts meet. Its own file so the class beside it stays the geometry
 * — where things are — and this stays what they look like.
 *
 * All of it in the fire colours: `ember` for the heat, `emberRim` for the
 * sparks, `podRim` for the white-hot point at the centre of each. The thread
 * was violet, the palette's "no colour", and what burns it is not violet: a
 * fuse is fire, and fire on this field is the ember family (`palette.ts`).
 */

type Haze = (hex: string) => string;

/** Streaks flung out from a point: `n` short lines of `len` each, at scattered
 * angles, brightest at the root. */
function streaks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  n: number,
  len: number,
  width: number,
  seed: number,
  hex: string,
  alpha: number,
  /** Restricts the fan: 1 is every direction, less is a cone about `aim`. */
  spread = 1,
  aim = 0,
): void {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = hex;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.globalAlpha = alpha;
  for (let i = 0; i < n; i++) {
    const ang = aim + (sinHash(i, seed) - 0.5) * Math.PI * 2 * spread;
    const reach = len * (0.5 + sinHash(seed, i));
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(ang) * reach * 0.25, y + Math.sin(ang) * reach * 0.25);
    ctx.lineTo(x + Math.cos(ang) * reach, y + Math.sin(ang) * reach);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * One front: a white-hot point, an ember glow around it, and sparks flying
 * off it that change every few frames — a lit fuse spits, and a point that
 * merely glows reads as a bead, not a burn. `side` tells the two fronts'
 * sparks apart so they do not fly in step.
 */
export function drawFuseFront(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tile: number,
  age: number,
  side: number,
  haze: Haze,
): void {
  const frame = Math.floor(age * 24) + side * 97;
  halo(ctx, x, y, tile * 1.1, haze(PALETTE.ember), 0.7);
  streaks(ctx, x, y, 9, tile * 0.7, 1.8, frame, haze(PALETTE.emberRim), 0.9);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = haze(PALETTE.podRim);
  ctx.beginPath();
  ctx.arc(x, y, tile * 0.1 * (1 + 0.25 * sinHash(frame, 3)), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** A raisin going as the front reaches it: a small ring leaving the place it
 * hung and a few sparks, over `u` 0..1. */
export function drawFusePop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tile: number,
  u: number,
  haze: Haze,
): void {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = haze(PALETTE.emberRim);
  ctx.lineWidth = Math.max(1, tile * 0.03 * (1 - u));
  ctx.globalAlpha = 0.9 * (1 - u) ** 1.5;
  ctx.beginPath();
  ctx.arc(x, y, tile * (0.12 + 0.5 * u), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  halo(ctx, x, y, tile * 0.5 * (1 - u * 0.5), haze(PALETTE.ember), 0.45 * (1 - u));
  streaks(ctx, x, y, 5, tile * 0.5 * (0.3 + u), 1.2, 41, haze(PALETTE.emberRim), 0.8 * (1 - u));
}

/**
 * The meeting: the big one, at the middle, over `u` 0..1. A ring going out
 * past a tile, a fan of long streaks behind it, a light that starts the size
 * of a body and fills the tile before it fades, and a white point at the
 * centre for the first third. Sized with the two bosses' deaths (`burstFor`'s
 * 24), because it is the end of an arrival.
 */
export function drawFuseBlast(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tile: number,
  u: number,
  haze: Haze,
): void {
  const out = 1 - (1 - u) ** 2;
  halo(ctx, x, y, tile * (1.2 + 1.6 * out), haze(PALETTE.ember), 0.95 * (1 - u));
  streaks(ctx, x, y, 16, tile * (0.8 + 1.8 * out), 2.2, 7, haze(PALETTE.emberRim), 0.95 * (1 - u));
  streaks(ctx, x, y, 10, tile * (0.5 + 1.3 * out), 1.4, 19, haze(PALETTE.podRim), 0.85 * (1 - u));
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = haze(PALETTE.emberRim);
  ctx.lineWidth = Math.max(1, tile * 0.08 * (1 - u));
  ctx.globalAlpha = 0.95 * (1 - u);
  ctx.beginPath();
  ctx.arc(x, y, tile * (0.3 + 1.8 * out), 0, Math.PI * 2);
  ctx.stroke();
  if (u < 0.35) {
    ctx.fillStyle = haze(PALETTE.podRim);
    ctx.globalAlpha = 1 - u / 0.35;
    ctx.beginPath();
    ctx.arc(x, y, tile * 0.3 * (1 - u / 0.35), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
