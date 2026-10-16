import type { World } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { cannonGrab, shieldGrab } from "./touch-ship.js";

/**
 * **A caption never covers the cannon or the shield.**
 *
 * The owner, 16 October 2026, of TWO ROCKS: *make sure that in tutorials the
 * text boxes do not overlap the element what is going to be explained … easy
 * rule is, that cannon and shield position should never be overlapped. we can
 * e.g. move the textbox more up.* A page anchored on a strip or on a band
 * lobe stands its plate just over that, which is the hull, which is where the
 * two lobes are — so PLAYER 2 CARRIES THE SHIELD hid the shield it was about.
 *
 * Where the two lobes are is `touch-ship.ts`'s grab circles, the one place
 * that says where a finger finds them, widened by the lobe's own swell and
 * the raised shield's dome. A plate that would cover either goes up over
 * both; with no room up there it goes under them instead.
 */

/** Air round a grab circle, in tiles: the lobe's swell and the dome. */
const SIDE_TILES = 0.2;
const TOP_TILES = 0.35;
/** How far the plate stands off the lobe it was moved off, in pixels. */
const GAP = 8;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The two rectangles a plate may not cover: the cannon, then the shield. */
export function shipLobeRects(l: Layout, world: World): Rect[] {
  return [cannonGrab(l, world.cannonCol), shieldGrab(l, world.shieldCol)].map((c) => {
    const side = c.r + l.tile * SIDE_TILES;
    const top = c.y - c.r - l.tile * TOP_TILES;
    return { x: c.x - side, y: top, w: side * 2, h: c.y + c.r - top };
  });
}

/** Whether two rectangles share any area. */
export function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/** The plate's top, moved off the cannon and the shield if it was on either;
 * `floor` is the highest the plate may stand. */
export function clearOfShip(l: Layout, world: World, plate: Rect, floor: number): number {
  const hit = shipLobeRects(l, world).filter((r) => plate.x < r.x + r.w && plate.x + plate.w > r.x);
  if (!hit.some((r) => overlaps(plate, r))) return plate.y;
  const top = Math.min(...hit.map((r) => r.y));
  const up = top - GAP - plate.h;
  if (up >= floor) return up;
  return Math.max(...hit.map((r) => r.y + r.h)) + GAP;
}
