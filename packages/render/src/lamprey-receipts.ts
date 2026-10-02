import { strokeGlowFaded } from "./glow.js";
import { rgba } from "./hex.js";
import type { FlungTooth } from "./lamprey-fx.js";
import {
  type LampreyPose,
  lampreyGulletReach,
  lampreyRing,
  lampreyToothAt,
} from "./lamprey-shape.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE LAMPREY's receipts, drawn** — what `lamprey-fx.ts` holds between
 * frames. The flung tooth is drawn where it flew, in the field's pixels; the
 * snap and the gulp are laid on the mouth `lamprey-draw.ts` stands this
 * frame, as the teeth and the gullet are.
 */

/** How far a flung tooth flies out from the ring, how far it drops, in tiles, and its turns. */
const FLING = 1.6;
const DROP = 2.2;
const TURNS = 1.5;
/** A flung tooth's length and root, in tiles. */
const LONG = 0.32;
const ROOT = 0.14;
/** How wide the snap's ring opens round the tooth before it closes, in mouth radii. */
const SNAP_OPEN = 0.5;
/** How far past the gullet's lip a gulp's flash rings, in mouth radii. */
const GULP_PAST = 0.35;

/**
 * The tooth a crack knocked out: a bone hook flung out off the ring, the way
 * it faced, turning end over end and falling as it fades.
 */
export function drawLampreyFlung(ctx: CanvasRenderingContext2D, l: Layout, f: FlungTooth): void {
  if (f.now <= 0) return;
  const k = 1 - f.now;
  const x = f.at.x + f.dir.x * FLING * l.tile * k;
  const y = f.at.y + f.dir.y * FLING * l.tile * k + DROP * l.tile * k * k;
  const w = ROOT * l.tile;
  const h = LONG * l.tile;
  const hook = new Path2D();
  hook.moveTo(-w / 2, h / 2);
  hook.quadraticCurveTo(-w * 0.1, -h * 0.1, w * 0.25, -h / 2);
  hook.quadraticCurveTo(w * 0.1, h * 0.05, w / 2, h / 2);
  hook.closePath();
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.atan2(f.dir.y, f.dir.x) + Math.PI / 2 + k * TURNS * Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.lampreyTooth, f.now);
  ctx.fill(hook);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.lampreyHideDark, 0.9 * f.now);
  ctx.stroke(hook);
  ctx.restore();
}

/** The snap: a ring closing hard onto the tooth that went back in, dull bone, gone in a quarter second. */
export function drawLampreySnap(
  ctx: CanvasRenderingContext2D,
  p: LampreyPose,
  snap: { now: number; tooth: number },
): void {
  if (snap.now <= 0) return;
  const at = lampreyToothAt(p, snap.tooth);
  const r = p.r * SNAP_OPEN * snap.now;
  const ring = new Path2D();
  ring.ellipse(at.x, at.y, r, r * (0.5 + 0.5 * p.tilt), 0, 0, Math.PI * 2);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.lampreyTooth, 0.85 * snap.now);
  ctx.stroke(ring);
}

/**
 * The gulp: the gullet a shot went down flaring in the colour it was lit,
 * opened past its lip and narrowing back to the size the hit left it.
 */
export function drawLampreyGulp(
  ctx: CanvasRenderingContext2D,
  p: LampreyPose,
  gulp: { now: number; hits: number; hex: string },
): void {
  if (gulp.now <= 0) return;
  const reach = lampreyGulletReach(gulp.hits) + GULP_PAST * gulp.now;
  const flare = lampreyRing(p, reach);
  ctx.fillStyle = rgba(gulp.hex, 0.45 * gulp.now);
  ctx.fill(flare);
  strokeGlowFaded(ctx, flare, gulp.hex, STROKE.outline, 1.4 * gulp.now, 1);
}
