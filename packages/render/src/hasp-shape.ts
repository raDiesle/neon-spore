import { HASP_COUNT, midCol, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";

/**
 * **Where THE HASP is**: three clasps down the middle column, each a hinged
 * shell over a hub, and the latch's rail beside whichever one is up — the
 * geometry the drawing and the hands both read, so a thumb is answered on the
 * shape it can see (§11.37, `hasp-draw.ts`).
 *
 * **The shell is THE CASE** from the shape sheet's armoured drafts
 * (`tools/shape-sheet/src/drafts/armoured.ts`, `forms/hinged.ts`): two faceted
 * half-shells hinged at the nose, which swing apart at the tail. Combined with
 * a wheel-hub riveted over the seam, which the sheet does not draw — a hasp
 * is a lid pinned shut by the thing turning in its middle, and a shell with
 * nothing over its seam would be a beetle. The outline is ported rather than
 * imported, because `render` does not reach into a tool.
 *
 * Index 0 is the **bottom** clasp, nearest the ship, and it is the first to
 * open: the second hasp's bolt falls down the same column, and a bolt that
 * fell through a clasp still sealed would be passing through a door.
 */

export interface Point {
  x: number;
  y: number;
}

/** The clasps' centres, in tiles below the top of the grid, bottom first. */
const ROWS: readonly number[] = [8.6, 5.4, 2.2];
/** Half-width and half-length of a shut shell, in tiles. */
const SHELL_RX = 1.5;
const SHELL_RY = 1.35;
/** Facets down one half's outer edge. Few: a facet has to be visible. */
const FACETS = 5;
/** How far one half swings at a gape of 1, in radians. */
const SWING = 0.5;
/** The hub's radius, in tiles. */
const HUB = 0.62;
/** The latch's rail: how far beside the shell's centre, and the bar's half-width.
 * How long it is is not a constant: see `haspRail`. */
const RAIL_OFF = 2.35;
const BAR_HALF = 0.42;

/** One clasp's centre. `i` counts up from the ship. */
export function haspCentre(l: Layout, cfg: SimConfig, i: number): Point {
  const row = ROWS[Math.max(0, Math.min(HASP_COUNT - 1, i))] ?? ROWS[0] ?? 0;
  return { x: fieldX(l, midCol(cfg)), y: l.gridTop + row * l.tile };
}

/** The hub's radius on this screen. */
export function haspHubRadius(l: Layout): number {
  return HUB * l.tile;
}

/** The shut shell's own radius on this screen — the longer of its two half-axes,
 * for a light that has to reach every facet (`hasp-draw.ts`). */
export function haspShellRadius(l: Layout): number {
  return Math.max(SHELL_RX, SHELL_RY) * l.tile;
}

/**
 * The outer edge as a fraction of the half-width, `f` of the way from nose
 * to tail — THE CASE's flank exactly: a rounded shoulder over the first
 * third, sampled coarsely so the samples are the facets, then one long flank
 * to a blunt tail (`forms/hinged.ts`).
 */
function flank(f: number): number {
  if (f < 0.3) return 0.16 + 0.84 * Math.sin((f / 0.3) * (Math.PI / 2));
  return 1 - 0.62 * ((f - 0.3) / 0.7) ** 1.35;
}

/**
 * One clasp's shell, both halves, swung apart about the nose by `gape`
 * (0 shut, 1 swung; the row's clearing takes it past 1).
 *
 * Each half walks its own seam edge rather than leaving it to the closing
 * segment, so a shut clasp has a line down its middle — the tell that it is
 * two things pinned, and not a rock.
 */
export function haspShellPath(l: Layout, cfg: SimConfig, i: number, gape: number): Path2D {
  const at = haspCentre(l, cfg, i);
  const rx = SHELL_RX * l.tile;
  const ry = SHELL_RY * l.tile;
  const hingeY = at.y - ry;
  const path = new Path2D();
  for (const side of [1, -1]) {
    const raw: Point[] = [];
    for (let k = 0; k <= FACETS; k++) {
      const f = k / FACETS;
      raw.push({ x: side * rx * flank(f), y: -ry + 2 * ry * f });
    }
    raw.push({ x: 0, y: ry });
    raw.push({ x: 0, y: -ry });
    // Negated for a page whose y runs down: a positive turn would carry the
    // right half's tail across the seam rather than away from it.
    const c = Math.cos(-gape * SWING * side);
    const s = Math.sin(-gape * SWING * side);
    raw.forEach((p, k) => {
      const dy = p.y + ry;
      const x = at.x + p.x * c - dy * s;
      const y = hingeY + p.x * s + dy * c;
      if (k === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    });
    path.closePath();
  }
  return path;
}

/** Which way the rail stands off the row on *this* screen: THE FLIP turns it with the field. */
function railSide(l: Layout, cfg: SimConfig): -1 | 1 {
  const mid = midCol(cfg);
  return fieldX(l, mid + 1) > fieldX(l, mid) ? 1 : -1;
}

/**
 * The latch's rail beside clasp `i`: its x, the top the bar rests at with no
 * hand on it, and its length. The bar travels down it as far as the pilot's
 * thumb has carried the latch — the depth the simulation reads.
 *
 * **The rail is exactly as long as the reach**, one tile for a thousand: a
 * drag reports its depth in thousandths of a tile and the simulation cuts it
 * to `haspReachMilli` (`sim/hasp-hand.ts`), so a rail of any other length
 * would draw the bar running ahead of the thumb or falling behind it.
 */
export function haspRail(
  l: Layout,
  cfg: SimConfig,
  i: number,
): { x: number; top: number; length: number; side: -1 | 1 } {
  const at = haspCentre(l, cfg, i);
  const side = railSide(l, cfg);
  const length = (cfg.haspReachMilli * l.tile) / 1000;
  return { x: at.x + side * RAIL_OFF * l.tile, top: at.y - length / 2, length, side };
}

/** Where the bar sits for a depth in thousandths of the reach, and its half-width. */
export function haspBarAt(
  l: Layout,
  cfg: SimConfig,
  i: number,
  depthMilli: number,
): { x: number; y: number; halfW: number } {
  const rail = haspRail(l, cfg, i);
  const k = Math.max(0, Math.min(1, depthMilli / Math.max(1, cfg.haspReachMilli)));
  return { x: rail.x, y: rail.top + rail.length * k, halfW: BAR_HALF * l.tile };
}

/** The shell's outer edge on the rail's side, where the staple is riveted. */
export function haspStapleFoot(l: Layout, cfg: SimConfig, i: number): Point {
  const at = haspCentre(l, cfg, i);
  return { x: at.x + railSide(l, cfg) * SHELL_RX * 0.96 * l.tile, y: at.y - 0.25 * l.tile };
}
