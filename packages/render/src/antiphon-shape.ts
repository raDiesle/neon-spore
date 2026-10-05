import { antiphonRadiusMul, HULL, hullRadiusMul, type Point } from "@neon-spore/content";
import {
  ANTIPHON_SHIP,
  type AntiphonState,
  antiphonOrganCol,
  antiphonOrganRow,
  antiphonSinkBeat,
  antiphonWindow,
  type SimConfig,
} from "@neon-spore/sim";
import { type Circle, type Layout, tileCX, tileCY } from "./layout.js";
import { splineInto } from "./spline.js";

/**
 * **Where THE ANTIPHON is**, in field pixels: the body hung over the top of
 * the field above row 0, where each candidate hangs on the rail's row and
 * where the organ stands under it (`sim/antiphon-vein.ts` says the same in
 * tiles), where a carried candidate is on its vein, the spot each pit sits
 * in on the body, how far out the organ is, how far through the window, and
 * how far the body has gone on its way out — and what a contour on the
 * table looks like at a size.
 *
 * Its own file for THE SCUTTLE's reason (`scuttle-shape.ts`): the drawer
 * hangs the body on these (`antiphon-draw.ts`), the transients throw their
 * bursts at them (`antiphon-fx.ts`), and a perch placed in two files would
 * be an organ drawn on one line and its receipts thrown at another.
 *
 * **Nothing here is per seat.** Everything is in the same place on both
 * screens; the split is *what is drawn there*, and that is the drawer's
 * (`view-role-clocks-b.ts`).
 */

/** The body's top and bottom above the grid, in tiles, and how far past the outer columns its flanks reach. */
const BODY_TOP = 1.5;
const BODY_BOTTOM = 0.4;
const BODY_FLANK = 0.5;
/**
 * The organ's radius grown and a candidate's on the rail, in tiles — the
 * same, so the one carried down is the size of the place it is carried to,
 * and three times what they were (the owner, 5 October 2026).
 */
export const ORGAN_R = 0.8;
export const RAIL_R = 0.8;
/** A pit's radius on the body, in tiles. */
export const PIT_R = 0.2;
/** Columns under each of the underside's slow waves. */
const COLS_PER_WAVE = 2;
/** Points a contour is walked in. */
const N = 36;

/** The body's box: left, right, top, bottom. */
export function antiphonBox(
  l: Layout,
  cfg: SimConfig,
): { left: number; right: number; top: number; bottom: number } {
  return {
    left: tileCX(l, 0) - l.tile * BODY_FLANK,
    right: tileCX(l, cfg.cols - 1) + l.tile * BODY_FLANK,
    top: l.gridTop - l.tile * BODY_TOP,
    bottom: l.gridTop - l.tile * BODY_BOTTOM,
  };
}

/** The middle of the body: where the pilot's organ hangs, and what the body's own receipts burst at. */
export function antiphonCentre(l: Layout, cfg: SimConfig): Point {
  const box = antiphonBox(l, cfg);
  return { x: (box.left + box.right) * 0.5, y: (box.top + box.bottom) * 0.5 };
}

/** A bud's radius as drawn, `rTiles` across and breathing with the clock. */
export function antiphonBudR(l: Layout, rTiles: number, time: number): number {
  return l.tile * rTiles * (1 + 0.03 * Math.sin(time * 4));
}

/** Where a candidate hangs on the rail, over `col` on `antiphonRailRow`. */
export function antiphonPerch(l: Layout, cfg: SimConfig, col: number): Point {
  return { x: tileCX(l, col), y: tileCY(l, cfg.antiphonRailRow) };
}

/**
 * Where rail index `i` is drawn now: at its perch, or as far down its vein
 * toward the organ as the chooser's thumb has carried it (`carryMilli`).
 */
export function antiphonCandidateAt(l: Layout, cfg: SimConfig, s: AntiphonState, i: number): Point {
  const c = s.rail[i];
  if (c === undefined) return antiphonOrganCircle(l, cfg);
  const from = antiphonPerch(l, cfg, c.col);
  if (s.carried !== i) return from;
  const to = antiphonOrganCircle(l, cfg);
  const k = s.carryMilli / 1000;
  return { x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k };
}

/** Where pit `i` sits on the body: spread across it in the order taken, alternating a little up and down. */
export function antiphonPitSpot(l: Layout, cfg: SimConfig, i: number): Point {
  const box = antiphonBox(l, cfg);
  const pad = l.tile * 0.7;
  const n = Math.max(1, cfg.antiphonPits);
  const x = box.left + pad + ((i + 0.5) * (box.right - box.left - pad * 2)) / n;
  const y = (box.top + box.bottom) * 0.5 + (i % 2 === 0 ? -0.1 : 0.1) * l.tile;
  return { x, y };
}

/**
 * The body as a closed contour: a smooth arched mass whose underside
 * swells slowly, one wave a pair of columns, and whose flanks breathe —
 * a slug of a thing rather than a slab, since the boss is the one that is
 * *soft* where THE SCUTTLE was rock. `open` closes it in on the middle,
 * for the body on its way out; `breath` is 0 while the surface is still.
 */
