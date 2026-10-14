import { halo, strokeGlowFaded } from "./glow.js";
import { rgba } from "./hex.js";
import type { At } from "./hydra-shape.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE HYDRA's heads, the piece every kind is drawn with** (§11.64): a
 * serpent's head on the end of a neck (`hydra-neck.ts`), its jaws hinged open
 * as far as it is asked, its fangs, its crest and its amber slit eye — and
 * the seared stump left where a head was stopped.
 */

/** A seared end where a head was: the stump of a neck stopped. */
export function drawStumpEnd(ctx: CanvasRenderingContext2D, at: At, r: number): void {
  ctx.fillStyle = PALETTE.hydraStump;
  ctx.beginPath();
  ctx.ellipse(at.x, at.y, r, r * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.hydraIchor, 0.7);
  ctx.beginPath();
  ctx.ellipse(at.x, at.y, r * 0.45, r * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * A serpent's head at `at`, facing `angle`, `size` long, its jaws open
 * `gape` (0..1). Its eyes lit `glare` (0..1). The jaws are drawn round the
 * hinge, so a head opening is its jaws parting, not a picture swapped.
 */
export function drawSerpentHead(
  ctx: CanvasRenderingContext2D,
  at: At,
  angle: number,
  size: number,
  gape: number,
  glare: number,
): void {
  const s = size;
  const open = 0.08 + 0.55 * gape;
  ctx.save();
  ctx.translate(at.x, at.y);
  ctx.rotate(angle);
  // A head facing left is turned over, so its eye stays on top.
  if (Math.cos(angle) < 0) ctx.scale(1, -1);
  // The gullet behind the jaws.
  ctx.fillStyle = PALETTE.hydraGullet;
  ctx.beginPath();
  ctx.moveTo(-s * 0.25, 0);
  ctx.lineTo(s * 0.45 * Math.cos(open), -s * 0.45 * Math.sin(open));
  ctx.lineTo(s * 0.45 * Math.cos(open), s * 0.45 * Math.sin(open));
  ctx.closePath();
  ctx.fill();
  for (const way of [-1, 1] as const) jaw(ctx, s, way, open, glare);
  ctx.restore();
}

/** One jaw, turned about the hinge `open` radians up (`way` -1) or down (1), its fangs on it. */
function jaw(ctx: CanvasRenderingContext2D, s: number, way: -1 | 1, open: number, glare: number) {
  ctx.save();
  ctx.translate(-s * 0.25, 0);
  ctx.rotate(way * open);
  const head = new Path2D();
  head.moveTo(-s * 0.3, 0);
  head.bezierCurveTo(-s * 0.3, way * s * 0.38, s * 0.35, way * s * 0.3, s * 0.78, way * s * 0.04);
  head.lineTo(s * 0.78, 0);
  head.closePath();
  ctx.fillStyle = PALETTE.hydraHide;
  ctx.fill(head);
  strokeGlowFaded(ctx, head, PALETTE.hydraScale, STROKE.outline, 0.9);
  // The fangs, down off the jaw's edge.
  ctx.fillStyle = PALETTE.hydraFang;
  for (const along of [0.62, 0.38]) {
    ctx.beginPath();
    ctx.moveTo(s * along, 0);
    ctx.lineTo(s * (along + 0.07), 0);
    ctx.lineTo(s * (along + 0.02), -way * s * 0.17);
    ctx.closePath();
    ctx.fill();
  }
  if (way === -1) {
    // The eye on the upper jaw, an amber slit, and the crest behind it.
    const ex = s * 0.12;
    const ey = -s * 0.17;
    glow(ctx, { x: ex, y: ey }, s * 0.35, PALETTE.hydraIris, 0.25 + 0.6 * glare);
    ctx.fillStyle = PALETTE.hydraIris;
    ctx.beginPath();
    ctx.ellipse(ex, ey, s * 0.09, s * 0.055, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.hydraHideDark;
    ctx.fillRect(ex - s * 0.012, ey - s * 0.05, s * 0.024, s * 0.1);
    ctx.fillStyle = PALETTE.hydraScale;
    for (const k of [0, 1, 2]) {
      const x = -s * (0.05 + 0.13 * k);
      ctx.beginPath();
      ctx.moveTo(x, -s * 0.26 + k * s * 0.03);
      ctx.lineTo(x - s * 0.13, -s * 0.42 + k * s * 0.05);
      ctx.lineTo(x - s * 0.1, -s * 0.22 + k * s * 0.03);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
}

/** A halo that leaves the caller's fade as it found it (`halo` sets it to one). */
export function glow(
  ctx: CanvasRenderingContext2D,
  at: At,
  radius: number,
  color: string,
  alpha: number,
): void {
  const fade = ctx.globalAlpha;
  halo(ctx, at.x, at.y, radius, color, alpha * fade);
  ctx.globalAlpha = fade;
}
