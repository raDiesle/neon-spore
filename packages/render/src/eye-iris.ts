import { circleSubpath } from "@neon-spore/content";
import type { EyeInk } from "./eye-lens.js";
import { strokeGlow } from "./glow.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **The machinery inside an eye**: an aperture ring around the pupil and a ring
 * of spokes turning slowly outside it.
 *
 * The eye had a pupil and a wash of the body's own colour and nothing else, so
 * a wide open one was a coloured almond with a hole in it — one shape, held
 * still, at the moment two people are looking hardest at it. This is what an
 * iris does with that space.
 *
 * **It turns on the beat clock and on nothing else.** A wall-clock spin would
 * be a thing on two phones at two angles, and the whole reason a pose is
 * sampled on beats (`content/own-motion.ts`) is that a pair reading the same
 * body has to be reading the same picture. It is deliberately *slow* — under a
 * fifth of a turn a beat — because anything faster becomes a second clock beside
 * the one the two of them are already counting out loud.
 *
 * **Everything here is under the lens's own clip**, which the caller already
 * holds for the pupil, so a shut eye shows none of it and a half open one shows
 * the band of it the lids have not taken. That is the whole reason it is worth
 * drawing: the machinery being *cut* by the lids is what says how far shut the
 * thing is, on top of the gap the other seat is already reading.
 */

/** Spokes round the iris. Eight: enough to read as a mechanism, few enough that
 * they are still separate at the couple of dozen pixels a body draws at. */
const SPOKES = 8;

/** Where a spoke begins and ends, as multiples of the pupil's own radius. Well
 * outside the aperture ring, so the two never touch and read as one smear. */
const SPOKE_IN = 2.1;
const SPOKE_OUT = 2.9;

/** The aperture ring's radius, as a multiple of the pupil's. */
const RING_MUL = 1.55;

/** Turns per beat. Slow, and see above on why. */
const SPIN = 0.16;

/**
 * The ring and the spokes, in the eye's own colour, inside the caller's clip.
 *
 * `pr` is the pupil's radius this instant — it breathes, and everything here is
 * measured off it, so the whole assembly breathes with the hole at its middle
 * rather than being a second thing on a second clock.
 */
export function drawEyeIris(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  pr: number,
  ink: EyeInk,
  openness: number,
  t: number,
): void {
  if (pr <= 0 || openness <= 0) return;
  const spin = t * SPIN * Math.PI * 2;
  // **One path and one glow, not nine.** The ring and every spoke go into the
  // same `Path2D` at the same weight, so the whole assembly costs what a single
  // stroke costs however many spokes there are — the argument `drawEyeFringe`
  // already makes about a fringe, and the reason an eye's price is flat.
  const iris = new Path2D(circleSubpath(cx, cy, pr * RING_MUL));
  for (let i = 0; i < SPOKES; i++) {
    const a = spin + (i / SPOKES) * Math.PI * 2;
    iris.moveTo(cx + Math.cos(a) * pr * SPOKE_IN, cy + Math.sin(a) * pr * SPOKE_IN);
    iris.lineTo(cx + Math.cos(a) * pr * SPOKE_OUT, cy + Math.sin(a) * pr * SPOKE_OUT);
  }
  // **Cut into the iris before it is lit.** The iris is a wash of the body's own
  // colour and a bright line on top of it is a bright line on a bright field —
  // the first pass of this drew spokes nobody could see at any size. A thick
  // dark stroke under the same path makes each one a *slot* through the colour,
  // and the thin lit one over it is then a line on a dark ground. One plain
  // stroke, not a glow: the glow is the layer above it.
  ctx.save();
  ctx.globalAlpha = 0.55 + openness * 0.35;
  ctx.strokeStyle = PALETTE.background;
  ctx.lineWidth = STROKE.inner * 3;
  ctx.stroke(iris);
  ctx.restore();
  strokeGlow(ctx, iris, ink.rim, STROKE.inner, 0.4 + openness * 0.5);
}
