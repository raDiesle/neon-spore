import type { GimbalRing } from "@neon-spore/sim";
import type { Point } from "./gimbal-shape.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { breath } from "./solid-motion.js";

/**
 * **THE GIMBAL in depth**: a ring is not a line drawn round the drum but a
 * hoop of metal with a body — a band lit on the side toward the key and gone
 * deep on the side away, the inside of the hoop in its own shade, and a cold
 * rim caught on the outer edge turned from the light.
 *
 * **The light is the world's and never the ring's.** It does not turn when
 * the ring is turned: a highlight carried round with the teeth would be a
 * sticker on a disc, and the ring's face is the one thing on this boss a thumb
 * is answered against. The light sways instead — a slow breath of the clock
 * (`solid-motion.ts`), one per ring and out of step, as though each hoop rocks
 * a little in its pins — and that moves nothing a seat reads: not the rim,
 * not a tooth, not a mark.
 *
 * Nothing here keeps state, so a restart starts the sway again.
 */

/** The hoop's band, in tiles: wider than the rim's stroke, so the rim is its lit edge. */
const BAND = 0.26;
/** How far the key's light sways round the hoop at the most, in radians, and how slowly. */
const SWAY = 0.35;
const SWAY_PERIOD = 8.5;
/** Where the key comes from, as an angle on the screen: up and to the left. */
const KEY = -0.75 * Math.PI;

/** The hoop under ring `ring`'s rim: its lit band, its inner shade, its cold rim. */
export function paintHoop(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  tile: number,
  ring: GimbalRing,
  time: number,
): void {
  const band = tile * BAND;
  const key = KEY + SWAY * breath(time, SWAY_PERIOD, 0.35, 41 + ring * 13);
  const kx = Math.cos(key) * r;
  const ky = Math.sin(key) * r;
  ctx.save();
  ctx.lineCap = "butt";
  // The band: lit toward the key, deep away from it.
  const lit = ctx.createLinearGradient(at.x + kx, at.y + ky, at.x - kx, at.y - ky);
  lit.addColorStop(0, rgba(PALETTE.rock, 0.55));
  lit.addColorStop(0.45, rgba(PALETTE.rockDark, 0.7));
  lit.addColorStop(1, rgba(PALETTE.sheenDeep, 0.85));
  ctx.strokeStyle = lit;
  ctx.lineWidth = band;
  ctx.beginPath();
  ctx.arc(at.x, at.y, r - band * 0.35, 0, Math.PI * 2);
  ctx.stroke();
  // The inside of the hoop, in its own shade.
  ctx.strokeStyle = rgba(PALETTE.sheenDeep, 0.6);
  ctx.lineWidth = Math.max(1, band * 0.25);
  ctx.beginPath();
  ctx.arc(at.x, at.y, r - band * 0.8, 0, Math.PI * 2);
  ctx.stroke();
  // The cold rim, on the outer edge turned from the key.
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = rgba(PALETTE.sheenCold, 0.4);
  ctx.lineWidth = Math.max(1, band * 0.2);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(at.x, at.y, r + band * 0.1, key + Math.PI - 0.7, key + Math.PI + 0.7);
  ctx.stroke();
  ctx.restore();
}
