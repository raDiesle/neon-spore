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
  /** How long the press-and-release before a bounce takes, in seconds. Short
   * on purpose — the owner asked for "slightly" twice, and a press that reads
   * as its own event rather than a hitch in the bounce has to be over before
   * the eye catches up to it. */
  pressLife: number;
  /** How far into the shield the rock presses, as a fraction of `tile`. */
  pressDepthFrac: number;
  /** Squash/stretch scale swing at the peak of the press — 18%, not more. */
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
   * them. One ring and a gap of nothing is a single arc, as shipped. */
  rings: number;
  ringGap: number;
  /** The soft light under the ring, as a share of its radius and of full. */
  haloMul: number;
  haloAlpha: number;
}

export const DEFLECT_LOOK: DeflectLook = {
  life: 1.1,
  shockLife: 0.5,
  pressLife: 0.08,
  pressDepthFrac: 0.16,
  squashAmount: 0.18,
  ringCompressFrac: 0.78,
  ringSpanFrac: 0.4,
  ringGrowTiles: 4.5,
  ringWidth: 3,
  ringWidthFloor: 1,
  ringAlpha: 0.85,
  rings: 1,
  ringGap: 0,
  haloMul: 0.5,
  haloAlpha: 0.4,
};
