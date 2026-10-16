import { GEODE_SPAN, midCol, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import { signedHash } from "./hash.js";
import { type Layout, tileCY } from "./layout.js";

/**
 * **THE GEODE's geometry**: where the stone hangs and how far it reaches. It
 * hangs over the middle column as wide as the field — every column a bolt can
 * climb is stone — and breaking it never makes it narrower: the pieces fly
 * apart across the same width.
 *
 * **Its pieces are THE CAIRN** (`tools/shape-sheet/src/drafts/collected.ts`):
 * rocks in one outline with the seams left to count — squared-off contours
 * of flat facets rather than lobes, each inset from its neighbours so the
 * dark seam between two is a count the pair can read.
 */

/** The row the stone's centre hangs on, in rows: under the seat switcher, with the field below it. */
export const GEODE_ROW = 3.2;

/** How far the stone reaches across from its centre, in tiles: a little past the columns a bolt meets it in. */
export const GEODE_BODY_TILES = GEODE_SPAN + 0.4;

/** How far the stone reaches up and down from its centre, against how far across: a slab, wider than tall. */
export const GEODE_TALL = 0.36;

/** A point on the screen. */
export interface At {
  x: number;
  y: number;
}

/** The stone's centre on the screen, hung where it stands once in. */
export function geodeCentre(l: Layout, cfg: SimConfig): At {
  return { x: fieldX(l, midCol(cfg)), y: tileCY(l, GEODE_ROW) };
}

/** How far the stone reaches across from its centre, in pixels. */
export function geodeReach(l: Layout): number {
  return GEODE_BODY_TILES * l.tile;
}

/** What a piece's facets are laid in: its box, and the seed its corners are knocked about by. */
export interface FacetBox {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  seed: number;
}

/** The squared-off facets of a piece: a superellipse with its corners knocked about. */
export function piecePoints(b: FacetBox, tile: number, crystal = false): At[] {
  const n = crystal ? 8 : 12;
  const inset = tile * 0.07;
  const cx = (b.x0 + b.x1) / 2;
  const cy = (b.y0 + b.y1) / 2;
  const hw = Math.max(tile * 0.2, (b.x1 - b.x0) / 2 - inset);
  const hh = Math.max(tile * 0.2, (b.y1 - b.y0) / 2 - inset);
  // A rock is boxy (a small exponent squares it); a crystal comes to points.
  const e = crystal ? 1 : 0.4;
  const out: At[] = [];
  for (let k = 0; k < n; k++) {
    const a = ((k + 0.5) / n) * Math.PI * 2 + signedHash(b.seed, k) * 0.1;
    const r = 1 + signedHash(b.seed, k, 1) * (crystal ? 0.1 : 0.06);
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    out.push({
      x: cx + hw * r * Math.sign(ca) * Math.abs(ca) ** e,
      y: cy + hh * r * Math.sign(sa) * Math.abs(sa) ** e,
    });
  }
  return out;
}

/** The crack down a piece, jagged, from a little over its top to a little under its foot. */
export function crackPoints(b: FacetBox & { crackX: number }, tile: number): At[] {
  const steps = Math.max(3, Math.round((b.y1 - b.y0) / (tile * 0.3)));
  const out: At[] = [];
  for (let k = 0; k <= steps; k++) {
    const y = b.y0 - tile * 0.2 + ((b.y1 - b.y0 + tile * 0.4) * k) / steps;
    const zig = k === 0 || k === steps ? 0 : signedHash(b.seed, k, 5) * tile * 0.14;
    out.push({ x: b.crackX + zig, y });
  }
  return out;
}

/** A closed path through points, straight edge to straight edge: facets, not lobes. */
export function polyPath(pts: readonly At[]): Path2D {
  const p = new Path2D();
  for (const [i, q] of pts.entries()) {
    if (i === 0) p.moveTo(q.x, q.y);
    else p.lineTo(q.x, q.y);
  }
  p.closePath();
  return p;
}
