import { HYDRA_SPAN, type HydraState, midCol, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import { type Layout, tileCY } from "./layout.js";

/**
 * **THE HYDRA's geometry**: where the body hangs and how far it reaches. It
 * hangs over the middle column, a slime with its necks run out from it, and
 * its size is read off the level, never kept: it is a little smaller for
 * every level of heads stopped.
 */

/** The row the body's centre hangs on, in rows: under the seat switcher, with the field below it. */
export const HYDRA_ROW = 3.4;

/** How far the body reaches across at the first level, in tiles: half a column past the columns a bolt meets it in. */
export const HYDRA_BODY_TILES = HYDRA_SPAN + 0.5;

/** How much smaller the body is for each level stopped, in tiles. */
export const HYDRA_SHRINK_TILES = 0.15;

/** How tall the body stands against how wide it is. */
export const HYDRA_TALL = 0.8;

/** A point on the screen. */
export interface At {
  x: number;
  y: number;
}

/** The body's centre on the screen, hung where it stands once in. */
export function hydraCentre(l: Layout, cfg: SimConfig): At {
  return { x: fieldX(l, midCol(cfg)), y: tileCY(l, HYDRA_ROW) };
}

/** How far the body reaches across from its centre now, in pixels. */
export function hydraReach(l: Layout, s: HydraState): number {
  return (HYDRA_BODY_TILES - HYDRA_SHRINK_TILES * s.cursor) * l.tile;
}
