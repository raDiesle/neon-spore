import { blisterRubbing } from "@neon-spore/sim";
import type { BlisterFrame } from "./blister-bodies.js";
import type { Body } from "./creature-body-in.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

const TAU = Math.PI * 2;

/** Spines round the top half and the flanks, the pore hiding the rest. */
const SPINES = 15;

/**
 * URCHIN, one of RUB's three bodies (`blister-rub.ts`): a sea urchin up out of the pore, the rub's drop in the middle of it,
 * its spines standing out all round; under a thumb they all shiver. One
 * blow and it is gone, so no spine is ever laid flat (until 15 October 2026
 * a blow laid a third of them down, `blister.ts`).
 */
export function drawUrchinBody(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r;
  const x = b.x;
  const y = b.y + (1 - f.rise) * r * 1.8;
  const rubbing = blisterRubbing(b.c);
  ctx.save();
  const shell = new Path2D();
  shell.ellipse(x, y + r * 0.1, r * 1.2, r * 1.1, 0, 0, TAU);
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.5, r * 0.1, x, y, r * 1.3);
  g.addColorStop(0, rgba(PALETTE.hull, 0.95));
  g.addColorStop(0.6, rgba(PALETTE.hull, 0.6));
  g.addColorStop(1, PALETTE.redDark);
  ctx.fillStyle = g;
  ctx.fill(shell);
  ctx.lineWidth = Math.max(1.5, r * 0.1);
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.85);
  ctx.stroke(shell);
  // The knobs the spines grow from, in a ring round the drop.
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.55);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * r * 0.95, y + r * 0.1 + Math.sin(a) * r * 0.88, r * 0.07, 0, TAU);
    ctx.fill();
  }
  // Over the shell.
  ctx.lineCap = "round";
  for (let i = 0; i < SPINES; i++) {
    // From the left flank over the top to the right flank.
    const t = i / (SPINES - 1);
    const a = Math.PI * (0.92 + t * 1.16);
    const shiver = rubbing ? Math.sin(b.time * 40 + i * 1.7) * 0.08 : 0;
    const lean = a + shiver;
    const len = r * 1.05;
    const sx = x + Math.cos(a) * r * 1.05;
    const sy = y + Math.sin(a) * r * 1.0;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(lean) * len, sy + Math.sin(lean) * len);
    ctx.lineWidth = r * 0.2;
    ctx.strokeStyle = rgba(PALETTE.hullRim, 0.9);
    ctx.stroke();
    ctx.lineWidth = r * 0.11;
    ctx.strokeStyle = PALETTE.hull;
    ctx.stroke();
  }
  ctx.restore();
}
