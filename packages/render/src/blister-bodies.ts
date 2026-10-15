import type { BlisterGesture } from "@neon-spore/sim";
import { drawComboBody } from "./blister-combo.js";
import type { Body } from "./creature-body-in.js";
import { drawLivingBody } from "./creature-body-living.js";

/**
 * **The body a blister is drawn as, one record per gesture** (the owner, 14
 * October 2026: *every control has its own visual related thing around the
 * button visuals integrating it*).
 *
 * THE BLISTER wears its gesture's control flat over its middle
 * (`blister-help.ts`), and the control is as big as the body: the press's
 * halo covers the clover whole, so what the pair sees is a ring and no
 * creature. Each gesture is a brush of its own in the director now
 * (`tools/director/src/control-brushes.ts`), and each can have a body built
 * round its control instead of under it — a ring with the button in its
 * mouth, a rider on the pad, arms holding the drop.
 *
 * Every record shipped the clover, risen out of its pore, so the game drew what
 * it did. A body built round a control is offered on VERSUS by patching its
 * gesture's `draw` (`blister:tap` and the slots after it), and an adopted one
 * replaces that gesture's field alone: COMBO's took BUD and CURL
 * (`blister-combo.ts`).
 */

/** What `drawBlisterBody` has already worked out, handed to every body. */
export interface BlisterFrame {
  /** The body's radius on screen — the one the control is drawn at. */
  readonly r: number;
  /** How far up it is, 0 under the pore and 1 fully up (`blisterRise`). */
  readonly rise: number;
  /** The pore's middle on screen, which nothing is drawn below. */
  readonly poreY: number;
}

export type BlisterBodyDraw = (b: Body, f: BlisterFrame) => void;

export interface BlisterBodyLook {
  /** The body, clipped to what is above the pore's lip. */
  draw: BlisterBodyDraw;
  /**
   * What the body puts out past its pore, drawn after the lip and unclipped —
   * a cord, a root or a neck run down a groove that leaves the pore behind
   * (`blister:lever`). Every shipped record puts out nothing.
   */
  beyond: BlisterBodyDraw;
}

/** The clover, pushed down into its pore by what is left of the rise. */
export function drawCloverBody(b: Body, f: BlisterFrame): void {
  drawLivingBody({ ...b, y: b.y + (1 - f.rise) * f.r * 1.5 });
}

/** Nothing past the pore: what every body ships with. */
export function drawNothingBeyond(_b: Body, _f: BlisterFrame): void {}

/** One record per gesture, each its own object, so a slot patches one gesture. */
export const BLISTER_BODY: Record<BlisterGesture, BlisterBodyLook> = {
  tap: { draw: drawCloverBody, beyond: drawNothingBeyond },
  hold: { draw: drawCloverBody, beyond: drawNothingBeyond },
  swipe: { draw: drawCloverBody, beyond: drawNothingBeyond },
  turn: { draw: drawCloverBody, beyond: drawNothingBeyond },
  rub: { draw: drawCloverBody, beyond: drawNothingBeyond },
  combo: { draw: drawComboBody, beyond: drawNothingBeyond },
  lever: { draw: drawCloverBody, beyond: drawNothingBeyond },
};
