import { signedHash } from "./hash.js";
import { PALETTE } from "./palette.js";

/**
 * **One discharge drawn between two points**, and the one place the shape of a
 * bolt in this game is decided.
 *
 * It was private to `clasp-strike.ts` while the ward reaching up a column was
 * the only thing that threw one. THE COIL's charge jumps from a failed dome to
 * the next one (`coil-jump.ts`), which is the same light doing the same thing
 * along a different line, so the two would have been two hand-written copies
 * of one picture — exactly what `copies-table.ts` exists to catch afterwards.
 *
 * **The wander is perpendicular to the line, and that is the whole of what
 * moving it here changed.** The clasp's version added its jitter to `x` alone,
 * which is right for a bolt that goes straight up a column and is the same
 * number for one — the perpendicular of a vertical line *is* the x axis. A
 * bolt across the field jittered that way would wander along its own length
 * instead of across it, which reads as a stutter rather than as lightning.
 */

/** Vertices along a bolt, end to end. */
const STEPS = 9;
/** Wander per vertex, across the line, as a share of a tile. */
const JITTER = 0.3;

/**
 * One bolt from `(x0, y0)` to `(x1, y1)`, drawn twice: a wide soft pass and a
 * hard thin one over it. `strokeGlow` is the wrong tool here for the reason
 * `shield-spark.ts` gives — it softens a curve meant to look drawn, and a
 * discharge is meant to look struck.
 *
 * The colour is `PALETTE.shieldRim` for both callers and is not a parameter:
 * it is the ship's own arcs at full reach in one case and the charge that was
 * holding a dome shut in the other, and those are the same light. A pair who
 * has watched the rim spit for a whole wave should read either as that.
 */
export function drawBolt(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  tile: number,
  seed: number,
  alpha: number,
  width: number,
): void {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  // A bolt with nowhere to go still has to have a direction, or every vertex
  // lands on the same point and the two passes draw nothing at all.
  const nx = len === 0 ? 1 : -dy / len;
  const ny = len === 0 ? 0 : dx / len;

  const path = (): void => {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    for (let i = 1; i < STEPS; i++) {
      const f = i / STEPS;
      // The wander is pinched to nothing at both ends, so the bolt leaves the
      // thing that threw it and lands on the thing it is aimed at rather than
      // near either.
      const spread = Math.sin(f * Math.PI);
      const off = signedHash(seed + i * 7.7) * JITTER * tile * spread;
      ctx.lineTo(x0 + dx * f + nx * off, y0 + dy * f + ny * off);
    }
    ctx.lineTo(x1, y1);
    ctx.stroke();
  };

  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = PALETTE.shieldRim;
  ctx.globalAlpha = alpha * 0.3;
  ctx.lineWidth = width * 3;
  path();
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  path();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = prev;
}
