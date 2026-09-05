import { strokeGlow } from "./glow.js";

/**
 * One rib of THE RECOIL's cage, and the piece of hoop it carries.
 *
 * Split out of `recoil.ts` when the frame was lit: the file there decides what
 * colour the cage is and how hard it burns, and this one draws the springs. A
 * rib is built as a `Path2D` and handed to `strokeGlow` rather than stroked
 * flat, which is the same lit-edge treatment the ship's own ward gets
 * (`shield.ts`) — a cage that returns a shot and a shield that returns a shot
 * are the same promise, and they now read as the same material.
 */

/** Zigzag folds in one rib. Three reads as a spring at 26 px; two reads as a
 * kink and four reads as a scribble. */
const FOLDS = 3;
/** How far a fold swings off the rib's own line, as a share of its length. */
const FOLD_MUL = 0.34;

/**
 * A zigzag leaf from the body out to the hoop.
 *
 * A spent one stops short of the hoop and leans off its own line — the spring
 * blew out and what is left is hanging. The lean is a fixed function of the
 * angle rather than of time, so a broken rib is *broken* and does not go on
 * flapping: the frame breathes and the wreckage does not, which is what makes
 * the two read as different materials. Its glow is turned right down for the
 * same reason — a rib that is still lit is a rib that still has a bounce in
 * it, and that is the count either seat reads the creature's life off.
 */
export function drawRib(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  a: number,
  inner: number,
  outer: number,
  spent: boolean,
  hex: string,
  time: number,
  glow: number,
): void {
  const reach = spent ? inner + (outer - inner) * 0.55 : outer;
  const lean = spent ? 0.5 : 0;
  const swing = spent ? 0 : 0.18 * Math.sin(time * 3.1 + a * 2);
  const path = new Path2D();
  for (let k = 0; k <= FOLDS * 2; k++) {
    const t = k / (FOLDS * 2);
    const d = inner + (reach - inner) * t;
    // The fold, alternating either side of the rib's line, and tapering to
    // nothing at both ends so the leaf meets the body and the hoop square on.
    const off = (k % 2 === 0 ? 0 : 1) * FOLD_MUL * (outer - inner) * Math.sin(t * Math.PI);
    const ang = a + lean * t + swing * t + off / Math.max(1, d);
    const px = x + Math.cos(ang) * d;
    const py = y + Math.sin(ang) * d;
    if (k === 0) path.moveTo(px, py);
    else path.lineTo(px, py);
  }
  ctx.globalAlpha = spent ? 0.65 : 1;
  strokeGlow(ctx, path, hex, Math.max(0.8, outer * (spent ? 0.05 : 0.08)), glow);
  ctx.globalAlpha = 1;
}

/**
 * The quarter of the hoop this rib carries, and the bolt at its head.
 *
 * A spent rib's arc is drawn split: two short pieces with a gap where the bolt
 * was, so the hoop is visibly *open* there. That gap is the whole readout —
 * a shot could be said to have "damaged" a frame by dimming it, and dimming is
 * something a phone in a bright room throws away first.
 */
export function drawHoopArc(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  a: number,
  struts: number,
  r: number,
  spent: boolean,
  hex: string,
  dark: string,
  glow: number,
): void {
  const half = Math.PI / struts;
  const gap = spent ? half * 0.45 : 0;
  const arc = new Path2D();
  arc.arc(x, y, r, a - half, a - gap);
  arc.moveTo(x + Math.cos(a + gap) * r, y + Math.sin(a + gap) * r);
  arc.arc(x, y, r, a + gap, a + half);
  ctx.globalAlpha = spent ? 0.7 : 1;
  strokeGlow(ctx, arc, hex, Math.max(0.8, r * (spent ? 0.05 : 0.075)), glow);
  ctx.globalAlpha = 1;

  // The bolt the rib meets the hoop at. Present while the rib is, gone when it
  // is not — which is what the gap above is a gap in.
  if (spent) return;
  ctx.fillStyle = dark;
  ctx.strokeStyle = hex;
  ctx.lineWidth = Math.max(0.6, r * 0.045);
  ctx.beginPath();
  ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, Math.max(1, r * 0.09), 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}
