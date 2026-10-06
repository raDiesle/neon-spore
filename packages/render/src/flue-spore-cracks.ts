import { flueEmberR, type Point } from "./flue-shape.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **The spore cracking, a crack for every level cleared** (the owner, 6
 * October 2026: *when the ball is hit correct, it should every time get some
 * visual of damaging, more and more, like cracks*). Each hit splits the
 * membrane in from its edge toward the nucleus, kinked and branched, and the
 * ones before it open wider, so by the last level the spore is crazed.
 *
 * The newest one runs in from the edge as the hit's flash fades (`fresh`, 1
 * at the hit), so the pilot sees the shot land on the ball itself. Drawn in
 * the spore's own frame, over its flesh and under its film; the pilot's,
 * since the spore is.
 */

/** Each crack, in the spore's radii: from the edge inward, kinked, with one branch off its middle. */
const CRACKS: readonly (readonly [number, number])[][] = [
  [
    [-0.94, -0.3],
    [-0.6, -0.12],
    [-0.42, -0.22],
    [-0.16, -0.04],
  ],
  [
    [0.72, 0.66],
    [0.48, 0.38],
    [0.5, 0.18],
    [0.2, 0.08],
  ],
  [
    [0.12, -0.98],
    [0.06, -0.66],
    [0.22, -0.46],
    [0.06, -0.2],
  ],
  [
    [-0.5, 0.84],
    [-0.36, 0.52],
    [-0.12, 0.44],
    [-0.08, 0.16],
  ],
  [
    [0.96, -0.2],
    [0.66, -0.3],
    [0.5, -0.1],
    [0.26, -0.16],
  ],
  [
    [-0.82, 0.48],
    [-0.54, 0.4],
    [-0.4, 0.58],
    [-0.2, 0.3],
  ],
];

/** The crack's width at its edge end, in the spore's radius, and how much wider each later hit opens it. */
const WIDE = 0.12;
const OPENS = 0.04;
/** How far past the listed points each crack is laid, so it splits the membrane's very edge. */
const OUT = 1.12;

export function drawFlueSporeCracks(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  hits: number,
  fresh: number,
  dim: number,
): void {
  const n = Math.min(hits, CRACKS.length);
  if (n <= 0) return;
  const r = flueEmberR(l) * OUT;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < n; i++) {
    const crack = CRACKS[i] ?? [];
    const reach = i === n - 1 ? Math.min(1, (1 - fresh) * 2.5) : 1;
    const path = new Path2D();
    const shown = Math.max(2, Math.ceil(crack.length * reach));
    crack.slice(0, shown).forEach(([x, y], k) => {
      if (k === 0) path.moveTo(at.x + x * r, at.y + y * r);
      else path.lineTo(at.x + x * r, at.y + y * r);
    });
    // A branch off the crack's middle, once it has run that far.
    const mid = crack[1];
    if (mid !== undefined && shown >= 3) {
      path.moveTo(at.x + mid[0] * r, at.y + mid[1] * r);
      path.lineTo(
        at.x + (mid[0] * 0.7 - mid[1] * 0.35) * r,
        at.y + (mid[1] * 0.7 + mid[0] * 0.35) * r,
      );
    }
    const open = WIDE + OPENS * (n - 1 - i);
    ctx.lineWidth = open * r;
    ctx.strokeStyle = rgba(PALETTE.flueSlot, 0.9 * dim);
    ctx.stroke(path);
    // The lit lip along it, and red raw in it while it is fresh.
    ctx.lineWidth = open * r * 0.35;
    ctx.strokeStyle =
      i === n - 1 && fresh > 0
        ? rgba(PALETTE.redRim, (0.4 + 0.5 * fresh) * dim)
        : rgba(PALETTE.sheenRim, 0.4 * dim);
    ctx.save();
    ctx.translate(-open * r * 0.3, -open * r * 0.3);
    ctx.stroke(path);
    ctx.restore();
  }
  ctx.restore();
}
