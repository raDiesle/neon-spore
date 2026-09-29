import type { Layout } from "./layout.js";

/**
 * **How far a body standing `tiles` above the grid has to come down to be
 * whole on the canvas**, in pixels.
 *
 * Nothing, on a phone: the tile is set by the width there, and the room above
 * the grid is tiles deep. On a stage wide or short enough that the height sets
 * the tile instead, the grid starts under nothing but the radar strip — under
 * a tile, on the director's 0.56 stage — and a frame hung 1.8 tiles over row 0
 * was drawn off the top of the canvas with only a row of it showing (the
 * owner, 27 September 2026, THE SCUTTLE). A body above the field asks this
 * and comes down by exactly the shortfall, parts and marks with it.
 */
export function headroomDrop(l: Layout, tiles: number): number {
  return Math.max(0, l.tile * tiles - l.gridTop);
}
