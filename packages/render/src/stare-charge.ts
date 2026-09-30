import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import type { StareEye } from "./stare-shape.js";

/**
 * **THE STARE's beam, gathering and let out** — the two pictures the owner
 * asked for on 29 September 2026: *during its closed and players need to pull
 * it, it looks like its charging a massive beam, so they need to open it in
 * time so it releases energie to the sides of it.*
 *
 * The **charge** is a hot core swelling in the shut eye, the light it draws
 * in streaking toward it from all round the cowl, faster as it fills; the
 * socket itself swells with it (`swollenEye`). The **vent** is the same light
 * thrown out flat from both corners of the eye to the walls of the field, on
 * both screens, fading over a beat or so (`StareFx.vent`). The beam that
 * falls when nobody pulls is the strike's own look (`stare-blow.ts`).
 */

/** Streaks drawn in toward the core. */
const STREAKS = 14;

/** The core and its in-drawn light, for how far the charge has come. */
export function drawCharge(
  ctx: CanvasRenderingContext2D,
  e: StareEye,
  swell: number,
  beatPhase: number,
  time: number,
): void {
  if (swell <= 0) return;
  const pulse = 0.5 + 0.5 * Math.cos(beatPhase * Math.PI * 2);
  const r = e.ry * (0.35 + 0.65 * swell) * (0.92 + 0.08 * pulse);
  ctx.save();
  // The in-drawn light: short streaks falling inward, their phase on the wall
  // clock, since nobody counts a streak.
  const lines = new Path2D();
  for (let i = 0; i < STREAKS; i++) {
    const a = (i / STREAKS) * Math.PI * 2 + i * 0.37;
    const run = (time * (0.8 + 1.6 * swell) + i * 0.29) % 1;
    const far = 2.4 - 1.5 * run;
    const near = far - 0.45;
    const cx = Math.cos(a) * e.rx;
    const cy = Math.sin(a) * e.ry * 1.6;
    lines.moveTo(e.cx + cx * (far / 2), e.cy + cy * (far / 2));
    lines.lineTo(e.cx + cx * (near / 2), e.cy + cy * (near / 2));
  }
  strokeGlow(ctx, lines, PALETTE.emberRim, STROKE.outline, 0.8 + swell, 0.6 + 0.4 * swell);
  // The core: ember round a white heart.
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = rgba(PALETTE.ember, 0.35 + 0.35 * swell);
  ctx.beginPath();
  ctx.arc(e.cx, e.cy, r * 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.emberRim, 0.7 + 0.3 * pulse * swell);
  ctx.beginPath();
  ctx.arc(e.cx, e.cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.text, 0.9);
  ctx.beginPath();
  ctx.arc(e.cx, e.cy, r * 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** The vent: two flat jets from the eye's corners to the field's walls, `vent` one on the tick and falling. */
export function drawVent(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  e: StareEye,
  vent: number,
): void {
  if (vent <= 0) return;
  const spread = 1 - vent;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const side of [-1, 1] as const) {
    const x0 = e.cx + side * e.rx * 0.95;
    const x1 = side < 0 ? l.gridLeft : l.gridLeft + l.gridWidth;
    const h0 = e.ry * 0.35;
    const h1 = e.ry * (0.9 + 1.4 * spread);
    const jet = new Path2D();
    jet.moveTo(x0, e.cy - h0);
    jet.lineTo(x1, e.cy - h1);
    jet.lineTo(x1, e.cy + h1);
    jet.lineTo(x0, e.cy + h0);
    jet.closePath();
    ctx.fillStyle = rgba(PALETTE.cyan, 0.45 * vent);
    ctx.fill(jet);
    const core = new Path2D();
    core.moveTo(x0, e.cy);
    core.lineTo(x1, e.cy);
    strokeGlow(ctx, core, PALETTE.cyanRim, STROKE.outline * 2 * vent, 2 * vent, vent);
  }
  ctx.restore();
}
