import type { LampreyState } from "./lamprey.js";
import { nextInt } from "./rng.js";
import type { World } from "./world.js";

/**
 * **Where THE LAMPREY leaps to**: a tile `jump` away from where it is, on the
 * square ring that far out (the larger of the two distances, so a leap of
 * three may be three across, three up, or both), inside the rows the eel may
 * land on and never on a tile it has already bitten. The seeded `Rng` picks
 * among them, so both phones land it on one tile.
 *
 * **The tail has to fit where it is leaving**: the eel lies with its tail
 * away from the tile it leaps to next (`lampreyTailWay`), so a leap is only
 * drawn toward a tile that leaves the whole tail inside the field —
 * `lampreyTailTiles` out from `from`, and as far again as an `apart` pulls
 * it when that is what the stay asks — between the column walls, under the
 * top row and three rows clear of the hull.
 *
 * **A ring with no tile on it comes in a step**: a long leap from near a wall
 * may have nowhere that far left inside the field, so the leap is the
 * longest it can be rather than none at all. With nowhere left at any
 * distance, the tail's room goes first and then the fresh tile.
 */
export interface Tile {
  col: number;
  row: number;
}

/**
 * The tile a leap of `jump` from `from` lands on. `tailMilli` is how far the
 * tail lies out from `from` while the eel waits there, thousandths of a tile,
 * or -1 where it never lies (the swim in).
 */
export function lampreyLeapTo(
  world: World,
  s: LampreyState,
  from: Tile,
  jump: number,
  tailMilli: number,
): Tile {
  for (const [fresh, fits] of LOOSER) {
    for (let d = Math.max(1, jump); d >= 1; d--) {
      const ring = ringAt(world, s, from, d, fresh, fits ? tailMilli : -1);
      if (ring.length > 0) return ring[nextInt(world.rng, ring.length)] ?? from;
    }
  }
  return from;
}

/** What a leap gives up, in order, when nothing that far keeps it: the tail's room, then the fresh tile. */
const LOOSER = [
  [true, true],
  [true, false],
  [false, false],
] as const;

/** Whether a tail `reach` long, laid away from `to`, stays inside the field from `from`. */
function tailFits(world: World, from: Tile, to: Tile, reach: number): boolean {
  const cfg = world.cfg;
  const way = lampreyWayMilli(from.col - to.col, from.row - to.row);
  const col = from.col * 1000 + Math.trunc((way.x * reach) / 1000);
  const row = from.row * 1000 + Math.trunc((way.y * reach) / 1000);
  if (col < 0 || col > (cfg.cols - 1) * 1000) return false;
  return row >= 1000 && row <= (cfg.rows - 3) * 1000;
}

/** Every tile exactly `d` from `from` the eel may land on, in a fixed order. */
function ringAt(
  world: World,
  s: LampreyState,
  from: Tile,
  d: number,
  fresh: boolean,
  tailMilli: number,
): Tile[] {
  const cfg = world.cfg;
  const out: Tile[] = [];
  for (let row = cfg.lampreyRowTop; row <= cfg.lampreyRowBottom; row++) {
    for (let col = 0; col < cfg.cols; col++) {
      if (Math.max(Math.abs(col - from.col), Math.abs(row - from.row)) !== d) continue;
      if (fresh && s.bitten.includes(lampreyTileIndex(world, col, row))) continue;
      if (tailMilli >= 0 && !tailFits(world, from, { col, row }, tailMilli)) continue;
      out.push({ col, row });
    }
  }
  return out;
}

/** A tile as one number, the way `bitten` keeps it. */
export function lampreyTileIndex(world: World, col: number, row: number): number {
  return row * world.cfg.cols + col;
}

/** A diagonal's share of a straight, in thousandths: one over the root of two. */
const DIAGONAL = 707;

/**
 * The way the tail lies from the head, in thousandths of a tile along each
 * axis, a unit long: away from the tile the eel leaps to next, so it leads
 * with its mouth — or straight down the field with no leap to come. **One of
 * the eight ways**, the nearest the leap goes, so the length is a table and
 * not a root (`purity.test.ts`). The picture lays the tail along it and an
 * `apart` is pulled along it, so the two are one direction.
 */
export function lampreyTailWay(s: LampreyState): { x: number; y: number } {
  if (s.nextCol < 0) return { x: 0, y: 1000 };
  return lampreyWayMilli(s.col - s.nextCol, s.row - s.nextRow);
}

/** The nearest of the eight ways to `(dx, dy)`, a unit long in thousandths; straight down for none. */
export function lampreyWayMilli(dx: number, dy: number): { x: number; y: number } {
  // Within half a step of an axis, the axis: |small| * 2 < |big| leaves it on it.
  const x = Math.abs(dx) * 2 < Math.abs(dy) ? 0 : Math.sign(dx);
  const y = Math.abs(dy) * 2 < Math.abs(dx) ? 0 : Math.sign(dy);
  if (x === 0 && y === 0) return { x: 0, y: 1000 };
  const len = x !== 0 && y !== 0 ? DIAGONAL : 1000;
  return { x: x * len, y: y * len };
}