export function antiphonBodyPath(
  l: Layout,
  cfg: SimConfig,
  open: number,
  time: number,
  breath: number,
): Path2D {
  const box = antiphonBox(l, cfg);
  const mid = (box.left + box.right) * 0.5;
  const hw = (box.right - box.left) * 0.5 * open;
  const flank = l.tile * (0.12 + 0.03 * Math.sin(time * 1.1) * breath);
  const arch = l.tile * 0.22;
  const swell = l.tile * (0.08 + 0.03 * Math.sin(time * 0.9) * breath);
  const p = new Path2D();
  p.moveTo(mid - hw, box.top + arch);
  p.quadraticCurveTo(mid, box.top - arch * 0.6, mid + hw, box.top + arch);
  p.quadraticCurveTo(mid + hw + flank, (box.top + box.bottom) * 0.5, mid + hw, box.bottom - swell);
  const n = antiphonHemLobes(cfg);
  for (let i = n - 1; i >= 0; i--) {
    const x0 = mid + hw - ((n - i) * hw * 2) / n;
    const x1 = x0 + (hw * 2) / n;
    const dip = swell * (1 + 0.3 * Math.sin(time * 0.7 + i) * breath);
    p.quadraticCurveTo((x0 + x1) * 0.5, box.bottom + dip, x0, box.bottom - swell);
  }
  p.quadraticCurveTo(mid - hw - flank, (box.top + box.bottom) * 0.5, mid - hw, box.top + arch);
  p.closePath();
  return p;
}

/** How many lobes the body's hem has: one for every `COLS_PER_WAVE` columns. */
export function antiphonHemLobes(cfg: SimConfig): number {
  return Math.max(1, Math.ceil(cfg.cols / COLS_PER_WAVE));
}

/**
 * A contour from the table at `c` with radius `r`: the shape's own radius
 * multiplier walked round and splined closed, the way a creature's is.
 * `ANTIPHON_SHIP` is a hull — `HULL`'s own lobes, and the cannon's bump on
 * top — and `lobes` is how many it is drawn with, so a decoy hull can be
 * one that is *subtly wrong* (`antiphonDecoyLobes`). `turn` is how far the
 * whole contour is turned in place, in radians: the point the shape puts at
 * angle `a` is drawn at `a + turn`, so the outline keeps its lobes and its
 * hull's cannon bump and only faces another way — the organ under a
 * resting thumb (`antiphon-grip.ts`).
 */
export function antiphonContourPath(
  shape: number,
  c: Point,
  r: number,
  t: number,
  lobes = HULL.lobes,
  turn = 0,
): Path2D {
  const pts: Point[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const at = a + turn;
    let m: number;
    if (shape === ANTIPHON_SHIP) {
      m = hullRadiusMul(a, lobes, HULL.depth, HULL.wobble, t, HULL.seed);
      const da = Math.atan2(Math.sin(a + Math.PI / 2), Math.cos(a + Math.PI / 2));
      m += 0.4 * Math.exp(-(da * da) / 0.08);
    } else m = antiphonRadiusMul(shape, a, t);
    pts.push({ x: c.x + Math.cos(at) * r * m, y: c.y + Math.sin(at) * r * m });
  }
  const p = new Path2D();
  splineInto(p, pts, true);
  p.closePath();
  return p;
}

/** The lobe count of the `i`th decoy hull on the ship's rail: never twelve, never far from it. */
export function antiphonDecoyLobes(i: number): number {
  const wrong = [10, 14, 9, 15, 8, 16];
  return wrong[i % wrong.length] ?? 10;
}

/**
 * Where the organ stands: the middle column, `antiphonVeinRows` under the
 * rail — one circle the drawing fills, the thumb is tested against, and
 * every vein ends at (`antiphon-draw.ts`, `antiphon-grip.ts`).
 */
export function antiphonOrganCircle(l: Layout, cfg: SimConfig): Circle {
  return {
    x: tileCX(l, antiphonOrganCol(cfg)),
    y: tileCY(l, antiphonOrganRow(cfg)),
    r: ORGAN_R * l.tile,
  };
}

/** How far out the standing organ is, 0 at the push and 1 grown; 0 while none stands. */
export function antiphonGrowPhase(
  s: AntiphonState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  const o = s.organ;
  if (o === null) return 0;
  const beats = Math.max(1, cfg.antiphonGrowBeats);
  const g = Math.min(1, Math.max(0, (beat - o.grownBeat + beatPhase) / beats));
  return g * (2 - g);
}

/** How much of the window is left, 1 as the organ grows and 0 as it sinks; 0 while none stands. */
export function antiphonWindowLeft(
  s: AntiphonState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  const sinkBeat = antiphonSinkBeat(s, cfg);
  if (sinkBeat < 0) return 0;
  const window = Math.max(1, antiphonWindow(s, cfg));
  return Math.min(1, Math.max(0, (sinkBeat - beat - beatPhase) / window));
}

/** What is left of the body on its way out, 1 while it stands and 0 when it is gone. */
export function antiphonFade(
  s: AntiphonState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.downBeat < 0) return 1;
  const beats = Math.max(1, cfg.antiphonOutBeats);
  return Math.max(0, 1 - (beat - s.downBeat + beatPhase) / beats);
}

/** Whether the surface is still: every pit there, nothing standing, not yet down. */
export function antiphonStill(s: AntiphonState): boolean {
  return s.stillBeat >= 0 && s.organ === null && s.downBeat < 0;
}
