import { shippedSeams, shippedStone } from "./volley-stone.js";

/**
 * THE ONE RECORD A CANDIDATE VOLLEY LOOK PATCHES.
 *
 * `throb-look.ts` and the files it counts are the precedent, and this is here
 * rather than at the bottom of `volley.ts` for their reason: the record needs
 * the paint and the caller needs the record, so the two would import each
 * other. The paint is `volley-stone.ts`.
 *
 * Two passes rather than one, because the shell is two things a look can
 * argue about separately and the ward's clip falls between them. The **stone**
 * is drawn inside the clip — a ward takes a sector of it away — so a candidate
 * for what the rock is made of paints there and loses material with the count
 * for free. The **seams** are drawn whole over it, outside the clip, because
 * the rim and the four seams are the skeleton the owner asked to survive every
 * ward; a candidate for what a seam *is* — paint on stone, a cut into it, the
 * body inside burning through it — paints there and is never clipped.
 */

/**
 * One shell, as everything a look on it could want. Every number is the
 * caller's: the size, the tumble, the count and which way the break faces
 * come off `volley.ts` and the world, and a look changes none of them.
 */
export interface VolleyShell {
  readonly ctx: CanvasRenderingContext2D;
  /** The ball's contour, centred on the origin and *not yet* turned. */
  readonly ball: Path2D;
  readonly r: number;
  /** How far the ball has rolled, in radians — the pattern rolls with it. */
  readonly turn: number;
  /** Seconds, for anything that breathes. */
  readonly time: number;
  /** The colour of the body sealed inside, hazed for the row. */
  readonly glow: string;
  /** The rock's own grey, hazed for the row. */
  readonly metal: string;
  /** Sectors still on, out of `total`. */
  readonly plates: number;
  readonly total: number;
  /** `1 - plates / total`: nought while the ball is shut. */
  readonly open: number;
  /** The angle the break faces, which is the way the ball is going. */
  readonly lead: number;
  /**
   * The sectors still on, as the path `volley.ts` clips the stone to — in
   * the *unturned* frame, because the break faces the way the ball travels
   * and not the way the pattern has rolled. `null` while the ball is whole.
   * The stone pass is already inside it; a seams pass that wants to mark the
   * stone rather than the space where stone was clips to it itself.
   */
  readonly kept: Path2D | null;
  /** The creature's id, which spreads anything hashed per body. */
  readonly id: number;
}

export interface VolleyLook {
  /** The stone, inside the ward's clip: what a sector is made of. */
  stone(s: VolleyShell): void;
  /** The skeleton and the seams, drawn whole over whatever stone is left. */
  seams(s: VolleyShell): void;
}

/** The shipped shell: meteor stone under the key light, cracked where it has
 * been hit, with the rim and the four seams painted whole over it. */
export const VOLLEY_LOOK: VolleyLook = { stone: shippedStone, seams: shippedSeams };
