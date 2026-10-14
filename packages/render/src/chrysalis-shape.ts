import {
  type ChrysalisSkin,
  type ChrysalisState,
  chrysalisSkinOn,
  midCol,
  type SimConfig,
} from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import { type Layout, tileCY } from "./layout.js";

/**
 * **THE CHRYSALIS's geometry**: where the cocoon hangs and how far out each
 * of its skins stands. It hangs over the middle column, as THE BASTION's moon
 * does, and it is smaller for every skin peeled — so its size is read off the
 * skin lit, never kept.
 *
 * The cocoon is taller than it is wide (`CHRYSALIS_TALL`): a living pod, not
 * a ball. What a skin's pieces look like is the look's (§11.63, lane two).
 */

/** The row the cocoon's centre hangs on, in rows: under the seat switcher, with the field below it. */
export const CHRYSALIS_ROW = 4.2;

/** How far out each skin stands from the centre across, in tiles, outermost first. */
export const CHRYSALIS_SKIN_TILES: Record<ChrysalisSkin, number> = {
  slime: 3.4,
  quills: 3.0,
  sacs: 2.5,
  heart: 2.0,
};

/** The grub under the last skin, in tiles. */
export const CHRYSALIS_GRUB_TILES = 0.9;

/** How tall the cocoon stands against how wide it is. */
export const CHRYSALIS_TALL = 1.15;

/** A point on the screen. */
export interface At {
  x: number;
  y: number;
}

/** The cocoon's centre on the screen, hung where it stands once in. */
export function chrysalisCentre(l: Layout, cfg: SimConfig): At {
  return { x: fieldX(l, midCol(cfg)), y: tileCY(l, CHRYSALIS_ROW) };
}

/**
 * How far the cocoon reaches across from its centre now, in pixels: the
 * outermost skin still on — the lit one, or the next to light — or the grub.
 */
export function chrysalisReach(l: Layout, s: ChrysalisState): number {
  const on = chrysalisSkinOn(s);
  const tiles = on === null ? CHRYSALIS_GRUB_TILES : CHRYSALIS_SKIN_TILES[on];
  return tiles * l.tile;
}
