import {
  type BastionLayer,
  type BastionState,
  bastionLayerOn,
  midCol,
  type SimConfig,
} from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import { type Layout, tileCY } from "./layout.js";

/**
 * **THE BASTION's geometry**: where the moon hangs, and how far out each of
 * its shells stands. The moon hangs over the middle column on the row its
 * shot is met on (`sim/bastion-shot.ts`), and it is smaller for every shell
 * taken off — so its size is read off the shell lit, never kept.
 */

/** The row the moon's centre hangs on, in rows. */
export const BASTION_ROW = 4.2;

/** How far out each shell stands from the centre, in tiles, outermost first. */
export const BASTION_SHELL_TILES: Record<BastionLayer, number> = {
  plates: 3.6,
  ring: 3.1,
  lattice: 2.6,
  port: 2.1,
};

/** The core under the last shell, in tiles. */
export const BASTION_CORE_TILES = 1.0;

/** The moon's centre on the screen. */
export function bastionCentre(l: Layout, cfg: SimConfig): { x: number; y: number } {
  return { x: fieldX(l, midCol(cfg)), y: tileCY(l, BASTION_ROW) };
}

/**
 * How far the moon reaches from its centre now, in pixels: the outermost
 * shell still on — the lit one, or the next to light — or the core alone.
 */
export function bastionReach(l: Layout, s: BastionState): number {
  const on = bastionLayerOn(s);
  const tiles = on === null ? BASTION_CORE_TILES : BASTION_SHELL_TILES[on];
  return tiles * l.tile;
}
