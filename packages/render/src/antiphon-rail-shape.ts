import type { Point } from "@neon-spore/content";
import {
  type AntiphonState,
  antiphonSlotCol,
  antiphonSlotRow,
  type SimConfig,
} from "@neon-spore/sim";
import { antiphonOrganCircle, ORGAN_R } from "./antiphon-shape.js";
import { type Layout, tileCX, tileCY } from "./layout.js";

/**
 * **Where THE ANTIPHON's rail is**, in field pixels: where each candidate
 * hangs, how big it is drawn, and where one carried down its vein is now.
 * Cut from `antiphon-shape.ts` when the rail's staggered rows took it past
 * 250 lines (14 October 2026); the body and the organ stay there.
 */

/**
 * A candidate's on the rail, in tiles: big enough that its outline stands
 * well clear of the knob over it — the owner, 14 October 2026, *make the
 * shapes behind the pull buttons much bigger otherwise it cannot be seen*,
 * and then *even more bigger*, with the outer two hung lower for it
 * (`antiphonRailDrop`).
 * Carried down it shrinks to the organ's, so the one carried home is the
 * size of the place it is carried to (`antiphonCandidateR`).
 */
export const RAIL_R = 1.6;

/** Where a candidate hangs on the rail: over `col`, on `row` (`antiphonSlotRow`). */
export function antiphonPerch(l: Layout, col: number, row: number): Point {
  return { x: tileCX(l, col), y: tileCY(l, row) };
}

/** Where rail slot `i` of `n` hangs, at rest. */
export function antiphonSlotPerch(l: Layout, cfg: SimConfig, n: number, i: number): Point {
  return antiphonPerch(l, antiphonSlotCol(cfg, n, i), antiphonSlotRow(cfg, n, i));
}

/** Where rail index `i` hangs, at rest. */
export function antiphonRailPerch(l: Layout, cfg: SimConfig, s: AntiphonState, i: number): Point {
  return antiphonSlotPerch(l, cfg, s.rail.length, i);
}

/**
 * Where rail index `i` is drawn now: at its perch, or as far down its vein
 * toward the organ as the chooser's thumb has carried it (`carryMilli`).
 */
export function antiphonCandidateAt(l: Layout, cfg: SimConfig, s: AntiphonState, i: number): Point {
  const c = s.rail[i];
  if (c === undefined) return antiphonOrganCircle(l, cfg);
  const from = antiphonRailPerch(l, cfg, s, i);
  if (s.carried !== i) return from;
  const to = antiphonOrganCircle(l, cfg);
  const k = s.carryMilli / 1000;
  return { x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k };
}

/** Rail index `i`'s radius now, in tiles: the rail's at its perch, the organ's when carried home. */
export function antiphonCandidateR(s: AntiphonState, i: number): number {
  if (s.carried !== i) return RAIL_R;
  return RAIL_R + (ORGAN_R - RAIL_R) * (s.carryMilli / 1000);
}
