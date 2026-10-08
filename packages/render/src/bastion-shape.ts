import {
  BASTION_PLATES_A_SIDE,
  type BastionLayer,
  type BastionState,
  bastionLayerOn,
  bastionPlateWay,
  coreRowMilli,
  midCol,
  type SimConfig,
} from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import { type Layout, tileCY } from "./layout.js";

/**
 * **THE BASTION's geometry**: where the moon hangs, how far out each of its
 * shells stands, and where on it every piece sits. The moon hangs over the
 * middle column on the row its shot is met on (`sim/bastion-shot.ts`), and
 * it is smaller for every shell taken off — so its size is read off the
 * shell lit, never kept.
 *
 * **The moon is a ball seen from a little above**: a ring round it is an
 * ellipse `RING_TILT` as tall as it is wide, and its front — the half nearer
 * the ship — is its lower half. A piece over a column sits on the moon's
 * lower face, where a bolt coming up that column meets it.
 */

/** The row the moon's centre hangs on, in rows: the simulation's, where its bolts are met (`sim/core-along.ts`). */
export const BASTION_ROW = coreRowMilli("bastion") / 1000;

/** How far out each shell stands from the centre, in tiles, outermost first. */
export const BASTION_SHELL_TILES: Record<BastionLayer, number> = {
  plates: 3.6,
  ring: 3.1,
  lattice: 2.6,
  port: 2.1,
};

/** How far in the plates reach, in tiles: deep enough to cover the ring's sides. */
export const BASTION_PLATE_IN = 2.3;

/** Half a plate's width, in radians either side of its way: a seam between two. */
export const BASTION_PLATE_HALF = (16 * Math.PI) / 180;

/** The core under the last shell, in tiles. */
export const BASTION_CORE_TILES = 1.0;

/** How tall a ring round the moon is drawn against its width: the moon seen from above. */
export const RING_TILT = 0.3;

/** How far below the centre the gun ring runs, in tiles. */
export const RING_DROP = 0.45;

/** A point on the screen. */
export interface At {
  x: number;
  y: number;
}

/** The moon's centre on the screen, hung where it stands once in. */
export function bastionCentre(l: Layout, cfg: SimConfig): At {
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

/** Whether `layer` is still on the moon: the lit shell or one under it. */
export function bastionHas(s: BastionState, layer: BastionLayer): boolean {
  for (let j = s.cursor; j < s.steps.length; j++) if (s.steps[j]?.layer === layer) return true;
  return false;
}

/** Plate `i`'s angle from straight up, clockwise, in radians: the way it tears off. */
export function bastionPlateAngle(i: number): number {
  const [wx, wy] = bastionPlateWay(i);
  return Math.atan2(wx, -wy);
}

/** Which seat's side plate `i` is on: nought the pilot's, the left. */
export function bastionPlateSeat(i: number): 0 | 1 {
  return i < BASTION_PLATES_A_SIDE ? 0 : 1;
}

/**
 * A plate's outline, centred at `c` and stood `ox`, `oy` out along its way:
 * an arc of the moon's rim and an arc of its inner edge, `half` either side.
 */
export function bastionPlatePath(
  c: At,
  angle: number,
  outer: number,
  inner: number,
  ox = 0,
  oy = 0,
  half = BASTION_PLATE_HALF,
): Path2D {
  const a = angle - Math.PI / 2;
  const p = new Path2D();
  p.arc(c.x + ox, c.y + oy, outer, a - half, a + half);
  p.arc(c.x + ox, c.y + oy, inner, a + half, a - half, true);
  p.closePath();
  return p;
}

/** A point on the moon's lower face over screen `x`, at `r` from the centre and `face` of the way down. */
export function bastionUnder(c: At, x: number, r: number, face: number): At {
  const dx = x - c.x;
  return { x, y: c.y + Math.sqrt(Math.max(0, r * r - dx * dx)) * face };
}

/** A node of the lattice over its column, on the cage's lower face. */
export function bastionNodeAt(l: Layout, cfg: SimConfig, c: At, offset: number): At {
  const r = BASTION_SHELL_TILES.lattice * l.tile;
  return bastionUnder(c, fieldX(l, midCol(cfg) + offset), r, 0.72);
}

/** A port of the inner hull over its column, on the hull's lower face. */
export function bastionPortAt(l: Layout, cfg: SimConfig, c: At, offset: number): At {
  const r = BASTION_SHELL_TILES.port * l.tile;
  return bastionUnder(c, fieldX(l, midCol(cfg) + offset), r, 0.6);
}

/**
 * A gun round the ring at `angleMilli` from the front, thousandths of a
 * degree: where it stands, and how near the front it is — 1 at the front,
 * -1 at the back, behind the moon.
 */
export function bastionGunAt(l: Layout, c: At, angleMilli: number): At & { depth: number } {
  const a = (angleMilli / 1000) * (Math.PI / 180);
  const r = BASTION_SHELL_TILES.ring * l.tile;
  return {
    x: c.x + Math.sin(a) * r,
    y: c.y + RING_DROP * l.tile + Math.cos(a) * r * RING_TILT,
    depth: Math.cos(a),
  };
}
