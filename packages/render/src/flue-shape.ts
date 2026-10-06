import { blobPoints } from "@neon-spore/content";
import { flueCannonCol, midCol, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import { type Layout, tileCY } from "./layout.js";
import { splinePath } from "./spline.js";

/**
 * **THE FLUE's geometry**: where the flue lies, the units it is laid from,
 * the slot the ember runs in, and the sight over the cannon.
 *
 * **The flue is THE CAIRN · PULLED laid out in a row, grown as THE
 * CRAWLER's chain** (`tools/shape-sheet/src/drafts/collected.ts`,
 * `armoured.ts`): one unit over every column of the field, so the outline
 * creases where two meet and the seams read as the sections of a gut. Since
 * the rework of 5 October 2026 it lies across the whole field, because the
 * ember runs nearly the whole of it; since 6 October 2026 — the owner: *all
 * boss graphics bigger, especially the ball, and more alien living* — each
 * unit is a lobed segment out of `blobPoints`, taller than wide and breathing
 * on its own clock, where it was THE RIME's facet, and the ember, the slot
 * and the sight round it are all grown.
 *
 * **It lies on the simulation's row** (`flueRow`), where a shot is judged,
 * so a bolt is drawn ending where it really ended. The ember's place is a
 * column of the field, so it and the units are laid with `fieldX` and turn
 * with a turned field. Paths are laid in field pixels.
 */

export interface Point {
  x: number;
  y: number;
}

/** A unit's radius and the slot's half-height, in tiles, and the ember's radius. */
const UNIT_R = 0.8;
const SLOT = 0.25;
const EMBER = 0.48;
/** A segment's width against its height, its lobes, how deep they cut and how much it trembles. */
const SEG_WIDE = 0.7;
const SEG_LOBES = 5;
const SEG_DEPTH = 0.07;
const SEG_WOBBLE = 0.035;
/** How far past the ember's ends the slot runs, in tiles. */
const SLOT_OVER = 0.3;
/** The sight's radius, in tiles. */
const SIGHT = 0.74;
/** THE CAIRN's own seed, spread along the row so no two units are cut alike. */
const SEED = 4.0;

/** How many units the flue is laid from: one a column. */
export function flueUnits(cfg: SimConfig): number {
  return cfg.cols;
}

/** The flue's middle: over the middle column, on the simulation's row. */
export function flueCentre(l: Layout, cfg: SimConfig): Point {
  return { x: fieldX(l, midCol(cfg)), y: tileCY(l, cfg.flueRow) };
}

/** Unit `k`'s middle, over column `k`. */
export function flueUnitAt(l: Layout, cfg: SimConfig, k: number): Point {
  return { x: fieldX(l, k), y: flueCentre(l, cfg).y };
}

/**
 * Unit `k`, round its own middle: a lobed segment, taller than wide, each
 * seeded a little differently and breathing on `time`, in seconds.
 */
export function flueUnitPath(l: Layout, k: number, time = 0): Path2D {
  const r = UNIT_R * l.tile;
  const seed = SEED + k * 1.7;
  return splinePath(
    blobPoints(0, 0, r * SEG_WIDE, r, SEG_LOBES, SEG_DEPTH, SEG_WOBBLE, time + k, seed, 28),
    true,
  );
}

/** The unit's radius, in pixels. */
export function flueUnitR(l: Layout): number {
  return UNIT_R * l.tile;
}

/** Half the slot's straight length, middle to either end, in pixels. */
export function flueSlotHalf(l: Layout, cfg: SimConfig): number {
  return (cfg.flueSpanMilli / 1000 + SLOT_OVER) * l.tile;
}

/** The slot, along the row the ember runs, rounded at its ends. */
export function flueSlotPath(l: Layout, cfg: SimConfig): Path2D {
  const c = flueCentre(l, cfg);
  const half = flueSlotHalf(l, cfg);
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

/** The sight: the place on the flue over the held cannon, where the ember must be met. */
export function flueSightAt(l: Layout, cfg: SimConfig): Point {
  return { x: fieldX(l, flueCannonCol(cfg)), y: flueCentre(l, cfg).y };
}

/** The sight's radius, in pixels. */
export function flueSightR(l: Layout): number {
  return SIGHT * l.tile;
}
