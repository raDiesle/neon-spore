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
 * Everything the armour is drawn from. `ctx` is in field pixels with no
 * transform of the body's own, so `(cx, cy)` is where the ring stands and `r`
 * is how far it reaches; `cut` is the opening the shot comes up through, and a
 * plate that ignored it would close the way in again with a line two pixels
 * wide.
 */
export interface WardenPlatesDraw {
  readonly ctx: CanvasRenderingContext2D;
  readonly cx: number;
  readonly cy: number;
  /** How far the body reaches from its own centre, in pixels. */
  readonly r: number;
  readonly b: WardenState;
  readonly cfg: SimConfig;
  /** The wall clock in seconds. */
  readonly time: number;
  readonly cut: WardenOpening | null;
}

/**
 * The plates, as gaps rather than as a bar. One comes off per opened eye and
 * the gap never fills, so the silhouette says how far in the pair is without
 * a number anywhere on the screen.
 *
 * Which plate is missing follows from the index, so a plate that has gone
 * stays gone in the same place on both screens and across a restart.
 */
export function drawPlates(d: WardenPlatesDraw): void {
  const { ctx, cx, cy, r, b, time, cut } = d;
  const arc = plateArc(d.cfg);
  ctx.save();
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = STROKE.outline * 2.2;
  ctx.lineCap = "butt";
  for (let k = 0; k < b.plates; k++) {
    const a0 = plateStart(k, arc, time);
    for (const [s, e] of clear(a0, a0 + arc * PLATE_SPAN, cut)) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.94, s, e);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/**
 * How wide the whole ring makes one plate's slot, in radians: a turn split
 * between however many plates the fight was authored with.
 *
 * Exported because a candidate look has to place its armour in the same slots
 * the shipped ring does — the plate that is missing is the readout, and two
 * pictures that disagreed about where the gap is would be a vote about a health
 * bar rather than about a surface.
 */
export function plateArc(cfg: SimConfig): number {
  return (Math.PI * 2) / Math.max(1, cfg.wardenPlates);
}

/** How much of its own slot a plate fills; the rest is the seam to the next. */
export const PLATE_SPAN = 0.76;

/**
 * Where plate `k` starts, this instant. The plate's place follows from its
 * index and never from its order in the ring, which is what makes a gap stay
 * where it was opened across a restart; the sine is the whole of the ring's own
 * motion, a hair of drift at a fifth of a radian a second.
 */
export function plateStart(k: number, arc: number, time: number): number {
  return k * arc + arc * 0.12 + Math.sin(time * 0.2) * 0.01;
}

/**
 * A plate's span with the opening taken out of it, as the pieces that are
 * left. A band of armour drawn across the way in would close the shot lane
 * again with a line two pixels wide, which is all it takes: the player reads
 * the silhouette, not the fill rule.
 */
export function clear(a0: number, a1: number, cut: WardenOpening | null): Array<[number, number]> {
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
