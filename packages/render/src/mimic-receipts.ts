import { strokeGlowFaded } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import type { Peel } from "./mimic-fx.js";
import { CORE, type MimicPose } from "./mimic-shape.js";
import { glyphPath } from "./mimic-sign.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE MIMIC's receipts, drawn** — what `mimic-fx.ts` holds between frames.
 * The peel is drawn where it drifted, in the field's pixels; the flash is
 * laid on the mantle `mimic-draw.ts` stands this frame, as the core is.
 */

/** How far a peel falls and drifts aside, in tiles, how many times it turns over, and its size against the sign. */
const FALL = 10;
const DRIFT = 1.2;
const TURNS = 1.5;
const SCRAP = 0.5;
/** How far past the core a flash rings, in core radii. */
const FLASH_PAST = 0.6;

/**
 * A sign peeled off: a scrap of skin with the sign still on it, lifting off
 * the mantle and drifting down the field, turning over as it falls so it
 * shows its blank underside every other half turn, its torn edge pale, fading
 * as it goes.
 */
export function drawMimicPeel(ctx: CanvasRenderingContext2D, l: Layout, f: Peel): void {
  if (f.now <= 0 || f.sign < 0) return;
  const k = 1 - f.now;
  const x = f.x + f.side * DRIFT * l.tile * Math.sin(k * Math.PI * 0.5);
  const y = f.y + FALL * l.tile * (0.6 * k + 0.4 * k * k);
  const turn = Math.cos(k * TURNS * Math.PI * 2);
  const face = Math.max(0.08, Math.abs(turn));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(f.side * k * 0.6);
  ctx.scale(face, 1);
  const scrap = new Path2D();
  const half = f.size * SCRAP * 0.62;
  scrap.roundRect(-half, -half, half * 2, half * 2, half * 0.45);
  ctx.fillStyle = rgba(turn >= 0 ? PALETTE.mimicSkin : PALETTE.mimicSkinDark, f.now);
  ctx.fill(scrap);
  // A pale torn edge, so the scrap reads against the mantle it came off.
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.mimicSign, 0.7 * f.now);
  ctx.stroke(scrap);
  if (turn >= 0) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = STROKE.outline;
    ctx.strokeStyle = rgba(PALETTE.mimicSign, f.now);
    ctx.stroke(glyphPath(f.sign, 0, 0, f.size * SCRAP * 0.8, 1, 0, 0));
  }
  ctx.restore();
}

/** The core taking a shot: a ring flaring out past it in the colour it was lit. */
export function drawMimicFlash(
  ctx: CanvasRenderingContext2D,
  p: MimicPose,
  flash: { now: number; hex: string },
): void {
  if (flash.now <= 0) return;
  const r = CORE * p.r * (1 + FLASH_PAST * (1 - flash.now));
  const ring = new Path2D();
  ring.ellipse(p.x, p.y, r, Math.max(1, r * p.squash), 0, 0, Math.PI * 2);
  ctx.fillStyle = rgba(flash.hex, 0.35 * flash.now);
  ctx.fill(ring);
  strokeGlowFaded(ctx, ring, flash.hex, STROKE.outline, 1.4 * flash.now, 1);
}
