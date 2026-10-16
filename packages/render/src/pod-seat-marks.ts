import type { Pod } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **What one seat is told about a pod and the other is not** — the two halves
 * of the SUCK page (16 October 2026) that turn a catch into a sentence:
 *
 * - **The drift, called.** A freed pod slides one way or the other, and the
 *   arrows saying which are drawn on player 2's screen alone. Player 1 sees it
 *   start to fall and has to be told: "loose — it's going right!"
 * - **The clock, on player 1's.** A pod authored `clockP1` wears its ring on
 *   player 1's screen only, so the seat that catches is the one that knows
 *   which is nearly out, and says so to the seat that shoots.
 *
 * Its own file for `husk-mark.ts`' reason: nothing that draws a body should
 * have to know which seat it is running on. `test` is both halves at once.
 */

/** Whether this screen draws a pod's clock. */
export function showsPodClock(l: Layout, p: Pod): boolean {
  return !(p.clockP1 && l.role === "p2");
}

/** How many chevrons point the way, and how far apart, in pod radii. */
const CHEVRONS = 3;
const STEP_R = 0.75;

/** The arrows beside every freed pod still sliding, on player 2's screen. */
export function drawDriftArrows(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  pods: readonly Pod[],
  /** Pod radius, as `podCenter` gives it. */
  r: number,
  time: number,
): void {
  if (l.role === "p1") return;
  for (const p of pods) {
    if (!p.loose || p.driftMilli === 0 || p.gripTicks !== undefined) continue;
    const dir = p.driftMilli < 0 ? -1 : 1;
    const x = tileCX(l, p.colMilli / 1000);
    const y = tileCY(l, p.rowMilli / 1000);
    // They run outward from the pod on the beat of the wall clock, so the
    // eye reads a direction rather than three marks.
    const run = (time * 2.2) % 1;
    const path = new Path2D();
    for (let k = 0; k < CHEVRONS; k++) {
      const cx = x + dir * r * (2 + (k + run) * STEP_R);
      const h = r * 0.8;
      path.moveTo(cx - dir * h * 0.6, y - h);
      path.lineTo(cx, y);
      path.lineTo(cx - dir * h * 0.6, y + h);
    }
    strokeGlow(ctx, path, PALETTE.podRim, l.tile * 0.07, 1.3, 1);
  }
}
