/**
 * How a catch reads, as a record rather than as numbers typed into the draw
 * call.
 *
 * It was a wall of module-private `const`s until this file was lifted, which
 * meant the ward — one of the two things a player watches all game — had
 * exactly one answer and nowhere for a second one to sit. See `docs/versus.md`
 * and `tools/versus/candidates/shield-ward/`. The values below are the ones
 * those constants held; nothing here changes what the game draws.
 *
 * The rock's own launch — the four randomised components of its flight and its
 * gravity — is deliberately *not* in here. That is the rock leaving, and this
 * record is about the shield catching.
 */
export interface DeflectLook {
  /** Seconds a bounced rock is drawn for, and its shockwave ring. */
  life: number;
  shockLife: number;
  /** How long the press-and-release before a bounce takes, in seconds. Long
   * enough that the catch is a give you can arrive late to and still see, not
   * a hitch in the bounce over before the eye catches up to it. */
  pressLife: number;
  /** How far into the shield the rock presses, as a fraction of `tile`. */
  pressDepthFrac: number;
  /** Squash/stretch scale swing at the peak of the press — a third, so the
   * shield visibly gives rather than merely flickering. */
  squashAmount: number;
  /** How compressed the shockwave ring starts, as a fraction of its resting
   * radius — the shield giving before it springs back out to `baseR`. */
  ringCompressFrac: number;
  /** Resting ring radius, as a share of `tile` times the creature's span. */
  ringSpanFrac: number;
  /** How fast the ring grows once the press is over, in tiles per second. */
  ringGrowTiles: number;
  /** Stroke width: this much times what is left of the ring's life, plus a floor. */
  ringWidth: number;
  ringWidthFloor: number;
  ringAlpha: number;
  /** Concentric rings drawn per catch, and the share of the radius between
   * them. Three, a quarter-radius apart, so the catch reads as a hard series
   * rather than a single soft edge. */
  rings: number;
  ringGap: number;
  /** The soft light under the ring, as a share of its radius and of full. */
  haloMul: number;
  haloAlpha: number;
}

export const DEFLECT_LOOK: DeflectLook = {
  life: 1.1,
  shockLife: 0.9,
  pressLife: 0.17,
  pressDepthFrac: 0.34,
  squashAmount: 0.32,
  ringCompressFrac: 0.55,
  ringSpanFrac: 0.85,
  ringGrowTiles: 2.6,
  ringWidth: 7,
  ringWidthFloor: 1.5,
  ringAlpha: 0.9,
  rings: 3,
  ringGap: 0.26,
  haloMul: 0.8,
  haloAlpha: 0.55,
};
