import { coreRowMilli, midCol, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { rimeFacetPath } from "./rime-shape.js";

/**
 * **THE FLUE's geometry**: where the flue lies, the units it is laid from,
 * the slot the ember rides in, the damper and the core under it.
 *
 * **The flue is THE CAIRN · PULLED laid out in a row**
 * (`tools/shape-sheet/src/drafts/collected.ts`): its seven faceted units
 * side by side across the middle of the field, each its own polygon, so the
 * outline creases where two meet and the seams read as the sections of a
 * pipe. The card's one unit dragged clear is **the damper**, the middle
 * unit, which drops down out of the row to bare the core behind it and
 * climbs back to shut it. THE RIME's frost is THE CAIRN piled over a lens;
 * this is the same unit, `rimeFacetPath`, called rather than copied, and
 * never piled.
 *
 * **The slot is cut along the whole row**, over the damper too, and the
 * ember rides in it: its place is a column of the field, so it is laid with
 * `fieldX` and turns with a turned field, where the units, being even either
 * side of the middle, need not. Paths are laid in field pixels.
 */

export interface Point {
  x: number;
  y: number;
}

/** The flue's middle, in tiles below the grid's top. */
const ROW = coreRowMilli("flue") / 1000 + 0.5;
/** The units, the middle one the damper, the tiles between their middles and their radius. */
export const FLUE_UNITS = 7;
export const FLUE_DAMPER = 3;
const PITCH = 0.82;
const UNIT_R = 0.56;
/** THE CAIRN's own seed, spread along the row so no two units are cut alike. */
const SEED = 4.0;
/** The slot's half-height, in tiles, and the ember's radius. */
const SLOT = 0.13;
const EMBER = 0.12;
/** How far the damper drops clear of the row to bare the core, and how much further once spent. */
const PULL = 1.15;
const WIDE = 0.55;
/** The core's radius at its fullest, in tiles. */
const CORE = 0.42;

/** The flue's middle: over the middle column, a little way down the field. */
export function flueCentre(l: Layout, cfg: SimConfig): Point {
  return { x: fieldX(l, midCol(cfg)), y: l.gridTop + ROW * l.tile };
}

/** Unit `k`'s middle, the damper's where it sits shut. */
export function flueUnitAt(l: Layout, cfg: SimConfig, k: number): Point {
  const c = flueCentre(l, cfg);
  return { x: c.x + (k - FLUE_DAMPER) * PITCH * l.tile, y: c.y };
}

/** Unit `k`, round its own middle: THE CAIRN's facet, each turned and cut a little differently. */
export function flueUnitPath(l: Layout, k: number): Path2D {
  return rimeFacetPath(UNIT_R * l.tile, -Math.PI / 2 + k * 0.41, SEED + k * 1.7);
}

/** The unit's radius, in pixels. */
export function flueUnitR(l: Layout): number {
  return UNIT_R * l.tile;
}

/** Half the slot's straight length, middle to an end unit's middle, in pixels. */
export function flueSlotHalf(l: Layout): number {
  return FLUE_DAMPER * PITCH * l.tile;
}

/** The slot, end unit to end unit along the row, rounded at its ends. */
export function flueSlotPath(l: Layout, cfg: SimConfig): Path2D {
  const c = flueCentre(l, cfg);
  const half = flueSlotHalf(l);
  const h = SLOT * l.tile;
  const p = new Path2D();
  p.moveTo(c.x - half, c.y - h);
  p.lineTo(c.x + half, c.y - h);
  p.arc(c.x + half, c.y, h, -Math.PI / 2, Math.PI / 2);
  p.lineTo(c.x - half, c.y + h);
  p.arc(c.x - half, c.y, h, Math.PI / 2, (Math.PI * 3) / 2);
  p.closePath();
  return p;
}

/** Where the ember sits for `milli` thousandths of a column off the middle one. */
export function flueEmberAt(l: Layout, cfg: SimConfig, milli: number): Point {
  return { x: fieldX(l, midCol(cfg) + milli / 1000), y: flueCentre(l, cfg).y };
}

/** The ember's radius, in pixels. */
export function flueEmberR(l: Layout): number {
  return EMBER * l.tile;
}

/** The damper's middle for `open` — 0 shut in the row, 1 clear of it, up to 2 swung wide. */
export function flueDamperAt(l: Layout, cfg: SimConfig, open: number): Point {
  const at = flueUnitAt(l, cfg, FLUE_DAMPER);
  const drop = Math.min(1, open) * PULL + Math.max(0, open - 1) * WIDE;
  return { x: at.x, y: at.y + drop * l.tile };
}

/** The core's radius at its fullest, in pixels. */
export function flueCoreR(l: Layout): number {
  return CORE * l.tile;
}
