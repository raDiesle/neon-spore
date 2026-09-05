import type { WardenOpening } from "@neon-spore/content";
import type { SimConfig, WardenState } from "@neon-spore/sim";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE WARDEN's armour, and the only place on the field that says how far in the
 * pair is.
 *
 * Its own file, cut out of `warden.ts` when the skin landed and that file went
 * past its 250-line ceiling. The seam is a real one: next door is the *body* —
 * two contours cut against each other, where the hole is, what it is made of —
 * and this is a **readout**, drawn from a count rather than from a shape, and
 * it is the one part of the boss that has to survive a restart looking the same
 * (`drawPlates` on why the missing plate is chosen by index).
 */

/**
 * The plates, as gaps rather than as a bar. One comes off per opened eye and
 * the gap never fills, so the silhouette says how far in the pair is without
 * a number anywhere on the screen.
 *
 * Which plate is missing follows from the index, so a plate that has gone
 * stays gone in the same place on both screens and across a restart.
 */
export function drawPlates(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  b: WardenState,
  cfg: SimConfig,
  time: number,
  cut: WardenOpening | null,
): void {
  const total = Math.max(1, cfg.wardenPlates);
  const arc = (Math.PI * 2) / total;
  ctx.save();
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = STROKE.outline * 2.2;
  ctx.lineCap = "butt";
  for (let k = 0; k < b.plates; k++) {
    const a0 = k * arc + arc * 0.12 + Math.sin(time * 0.2) * 0.01;
    for (const [s, e] of clear(a0, a0 + arc * 0.76, cut)) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.94, s, e);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/**
 * A plate's span with the opening taken out of it, as the pieces that are
 * left. A band of armour drawn across the way in would close the shot lane
 * again with a line two pixels wide, which is all it takes: the player reads
 * the silhouette, not the fill rule.
 */
function clear(a0: number, a1: number, cut: WardenOpening | null): Array<[number, number]> {
  if (cut === null) return [[a0, a1]];
  const out: Array<[number, number]> = [];
  for (const turn of [-Math.PI * 2, 0, Math.PI * 2]) {
    const m0 = cut.from + turn;
    const m1 = cut.to + turn;
    if (m1 <= a0 || m0 >= a1) continue;
    if (m0 > a0) out.push([a0, m0]);
    a0 = Math.max(a0, m1);
  }
  if (a0 < a1) out.push([a0, a1]);
  return out;
}
