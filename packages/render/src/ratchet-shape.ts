import { midCol, RATCHET_TEETH, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";

/**
 * **Where THE RATCHET is**: a strut down the middle column, a rack of seven
 * plates sliding up inside it, the pawl on one side, the catch on the other
 * and the lock at the top — the geometry the drawing and the hands both read,
 * so a thumb is answered on the shape it can see (§11.38, `ratchet-draw.ts`).
 *
 * **The rack is THE CRAWLER** from the shape sheet's armoured drafts
 * (`tools/shape-sheet/src/drafts/armoured.ts`, `forms/segmented.ts`): a chain
 * of straight-sided plates, graded from a wide head to a narrow tail, each one
 * standing proud of the one it laps. Stood upright at seven plates rather
 * than nine, with its head at the bottom and the flex taken out — a rack does
 * not snake — and with the lap turned into the tooth: the step at every seam,
 * which on the sheet is the armour, is here the flat shoulder the pawl bears
 * on. The outline is ported rather than imported, because `render` does not
 * reach into a tool.
 *
 * Plate 0 is the **top** plate, and it is the first to pass the pawl: the
 * rack climbs, so the teeth it has spent are above the pawl and the ones it
 * has left are below it, the widest last — the two it never got to spend are
 * the heavy end, still hanging (§22, row 15).
 */

export interface Point {
  x: number;
  y: number;
}

/** One plate's length up the rack, in tiles. Seven of them is the rack. */
const STEP = 0.74;
/** Half-width of the head plate (the bottom one), in tiles, and what the tail keeps. */
const GIRTH = 0.62;
const TAPER = 0.58;
/** How far a plate's lower edge stands proud of the next plate down, in tiles — the tooth. */
const LAP = 0.2;
/** The pawl's row: the seam it bears on, in tiles below the top of the grid. */
const PAWL_ROW = 5.5;
/** The lock at the top of the strut: its centre, and its half-size, in tiles. */
const LOCK_ROW = 0.35;
const LOCK_HALF = 0.62;
/** How far the strut's rails stand off the rack's middle, in tiles. */
const RAIL_OFF = 0.95;
/** The catch's rail: how far beside the rack's middle, and the bar's half-width. */
const CATCH_OFF = 1.9;
const BAR_HALF = 0.38;
/** The pawl's pivot, beside the rack on the other side, and its arm's length. */
const PAWL_OFF = 1.5;

/** The rack's middle, on this screen. */
export function ratchetX(l: Layout, cfg: SimConfig): number {
  return fieldX(l, midCol(cfg));
}

/** One plate's length up the rack, in pixels. */
export function ratchetStep(l: Layout): number {
  return STEP * l.tile;
}

/** The seam the pawl bears on: the rack's top stands here with no tooth spent. */
export function ratchetPawlY(l: Layout): number {
  return l.gridTop + PAWL_ROW * l.tile;
}

/** The lock at the top of the strut, and its half-size. */
export function ratchetLock(l: Layout, cfg: SimConfig): Point & { half: number } {
  return { x: ratchetX(l, cfg), y: l.gridTop + LOCK_ROW * l.tile, half: LOCK_HALF * l.tile };
}

/**
 * Which side the teeth, and so the pawl, face on *this* screen — THE FLIP
 * turns it with the field, so the pawl is on the same column of the field on
 * both devices. The catch is on the other side.
 */
export function ratchetSide(l: Layout, cfg: SimConfig): -1 | 1 {
  const mid = midCol(cfg);
  return fieldX(l, mid + 1) > fieldX(l, mid) ? 1 : -1;
}

/** Plate `i`'s half-width, graded from the tail at the top to the head at the bottom. */
export function ratchetGirth(l: Layout, i: number): number {
  const f = RATCHET_TEETH > 1 ? i / (RATCHET_TEETH - 1) : 0;
  return GIRTH * l.tile * (TAPER + (1 - TAPER) * f);
}

/**
 * Plate `i`'s outline with the rack's top at `top`: straight edges corner to
 * corner, the smooth back on the catch's side and the tooth on the pawl's —
 * the edge running out from the plate's top to stand `LAP` proud at its
 * bottom, then stepping flat back in. That flat step is the shoulder the pawl
 * bears on, and it faces down, so the rack may climb over the pawl and never
 * fall back past it.
 */
export function ratchetPlatePath(l: Layout, cfg: SimConfig, i: number, top: number): Path2D {
  const x = ratchetX(l, cfg);
  const side = ratchetSide(l, cfg);
  const step = ratchetStep(l);
  const w = ratchetGirth(l, i);
  const y0 = top + i * step;
  const y1 = y0 + step;
  const lap = LAP * l.tile;
  const path = new Path2D();
  path.moveTo(x - side * w, y0);
  path.lineTo(x + side * w, y0);
  path.lineTo(x + side * (w + lap), y1);
  path.lineTo(x - side * w, y1);
  path.closePath();
  return path;
}

/** Plate `i`'s own box for `litBox` — the outline's bounding rectangle, top-left
 * corner and full width and height, so the ramp is sized to the plate rather
 * than guessed at from outside (`ratchet-draw.ts`). */
export function ratchetPlateBox(
  l: Layout,
  cfg: SimConfig,
  i: number,
  top: number,
): { x: number; y: number; w: number; h: number } {
  const x = ratchetX(l, cfg);
  const side = ratchetSide(l, cfg);
  const step = ratchetStep(l);
  const w = ratchetGirth(l, i);
  const lap = LAP * l.tile;
  const left = x - w - (side < 0 ? lap : 0);
  const right = x + w + (side > 0 ? lap : 0);
  return { x: left, y: top + i * step, w: right - left, h: step };
}

/** Where the shoulder of plate `i` stands with the rack's top at `top`: the tip the pawl bears on. */
export function ratchetShoulder(l: Layout, cfg: SimConfig, i: number, top: number): Point {
  const side = ratchetSide(l, cfg);
  return {
    x: ratchetX(l, cfg) + side * (ratchetGirth(l, i) + LAP * l.tile),
    y: top + (i + 1) * ratchetStep(l),
  };
}

/** The strut's two rails, beside the rack from the lock down past its lowest reach. */
export function ratchetRails(
  l: Layout,
  cfg: SimConfig,
): { left: number; right: number; bottom: number } {
  const x = ratchetX(l, cfg);
  const off = RAIL_OFF * l.tile;
  const bottom = ratchetPawlY(l) + RATCHET_TEETH * ratchetStep(l) + 0.3 * l.tile;
  return { left: x - off, right: x + off, bottom };
}

/** The pawl's pivot, beside the rack on the teeth's side, and its arm's length to the seam. */
export function ratchetPawl(l: Layout, cfg: SimConfig): Point & { reach: number } {
  const side = ratchetSide(l, cfg);
  const x = ratchetX(l, cfg) + side * PAWL_OFF * l.tile;
  const y = ratchetPawlY(l) + 0.55 * l.tile;
  return { x, y, reach: Math.hypot(0.62 * l.tile, 0.55 * l.tile) };
}

/**
 * The catch's rail beside the rack on the back's side: its x, the top the
 * bar rests at with no hand on it, and its length.
 *
 * **The rail is exactly as long as the reach**, one tile for a thousand, for
 * `hasp-shape.ts`' reason: a drag reports its depth in thousandths of a tile
 * and the simulation cuts it to `ratchetReachMilli`, so a rail of any other
 * length would draw the bar running ahead of the thumb or falling behind it.
 */
export function ratchetCatchRail(
  l: Layout,
  cfg: SimConfig,
): { x: number; top: number; length: number; side: -1 | 1 } {
  const side = ratchetSide(l, cfg);
  const length = (cfg.ratchetReachMilli * l.tile) / 1000;
  return {
    x: ratchetX(l, cfg) - side * CATCH_OFF * l.tile,
    top: ratchetPawlY(l) - length / 2,
    length,
    side: side === 1 ? -1 : 1,
  };
}

/** Where the catch's bar sits for a depth in thousandths of the reach, and its half-width. */
export function ratchetBarAt(
  l: Layout,
  cfg: SimConfig,
  depthMilli: number,
): { x: number; y: number; halfW: number } {
  const rail = ratchetCatchRail(l, cfg);
  const k = Math.max(0, Math.min(1, depthMilli / Math.max(1, cfg.ratchetReachMilli)));
  return { x: rail.x, y: rail.top + rail.length * k, halfW: BAR_HALF * l.tile };
}
