import { BELLOWS_SEAMS, type BellowsState, type SimConfig } from "@neon-spore/sim";
import { bellowsCentre, bellowsInnerX } from "./bellows-shape.js";
import type { Layout } from "./layout.js";

/**
 * **The leather waist THE BELLOWS' two housings are joined at, and the four
 * seams that are its health.**
 *
 * Its own page off `bellows-shape.ts`, which went over 250 lines with it, and
 * the cut is the boss's own: next door is a housing and the handle under it —
 * the half one seat is shown and the only half a thumb ever reaches — and
 * here is the waist, which both seats are shown whole and neither may touch.
 * It is also the only part of the lung that carries the count, so a change to
 * how a seam is drawn cannot reach the hit test at all.
 */

/** Half the waist's height with every seam whole, in tiles, and with none left. */
const WAIST_HALF = 0.85;
const WAIST_THIN = 0.22;

/** Half the waist's height at `seams` left: full with four, a thread with none. */
export function bellowsWaistHalf(l: Layout, seams: number): number {
  const share = Math.min(1, Math.max(0, seams / BELLOWS_SEAMS));
  return l.tile * (WAIST_THIN + (WAIST_HALF - WAIST_THIN) * share);
}

/**
 * **The waist is the health.** The leather between the two housings, drawn as
 * a lip over and a lip under, pinched in further with every seam gone — and
 * once the last one parts, the two lips pull away from each other and the
 * gap between them is the split. Nothing prints the number: a waist with one
 * seam left is a different silhouette from a waist with four.
 */
export function bellowsWaistPath(
  l: Layout,
  cfg: SimConfig,
  s: BellowsState,
  apart: number,
): Path2D {
  const at = bellowsCentre(l, cfg);
  const half = bellowsWaistHalf(l, s.seams);
  const x0 = bellowsInnerX(l, cfg, 1);
  const x1 = bellowsInnerX(l, cfg, 2);
  const belly = half * 0.5;
  const p = new Path2D();
  for (const lip of [-1, 1] as const) {
    const y = at.y + lip * (half + apart * l.tile * 0.9);
    p.moveTo(x0, at.y + lip * half * 1.3);
    p.quadraticCurveTo((x0 + x1) / 2, y + lip * belly, x1, at.y + lip * half * 1.3);
  }
  return p;
}

/**
 * The four seams themselves, across the waist: a whole one stitched shut, a
 * parted one standing open. `BELLOWS_SEAMS` of them evenly along the leather,
 * and the ones already gone are the first — so the waist unzips from the
 * pilot's side toward the navigator's and the eye has a direction to read.
 */
export function bellowsSeamPath(
  l: Layout,
  cfg: SimConfig,
  s: BellowsState,
  parted: boolean,
  /** How far the seam parting right now has opened, 0..1. */
  going: number,
): Path2D {
  const at = bellowsCentre(l, cfg);
  const half = bellowsWaistHalf(l, s.seams);
  const x0 = bellowsInnerX(l, cfg, 1);
  const x1 = bellowsInnerX(l, cfg, 2);
  const gone = BELLOWS_SEAMS - s.seams;
  const p = new Path2D();
  for (let i = 0; i < BELLOWS_SEAMS; i++) {
    if (i < gone !== parted) continue;
    const share = (i + 0.5) / BELLOWS_SEAMS;
    const x = x0 + (x1 - x0) * share;
    // A parted seam is drawn as the two lips standing off each other, the
    // newest one still opening; a whole one is the stitch holding them.
    const open = parted ? half * (0.5 + 0.5 * (i === gone - 1 ? going : 1)) : 0;
    p.moveTo(x, at.y - half - open * 0.4);
    p.lineTo(x, at.y + half + open * 0.4);
  }
  return p;
}
