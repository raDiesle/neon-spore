import { fieldX } from "./field-flip.js";
import type { Point } from "./keel-shape.js";
import type { Layout } from "./layout.js";

/**
 * **THE KEEL's rock**, the lump of iron the tail throws: where it is on its
 * fall and how big it is drawn (`keel-draw.ts`), which is where a bolt meets
 * it (`keel-stop.ts`) and where its burst is thrown (`keel-fx.ts`). Cut from
 * `keel-shape.ts` when that page reached the length ceiling.
 */

/** The rock's half-width and half-height, in tiles. */
export const KEEL_ROCK = { rx: 0.34, ry: 0.3 } as const;

/**
 * Where the tail's rock is, `along` 0 at the tail to 1 on the hull, in the
 * column it was thrown down: drawn there, and the cannon's column is the same
 * one (`sim/keel-step.ts` `throwRock`).
 */
export function keelRockPoint(l: Layout, tail: Point, col: number, along: number): Point {
  const x = fieldX(l, col);
  return {
    x: tail.x + (x - tail.x) * Math.min(1, along * 4),
    y: tail.y + (l.hullY - tail.y) * along,
  };
}
