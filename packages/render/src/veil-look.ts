import { overcast } from "./veil-mass.js";

/**
 * THE ONE RECORD A CANDIDATE THUNDERHEAD PATCHES.
 *
 * The seventh of `magnet-look.ts`'s kind. The slot it opens is deliberately
 * narrow: what the cloud is made of **between its rim and its bolts**, and
 * neither of those. The rim is the silhouette player 2 finds the body by and
 * the lightning is the metronome the pair counts the morph on — a vote that
 * moved either would be a vote on the creature's rules wearing a look's
 * clothes.
 */

/**
 * A cloud, as everything a fill of it could want. `ctx` is already translated
 * to the cloud's own centre and carries its sink, so every mark is in the
 * cloud's frame and `r` is the only size there is.
 */
export interface VeilMassDraw {
  readonly ctx: CanvasRenderingContext2D;
  /** How far the cloud reaches from its centre, in pixels. */
  readonly r: number;
  /** The contour's own clock, spread by the body's id (`contourClock`). */
  readonly t: number;
  /** The shared beat plus its phase — the count the pair is keeping. */
  readonly beats: number;
  /** The cloud's contour, already built at this `r` and this `t`. */
  readonly path: Path2D;
  /** How far a wrong colour has shut the cloud, 0..1. The angry red is the mix. */
  readonly shut: number;
  /** Whether this screen sees into the cloud — player 1's, and no other. */
  readonly seeThrough: boolean;
  /** The shipped gradient's two stops, angry-mixed and hazed for distance. */
  readonly top: string;
  readonly bottom: string;
  /**
   * Distance, as a function rather than as a colour. A candidate mixing colours
   * of its own still owes the field its haze, and re-deriving one off `near`
   * would be a second copy of `depth.ts`'s rule; the two stops above have been
   * through this already, so a candidate that uses them must not haze twice.
   */
  readonly haze: (hex: string) => string;
}

export interface VeilLook {
  mass(d: VeilMassDraw): void;
}

/** The shipped thunderhead: one vertical gradient across the whole contour,
 * dark at the top and darker underneath. `veil-mass.ts` holds it. */
export const VEIL_LOOK: VeilLook = { mass: overcast };
