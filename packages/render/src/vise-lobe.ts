import { LIGHT_HALF } from "@neon-spore/content";
import { VISE_SEAMS_PER_LOBE, type ViseState } from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import {
  type Point,
  VISE_PINCH_NARROW,
  viseHinge,
  viseLobePath,
  viseLobePoints,
  viseRadius,
  viseSeamPath,
} from "./vise-shape.js";

/** How lobe `side` stands this frame: its lean from the hinge, the pinch on it, and how far the case has split. */
export interface ViseLobePose {
  side: 0 | 1;
  lean: number;
  squeeze: number;
  split: number;
}

/**
 * Move the canvas into lobe `side`'s own frame: swung `lean` about the hinge
 * at the top of the spine, its bottom outward; narrowed toward the spine by
 * the pinch on it; and, as the case splits, thrown out and down.
 */
export function viseLobeFrame(ctx: CanvasRenderingContext2D, l: Layout, p: ViseLobePose): void {
  const out = p.side === 0 ? -1 : 1;
  if (p.split > 0) ctx.translate(out * p.split * l.tile * 0.9, p.split * l.tile * 0.7);
  const hinge = viseHinge(l);
  ctx.translate(hinge.x, hinge.y);
  ctx.rotate(-out * p.lean);
  ctx.translate(-hinge.x, -hinge.y);
  ctx.scale(1 - VISE_PINCH_NARROW * p.squeeze, 1);
}

/**
 * Lobe `side`'s outline in the case's frame, as `viseLobeFrame` puts it: what
 * a bolt meets (`vise-stop.ts`) and what the far lobe's dark is laid over
 * when the case turns (`vise-glance.ts`).
 */
export function viseLobeOutline(l: Layout, p: ViseLobePose): Point[] {
  const out = p.side === 0 ? -1 : 1;
  const hinge = viseHinge(l);
  const turn = -out * p.lean;
  const cos = Math.cos(turn);
  const sin = Math.sin(turn);
  const narrow = 1 - VISE_PINCH_NARROW * p.squeeze;
  const dx = p.split > 0 ? out * p.split * l.tile * 0.9 : 0;
  const dy = p.split > 0 ? p.split * l.tile * 0.7 : 0;
  return viseLobePoints(l, p.side).map((q) => {
    const x = q.x * narrow - hinge.x;
    const y = q.y - hinge.y;
    return { x: dx + hinge.x + x * cos - y * sin, y: dy + hinge.y + x * sin + y * cos };
  });
}

/** `viseLobeOutline` as a path. */
export function viseLobeShell(l: Layout, p: ViseLobePose): Path2D {
  const shell = new Path2D();
  for (const [k, q] of viseLobeOutline(l, p).entries()) {
    if (k === 0) shell.moveTo(q.x, q.y);
    else shell.lineTo(q.x, q.y);
  }
  shell.closePath();
  return shell;
}

/** One half-shell: tan fill, the key light on it, its bristled outline, the blow over it, and every seam already cracked. */
export function drawViseLobe(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: ViseState,
  p: ViseLobePose,
  time: number,
  hurt: number,
): void {
  const shell = viseLobePath(l, p.side);
  const { ry, rx } = viseRadius(l);
  ctx.save();
  viseLobeFrame(ctx, l, p);
  ctx.fillStyle = rgba(PALETTE.viseCase, 0.95);
  ctx.fill(shell);
  ctx.save();
  ctx.clip(shell);
  litRound(ctx, 0, -ry * 0.2, Math.max(rx, ry), LIGHT_HALF.rock, 0.02 * Math.sin(time * 0.5));
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.viseCaseDark, 0.95);
  ctx.stroke(shell);
  drawHurt(ctx, shell, hurt);
  const cracked = Math.min(VISE_SEAMS_PER_LOBE, s.cracks[p.side]);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.viseCrack, 0.85);
  for (let k = 0; k < cracked; k++) ctx.stroke(viseSeamPath(l, p.side, k));
  ctx.restore();
}
