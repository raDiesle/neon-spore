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
 * **Everything here is under the lens's own clip**, which the caller holds, so
 * a shut eye shows none of it and a half open one shows the band of it the lids
 * have not taken. That is the whole reason it is worth drawing: the machinery
 * being *cut* by the lids is what says how far shut the thing is, on top of the
 * gap the other seat is already reading.
 *
 * **The pupil is drawn here too**, and it was in `eye-lens.ts` until
 * `eye-look.ts` gave this a seam. It has to be: a look that places the iris on
 * a ball moves the hole with it, and a record that held the ring and the spokes
 * while somebody else held the pupil would let a candidate open a hole where
 * the iris no longer is. Everything inside the aperture is one mark, so it is
 * one function and one field.
 */

/** Spokes round the iris. Six: enough to read as a mechanism, few enough that
 * they are still separate at the couple of dozen pixels a body draws at. */
const SPOKES = 6;

/**
 * Where a spoke begins and ends, as multiples of the pupil's own radius.
 *
 * **Long, out past the lens's own edge.** They were short bars floating between
 * the ring and the rim, and a short bright bar on a bright wash of the same
 * colour is nothing anybody can see — the first pass of this drew spokes
 * invisible at every size, and darkening them turned the ring into a black
 * outline round the pupil, which was worse. An arm that runs from just outside
 * the ring all the way to the margin is cut by the lids at both ends, and a
 * line the eyelid crosses is a line an eye finds.
 */
const SPOKE_IN = 1.35;
const SPOKE_OUT = 3.8;

/** The aperture ring's radius, as a multiple of the pupil's. */
const RING_MUL = 1.55;

/** Turns per beat. Slow, and see above on why. */
const SPIN = 0.16;

/**
 * Everything the inside of an eye is drawn from.
 *
 * A record rather than seven positional arguments, because `eye-look.ts` lets a
 * candidate replace this whole function and a look needs two things the shipped
 * one does not read: how far a mark may travel from the middle (`reach`, the
 * lens's own half-width) and whether this eye is round or an almond
 * (`rx`/`ry`). Adding them to a list of positions would have made the shipped
 * call unreadable and the candidate's signature a guess.
 */
export interface IrisDraw {
  readonly ctx: CanvasRenderingContext2D;
  /** The middle of the gap, which is where the pupil rides. */
  readonly cx: number;
  readonly cy: number;
  /** The pupil's radius this instant. It breathes, and everything the shipped
   * look draws is measured off it. */
  readonly pr: number;
  /** The lens's own half-width — how far across the opening reaches, and so how
   * far a mark placed on a surface may go before the lids take it. */
  readonly reach: number;
  /** The socket's half-extents: THE WARDEN's is round and THE LID's an almond
   * half as tall as it is wide. */
  readonly rx: number;
  readonly ry: number;
  readonly ink: EyeInk;
  readonly openness: number;
  /** The **beat** clock, so both phones draw one picture. */
  readonly t: number;
}

/**
 * The assembly itself — the ring, the spokes and the hole — at a point.
 *
 * Split out of the function above so a candidate look can **move** it without
 * making a second copy of what it is. Where the iris goes is the question
 * VERSUS is for; six spokes at this weight turning at this rate is the answer
 * the game already has, and a look arguing about the first has no business
 * restating the second. It takes no `save` of its own for the reason the pupil
 * does not: the caller is already inside one, and a save per eye is an op
 * `frame-budget.test.ts` counts on the two biggest bodies in the game.
 */
export function drawIrisMarks(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  pr: number,
  ink: EyeInk,
  openness: number,
  t: number,
): void {
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
  strokeGlow(ctx, iris, ink.rim, STROKE.inner, 0.4 + openness * 0.5);

  // The hole, over the machinery it turns outside of, so a spoke never crosses
  // it. Cut by the lids rather than sized to miss them — the clip is the
  // caller's — so an eye half open shows a big pupil with its top and bottom
  // taken off rather than a small round one.
  // No `save` of its own: the caller is already inside one for the clip, and
  // the alpha set here is cleaned up by the same `restore`. A `save` per eye is
  // an op `frame-budget.test.ts` counts, and this pass is drawn on the two
  // biggest bodies in the game.
  const pupil = new Path2D(circleSubpath(cx, cy, pr));
  ctx.globalAlpha = openness;
  ctx.fillStyle = PALETTE.background;
  ctx.fill(pupil);
  strokeGlow(ctx, pupil, ink.rim, STROKE.inner, 1.2 * openness);
}
