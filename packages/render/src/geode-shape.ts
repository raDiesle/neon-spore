import { GEODE_SPAN, midCol, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import { type Layout, tileCY } from "./layout.js";

/**
 * **THE GEODE's geometry**: where the stone hangs and how far it reaches. It
 * hangs over the middle column as wide as the field — every column a bolt can
 * climb is stone — and breaking it never makes it narrower: the pieces fly
 * apart across the same width.
 */

/** The row the stone's centre hangs on, in rows: under the seat switcher, with the field below it. */
export const GEODE_ROW = 3.2;

/** How far the stone reaches across from its centre, in tiles: a little past the columns a bolt meets it in. */
export const GEODE_BODY_TILES = GEODE_SPAN + 0.4;

/** How tall the stone stands against how wide it is. */
export const GEODE_TALL = 0.5;

/** A point on the screen. */
export interface At {
  x: number;
  y: number;
}

/** The stone's centre on the screen, hung where it stands once in. */
export function geodeCentre(l: Layout, cfg: SimConfig): At {
  return { x: fieldX(l, midCol(cfg)), y: tileCY(l, GEODE_ROW) };
}

/** How far the stone reaches across from its centre, in pixels. */
export function geodeReach(l: Layout): number {
  return GEODE_BODY_TILES * l.tile;
}
