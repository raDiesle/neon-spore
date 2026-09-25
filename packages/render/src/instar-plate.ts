import { drawHurt } from "./boss-hurt.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Figure, Point } from "./instar-shape.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **What every part of THE INSTAR is drawn with**: the hide — a plate filled
 * dark and rimmed in the hull's violet, washed red while the body shows a blow
 * — the colour at the fade, and the one bundle of the frame's numbers every
 * drawer of the body is handed.
 *
 * Its own file so the drawers (`instar-front.ts`, `instar-head.ts`,
 * `instar-profile.ts`, `instar-tail.ts`, `instar-wings.ts`, `instar-eggs.ts`)
 * reach it without reaching the file that calls them.
 */

/** The frame, as every drawer of the body reads it. */
export interface Look {
  /** The figure, swing included (`instar-sway.ts`). */
  f: Figure;
  /** The head's centre and radius, in pixels. */
  head: Point;
  r: number;
  time: number;
  /** The opacity of this view of the body: the fade, times its share of the turn. */
  fade: number;
  /** How red the body is with a blow (`boss-hurt.ts`). */
  hurt: number;
  /** How far the window has run, 0..1 (`instarThreat`). */
  threat: number;
  /** How big the fire in the mouth is, 0..1, before the jaws choke it. */
  fire: number;
}

/** A colour at the fade: the hex itself while the body is whole, so the frame
 * tests can count it (`hive-draw.ts`). */
export function faded(hex: string, fade: number, alpha = 1): string {
  return fade >= 1 && alpha >= 1 ? hex : rgba(hex, alpha * fade);
}

/** One plate of hide, filled dark and rimmed in the hull's violet. */
export function drawPlate(
  ctx: CanvasRenderingContext2D,
  p: Path2D,
  fade: number,
  glow = 0.5,
  hurt = 0,
): void {
  ctx.save();
  ctx.fillStyle = faded(PALETTE.background, fade);
  ctx.fill(p);
  ctx.fillStyle = faded(PALETTE.sheenDeep, fade, 0.9);
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, faded(PALETTE.hull, fade), STROKE.inner, glow * fade);
  drawHurt(ctx, p, hurt * fade);
}

/** A seam of the hide: a line across a plate, lit in the hull's rim. */
export function drawSeam(
  ctx: CanvasRenderingContext2D,
  a: Point,
  c: Point,
  b: Point,
  fade: number,
  alpha = 0.5,
): void {
  const p = new Path2D();
  p.moveTo(a.x, a.y);
  p.quadraticCurveTo(c.x, c.y, b.x, b.y);
  strokeGlow(ctx, p, faded(PALETTE.hullRim, fade, alpha), STROKE.inner, 0.4 * fade);
}

/** A bio-light on the hide: a small gold lamp with a warm core. */
export function drawLamp(
  ctx: CanvasRenderingContext2D,
  at: Point,
  size: number,
  fade: number,
  pulse = 1,
): void {
  ctx.save();
  ctx.fillStyle = faded(PALETTE.pod, fade, 0.35 * pulse);
  ctx.beginPath();
  ctx.arc(at.x, at.y, size * 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = faded(PALETTE.podRim, fade, 0.9);
  ctx.beginPath();
  ctx.arc(at.x, at.y, size * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** A point `u` of the way from `a` to `b`. */
export function toward(a: Point, b: Point, u: number): Point {
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
}
