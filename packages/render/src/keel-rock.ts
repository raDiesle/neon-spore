import { KEEL_ROCK_FROM_MILLI } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Point } from "./keel-shape.js";
import { type Layout, tileCY } from "./layout.js";

/**
 * **THE KEEL's rock**, the lump of iron the tail throws: where it is on its
 * fall and how big it is drawn (`keel-draw.ts`), which is where a bolt meets
 * it (`keel-stop.ts`) and where its burst is thrown (`keel-fx.ts`). Cut from
 * `keel-shape.ts` when that page reached the length ceiling.
 */

/** The rock's half-width and half-height, in tiles. */
export const KEEL_ROCK = { rx: 0.34, ry: 0.3 } as const;

/** The share of the fall over which the rock leaves the drawn tail for its column and its row. */
const LEAVES = 0.25;

/**
 * Where the tail's rock is, `along` 0 at the tail to 1 on the hull, in the
 * column it was thrown down, `milli` down the field by the simulation's
 * reckoning of the fall (`sim/keel-shot.ts`, `spark-fall.ts`): drawn there,
 * and met there by a shot. The rock leaves the tail's drawn end, which rocks
 * with the spine's breath, and is over its column on the simulation's row by
 * a quarter of the way down.
 */
export function keelRockPoint(
  l: Layout,
  tail: Point,
  col: number,
  along: number,
  milli: number,
): Point {
  const k = Math.min(1, along / LEAVES);
  const off = tail.y - tileCY(l, KEEL_ROCK_FROM_MILLI / 1000);
  return {
    x: tail.x + (fieldX(l, col) - tail.x) * k,
    y: tileCY(l, milli / 1000) + off * (1 - k),
  };
}
