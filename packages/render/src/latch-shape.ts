import { isoLoops, type Point } from "@neon-spore/content";
import {
  type LatchGrip,
  type LatchState,
  latchGripCol,
  latchKnotsAll,
  midCol,
  type SimConfig,
} from "@neon-spore/sim";
import { handleRadius } from "./handle-draw.js";
import type { LatchPose } from "./latch-pose.js";
import { type Circle, type Layout, tileCX } from "./layout.js";

/**
 * **THE LATCH's shape** (§11.61): the shape sheet's COLONY — small bodies
 * sharing one skin, `tools/shape-sheet/src/drafts/creatures.ts` — at one body
 * a knot, round the knot of skin the tendril grows out of. Every knot pulled
 * in tears a body off, so what is left to haul is counted on the colony.
 *
 * The skin is the metaball field THE CHOIR's membrane is traced from
 * (`choir-shape.ts`), at its coarse grid: each body adds `r² / d²`, and the
 * outline is where the sum crosses one.
 *
 * **The figures it blends between**, all off `LatchPose`: hung over the
 * field; **stretched** toward the ship as the rope is hauled, its lower bodies
 * drawn down after the tendril; **reared**, lifted and tipped back so the ring
 * of bodies is seen edge-on, the face the pair has been counting turned away;
 * and torn loose, gone off the top.
 */

/** Cells a side the skin is traced on: THE CHOIR's figure, for its reason. */
const RES = 22;

/** The row the colony's middle hangs at. */
const HANG_ROW = 2.6;

/** One body's radius, and the ring the bodies sit on, in tiles. */
const BODY = 0.62;
const RING_X = 1.65;
const RING_Y = 0.95;

/** The knot of skin in the middle, which holds the tendril, in tiles. */
const CORE = 0.75;

/** A body of the colony: where it is, how big, and which knot tears it off. */
export interface LatchBody extends Circle {
  /** Nought for the core, else the knot that tears this body off. */
  knot: number;
}

/** The tendril's width, in tiles: the rope as drawn hanging (`latch-draw.ts`) and cracked (`latch-blow.ts`). */
export const LATCH_TENDRIL = 0.16;

/** Where the colony's middle hangs this frame. */
export function latchHang(l: Layout, cfg: SimConfig, p: LatchPose): Point {
  const rows = HANG_ROW + 0.9 * p.sag - 0.6 * p.rear;
  const drop = (1 - p.arrived) * 5 + p.gone * 7;
  return { x: tileCX(l, midCol(cfg)), y: l.gridTop + l.tile * (rows - drop) };
}

/** The core's radius: it swells a little as the colony rears. */
function coreRadius(l: Layout, p: LatchPose): number {
  return l.tile * CORE * (1 + 0.15 * p.rear);
}

/** Where the tendril leaves the colony: the underside of the core. */
export function latchRoot(l: Layout, cfg: SimConfig, p: LatchPose): Point {
  const at = latchHang(l, cfg, p);
  return { x: at.x, y: at.y + coreRadius(l, p) };
}

/**
 * The bodies still on the colony, the core first. Body `i` is torn off by
 * knot `i + 1`, taken from the bottom of the ring round both ways, so the
 * colony is eaten from the rope up.
 */
export function latchBodies(
  l: Layout,
  cfg: SimConfig,
  s: LatchState,
  p: LatchPose,
  time: number,
): LatchBody[] {
  const at = latchHang(l, cfg, p);
  const n = latchKnotsAll(s);
  const bodies: LatchBody[] = [{ x: at.x, y: at.y, r: coreRadius(l, p), knot: 0 }];
  const rx = l.tile * RING_X * (1 + 0.25 * p.rear);
  const ry = l.tile * RING_Y * (1 - 0.6 * p.rear) * (1 + 0.35 * p.sag);
  const spin = time * 0.15;
  for (let i = 0; i < n; i += 1) {
    if (i < s.knots) continue;
    // From the bottom, alternately right and left of it, up to the top.
    const side = i % 2 === 0 ? 1 : -1;
    const a = Math.PI / 2 + side * Math.ceil(i / 2) * ((Math.PI * 2) / Math.max(1, n)) + spin;
    const down = Math.max(0, Math.sin(a)) * p.sag * l.tile * 0.3;
    bodies.push({
      x: at.x + Math.cos(a) * rx,
      y: at.y + Math.sin(a) * ry + down,
      r: l.tile * BODY * (1 + 0.05 * Math.sin(time * 1.4 + i * 2.3)),
      knot: i + 1,
    });
  }
  return bodies;
}

/** The skin round the bodies, as however many loops the field gives. */
export function latchSkinLoops(l: Layout, bodies: readonly LatchBody[]): Point[][] {
  const field = (x: number, y: number): number => {
    let f = 0;
    for (const b of bodies) f += (b.r * b.r) / Math.max((x - b.x) ** 2 + (y - b.y) ** 2, 1);
    return f;
  };
  const pad = l.tile * BODY * 1.8;
  const xs = bodies.map((b) => b.x);
  const ys = bodies.map((b) => b.y);
  const box = {
    x0: Math.min(...xs) - pad,
    y0: Math.min(...ys) - pad,
    x1: Math.max(...xs) + pad,
    y1: Math.max(...ys) + pad,
  };
  return isoLoops(field, box, 1, RES);
}

/** The screen y of the row the grips hang on. */
export function latchGripY(l: Layout, cfg: SimConfig): number {
  return l.gridTop + (cfg.latchGripRowMilli * l.tile) / 1000;
}

/** A tile-thousandth of rope, on the screen. */
export function latchMilliPx(l: Layout, milli: number): number {
  return (milli * l.tile) / 1000;
}

/**
 * Where knot `k` (one-based) is on the tendril this frame: above the grips by
 * as much rope as is still to be hauled to it, so it comes down past them the
 * instant the simulation counts it in.
 */
export function latchKnotY(l: Layout, cfg: SimConfig, s: LatchState, k: number): number {
  return latchGripY(l, cfg) - latchMilliPx(l, k * cfg.latchKnotMilli - s.hauledMilli);
}

/** A grip's knob at rest, at the top of its pull: one column off the tendril. */
export function latchGripRest(l: Layout, cfg: SimConfig, grip: LatchGrip): Circle {
  return {
    x: tileCX(l, latchGripCol(cfg, grip)),
    y: latchGripY(l, cfg),
    r: handleRadius(l, cfg),
  };
}

/** A grip's knob where its thumb has it: drawn down by its depth. */
export function latchKnobAt(l: Layout, cfg: SimConfig, s: LatchState, grip: LatchGrip): Circle {
  const rest = latchGripRest(l, cfg, grip);
  return { ...rest, y: rest.y + latchMilliPx(l, s.depthMilli[grip]) };
}
