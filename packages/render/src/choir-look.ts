import { film } from "./choir-skin.js";
import type { Layout } from "./layout.js";

/**
 * THE ONE RECORD A CANDIDATE CHOIR SURFACE PATCHES.
 *
 * The fifth of `magnet-look.ts`'s kind and here for its reason: the record
 * needs the paint and `choir.ts` needs the record, so a record beside the
 * paint would make the two import each other.
 */

/**
 * A membrane, as everything a surface on it could want.
 *
 * `tint` arrives **already hazed** — how far up the field a body is, is
 * distance rather than material, and a candidate that re-hazed would be
 * spending the same distance twice. `lit` and `close` are the gesture: 0 while
 * the pair is two grey balls nothing answers, up to 1 once the film has shut
 * and the colour has arrived.
 */
export interface ChoirDraw {
  readonly ctx: CanvasRenderingContext2D;
  readonly l: Layout;
  /** The tile's own centre, in field pixels. */
  readonly x: number;
  readonly y: number;
  /** The wall clock in seconds — the drift and the turn are read off it. */
  readonly time: number;
  /** How far the two have drawn together, 0..1. */
  readonly close: number;
  /** How far the reaction has got, 0..1 — 0 waiting, 0.33 charged, 1 shut. */
  readonly lit: number;
  /** The grey mixed toward the colour that is arriving, hazed for distance. */
  readonly tint: string;
  /** The traced membrane: one loop, or two while the pair is properly apart. */
  readonly path: Path2D;
}

export interface ChoirLook {
  skin(d: ChoirDraw): void;
}

/** The shipped membrane: two halos, two turning bubbles drawn in added light
 * only, and the traced rim over them with no wash inside it. `choir-skin.ts`
 * holds it. */
export const CHOIR_LOOK: ChoirLook = { skin: film };
