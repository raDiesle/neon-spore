import { undertowBoss, type World } from "@neon-spore/sim";
import type { AnchorPoint } from "./caption-anchor.js";
import type { Layout } from "./layout.js";
import { LOBE_TILES } from "./undertow-shape.js";

/**
 * **A caption on a control stands clear of a fight that is in the hull.**
 *
 * A caption on a strip stands `CLEAR_STRIP` over it and one on a band lobe
 * `CLEAR` over that, which is right wherever the thing a page is about is on
 * the field — the box sits on the plating and the field above is free. THE
 * UNDERTOW is the one boss whose whole picture *is* that plating: the bow,
 * the lobe coming through and the scars are all within a tile of `hullY`, so
 * a box standing on the cannon's strip covered exactly what the page was
 * about — the owner, 25 September 2026: *the description text of slider and
 * controls is above the hull graphics so i cant see the enemy and follow the
 * tutorial. so move the text boxes higher.*
 *
 * The room is a standing lobe's full height and half a tile of air, fixed
 * rather than read off the lobe standing now, so the box does not ride up
 * and down the page with the lobe it is pointing past.
 */
const UNDERTOW_ROOM_TILES = LOBE_TILES + 0.5;

/** How far above `hullY` this world's fight reaches, in tiles, or null. */
function hullRoomTiles(world: World): number | null {
  return undertowBoss(world) !== null ? UNDERTOW_ROOM_TILES : null;
}

/** `point` with its clearance raised so the box stands over the fight. */
export function clearOfHull(l: Layout, world: World, point: AnchorPoint): AnchorPoint {
  const tiles = hullRoomTiles(world);
  if (tiles === null) return point;
  const top = l.hullY - tiles * l.tile;
  return { ...point, clear: Math.max(point.clear, point.y - point.r - top) };
}
